/**
 * SYNC FACILITIES API ROUTE
 *
 * Fetches facility data from Salesforce and saves it locally for fast search.
 * Run via: POST /api/sync-facilities
 *
 * Can be triggered from:
 * - Sanity Studio (via document action)
 * - Build scripts
 * - Manual API call
 *
 * Security: Requires SYNC_SECRET or Sanity webhook signature
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllFacilities, getVillaFacilityMap, clearFacilityCache } from '@/lib/crm-client';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Secret for API authentication (set in .env.local)
const SYNC_SECRET = process.env.SYNC_FACILITIES_SECRET || 'dev-secret-change-me';

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const body = await request.json().catch(() => ({}));
    const providedSecret = authHeader?.replace('Bearer ', '') || body.secret;

    if (providedSecret !== SYNC_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid secret' },
        { status: 401 }
      );
    }

    console.log('[SYNC FACILITIES] Starting facility sync from Salesforce...');

    // Fetch all facilities (master list)
    const allFacilities = await getAllFacilities();
    console.log(`[SYNC FACILITIES] Fetched ${allFacilities.length} facilities from Facility__c`);

    // Fetch villa-facility mappings
    const villaFacilityMap = await getVillaFacilityMap();
    console.log(`[SYNC FACILITIES] Fetched facility mappings for ${villaFacilityMap.size} villas`);

    // Convert Map to plain object for JSON serialization
    const villaFacilitiesObject: Record<string, string[]> = {};
    villaFacilityMap.forEach((facilities, villaId) => {
      villaFacilitiesObject[villaId] = facilities;
    });

    // Prepare data structure
    const syncData = {
      lastSynced: new Date().toISOString(),
      syncedBy: body.syncedBy || 'api',
      villaFacilities: villaFacilitiesObject,
      allFacilities: allFacilities,
    };

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    // Write to JSON file
    const filePath = path.join(dataDir, 'villa-facilities.json');
    await writeFile(filePath, JSON.stringify(syncData, null, 2), 'utf-8');

    console.log(`[SYNC FACILITIES] Successfully saved to ${filePath}`);

    // Clear the in-memory cache so next request loads fresh data
    clearFacilityCache();

    // Calculate stats
    const totalMappings = Object.values(villaFacilitiesObject).reduce(
      (sum, facilities) => sum + facilities.length,
      0
    );

    return NextResponse.json({
      success: true,
      message: 'Facility data synced successfully',
      stats: {
        facilitiesCount: allFacilities.length,
        villasWithFacilities: villaFacilityMap.size,
        totalMappings,
        lastSynced: syncData.lastSynced,
      },
    });

  } catch (error: any) {
    console.error('[SYNC FACILITIES] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync facilities',
      },
      { status: 500 }
    );
  }
}

// Also support GET for easy browser/build testing (with secret as query param)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== SYNC_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized - provide ?secret=YOUR_SECRET' },
      { status: 401 }
    );
  }

  // Create a mock request with the secret in body
  const mockRequest = {
    headers: request.headers,
    json: async () => ({ secret }),
  } as NextRequest;

  return POST(mockRequest);
}
