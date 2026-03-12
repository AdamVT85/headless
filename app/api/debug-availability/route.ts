/**
 * DEBUG ENDPOINT: Check raw Salesforce availability data for a villa
 * Usage: /api/debug-availability?slug=luna
 *
 * Returns RAW Salesforce record keys and values to diagnose field name casing issues.
 * REMOVE THIS ENDPOINT before production launch.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVillaBySlug } from '@/lib/villa-data-source';
import jsforce from 'jsforce';
import { format } from 'date-fns';

const { SF_USERNAME, SF_PASSWORD, SF_TOKEN, SF_LOGIN_URL } = process.env;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const villaId = searchParams.get('villaId');
  const slug = searchParams.get('slug');

  if (!villaId && !slug) {
    return NextResponse.json({ error: 'Provide ?villaId=XXX or ?slug=luna' }, { status: 400 });
  }

  try {
    let resolvedVillaId = villaId;

    if (slug && !villaId) {
      const villa = await getVillaBySlug(slug);
      if (!villa) {
        return NextResponse.json({ error: `Villa not found for slug: ${slug}` }, { status: 404 });
      }
      resolvedVillaId = villa.id;
    }

    // Connect directly to Salesforce for raw data
    if (!SF_USERNAME || !SF_PASSWORD || !SF_TOKEN) {
      return NextResponse.json({ error: 'Missing Salesforce credentials' }, { status: 500 });
    }

    const conn = new jsforce.Connection({
      loginUrl: SF_LOGIN_URL || 'https://login.salesforce.com',
    });
    await conn.login(SF_USERNAME, SF_PASSWORD + SF_TOKEN);

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const result = await conn.query(
      `SELECT
        Id,
        WR_Week_Start_Date__c,
        WR_Live_Sell_This_Year__c,
        WR_Status__c,
        WR_Group_of__c,
        WR_Display_Daily_Rate__c
      FROM Weekly_Rate__c
      WHERE WR_Contract__r.CON_Property__c = '${resolvedVillaId}'
        AND WR_Week_Start_Date__c >= ${todayStr}
      ORDER BY WR_Week_Start_Date__c ASC
      LIMIT 5`
    );

    // Get raw record keys to diagnose casing
    const firstRecord = result.records[0] as Record<string, unknown> | undefined;
    const allKeys = firstRecord ? Object.keys(firstRecord) : [];

    // Find any key containing "daily" (case-insensitive)
    const dailyKeys = allKeys.filter(k => k.toLowerCase().includes('daily'));

    // Find any key containing "display" (case-insensitive)
    const displayKeys = allKeys.filter(k => k.toLowerCase().includes('display'));

    return NextResponse.json({
      villaId: resolvedVillaId,
      slug: slug || null,
      totalRecords: result.totalSize,
      diagnosis: {
        allFieldKeys: allKeys,
        keysContainingDaily: dailyKeys,
        keysContainingDisplay: displayKeys,
        exactFieldWeExpect: 'WR_Display_Daily_Rate__c',
        fieldExists: allKeys.includes('WR_Display_Daily_Rate__c'),
        // Try common casing variants
        casingVariants: {
          'WR_Display_Daily_Rate__c': firstRecord?.['WR_Display_Daily_Rate__c'],
          'WR_Display_Daily_Rate__c': firstRecord?.['WR_Display_Daily_Rate__c'],
          'WR_Display_daily_rate__c': firstRecord?.['WR_Display_daily_rate__c'],
          'WR_Display_Daily_Rate__c (type)': typeof firstRecord?.['WR_Display_Daily_Rate__c'],
          'WR_Display_Daily_Rate__c (type)': typeof firstRecord?.['WR_Display_Daily_Rate__c'],
        },
      },
      // Raw first 3 records with all fields as Salesforce returns them
      rawRecords: result.records.slice(0, 3),
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5),
    }, { status: 500 });
  }
}
