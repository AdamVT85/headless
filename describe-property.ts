/**
 * Describe Property__c object fields
 * Run with: npx tsx describe-property.ts
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

// DISABLED: getConn is not exported from crm-client
// import { getConn } from './lib/crm-client';

async function describeProperty() {
  console.log('=== SCRIPT DISABLED: getConn is not exported ===\n');
  return;

  /* ORIGINAL CODE - DISABLED
  console.log('=== DESCRIBING PROPERTY__C OBJECT ===\n');

  try {
    const conn = await getConn();

    const describe = await conn.describe('Property__c');

    console.log(`Object: ${describe.name}`);
    console.log(`Label: ${describe.label}`);
    console.log(`Total fields: ${describe.fields.length}\n`);

    // Show all custom fields
    const customFields = describe.fields.filter((f) => f.custom);
    console.log(`=== CUSTOM FIELDS (${customFields.length}) ===\n`);
    customFields.forEach((field) => {
      console.log(`${field.name}`);
      console.log(`  Type: ${field.type}`);
      console.log(`  Label: ${field.label}`);
      if (field.type === 'picklist' && field.picklistValues && field.picklistValues.length < 10) {
        console.log(`  Values: ${field.picklistValues.map((v: any) => v.value).join(', ')}`);
      }
      console.log('');
    });

    // Show standard fields
    const standardFields = describe.fields.filter((f) => !f.custom);
    console.log(`\n=== STANDARD FIELDS (${standardFields.length}) ===\n`);
    standardFields.forEach((field) => {
      console.log(`- ${field.name} (${field.type}): ${field.label}`);
    });

    // Query a few records to see what data looks like
    console.log('\n=== SAMPLE RECORDS ===\n');
    const query = `
      SELECT Id, Name
      FROM Property__c
      LIMIT 5
    `;
    const result = await conn.query(query);
    console.log(`Found ${result.totalSize} record(s):\n`);
    result.records.forEach((record: any) => {
      console.log(`- ${record.Id}: ${record.Name}`);
    });
  } catch (error) {
    console.error('\n❌ ERROR:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
  */
}

describeProperty();
