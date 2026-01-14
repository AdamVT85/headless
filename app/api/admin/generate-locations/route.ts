import { NextResponse } from 'next/server';
import { getAllVillas } from '@/lib/crm-client';

/**
 * PHASE 49: STRICT COUNTRY VALIDATION
 *
 * Only 8 valid countries are allowed. Anything else gets reclassified as a region.
 * This prevents regions like "Tuscany" or "Algarve" from appearing as countries.
 *
 * Valid Countries: Balearics, Spain, France, Croatia, Turkey, Greece, Italy, Portugal
 */

const VALID_COUNTRIES = new Set([
  "Balearics",
  "Spain",
  "France",
  "Croatia",
  "Turkey",
  "Greece",
  "Italy",
  "Portugal"
]);

export async function GET() {
  try {
    console.log('[LOCATION GENERATOR] Starting STRICT location extraction...');
    const villas = await getAllVillas();
    console.log(`[LOCATION GENERATOR] Processing ${villas.length} villas`);

    const countries = new Set<string>();
    const regions = new Set<string>();
    const towns = new Set<string>();

    villas.forEach(villa => {
      // 1. RAW PARSE from villa object
      let c = villa.country ? villa.country.trim() : "";
      let r = villa.region ? villa.region.trim() : "";
      let t = villa.town ? villa.town.trim() : "";

      // 2. NORMALIZE SPECIFIC CASES
      if (c === "Balearic Islands") c = "Balearics";
      if (r === "Balearic Islands") r = "Balearics";

      // 3. STRICT COUNTRY CLASSIFICATION
      if (VALID_COUNTRIES.has(c)) {
        // Valid country - keep it
        countries.add(c);

        // Add the region if it's distinct and valid
        if (r && r !== c && r !== "Unknown Region") {
          regions.add(r);
        }
      } else {
        // INVALID COUNTRY DETECTED (e.g., "Tuscany", "Algarve")
        // Downgrade it to Region
        if (c && c.length > 2 && c !== "Unknown") {
          console.log(`[LOCATION GENERATOR] Reclassifying "${c}" as region (not in valid countries)`);
          regions.add(c);
        }

        // If there was a distinct region, add it too
        if (r && r !== c && r !== "Unknown Region") {
          regions.add(r);
        }
      }

      // 4. TOWN HANDLING - strict filtering
      if (t && t.length > 2 && t !== r && t !== c) {
        towns.add(t);
      }
    });

    // Helper to sort alphabetically
    const sortSet = (s: Set<string>) => Array.from(s).sort((a, b) => a.localeCompare(b));

    const structuredData = {
      countries: sortSet(countries),
      regions: sortSet(regions),
      towns: sortSet(towns),
      // Metadata
      meta: {
        villaCount: villas.length,
        countryCount: countries.size,
        regionCount: regions.size,
        townCount: towns.size,
        validCountries: Array.from(VALID_COUNTRIES).sort(),
        generatedAt: new Date().toISOString(),
      }
    };

    console.log(`[LOCATION GENERATOR] ✓ Extracted with STRICT validation:`);
    console.log(`  - ${countries.size} countries (valid only)`);
    console.log(`  - ${regions.size} regions`);
    console.log(`  - ${towns.size} towns`);

    // Return structured object
    return NextResponse.json(structuredData);

  } catch (error) {
    console.error('[LOCATION GENERATOR] Error:', error);
    return NextResponse.json({
      error: 'Failed to generate locations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
