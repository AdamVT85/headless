/**
 * PHASE 43: CALENDAR WIDGET USAGE EXAMPLE
 *
 * This file demonstrates how to integrate the CalendarWidget component
 * into a villa detail page or booking flow.
 */

'use client';

import { CalendarWidget } from './calendar-widget';
import { Availability } from '@/types/villa';
import { useRouter } from 'next/navigation';

// Example: Using CalendarWidget on a villa detail page
export function VillaBookingSection({ villaId }: { villaId: string }) {
  const router = useRouter();

  // STEP 1: Convert your existing WeeklyRate[] data to Availability[]
  // This would typically come from your villa data fetching
  const exampleAvailability: Availability[] = [
    { startDate: '2026-06-06', price: 2500, status: 'Available' },
    { startDate: '2026-06-13', price: 2800, status: 'Available' },
    { startDate: '2026-06-20', price: 3200, status: 'Booked' },
    { startDate: '2026-06-27', price: 3500, status: 'Available' },
    { startDate: '2026-07-04', price: 4000, status: 'Available' },
    { startDate: '2026-07-11', price: 4200, status: 'Available' },
    { startDate: '2026-07-18', price: 4500, status: 'Available' },
    { startDate: '2026-07-25', price: 4200, status: 'Booked' },
    { startDate: '2026-08-01', price: 4000, status: 'Available' },
  ];

  // STEP 2: Handle booking callback
  const handleBooking = (start: Date, end: Date, price: number) => {
    console.log('Booking initiated:', {
      checkIn: start.toISOString(),
      checkOut: end.toISOString(),
      totalPrice: price,
    });

    // Navigate to booking/checkout page with query params
    const params = new URLSearchParams({
      villa: villaId,
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
      price: price.toString(),
    });

    router.push(`/booking?${params.toString()}`);
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="font-serif text-3xl text-olive mb-8">Book Your Stay</h1>

      <div className="max-w-2xl">
        <CalendarWidget
          availability={exampleAvailability}
          onBooking={handleBooking}
        />
      </div>
    </div>
  );
}

// Example: Converting WeeklyRate[] to Availability[]
export function convertWeeklyRatesToAvailability(
  weeklyRates: Array<{
    weekStartDate: Date | string;
    price: number | null;
    status: string;
  }>
): Availability[] {
  return weeklyRates
    .filter(rate => rate.price != null && rate.price > 0) // Exclude rates without pricing
    .map(rate => {
      // Convert Date to ISO string if needed
      const dateStr =
        typeof rate.weekStartDate === 'string'
          ? rate.weekStartDate
          : rate.weekStartDate.toISOString().split('T')[0];

      return {
        startDate: dateStr,
        price: rate.price!,
        status: rate.status as 'Available' | 'Booked' | 'Hold',
      };
    });
}

// Example: Integrating into existing villa page
/*
// In your app/villas/[slug]/page.tsx:

import { CalendarWidget } from '@/components/ui/calendar-widget';
import { convertWeeklyRatesToAvailability } from '@/components/ui/calendar-widget.example';

export default async function VillaPage({ params }: { params: { slug: string } }) {
  // Fetch villa data
  const villa = await getVillaBySlug(params.slug);
  const weeklyRates = await getVillaAvailability(villa.id);

  // Convert to Availability format
  const availability = convertWeeklyRatesToAvailability(weeklyRates);

  const handleBooking = (start: Date, end: Date, price: number) => {
    'use server';
    // Handle booking logic
  };

  return (
    <div>
      <h1>{villa.name}</h1>

      <CalendarWidget
        availability={availability}
        onBooking={handleBooking}
      />
    </div>
  );
}
*/
