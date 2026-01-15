/**
 * LOCATION AUTOSUGGEST - Server Action (STATIC DATA)
 * Powers the "Where to?" search input with grouped results
 *
 * PERFORMANCE: Uses pre-generated static data for instant responses
 * No Salesforce API calls - data loaded from lib/autosuggest-data.ts
 *
 * To update the data, run: npm run generate:autosuggest
 */

'use server';

import { COUNTRIES, REGIONS, TOWNS, VILLAS } from '@/lib/autosuggest-data';

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
 * Uses static pre-generated data for fast responses
 *
 * @param query - User search input
 * @returns Grouped suggestions object
 */
export async function getSearchSuggestions(query: string): Promise<GroupedSuggestions> {
  // Minimum 3 characters to reduce noise
  if (!query || query.length < 3) {
    return {
      countries: [],
      regions: [],
      towns: [],
      villas: [],
    };
  }

  const queryLower = query.toLowerCase();

  // Filter countries
  const countrySuggestions: SearchSuggestion[] = COUNTRIES
    .filter(c => c.label.toLowerCase().includes(queryLower))
    .map(c => ({
      id: c.id,
      label: c.label,
      type: 'country' as const,
      slug: c.slug,
    }));

  // Filter regions
  const regionSuggestions: SearchSuggestion[] = REGIONS
    .filter(r => r.label.toLowerCase().includes(queryLower))
    .map(r => ({
      id: r.id,
      label: r.label,
      type: 'region' as const,
      slug: r.slug,
    }));

  // Filter towns (limit to 10)
  const townSuggestions: SearchSuggestion[] = TOWNS
    .filter(t => t.label.toLowerCase().includes(queryLower))
    .slice(0, 10)
    .map(t => ({
      id: t.id,
      label: t.label,
      type: 'town' as const,
      slug: t.slug,
    }));

  // Filter villas - only show if query matches at least 40% of villa name
  const villaSuggestions: SearchSuggestion[] = VILLAS
    .filter(v => {
      const villaName = v.name.toLowerCase();
      const queryLen = queryLower.length;
      const nameLen = villaName.length;

      // Query must be contained in the name
      if (!villaName.includes(queryLower)) {
        return false;
      }

      // Check if query represents at least 40% of the villa name
      const matchPercentage = queryLen / nameLen;
      return matchPercentage >= 0.4;
    })
    .slice(0, 5) // Limit to 5 villas
    .map(v => ({
      id: v.id,
      label: v.name,
      type: 'villa' as const,
      slug: v.slug,
      villaId: v.id,
    }));

  const suggestions: GroupedSuggestions = {
    countries: countrySuggestions,
    regions: regionSuggestions,
    towns: townSuggestions,
    villas: villaSuggestions,
  };

  return suggestions;
}
