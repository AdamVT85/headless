'use server';

/**
 * FAVORITES SERVER ACTIONS
 * Server-side functions for fetching favourite villa data
 */

import { getAllVillas } from '@/lib/crm-client';

interface VillaData {
  id: string;
  slug: string;
  title: string;
  region: string;
  town?: string;
  heroImageUrl?: string | null;
  pricePerWeek?: number | null;
  maxGuests?: number;
  bedrooms?: number;
}

/**
 * Fetch multiple villas by their IDs
 * Returns villa data for display on the favorites page
 * Uses cached getAllVillas() for better performance and reliability
 */
export async function getVillasByIds(ids: string[]): Promise<VillaData[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  try {
    // Get all villas from cache
    const allVillas = await getAllVillas();

    // Create a Set for O(1) lookup
    const idSet = new Set(ids);

    // Filter to only the favourited villas and preserve order
    const villas: VillaData[] = ids
      .map(id => allVillas.find(v => v.id === id))
      .filter((villa): villa is NonNullable<typeof villa> => villa !== null && villa !== undefined)
      .map(villa => ({
        id: villa.id,
        slug: villa.slug,
        title: villa.title,
        region: villa.region,
        town: villa.town,
        heroImageUrl: villa.heroImageUrl,
        pricePerWeek: villa.pricePerWeek,
        maxGuests: villa.maxGuests,
        bedrooms: villa.bedrooms,
      }));

    console.log(`[Favorites] Found ${villas.length}/${ids.length} favourited villas`);
    return villas;
  } catch (error) {
    console.error('[Favorites] Failed to fetch villas:', error);
    return [];
  }
}
