/**
 * SEARCH PARAMETER TYPES
 * Type definitions for villa search functionality
 */

export interface SearchParams {
  // Location - flexible text search (region, town, etc.)
  location?: string;

  // Country - exact match filter (Spain, France, Balearic Islands, etc.)
  country?: string;

  // Dates
  dates?: {
    startDate: string; // ISO date string (YYYY-MM-DD)
    endDate: string;   // ISO date string (YYYY-MM-DD)
  };

  // Guests
  guests?: {
    adults?: number;
    children?: number;
    infants?: number;
  };

  // Additional filters
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;

  // Guest capacity filters
  minSleeps?: number; // Minimum guests villa sleeps (e.g., 8 for "large villas")
  maxSleeps?: number; // Maximum guests villa sleeps (e.g., 4 for "couples")

  // Facility filters (AND logic - villa must have ALL selected facilities)
  facilities?: string[]; // Array of facility names to filter by
}

export interface SearchResults {
  villas: any[]; // Using any for now, should match Villa type
  totalCount: number;
  filters: SearchParams;
}
