/**
 * LOCATION AUTOSUGGEST - Server Action (DYNAMIC DATA)
 * Powers the "Where to?" search input with grouped results
 *
 * PHASE 46: Preserves EXACT location hierarchy from P_Property_Location__c
 * Format: "Town, Region, Country" (e.g., "Spartia, Kefalonia, Greece")
 *
 * PERFORMANCE: Data is cached from villa data source
 *
 * Searches across:
 * - Countries (third part: "Greece", "Spain", etc.)
 * - Regions (second part: "Kefalonia", "Mallorca", etc.)
 * - Towns (first part: "Spartia", "Pollensa", etc.)
 * - Villas (all 2026-active villas)
 */

'use server';

import { getAllVillasFromSource } from '@/lib/villa-data-source';

export interface SearchSuggestion {
  id: string;
  label: string;
  type: 'country' | 'region' | 'town' | 'villa';
  slug?: string;
  villaId?: string;
}

export interface GroupedSuggestions {
  countries: SearchSuggestion[];
  regions: SearchSuggestion[];
  towns: SearchSuggestion[];
  villas: SearchSuggestion[];
}

/**
 * Get search suggestions based on user query
 * PHASE 45: Extracts unique locations dynamically from P_Property_Location__c
 *
 * @param query - User search input
 * @returns Grouped suggestions object
 */
export async function getSearchSuggestions(query: string): Promise<GroupedSuggestions> {
  // PHASE 14: Increased threshold to 3 characters to reduce noise
  if (!query || query.length < 3) {
    return {
      countries: [],
      regions: [],
      towns: [],
      villas: [],
    };
  }

  try {
    // Fetch all villas (uses cache from villa-data-source)
    const villas = await getAllVillasFromSource();
    const queryLower = query.toLowerCase();

    // PHASE 46: Extract unique locations - EXACT HIERARCHY
    // Format: "Town, Region, Country" (e.g., "Spartia, Kefalonia, Greece")
    const uniqueCountries = new Set<string>();
    const uniqueRegions = new Set<string>();
    const uniqueTowns = new Set<string>();

    villas.forEach((villa) => {
      // Collect unique countries (third part: "Greece")
      if (villa.country) {
        uniqueCountries.add(villa.country);
      }

      // Collect unique regions (second part: "Kefalonia")
      if (villa.region && villa.region !== 'Unknown Region') {
        uniqueRegions.add(villa.region);
      }

      // Collect unique towns (first part: "Spartia")
      if (villa.town) {
        uniqueTowns.add(villa.town);
      }
    });

    // Filter and create suggestions based on query
    const countrySuggestions: SearchSuggestion[] = Array.from(uniqueCountries)
      .filter(country => country.toLowerCase().includes(queryLower))
      .sort()
      .map((country) => ({
        id: `country-${country.toLowerCase().replace(/\s+/g, '-')}`,
        label: country,
        type: 'country',
        slug: country.toLowerCase().replace(/\s+/g, '-'),
      }));

    const regionSuggestions: SearchSuggestion[] = Array.from(uniqueRegions)
      .filter(region => region.toLowerCase().includes(queryLower))
      .sort()
      .map((region) => ({
        id: `region-${region.toLowerCase().replace(/\s+/g, '-')}`,
        label: region,
        type: 'region',
        slug: region.toLowerCase().replace(/\s+/g, '-'),
      }));

    const townSuggestions: SearchSuggestion[] = Array.from(uniqueTowns)
      .filter(town => town.toLowerCase().includes(queryLower))
      .sort()
      .slice(0, 10) // Limit towns to top 10
      .map((town) => ({
        id: `town-${town.toLowerCase().replace(/\s+/g, '-')}`,
        label: town,
        type: 'town',
        slug: town.toLowerCase().replace(/\s+/g, '-'),
      }));

    // Filter villas by query (name, region, country, or town)
    const villaSuggestions: SearchSuggestion[] = villas
      .filter((villa) => {
        const nameMatch = villa.name?.toLowerCase().includes(queryLower);
        const titleMatch = villa.title?.toLowerCase().includes(queryLower);
        const regionMatch = villa.region?.toLowerCase().includes(queryLower);
        const countryMatch = villa.country?.toLowerCase().includes(queryLower);
        const townMatch = villa.town?.toLowerCase().includes(queryLower);

        return nameMatch || titleMatch || regionMatch || countryMatch || townMatch;
      })
      .slice(0, 5) // Limit villas to top 5
      .map((villa) => ({
        id: villa.id,
        label: villa.title || villa.name,
        type: 'villa',
        slug: villa.slug,
        villaId: villa.id,
      }));

    const suggestions: GroupedSuggestions = {
      countries: countrySuggestions,
      regions: regionSuggestions,
      towns: townSuggestions,
      villas: villaSuggestions,
    };

    console.log(`[Search Suggestions] Query: "${query}" (Dynamic P_Property_Location__c)`);
    console.log(`[Search Suggestions] Results: ${suggestions.countries.length} countries, ${suggestions.regions.length} regions, ${suggestions.towns.length} towns, ${suggestions.villas.length} villas`);

    return suggestions;
  } catch (error) {
    console.error('[Search Suggestions] Error:', error);
    return {
      countries: [],
      regions: [],
      towns: [],
      villas: [],
    };
  }
}
