/**
 * SANITY QUERIES - VILLA MEDIA
 * Fetches gallery images and hero images from Sanity CMS
 * Links to Salesforce villas via salesforceId
 */

import { client, urlFor } from '../sanity.client';

export interface SanityVillaMedia {
  salesforceId: string;
  heroImageUrl?: string;
  galleryImages: { url: string; alt: string }[];
}

/**
 * GROQ query to fetch villa media by Salesforce ID
 */
const villaMediaQuery = `*[_type == "villa" && salesforceId == $salesforceId][0]{
  salesforceId,
  heroImage,
  gallery[]
}`;

/**
 * GROQ query to fetch all villa media (for batch loading)
 */
const allVillaMediaQuery = `*[_type == "villa" && defined(salesforceId)]{
  salesforceId,
  heroImage,
  gallery[]
}`;

/**
 * Get gallery images for a single villa by Salesforce ID
 */
export async function getVillaMedia(salesforceId: string): Promise<SanityVillaMedia | null> {
  try {
    const data = await client.fetch(villaMediaQuery, { salesforceId }, {
      next: { revalidate: 60 }
    });

    if (!data) {
      return null;
    }

    return processVillaMedia(data);
  } catch (error) {
    console.error(`[Sanity] Error fetching media for villa ${salesforceId}:`, error);
    return null;
  }
}

/**
 * Get all villa media in one batch query (more efficient for listing pages)
 */
export async function getAllVillaMedia(): Promise<Map<string, SanityVillaMedia>> {
  try {
    const data = await client.fetch(allVillaMediaQuery, {}, {
      next: { revalidate: 60 }
    });

    const mediaMap = new Map<string, SanityVillaMedia>();

    if (data && Array.isArray(data)) {
      data.forEach((villa: any) => {
        if (villa.salesforceId) {
          const processed = processVillaMedia(villa);
          if (processed) {
            mediaMap.set(villa.salesforceId, processed);
          }
        }
      });
    }

    console.log(`[Sanity] Loaded media for ${mediaMap.size} villas`);
    return mediaMap;
  } catch (error) {
    console.error('[Sanity] Error fetching all villa media:', error);
    return new Map();
  }
}

/**
 * Process raw Sanity villa data into media URLs
 */
function processVillaMedia(data: any): SanityVillaMedia | null {
  if (!data || !data.salesforceId) {
    return null;
  }

  // Process hero image
  let heroImageUrl: string | undefined;
  if (data.heroImage?.asset) {
    try {
      heroImageUrl = urlFor(data.heroImage).width(1920).quality(85).url();
    } catch (e) {
      console.warn('[Sanity] Failed to build hero image URL');
    }
  }

  // Process gallery images
  const galleryImages: { url: string; alt: string }[] = [];
  if (data.gallery && Array.isArray(data.gallery)) {
    data.gallery.forEach((img: any, index: number) => {
      if (img?.asset) {
        try {
          const url = urlFor(img).width(1600).quality(85).url();
          galleryImages.push({
            url,
            alt: img.alt || `Gallery image ${index + 1}`,
          });
        } catch (e) {
          console.warn(`[Sanity] Failed to build gallery image URL for index ${index}`);
        }
      }
    });
  }

  return {
    salesforceId: data.salesforceId,
    heroImageUrl,
    galleryImages,
  };
}
