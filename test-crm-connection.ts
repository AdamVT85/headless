/**
 * Test script to verify Salesforce CRM connection
 * Run with: npx tsx test-crm-connection.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { getAllVillasFromSource } from './lib/villa-data-source';
import { getDataSourceInfo } from './lib/villa-data-source';

async function testCRMConnection() {
  console.log('=== TESTING CRM CONNECTION ===\n');

  // Show data source configuration
  const dataSourceInfo = getDataSourceInfo();
  console.log('Data Source Configuration:');
  console.log('- Source:', dataSourceInfo.source);
  console.log('- Fallback enabled:', dataSourceInfo.fallbackEnabled);
  console.log('- USE_MOCK_DATA env:', process.env.USE_MOCK_DATA);
  console.log('');

  // Test fetching villas
  console.log('Fetching villas...\n');
  try {
    const villas = await getAllVillasFromSource();

    console.log(`\n✅ SUCCESS: Fetched ${villas.length} villa(s)\n`);

    if (villas.length > 0) {
      console.log('First villa:');
      const firstVilla = villas[0];
      console.log('- ID:', firstVilla.id);
      console.log('- Title:', firstVilla.title);
      console.log('- Region:', firstVilla.region);
      console.log('- Bedrooms:', firstVilla.bedrooms);
      console.log('- Max Guests:', firstVilla.maxGuests);
      console.log('- Description:', firstVilla.description.substring(0, 100) + '...');
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testCRMConnection();
