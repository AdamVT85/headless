/**
 * VINTAGE TRAVEL - SEARCH CLIENT
 *
 * Search implementation with federated search capabilities
 * Searches across villa content (CRM/Mock) + availability (SFCC)
 *
 * CRITICAL: Date range filtering must exclude villas with booking conflicts
 */

import { getAllVillasFromSource } from '@/lib/villa-data-source';
import {
  isVillaAvailable,
  MockVilla,
  getAllPublishedVillas,
} from '@/lib/mock-db';

// ===== SEARCH TYPES =====

export interface SearchFilters {
  // Attribute filters
  minSleeps?: number;
  maxSleeps?: number;
  region?: string;
  minPrice?: number;
  maxPrice?: number;

  // CRITICAL: Date range filter
  // If provided, exclude villas with booked dates overlapping this range
  dateRange?: {
    start: string; // ISO format YYYY-MM-DD
    end: string; // ISO format YYYY-MM-DD
  };
}

export interface SearchResult {
  villa: MockVilla;
  score: number; // Relevance score (0-1)
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  processingTimeMs: number;
  filters: SearchFilters;
}

// ===== SEARCH LOGIC =====

/**
 * Calculate text relevance score
 * Simple mock scoring based on keyword matches
 */
function calculateTextScore(villa: MockVilla, query: string): number {
  if (!query || query.trim() === '') return 1; // No query = all results equally relevant

  const lowerQuery = query.toLowerCase();
  const searchableText = [
    villa.title,
    villa.region,
    villa.description,
    ...villa.amenities,
  ]
    .join(' ')
    .toLowerCase();

  // Count keyword matches
  const keywords = lowerQuery.split(/\s+/);
  const matches = keywords.filter((keyword) =>
    searchableText.includes(keyword)
  ).length;

  return matches / keywords.length; // Score 0-1
}

/**
 * Apply attribute filters
 */
function matchesAttributeFilters(
  villa: MockVilla,
  filters: SearchFilters
): boolean {
  // Min sleeps filter
  if (filters.minSleeps !== undefined && villa.maxGuests < filters.minSleeps) {
    return false;
  }

  // Max sleeps filter
  if (filters.maxSleeps !== undefined && villa.maxGuests > filters.maxSleeps) {
    return false;
  }

  // Region filter (case-insensitive partial match)
  if (filters.region) {
    const regionMatch = villa.region
      .toLowerCase()
      .includes(filters.region.toLowerCase());
    if (!regionMatch) return false;
  }

  // Price filters
  if (
    filters.minPrice !== undefined &&
    villa.pricePerWeek !== null &&
    villa.pricePerWeek < filters.minPrice
  ) {
    return false;
  }

  if (
    filters.maxPrice !== undefined &&
    villa.pricePerWeek !== null &&
    villa.pricePerWeek > filters.maxPrice
  ) {
    return false;
  }

  return true;
}

/**
 * Apply date range availability filter
 * CRITICAL: This prevents showing villas that are booked during requested dates
 */
function matchesDateAvailability(
  villa: MockVilla,
  dateRange?: { start: string; end: string }
): boolean {
  // No date filter = show all villas
  if (!dateRange) return true;

  // Check if villa is available for the requested dates
  return isVillaAvailable(villa, dateRange.start, dateRange.end);
}

// ===== MOCK ALGOLIA CLIENT =====

/**
 * Search villas with filters (MOCK)
 *
 * Mimics Algolia's federated search across:
 * - Content attributes (Sanity)
 * - Availability data (SFCC)
 *
 * @param query - Text search query
 * @param filters - Attribute and date filters
 * @returns Search results with relevance scores
 */
export async function searchVillas(
  query: string = '',
  filters: SearchFilters = {}
): Promise<SearchResponse> {
  const startTime = Date.now();

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Get all villas from data source (CRM or Mock)
  let villas = await getAllVillasFromSource();

  // Apply filters
  villas = villas.filter((villa) => {
    // Attribute filters
    if (!matchesAttributeFilters(villa, filters)) return false;

    // CRITICAL: Date availability filter
    if (!matchesDateAvailability(villa, filters.dateRange)) return false;

    return true;
  });

  // Calculate relevance scores
  const results: SearchResult[] = villas.map((villa) => ({
    villa,
    score: calculateTextScore(villa, query),
  }));

  // Sort by relevance score (descending)
  results.sort((a, b) => b.score - a.score);

  // PHASE 39: PAYLOAD OPTIMIZATION
  // Limit to 100 results and strip heavy fields to prevent payload overflow
  const LIMITED_RESULTS = results.slice(0, 100);
  console.log(`[SEARCH] Total matches: ${results.length}, returning: ${LIMITED_RESULTS.length} (payload optimized)`);

  // Strip heavy fields that aren't needed for the grid
  const optimizedResults = LIMITED_RESULTS.map(result => ({
    villa: {
      // Identifiers
      id: result.villa.id,
      sfccId: result.villa.sfccId,
      sanityId: result.villa.sanityId,
      slug: result.villa.slug,

      // Content (lightweight)
      title: result.villa.title,
      name: result.villa.name || result.villa.title, // Added for search compatibility
      region: result.villa.region,
      country: result.villa.country, // Added for search
      town: result.villa.town, // Added for search
      heroImageUrl: result.villa.heroImageUrl,
      galleryImages: result.villa.galleryImages || [],
      description: '', // ⚠️ STRIPPED: Not needed for grid
      amenities: [], // ⚠️ STRIPPED: Not needed for grid

      // Capacity
      maxGuests: result.villa.maxGuests,
      bedrooms: result.villa.bedrooms,
      bathrooms: result.villa.bathrooms,

      // Commerce
      pricePerWeek: result.villa.pricePerWeek,
      pricePerNight: result.villa.pricePerNight,
      bookedDates: [], // ⚠️ STRIPPED: Not needed for grid

      // Status
      published: result.villa.published,
    } as MockVilla,
    score: result.score,
  }));

  const processingTimeMs = Date.now() - startTime;

  return {
    results: optimizedResults,
    total: results.length, // Return original count so UI knows there are more
    processingTimeMs,
    filters,
  };
}

/**
 * Get villa suggestions (autocomplete)
 */
export async function getVillaSuggestions(
  query: string,
  limit: number = 5
): Promise<MockVilla[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  if (!query || query.trim() === '') return [];

  const response = await searchVillas(query);
  return response.results.slice(0, limit).map((r) => r.villa);
}

/**
 * Get available regions with villa counts (faceted search)
 * Used for dynamically populating region filters
 */
export async function getAvailableRegions(): Promise<
  Array<{ region: string; count: number }>
> {
  // Get all villas from the configured data source (CRM or Mock)
  const villas = await getAllVillasFromSource();
  const regionCounts = new Map<string, number>();

  villas.forEach((villa) => {
    const count = regionCounts.get(villa.region) || 0;
    regionCounts.set(villa.region, count + 1);
  });

  return Array.from(regionCounts.entries())
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get available villas for specific dates
 * Convenience function for date-specific searches
 */
export async function getAvailableVillasForDates(
  startDate: string,
  endDate: string
): Promise<MockVilla[]> {
  const response = await searchVillas('', {
    dateRange: { start: startDate, end: endDate },
  });

  return response.results.map((r) => r.villa);
}
