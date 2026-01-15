/**
 * AUTOSUGGEST DATA GENERATOR
 *
 * Fetches villa data from Salesforce and generates the static autosuggest-data.ts file.
 * Run this script periodically to keep villa data fresh:
 *
 * npm run generate:autosuggest
 */

import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('[Generate Autosuggest] Starting...');

  try {
    // Dynamic import to handle ES modules
    const { getAllVillasFromSource } = await import('../lib/villa-data-source');

    console.log('[Generate Autosuggest] Fetching villas from Salesforce...');
    const villas = await getAllVillasFromSource();

    console.log('[Generate Autosuggest] Found ' + villas.length + ' villas');

    // Extract unique locations
    const countries = new Set<string>();
    const regions = new Set<string>();
    const towns = new Set<string>();

    villas.forEach((villa: any) => {
      if (villa.country) countries.add(villa.country);
      if (villa.region && villa.region !== 'Unknown Region') regions.add(villa.region);
      if (villa.town) towns.add(villa.town);
    });

    // Format location data
    const countryData = Array.from(countries).sort().map(c => ({
      id: 'country-' + c.toLowerCase().replace(/\s+/g, '-'),
      label: c,
      slug: c.toLowerCase().replace(/\s+/g, '-'),
      type: 'country'
    }));

    const regionData = Array.from(regions).sort().map(r => ({
      id: 'region-' + r.toLowerCase().replace(/\s+/g, '-'),
      label: r,
      slug: r.toLowerCase().replace(/\s+/g, '-'),
      type: 'region'
    }));

    const townData = Array.from(towns).sort().map(t => ({
      id: 'town-' + t.toLowerCase().replace(/\s+/g, '-'),
      label: t,
      slug: t.toLowerCase().replace(/\s+/g, '-'),
      type: 'town'
    }));

    // Format villa data
    const villaData = villas.map((v: any) => ({
      id: v.id,
      name: v.title || v.name,
      slug: v.slug,
    }));

    // Generate the TypeScript file content
    const timestamp = new Date().toISOString();
    const fileContent = [
      '/**',
      ' * STATIC AUTOSUGGEST DATA',
      ' * Auto-generated from Salesforce data',
      ' * Generated: ' + timestamp,
      ' *',
      ' * DO NOT EDIT MANUALLY - Run "npm run generate:autosuggest" to regenerate',
      ' */',
      '',
      'export interface LocationItem {',
      '  id: string;',
      '  label: string;',
      '  slug: string;',
      "  type: 'country' | 'region' | 'town';",
      '}',
      '',
      'export interface VillaItem {',
      '  id: string;',
      '  name: string;',
      '  slug: string;',
      '}',
      '',
      '// Countries (' + countryData.length + ' total)',
      'export const COUNTRIES: LocationItem[] = ' + JSON.stringify(countryData, null, 2) + ';',
      '',
      '// Regions (' + regionData.length + ' total)',
      'export const REGIONS: LocationItem[] = ' + JSON.stringify(regionData, null, 2) + ';',
      '',
      '// Towns (' + townData.length + ' total)',
      'export const TOWNS: LocationItem[] = ' + JSON.stringify(townData, null, 2) + ';',
      '',
      '// Villas (' + villaData.length + ' total)',
      'export const VILLAS: VillaItem[] = ' + JSON.stringify(villaData, null, 2) + ';',
      ''
    ].join('\n');

    // Write to file
    const outputPath = path.join(__dirname, '..', 'lib', 'autosuggest-data.ts');
    fs.writeFileSync(outputPath, fileContent, 'utf-8');

    console.log('[Generate Autosuggest] Written to ' + outputPath);
    console.log('[Generate Autosuggest] Summary:');
    console.log('  - ' + countryData.length + ' countries');
    console.log('  - ' + regionData.length + ' regions');
    console.log('  - ' + townData.length + ' towns');
    console.log('  - ' + villaData.length + ' villas');
    console.log('[Generate Autosuggest] Done!');

  } catch (error) {
    console.error('[Generate Autosuggest] Error:', error);
    process.exit(1);
  }
}

main();
