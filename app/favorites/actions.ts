'use server';

/**
 * FAVORITES SERVER ACTIONS
 * Server-side functions for fetching favourite villa data
 */

import { getVillaById } from '@/lib/crm-client';

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
 */
export async function getVillasByIds(ids: string[]): Promise<VillaData[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  // Fetch all villas in parallel
  const villaPromises = ids.map(id => getVillaById(id));
  const results = await Promise.all(villaPromises);

  // Filter out nulls (villas that weren't found) and map to the display format
  const villas: VillaData[] = results
    .filter((villa): villa is NonNullable<typeof villa> => villa !== null)
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

  return villas;
}
