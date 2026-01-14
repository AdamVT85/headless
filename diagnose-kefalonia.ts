/**
 * Diagnose Kefalonia villa discrepancy
 * Expected: 43 villas
 * Getting: 18 villas
 */

import { getAllVillas } from './lib/crm-client';

const EXPECTED_VILLAS = [
  'Agata', 'Alegria', 'Alena', 'Alexander', 'Anax', 'Anelia', 'Anesis',
  'Astoria', 'Athina Villa', 'Avaton', 'Azamara', 'Charma', 'Christina',
  'Chrysa', 'Dafni', 'Dina', 'Dionisis Villa', 'Eirini', 'Evanthia',
  'Ionian Mansion', 'Isalos', 'Kamini', 'Kanelo Villa', 'Leonie',
  'Magdalani', 'Marina', 'Melanthi', 'Melia', 'Micato', 'Nikolas',
  'Odore Di Mare', 'Panagis Villa', 'Persephone', 'Petra Tranquila',
  'Raxi', 'Ruggero', 'Saluto', 'Selene', 'Spartia Bay Cottage',
  'Vasilikades', 'Villa La Vie', 'Virida', 'Vryonis'
];

async function diagnose() {
  console.log('========== KEFALONIA VILLA DIAGNOSTIC ==========\n');
  console.log(`Expected villas: ${EXPECTED_VILLAS.length}`);

  const allVillas = await getAllVillas();
  console.log(`Total villas in system: ${allVillas.length}\n`);

  // Find villas matching the expected list (case-insensitive, fuzzy match)
  const foundVillas: any[] = [];
  const missingVillas: string[] = [];

  EXPECTED_VILLAS.forEach(expectedName => {
    const found = allVillas.find(v => {
      const villaName = v.name.toLowerCase();
      const expectedLower = expectedName.toLowerCase();

      // Try exact match first
      if (villaName === expectedLower) return true;

      // Try contains match
      if (villaName.includes(expectedLower) || expectedLower.includes(villaName)) return true;

      // Try without "Villa" suffix
      const nameWithoutVilla = expectedLower.replace(' villa', '').trim();
      if (villaName.includes(nameWithoutVilla)) return true;

      return false;
    });

    if (found) {
      foundVillas.push({ expected: expectedName, villa: found });
    } else {
      missingVillas.push(expectedName);
    }
  });

  console.log(`✓ Found: ${foundVillas.length} villas`);
  console.log(`✗ Missing: ${missingVillas.length} villas\n`);

  // Show found villas with location data
  console.log('========== FOUND VILLAS (with location data) ==========\n');
  foundVillas.forEach((item, i) => {
    console.log(`${i + 1}. ${item.expected} (${item.villa.name})`);
    console.log(`   Region: ${item.villa.region}`);
    console.log(`   Country: ${item.villa.country || 'N/A'}`);
    console.log(`   Town: ${item.villa.town || 'N/A'}`);
  });

  // Show missing villas
  if (missingVillas.length > 0) {
    console.log('\n========== MISSING VILLAS ==========\n');
    missingVillas.forEach((name, i) => {
      console.log(`${i + 1}. ${name}`);
    });

    console.log('\n========== CHECKING IF MISSING VILLAS EXIST WITH DIFFERENT NAMES ==========\n');

    // Try to find them by partial name match in all villas
    missingVillas.forEach(missing => {
      const partialMatches = allVillas.filter(v => {
        const villaName = v.name.toLowerCase();
        const missingLower = missing.toLowerCase();
        const firstWord = missingLower.split(' ')[0];

        return villaName.includes(firstWord) && firstWord.length > 3;
      });

      if (partialMatches.length > 0) {
        console.log(`"${missing}" might be:`);
        partialMatches.forEach(v => {
          console.log(`  - ${v.name} (Region: ${v.region}, Country: ${v.country || 'N/A'})`);
        });
      }
    });
  }

  // Check if any villas have Kefalonia in location but weren't in expected list
  console.log('\n========== ADDITIONAL KEFALONIA VILLAS (not in expected list) ==========\n');
  const kefaloniaVillas = allVillas.filter(v => {
    const hasKefalonia =
      v.region.toLowerCase().includes('kefalonia') ||
      (v.country && v.country.toLowerCase().includes('kefalonia')) ||
      (v.town && v.town.toLowerCase().includes('kefalonia'));

    const isInExpected = foundVillas.some(f => f.villa.id === v.id);
    return hasKefalonia && !isInExpected;
  });

  if (kefaloniaVillas.length > 0) {
    kefaloniaVillas.forEach((v, i) => {
      console.log(`${i + 1}. ${v.name}`);
      console.log(`   Region: ${v.region}, Country: ${v.country || 'N/A'}, Town: ${v.town || 'N/A'}`);
    });
  } else {
    console.log('None found.');
  }

  console.log('\n====================================================');
}

diagnose().catch(console.error);
