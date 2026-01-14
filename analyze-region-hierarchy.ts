/**
 * Analyze region hierarchy to identify parent-child region relationships
 * This will help us map sub-regions to their parent regions for better search
 */

import { getAllVillas } from './lib/crm-client';

interface RegionGroup {
  parentRegion: string;
  subRegions: Set<string>;
  villaCount: number;
  countries: Set<string>;
  sampleVillas: string[];
}

async function analyzeRegionHierarchy() {
  console.log('========== REGION HIERARCHY ANALYSIS ==========\n');

  const villas = await getAllVillas();
  console.log(`Total villas: ${villas.length}\n`);

  // Group villas by their region field
  const regionGroups = new Map<string, any[]>();

  villas.forEach(v => {
    if (!v.region) return;

    if (!regionGroups.has(v.region)) {
      regionGroups.set(v.region, []);
    }
    regionGroups.get(v.region)!.push(v);
  });

  console.log(`Unique regions found: ${regionGroups.size}\n`);

  // Analyze regions to find potential parent-child relationships
  // Strategy: Look for regions that share the same country and have overlapping towns
  const potentialParentRegions = new Map<string, RegionGroup>();

  // First pass: Identify regions that might be parents based on:
  // 1. Multiple villas share the same town but different regions
  // 2. Region names appear in P_Property_Location__c of other villas

  // Build a town -> regions mapping
  const townToRegions = new Map<string, Set<string>>();

  villas.forEach(v => {
    if (!v.town || !v.region) return;

    const townLower = v.town.toLowerCase();
    if (!townToRegions.has(townLower)) {
      townToRegions.set(townLower, new Set());
    }
    townToRegions.get(townLower)!.add(v.region);
  });

  // Find towns that map to multiple regions (these might indicate parent-child relationships)
  console.log('========== TOWNS WITH MULTIPLE REGIONS ==========\n');
  for (const [town, regions] of townToRegions.entries()) {
    if (regions.size > 1) {
      console.log(`Town: ${town}`);
      console.log(`  Regions: ${Array.from(regions).join(', ')}`);
      console.log('');
    }
  }

  // Analyze by country - group regions by country to find patterns
  const countryRegions = new Map<string, Map<string, number>>();

  villas.forEach(v => {
    const country = v.country || 'Unknown';
    const region = v.region;

    if (!countryRegions.has(country)) {
      countryRegions.set(country, new Map());
    }

    const regions = countryRegions.get(country)!;
    regions.set(region, (regions.get(region) || 0) + 1);
  });

  // Print regions by country
  console.log('\n========== REGIONS BY COUNTRY ==========\n');

  for (const [country, regions] of countryRegions.entries()) {
    console.log(`\n${country.toUpperCase()} (${regions.size} regions):`);
    const sorted = Array.from(regions.entries()).sort((a, b) => b[1] - a[1]);

    // Show top regions by villa count
    sorted.forEach(([region, count]) => {
      console.log(`  - ${region}: ${count} villas`);
    });
  }

  // Special focus on Greek islands (likely to have sub-region issues)
  console.log('\n\n========== GREEK ISLAND ANALYSIS ==========\n');

  const greekIslands = [
    'Kefalonia', 'Corfu', 'Lefkada', 'Zakynthos', 'Crete',
    'Parga', 'Peloponnese', 'Messinia'
  ];

  for (const island of greekIslands) {
    const islandVillas = villas.filter(v =>
      v.region.toLowerCase().includes(island.toLowerCase()) ||
      v.country?.toLowerCase().includes(island.toLowerCase()) ||
      v.town?.toLowerCase().includes(island.toLowerCase())
    );

    if (islandVillas.length === 0) continue;

    console.log(`\n${island.toUpperCase()}:`);
    console.log(`  Total villas matching: ${islandVillas.length}`);

    // Get unique regions for this island
    const regionsForIsland = new Set(islandVillas.map(v => v.region));
    console.log(`  Regions found: ${regionsForIsland.size}`);

    regionsForIsland.forEach(region => {
      const count = islandVillas.filter(v => v.region === region).length;
      console.log(`    - ${region}: ${count} villas`);
    });

    // Sample a few villas to see location patterns
    console.log('  Sample location patterns:');
    islandVillas.slice(0, 3).forEach(v => {
      console.log(`    - ${v.name}: Town="${v.town}", Region="${v.region}", Country="${v.country}"`);
    });
  }

  // Spanish islands analysis
  console.log('\n\n========== SPANISH ISLAND ANALYSIS ==========\n');

  const spanishIslands = ['Mallorca', 'Menorca', 'Ibiza'];

  for (const island of spanishIslands) {
    const islandVillas = villas.filter(v =>
      v.region.toLowerCase().includes(island.toLowerCase())
    );

    if (islandVillas.length === 0) continue;

    console.log(`\n${island.toUpperCase()}:`);
    console.log(`  Total villas: ${islandVillas.length}`);

    const regionsForIsland = new Set(islandVillas.map(v => v.region));
    console.log(`  Unique regions: ${regionsForIsland.size}`);

    regionsForIsland.forEach(region => {
      const count = islandVillas.filter(v => v.region === region).length;
      console.log(`    - ${region}: ${count} villas`);
    });
  }

  console.log('\n====================================================\n');
}

analyzeRegionHierarchy().catch(console.error);
