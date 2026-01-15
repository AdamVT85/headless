/**
 * VINTAGE TRAVEL - VILLA DATA SOURCE ABSTRACTION
 *
 * Provides unified interface for fetching villa data
 * Can switch between Mock DB and Salesforce CRM based on configuration
 *
 * PHASE 21: CRM client now returns MockVilla[] directly (no mapping needed)
 * PHASE 29: Server-side module - imports from crm-client which requires server environment
 * PHASE 30: Removed 'use server' directive (causes build error with sync functions)
 *           This module is safe because it's only imported by server components
 * PHASE 62: Merges Sanity gallery images with Salesforce villa data
 */

import { getAllVillas } from '@/lib/crm-client';
import { getAllPublishedVillas, MockVilla } from '@/lib/mock-db';
import { getVillaMedia, getAllVillaMedia } from '@/lib/queries/villa-media';

/**
 * Check if we should use mock data
 * Evaluates at runtime to support dynamic environment variable loading
 */
function shouldUseMockData(): boolean {
  return process.env.USE_MOCK_DATA !== 'false';
}

/**
 * Get all villas from configured data source
 * Automatically switches between Mock DB and Salesforce CRM
 *
 * @returns Array of villa records
 */
export async function getAllVillasFromSource(): Promise<MockVilla[]> {
  if (shouldUseMockData()) {
    console.log('[DataSource] Using MOCK data');
    return getAllPublishedVillas();
  }

  try {
    console.log('[DataSource] ====== FETCHING VILLAS FROM CRM (MOCK MODE) ======');
    // PHASE 21: getAllVillas() now returns MockVilla[] directly
    const villas = await getAllVillas();

    // Final verification summary
    console.log('[DataSource] ====== FINAL SUMMARY ======');
    console.log(`[DataSource] ✓ Successfully loaded ${villas.length} villas`);

    // Group by region for final verification
    const regionCounts = villas.reduce((acc, villa) => {
      acc[villa.region] = (acc[villa.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('[DataSource] Final region breakdown:');
    Object.entries(regionCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([region, count]) => {
        console.log(`  ${region}: ${count}`);
      });

    console.log('[DataSource] =====================================');

    return villas;
  } catch (error) {
    console.error('[DataSource] Failed to fetch from CRM, falling back to mocks:', error);
    console.log('[DataSource] Using MOCK data as fallback');
    return getAllPublishedVillas();
  }
}

/**
 * Get a single villa by slug
 * PHASE 62: Merges Sanity gallery images with Salesforce data
 *
 * @param slug - Villa slug identifier
 * @returns Villa record or null if not found
 */
export async function getVillaBySlug(slug: string): Promise<MockVilla | null> {
  const villas = await getAllVillasFromSource();
  const villa = villas.find(v => v.slug === slug);

  if (!villa) {
    return null;
  }

  // PHASE 62: Fetch Sanity gallery images and merge with villa data
  try {
    const sanityMedia = await getVillaMedia(villa.id);

    if (sanityMedia) {
      console.log(`[DataSource] Found Sanity media for ${villa.title}: ${sanityMedia.galleryImages.length} gallery images`);

      // Merge Sanity media with Salesforce data
      // Sanity takes precedence for images
      return {
        ...villa,
        heroImageUrl: sanityMedia.heroImageUrl || villa.heroImageUrl,
        galleryImages: sanityMedia.galleryImages.length > 0
          ? sanityMedia.galleryImages
          : villa.galleryImages,
      };
    }
  } catch (error) {
    console.warn(`[DataSource] Failed to fetch Sanity media for ${villa.title}:`, error);
  }

  return villa;
}

/**
 * Get a single villa by ID (Salesforce ID)
 *
 * @param id - Villa Salesforce ID
 * @returns Villa record or null if not found
 */
export async function getVillaById(id: string): Promise<MockVilla | null> {
  const villas = await getAllVillasFromSource();
  return villas.find(v => v.id === id) || null;
}

/**
 * Get all villa slugs for static generation
 *
 * @returns Array of villa slugs
 */
export async function getAllVillaSlugs(): Promise<string[]> {
  const villas = await getAllVillasFromSource();
  return villas.map(v => v.slug);
}

/**
 * Get data source status for debugging
 *
 * @returns Object with data source information
 */
export function getDataSourceInfo(): {
  source: 'mock' | 'crm';
  fallbackEnabled: boolean;
} {
  const useMock = shouldUseMockData();
  return {
    source: useMock ? 'mock' : 'crm',
    fallbackEnabled: !useMock,
  };
}
