/**
 * SEED VILLAS API ROUTE
 *
 * Creates Sanity villa documents from Salesforce data.
 * This links Sanity content to Salesforce villas via salesforceId.
 *
 * Run via: GET /api/seed-villas
 */

import { createClient } from '@sanity/client';
import { NextResponse } from 'next/server';
import { getAllVillas } from '@/lib/crm-client';

// Create a write-capable Sanity client
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

// Generate URL-friendly slug from villa name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 96); // Max length
}

// Generate a short introduction from description
function generateIntroduction(description: string | undefined, name: string, location: string): string {
  if (description) {
    // Strip HTML and get first 200 chars
    const plain = description.replace(/<[^>]*>/g, '').trim();
    if (plain.length > 10) {
      return plain.substring(0, 200) + (plain.length > 200 ? '...' : '');
    }
  }
  // Fallback introduction
  return `Discover ${name}, a beautiful villa in ${location}. Book your Mediterranean escape today.`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '0', 10);
  const skipExisting = searchParams.get('skipExisting') !== 'false';

  // Check for write token
  if (!process.env.SANITY_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'SANITY_WRITE_TOKEN not configured' },
      { status: 400 }
    );
  }

  try {
    // Fetch all villas from Salesforce
    console.log('Fetching villas from Salesforce...');
    const salesforceVillas = await getAllVillas();
    console.log(`Found ${salesforceVillas.length} villas in Salesforce`);

    if (salesforceVillas.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No villas found in Salesforce',
      });
    }

    // Get existing villa salesforceIds from Sanity to avoid duplicates
    let existingIds: Set<string> = new Set();
    if (skipExisting) {
      const existing = await writeClient.fetch<{ salesforceId: string }[]>(
        `*[_type == "villa"]{ salesforceId }`
      );
      existingIds = new Set(existing.map(v => v.salesforceId));
      console.log(`Found ${existingIds.size} existing villas in Sanity`);
    }

    // Filter and limit villas to seed
    let villasToSeed = salesforceVillas.filter(v => !existingIds.has(v.id));
    if (limit > 0) {
      villasToSeed = villasToSeed.slice(0, limit);
    }

    console.log(`Seeding ${villasToSeed.length} new villas...`);

    // Create villa documents in batches
    const results = {
      created: 0,
      skipped: existingIds.size,
      errors: [] as string[],
    };

    // Process in batches of 10
    const batchSize = 10;
    for (let i = 0; i < villasToSeed.length; i += batchSize) {
      const batch = villasToSeed.slice(i, i + batchSize);

      const transaction = writeClient.transaction();

      for (const villa of batch) {
        const slug = generateSlug(villa.name);
        const location = [villa.region, villa.country].filter(Boolean).join(', ');
        const introduction = generateIntroduction(villa.description, villa.name, location);

        // Create document with a deterministic ID based on salesforceId
        const docId = `villa-${villa.id.replace(/[^a-zA-Z0-9]/g, '-')}`;

        const doc = {
          _id: docId,
          _type: 'villa',
          salesforceId: villa.id,
          title: villa.name,
          slug: {
            _type: 'slug',
            current: slug,
          },
          introduction: introduction,
          isFeatured: false,
          isNewListing: false,
          // Note: gallery and heroImage are left empty - must be added manually
          // Sanity requires images to be uploaded through its asset pipeline
        };

        transaction.createIfNotExists(doc);
      }

      try {
        await transaction.commit();
        results.created += batch.length;
        console.log(`Created batch ${Math.floor(i / batchSize) + 1}: ${batch.length} villas`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${errorMsg}`);
        console.error(`Error in batch ${Math.floor(i / batchSize) + 1}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Villa seeding complete!`,
      results: {
        totalInSalesforce: salesforceVillas.length,
        created: results.created,
        skippedExisting: results.skipped,
        errors: results.errors.length > 0 ? results.errors : undefined,
      },
      note: 'Photos must be uploaded manually through Sanity Studio. Go to Villas > All Villas to add images.',
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed villas',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
