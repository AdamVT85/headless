/**
 * Extract all unique towns from Salesforce villas
 */

const jsforce = require('jsforce');
require('dotenv').config({ path: '.env.local' });

async function extractTowns() {
  const conn = new jsforce.Connection({
    loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
  });

  await conn.login(process.env.SF_USERNAME, process.env.SF_PASSWORD + process.env.SF_TOKEN);
  console.log('Connected to Salesforce');

  const result = await conn.query(
    'SELECT P_Property_Location__c FROM Property__c WHERE P_Archive_Suppress__c = false'
  ).execute({ autoFetch: true, maxFetch: 5000 });

  const towns = new Map();

  result.records.forEach(rec => {
    const location = rec.P_Property_Location__c;
    if (location) {
      const parts = location.split(',').map(p => p.trim());
      if (parts.length >= 1 && parts[0]) {
        const town = parts[0];
        const slug = town.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        if (!towns.has(town) && town.length > 1) {
          towns.set(town, { town, slug });
        }
      }
    }
  });

  // Sort and output
  const sorted = Array.from(towns.values()).sort((a, b) => a.town.localeCompare(b.town));
  console.log('\n// Generated towns from Salesforce (' + sorted.length + ' unique towns)');
  console.log('export const TOWNS: LocationItem[] = [');
  sorted.forEach((t, i) => {
    const label = t.town.replace(/"/g, '\\"');
    console.log(`  { id: "town-${t.slug}", label: "${label}", slug: "${t.slug}", type: "town" },`);
  });
  console.log('];');
}

extractTowns().catch(console.error);
