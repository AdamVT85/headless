/**
 * SEED LOCATIONS API ROUTE
 *
 * Creates Sanity location documents (countries & regions) from Salesforce data.
 * Establishes proper hierarchy: Region -> Country
 *
 * Run via: GET /api/seed-locations
 */

import { createClient } from '@sanity/client';
import { NextResponse } from 'next/server';
import { getAllVillas } from '@/lib/crm-client';

// Valid countries (from crm-mapper.ts)
// Note: "Balearic Islands" is the normalized name used in crm-mapper.ts
const VALID_COUNTRIES = [
  'Spain',
  'Balearic Islands',
  'France',
  'Greece',
  'Italy',
  'Portugal',
  'Croatia',
  'Turkey',
];

// Country descriptions for SEO
const countryDescriptions: Record<string, string> = {
  'Spain': 'Discover stunning villas across Spain, from the sun-drenched Costa Blanca to the rolling hills of Andalusia.',
  'Balearic Islands': 'Experience the magic of the Balearic Islands - Mallorca, Menorca, Ibiza, and Formentera.',
  'France': 'From Provence lavender fields to the glamorous Côte d\'Azur, find your perfect French villa escape.',
  'Greece': 'Explore ancient history and island beauty with our collection of Greek villas.',
  'Italy': 'La dolce vita awaits in Tuscany, the Amalfi Coast, Sicily, and beyond.',
  'Portugal': 'Discover the Algarve\'s golden beaches and Portugal\'s charming coastal towns.',
  'Croatia': 'Crystal-clear Adriatic waters and historic towns await in Croatia.',
  'Turkey': 'Where East meets West - explore Turkey\'s stunning Aegean and Mediterranean coasts.',
};

// Create a write-capable Sanity client
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

// Generate URL-friendly slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 96);
}

export async function GET() {
  if (!process.env.SANITY_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'SANITY_WRITE_TOKEN not configured' },
      { status: 400 }
    );
  }

  try {
    // Fetch all villas from Salesforce to extract locations
    console.log('Fetching villas from Salesforce...');
    const villas = await getAllVillas();
    console.log(`Found ${villas.length} villas`);

    // Extract unique countries and regions
    const countries = new Set<string>();
    const regionsByCountry = new Map<string, Set<string>>();

    for (const villa of villas) {
      const country = villa.country;
      const region = villa.region;

      if (country && VALID_COUNTRIES.includes(country)) {
        countries.add(country);

        if (region && region !== country) {
          if (!regionsByCountry.has(country)) {
            regionsByCountry.set(country, new Set());
          }
          regionsByCountry.get(country)!.add(region);
        }
      }
    }

    console.log(`Found ${countries.size} countries and ${[...regionsByCountry.values()].reduce((sum, s) => sum + s.size, 0)} regions`);

    // Check existing locations to avoid duplicates
    const existing = await writeClient.fetch<{ title: string; type: string }[]>(
      `*[_type == "location"]{ title, type }`
    );
    const existingCountries = new Set(existing.filter(l => l.type === 'country').map(l => l.title));
    const existingRegions = new Set(existing.filter(l => l.type === 'region').map(l => l.title));

    const results = {
      countriesCreated: 0,
      regionsCreated: 0,
      skipped: 0,
    };

    // Create country documents first
    const countryTransaction = writeClient.transaction();
    const countryIdMap = new Map<string, string>();

    for (const country of countries) {
      const docId = `location-country-${generateSlug(country)}`;
      countryIdMap.set(country, docId);

      if (existingCountries.has(country)) {
        results.skipped++;
        continue;
      }

      const doc = {
        _id: docId,
        _type: 'location',
        title: country,
        slug: { _type: 'slug', current: generateSlug(country) },
        type: 'country',
        introduction: countryDescriptions[country] || `Discover beautiful villas in ${country}.`,
        isPopular: true,
        sortOrder: VALID_COUNTRIES.indexOf(country) * 10,
      };

      countryTransaction.createIfNotExists(doc);
      results.countriesCreated++;
    }

    if (results.countriesCreated > 0) {
      await countryTransaction.commit();
      console.log(`Created ${results.countriesCreated} countries`);
    }

    // Create region documents with parent references
    for (const [country, regions] of regionsByCountry) {
      const parentId = countryIdMap.get(country);
      if (!parentId) continue;

      const regionTransaction = writeClient.transaction();
      let batchCount = 0;

      for (const region of regions) {
        if (existingRegions.has(region)) {
          results.skipped++;
          continue;
        }

        const docId = `location-region-${generateSlug(region)}`;
        const doc = {
          _id: docId,
          _type: 'location',
          title: region,
          slug: { _type: 'slug', current: generateSlug(region) },
          type: 'region',
          parent: { _type: 'reference', _ref: parentId },
          introduction: `Explore our collection of villas in ${region}, ${country}.`,
          isPopular: false,
          sortOrder: 100,
        };

        regionTransaction.createIfNotExists(doc);
        results.regionsCreated++;
        batchCount++;

        // Commit in batches of 20
        if (batchCount >= 20) {
          await regionTransaction.commit();
          batchCount = 0;
        }
      }

      // Commit remaining
      if (batchCount > 0) {
        await regionTransaction.commit();
      }
    }

    console.log(`Created ${results.regionsCreated} regions`);

    return NextResponse.json({
      success: true,
      message: 'Location seeding complete!',
      results: {
        countriesCreated: results.countriesCreated,
        regionsCreated: results.regionsCreated,
        skipped: results.skipped,
        totalCountries: countries.size,
        totalRegions: [...regionsByCountry.values()].reduce((sum, s) => sum + s.size, 0),
      },
      note: 'Hero images should be uploaded manually through Sanity Studio.',
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed locations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
