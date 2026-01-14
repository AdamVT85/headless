/**
 * API Route: Find Test Villa for Smart Calendar Jump
 *
 * GET /api/find-test-villa
 *
 * Finds a villa with June 2026+ availability but no early season availability
 */

import { NextResponse } from 'next/server';
// DISABLED: getConn is not exported from crm-client
// import { getConn } from '@/lib/crm-client';

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

export async function GET() {
  // DISABLED: This test endpoint requires getConn which is not exported
  return NextResponse.json({
    success: false,
    message: 'This test endpoint is currently disabled',
  }, { status: 501 });

  /* ORIGINAL CODE - DISABLED
  try {
    console.log('[API] Finding test villa...');
    const conn = await getConn();

    // Query: Find villas with 2026 availability
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

    console.log('[API] Querying weekly rates...');
    const result = await conn.query<WeeklyRateResult>(query);
    console.log(`[API] Found ${result.totalSize} weekly rates`);

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

    console.log(`[API] Analyzing ${villaMap.size} villas...`);

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

    console.log(`[API] Found ${candidates.length} candidate villas`);

    if (candidates.length > 0) {
      const testVilla = candidates[0];
      const firstDate = new Date(testVilla.firstAvailableDate);

      return NextResponse.json({
        success: true,
        villa: {
          id: testVilla.id,
          name: testVilla.name,
          firstAvailableDate: testVilla.firstAvailableDate,
          firstAvailableMonth: firstDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          }),
          earlySeasonStatus: testVilla.earlySeasonStatus,
        },
        message: `Smart Calendar should jump to ${firstDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        totalCandidates: candidates.length,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'No villas found matching criteria (no early season availability, but has June+ availability)',
      });
    }
  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
  */
}
