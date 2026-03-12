/**
 * DEBUG ENDPOINT: Check raw availability data for a villa
 * Usage: /api/debug-availability?villaId=XXXX
 * or:    /api/debug-availability?slug=luna
 *
 * Shows the raw Salesforce data including WR_Display_Daily_rate__c values
 * to diagnose why daily-rate mode may not be activating.
 *
 * REMOVE THIS ENDPOINT before production launch.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVillaAvailability } from '@/lib/crm-client';
import { getVillaBySlug } from '@/lib/villa-data-source';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const villaId = searchParams.get('villaId');
  const slug = searchParams.get('slug');

  if (!villaId && !slug) {
    return NextResponse.json({ error: 'Provide ?villaId=XXX or ?slug=luna' }, { status: 400 });
  }

  try {
    let resolvedVillaId = villaId;

    // Resolve slug to villa ID if needed
    if (slug && !villaId) {
      const villa = await getVillaBySlug(slug);
      if (!villa) {
        return NextResponse.json({ error: `Villa not found for slug: ${slug}` }, { status: 404 });
      }
      resolvedVillaId = villa.id;
    }

    const availability = await getVillaAvailability(resolvedVillaId!);

    // Analyse daily rate field
    const dailyRateTrue = availability.filter(r => r.displayDailyRate === true);
    const dailyRateFalse = availability.filter(r => r.displayDailyRate === false);
    const anyDailyRate = availability.some(r => r.displayDailyRate);

    return NextResponse.json({
      villaId: resolvedVillaId,
      slug: slug || null,
      totalRates: availability.length,
      summary: {
        dailyRateEnabled: anyDailyRate,
        dailyRateTrueCount: dailyRateTrue.length,
        dailyRateFalseCount: dailyRateFalse.length,
        uniqueStatuses: [...new Set(availability.map(r => r.status))],
        uniqueGroupSizes: [...new Set(availability.map(r => r.groupOf))].sort(),
      },
      // Show first 5 rates with all fields for diagnosis
      sampleRates: availability.slice(0, 5).map(r => ({
        id: r.id,
        weekStartDate: r.rawDateString,
        price: r.price,
        status: r.status,
        groupOf: r.groupOf,
        displayDailyRate: r.displayDailyRate,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      hint: 'Check server logs for detailed CRM debug output',
    }, { status: 500 });
  }
}
