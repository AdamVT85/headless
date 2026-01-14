/**
 * Test serialization of CRM data to ensure no circular references
 * Run with: npx tsx test-serialization.ts
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { getAllVillasFromSource } from './lib/villa-data-source';
import { searchVillas } from './lib/algolia-client';

async function testSerialization() {
  console.log('=== TESTING DATA SERIALIZATION ===\n');

  try {
    console.log('1. Fetching villas from data source...');
    const villas = await getAllVillasFromSource();
    console.log(`   ✓ Fetched ${villas.length} villas\n`);

    console.log('2. Testing JSON serialization of raw villa data...');
    try {
      const villaJson = JSON.stringify(villas);
      console.log(`   ✓ Successfully serialized ${villaJson.length} characters`);
      console.log(`   ✓ No circular references detected\n`);
    } catch (error) {
      console.error('   ✗ SERIALIZATION FAILED:', error);
      throw error;
    }

    console.log('3. Testing search response serialization...');
    const searchResponse = await searchVillas('', { minSleeps: 4 });
    console.log(`   ✓ Search returned ${searchResponse.total} results\n`);

    try {
      const searchJson = JSON.stringify(searchResponse);
      console.log(`   ✓ Successfully serialized search response (${searchJson.length} characters)`);
      console.log(`   ✓ No circular references detected\n`);
    } catch (error) {
      console.error('   ✗ SEARCH RESPONSE SERIALIZATION FAILED:', error);
      throw error;
    }

    console.log('4. Testing individual villa serialization...');
    if (villas.length > 0) {
      const firstVilla = villas[0];
      console.log(`   Testing villa: ${firstVilla.title}`);

      try {
        const singleVillaJson = JSON.stringify(firstVilla);
        console.log(`   ✓ Successfully serialized (${singleVillaJson.length} characters)`);

        // Parse back to verify data integrity
        const parsed = JSON.parse(singleVillaJson);
        console.log(`   ✓ Parsed back successfully`);
        console.log(`   ✓ ID: ${parsed.id}`);
        console.log(`   ✓ Title: ${parsed.title}`);
        console.log(`   ✓ Region: ${parsed.region}\n`);
      } catch (error) {
        console.error('   ✗ SINGLE VILLA SERIALIZATION FAILED:', error);
        throw error;
      }
    }

    console.log('\n✅ ALL SERIALIZATION TESTS PASSED!');
    console.log('   The data is clean and can be sent to client components.');
  } catch (error) {
    console.error('\n❌ SERIALIZATION TEST FAILED:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testSerialization();
