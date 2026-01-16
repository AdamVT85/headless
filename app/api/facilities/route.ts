/**
 * FACILITIES API ROUTE
 *
 * Returns the cached facility data for use in search filters.
 * Reads from local JSON file (no Salesforce call).
 */

import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

interface Facility {
  id: string;
  name: string;
  type?: string;
}

interface CachedFacilityData {
  lastSynced: string | null;
  syncedBy: string | null;
  villaFacilities: Record<string, string[]>;
  allFacilities: Facility[];
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'villa-facilities.json');

    if (!existsSync(filePath)) {
      return NextResponse.json({
        facilities: [],
        grouped: {},
        lastSynced: null,
        message: 'No facility data cached. Run /api/sync-facilities first.',
      });
    }

    const fileContent = readFileSync(filePath, 'utf-8');
    const data: CachedFacilityData = JSON.parse(fileContent);

    // Group facilities by type
    const grouped: Record<string, Facility[]> = {};
    data.allFacilities.forEach(facility => {
      const type = facility.type || 'Other';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(facility);
    });

    return NextResponse.json({
      facilities: data.allFacilities,
      grouped,
      lastSynced: data.lastSynced,
    });

  } catch (error: any) {
    console.error('[FACILITIES API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load facilities', facilities: [], grouped: {} },
      { status: 500 }
    );
  }
}
