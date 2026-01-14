/**
 * Discover available objects in Salesforce org
 * Run with: npx tsx discover-salesforce-objects.ts
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

// DISABLED: getConn is not exported from crm-client
// import { getConn } from './lib/crm-client';

async function discoverObjects() {
  console.log('=== SCRIPT DISABLED: getConn is not exported ===\n');
  return;

  /* ORIGINAL CODE - DISABLED
  console.log('=== DISCOVERING SALESFORCE OBJECTS ===\n');

  try {
    const conn = await getConn();

    console.log('Fetching global describe...\n');
    const describe = await conn.describeGlobal();

    // Filter for custom objects and objects that might contain villa data
    const relevantObjects = describe.sobjects
      .filter((obj) => {
        const name = obj.name.toLowerCase();
        return (
          obj.custom || // Custom objects
          name.includes('villa') ||
          name.includes('product') ||
          name.includes('property') ||
          name.includes('accommodation')
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(`Found ${relevantObjects.length} relevant object(s):\n`);

    relevantObjects.forEach((obj) => {
      const type = obj.custom ? '[CUSTOM]' : '[STANDARD]';
      console.log(`${type} ${obj.name}`);
      console.log(`  Label: ${obj.label}`);
      console.log(`  Queryable: ${obj.queryable}`);
      console.log('');
    });

    // If there are custom objects with villa-related names, show more details
    const villaObjects = relevantObjects.filter((obj) =>
      obj.name.toLowerCase().includes('villa')
    );

    if (villaObjects.length > 0) {
      console.log('\n=== VILLA-RELATED OBJECTS ===\n');
      for (const obj of villaObjects) {
        console.log(`Describing ${obj.name}...`);
        const detail = await conn.describe(obj.name);
        console.log(`Fields (${detail.fields.length}):`);
        detail.fields
          .filter((f) => f.custom || f.name === 'Id' || f.name === 'Name')
          .slice(0, 20)
          .forEach((field) => {
            console.log(`  - ${field.name} (${field.type})`);
          });
        console.log('');
      }
    }

    // Show all custom objects
    const allCustomObjects = describe.sobjects.filter((obj) => obj.custom);
    console.log(`\n=== ALL CUSTOM OBJECTS (${allCustomObjects.length}) ===\n`);
    allCustomObjects.slice(0, 50).forEach((obj) => {
      console.log(`- ${obj.name} (${obj.label})`);
    });
    if (allCustomObjects.length > 50) {
      console.log(`... and ${allCustomObjects.length - 50} more`);
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
  */
}

discoverObjects();
