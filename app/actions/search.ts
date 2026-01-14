'use server';

/**
 * VINTAGE TRAVEL - SEARCH SERVER ACTIONS
 *
 * Server-side search operations that connect to CRM/data sources
 * Client components call these actions to perform searches
 */

import { searchVillas, SearchFilters, SearchResponse, getAvailableRegions } from '@/lib/algolia-client';

/**
 * Perform villa search server-side
 * This allows CRM connection with environment variables
 *
 * CRITICAL: Returns clean, serializable data (no circular references)
 * The mapper strips Salesforce metadata to prevent stack overflow errors
 *
 * @param query - Text search query
 * @param filters - Search filters
 * @returns Search response with results
 */
export async function performSearch(
  query: string = '',
  filters: SearchFilters = {}
): Promise<SearchResponse> {
  try {
    console.log('[SearchAction] Performing search with query:', query, 'filters:', filters);
    const response = await searchVillas(query, filters);
    console.log(`[SearchAction] Found ${response.total} results`);

    // Verify the response is serializable (catch any circular reference issues early)
    try {
      JSON.stringify(response);
    } catch (serializationError) {
      console.error('[SearchAction] CRITICAL: Response contains non-serializable data:', serializationError);
      throw new Error('Search results contain non-serializable data. Check CRM mapper.');
    }

    return response;
  } catch (error) {
    console.error('[SearchAction] Search failed:', error);
    throw new Error(
      `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get available regions with villa counts
 * Used for dynamically populating region filter dropdown
 *
 * @returns Array of regions with counts, sorted by count descending
 */
export async function fetchAvailableRegions(): Promise<
  Array<{ region: string; count: number }>
> {
  try {
    console.log('[SearchAction] Fetching available regions...');
    const regions = await getAvailableRegions();
    console.log(`[SearchAction] Found ${regions.length} regions`);
    return regions;
  } catch (error) {
    console.error('[SearchAction] Failed to fetch regions:', error);
    throw new Error(
      `Failed to fetch regions: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
