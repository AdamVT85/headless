/**
 * Find a test villa for Smart Calendar Jump feature
 *
 * Requirements:
 * - Has Weekly_Rate__c records starting in June 2026+
 * - Fully booked/unavailable in Jan/Feb/Mar/Apr 2026
 */

// DISABLED: getConn is not exported from crm-client
// import { getConn } from '../lib/crm-client';

interface WeeklyRateResult {
  WR_Week_Start_Date__c: string;
  WR_Status__c: string;
  WR_Live_Sell_This_Year__c: number | null;
  WR_Contract__r: {
    CON_Property__c: string;
    CON_Property__r: {
      Name: string;
    };
  };
}

async function findTestVilla() {
  console.log('[Test Villa Finder] SCRIPT DISABLED: getConn is not exported');
  return null;

  /* ORIGINAL CODE - DISABLED
  try {
    console.log('[Test Villa Finder] Connecting to Salesforce...');
    const conn = await getConn();

    // Query: Find villas with June+ availability but no early-season availability
    const query = `
      SELECT
        WR_Week_Start_Date__c,
        WR_Status__c,
        WR_Live_Sell_This_Year__c,
        WR_Contract__r.CON_Property__c,
        WR_Contract__r.CON_Property__r.Name
      FROM Weekly_Rate__c
      WHERE WR_Contract__r.Status = 'Live Pricing'
        AND WR_Week_Start_Date__c >= 2026-01-01
        AND WR_Week_Start_Date__c <= 2026-12-31
      ORDER BY WR_Contract__r.CON_Property__c, WR_Week_Start_Date__c ASC
      LIMIT 5000
    `;

    console.log('[Test Villa Finder] Querying weekly rates...');
    const result = await conn.query<WeeklyRateResult>(query);
    console.log(`[Test Villa Finder] Found ${result.totalSize} weekly rates`);

    // Group by villa
    const villaMap = new Map<string, {
      id: string;
      name: string;
      rates: { date: string; status: string; price: number | null }[];
    }>();

    result.records.forEach((record) => {
      const villaId = record.WR_Contract__r.CON_Property__c;
      const villaName = record.WR_Contract__r.CON_Property__r.Name;

      if (!villaMap.has(villaId)) {
        villaMap.set(villaId, {
          id: villaId,
          name: villaName,
          rates: [],
        });
      }

      villaMap.get(villaId)!.rates.push({
        date: record.WR_Week_Start_Date__c,
        status: record.WR_Status__c,
        price: record.WR_Live_Sell_This_Year__c,
      });
    });

    console.log(`[Test Villa Finder] Analyzing ${villaMap.size} villas...`);

    // Find villas matching our criteria
    const candidates: Array<{
      id: string;
      name: string;
      firstAvailableDate: string;
      earlySeasonStatus: string;
    }> = [];

    for (const [villaId, villa] of villaMap.entries()) {
      // Check early season (Jan-Apr 2026)
      const earlySeasonRates = villa.rates.filter((rate) => {
        const date = new Date(rate.date);
        return date >= new Date('2026-01-01') && date < new Date('2026-05-01');
      });

      // Check if any early season dates are Available
      const hasEarlyAvailability = earlySeasonRates.some(
        (rate) => rate.status === 'Available' && rate.price && rate.price > 0
      );

      // Find first available date
      const firstAvailable = villa.rates.find(
        (rate) => rate.status === 'Available' && rate.price && rate.price > 0
      );

      // Match criteria: No early availability, but has June+ availability
      if (!hasEarlyAvailability && firstAvailable) {
        const firstDate = new Date(firstAvailable.date);
        if (firstDate >= new Date('2026-05-01')) {
          candidates.push({
            id: villaId,
            name: villa.name,
            firstAvailableDate: firstAvailable.date,
            earlySeasonStatus: earlySeasonRates.length > 0 ? 'Booked' : 'No data',
          });
        }
      }
    }

    console.log('\n[Test Villa Finder] ========== RESULTS ==========');
    console.log(`Found ${candidates.length} villas matching criteria:\n`);

    if (candidates.length > 0) {
      // Show top 5 candidates
      const topCandidates = candidates.slice(0, 5);

      topCandidates.forEach((villa, index) => {
        console.log(`${index + 1}. ${villa.name}`);
        console.log(`   ID: ${villa.id}`);
        console.log(`   First Available: ${villa.firstAvailableDate}`);
        console.log(`   Early Season: ${villa.earlySeasonStatus}`);
        console.log('');
      });

      console.log('\n[Test Villa Finder] ========== TEST THIS VILLA ==========');
      console.log(`Villa ID: ${topCandidates[0].id}`);
      console.log(`Villa Name: ${topCandidates[0].name}`);
      console.log(`First Available Date: ${topCandidates[0].firstAvailableDate}`);
      console.log('\nExpected Behavior:');
      console.log('- Calendar should jump to ' + new Date(topCandidates[0].firstAvailableDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
      console.log('- Instead of showing January 2026');
      console.log('======================================\n');

      return topCandidates[0].id;
    } else {
      console.log('No villas found matching criteria.');
      console.log('Try relaxing the search parameters.');
      return null;
    }
  } catch (error) {
    console.error('[Test Villa Finder] Error:', error);
    throw error;
  }
  */
}

// Run the script
findTestVilla()
  .then((villaId) => {
    if (villaId) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
