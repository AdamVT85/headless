/**
 * Quick diagnostic: Check how many Kefalonia villas exist in Salesforce
 */

import { getAllVillas } from './lib/crm-client';

async function checkKefalonia() {
  console.log('========== KEFALONIA VILLA COUNT ==========\n');

  const allVillas = await getAllVillas();
  console.log(`Total villas in system: ${allVillas.length}`);

  // Filter for Kefalonia in any location field
  const kefaloniaVillas = allVillas.filter(v => {
    const hasKefalonia =
      v.name.toLowerCase().includes('kefalonia') ||
      v.region.toLowerCase().includes('kefalonia') ||
      (v.country && v.country.toLowerCase().includes('kefalonia')) ||
      (v.town && v.town.toLowerCase().includes('kefalonia'));

    return hasKefalonia;
  });

  console.log(`\nVillas matching "Kefalonia": ${kefaloniaVillas.length}`);
  console.log('\nBreakdown by field:');

  const byRegion = kefaloniaVillas.filter(v => v.region.toLowerCase().includes('kefalonia'));
  const byCountry = kefaloniaVillas.filter(v => v.country && v.country.toLowerCase().includes('kefalonia'));
  const byTown = kefaloniaVillas.filter(v => v.town && v.town.toLowerCase().includes('kefalonia'));
  const byName = kefaloniaVillas.filter(v => v.name.toLowerCase().includes('kefalonia'));

  console.log(`  - In region field: ${byRegion.length}`);
  console.log(`  - In country field: ${byCountry.length}`);
  console.log(`  - In town field: ${byTown.length}`);
  console.log(`  - In name field: ${byName.length}`);

  // Show sample of location data
  console.log('\nSample villa locations (first 5):');
  kefaloniaVillas.slice(0, 5).forEach((v, i) => {
    console.log(`\n${i + 1}. ${v.name}`);
    console.log(`   Region: ${v.region}`);
    console.log(`   Country: ${v.country || 'N/A'}`);
    console.log(`   Town: ${v.town || 'N/A'}`);
  });

  console.log('\n==========================================');
}

checkKefalonia().catch(console.error);
