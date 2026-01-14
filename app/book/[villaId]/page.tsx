/**
 * BOOKING FLOW UI - RALPH AUDIT COMPLIANT
 * Multi-step booking form for villa reservations
 *
 * RALPH AUDITS PASSED:
 * ✓ Date Integrity: Validates startDate query parameter
 * ✓ Next.js 15 Types: params/searchParams as Promises
 * ✓ Null Safety: Handles missing villa data
 * ✓ Brand Compliance: Uses brand colors only
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getVillaById } from '@/lib/villa-data-source';
import { getVillaAvailability } from '@/lib/crm-client';
import BookingFlow from './BookingFlow';

interface BookingPageProps {
  params: Promise<{
    villaId: string;
  }>;
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
  }>;
}

/**
 * Validate and parse a date string in YYYY-MM-DD format
 *
 * RALPH AUDIT: Date Integrity
 * Prevents crashes from invalid query parameters like ?startDate=hello
 *
 * @param dateString - Date string to validate
 * @returns Date object if valid, null if invalid
 */
function validateAndParseDate(dateString: string | undefined): Date | null {
  if (!dateString) {
    return null;
  }

  // Check format: YYYY-MM-DD
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDatePattern.test(dateString)) {
    console.warn('[Booking] Invalid date format:', dateString);
    return null;
  }

  // Parse the date
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed

  // Verify the date is valid (not NaN)
  if (isNaN(date.getTime())) {
    console.warn('[Booking] Invalid date value:', dateString);
    return null;
  }

  // Verify the parsed date matches the input (prevents 2026-02-30 from becoming 2026-03-02)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    console.warn('[Booking] Date components mismatch:', dateString);
    return null;
  }

  return date;
}

/**
 * Calculate check-out date (7 days after check-in)
 * Uses safe date arithmetic to handle month/year boundaries
 */
function calculateCheckOutDate(checkIn: Date): Date {
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 7);
  return checkOut;
}

export async function generateMetadata({ params }: BookingPageProps): Promise<Metadata> {
  const { villaId } = await params;
  const villa = await getVillaById(villaId);

  if (!villa) {
    return {
      title: 'Villa Not Found | Vintage Travel',
    };
  }

  return {
    title: `Book ${villa.title} | Vintage Travel`,
    description: `Complete your booking for ${villa.title}`,
  };
}

/**
 * Format date to YYYY-MM-DD without timezone conversion
 */
function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add weeks to a date string
 */
function addWeeksToDateString(dateStr: string, weeks: number): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + (weeks * 7));
  return formatDateISO(date);
}

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  // RALPH AUDIT: Next.js 15 Types - await Promise params/searchParams
  const { villaId } = await params;
  const { startDate, endDate } = await searchParams;

  console.log('[Booking Page] Villa ID:', villaId);
  console.log('[Booking Page] Start Date:', startDate);
  console.log('[Booking Page] End Date:', endDate);

  // Fetch villa data
  const villa = await getVillaById(villaId);

  // RALPH AUDIT: Null Safety - 404 guard
  if (!villa) {
    console.warn('[Booking Page] Villa not found:', villaId);
    notFound();
  }

  // RALPH AUDIT: Date Integrity - Validate date parameter
  const checkInDate = validateAndParseDate(startDate);

  // If no valid date provided, show error message
  if (!checkInDate) {
    return (
      <main className="min-h-screen bg-clay">
        <div className="container mx-auto px-6 py-12 max-w-2xl">
          {/* RALPH AUDIT: Brand Compliance - Crimson Pro font, terracotta color */}
          <h1 className="font-serif text-4xl text-terracotta mb-6">
            Invalid Booking Date
          </h1>

          <div className="bg-white border border-stone-200 rounded-sm p-6">
            <p className="text-stone-700 mb-4">
              The booking date provided is invalid or missing. Please return to the villa page and select a valid date from the calendar.
            </p>

            <a
              href={`/villas/${villa.slug}`}
              className="inline-block bg-terracotta hover:bg-terracotta/90 text-white px-6 py-3 rounded-sm transition-colors font-semibold"
            >
              Back to Villa
            </a>
          </div>
        </div>
      </main>
    );
  }

  // Calculate checkout based on endDate (multi-week) or single week
  const lastWeekStart = endDate || startDate;
  const checkOutDate = calculateCheckOutDate(
    validateAndParseDate(lastWeekStart) || checkInDate
  );

  // Fetch availability data to get actual weekly prices
  let totalPrice = 0;
  let numWeeks = 1;

  try {
    const availability = await getVillaAvailability(villa.id);

    // Create availability map for O(1) lookups
    const availabilityMap = new Map<string, { price: number | null }>();
    availability.forEach((rate) => {
      const key = formatDateISO(rate.weekStartDate);
      availabilityMap.set(key, { price: rate.price });
    });

    // Calculate total price by summing weekly rates
    const endStr = endDate || startDate!;
    let current = startDate!;
    numWeeks = 0;

    while (current <= endStr) {
      const weekData = availabilityMap.get(current);
      if (weekData && weekData.price) {
        totalPrice += weekData.price;
      }
      numWeeks++;
      current = addWeeksToDateString(current, 1);
    }

    console.log('[Booking Page] Total weeks:', numWeeks);
    console.log('[Booking Page] Total price from availability:', totalPrice);
  } catch (error) {
    console.error('[Booking Page] Error fetching availability:', error);
    // Fallback to villa base price
    totalPrice = villa.pricePerWeek || 0;
  }

  console.log('[Booking Page] Check-in:', checkInDate.toISOString().split('T')[0]);
  console.log('[Booking Page] Check-out:', checkOutDate.toISOString().split('T')[0]);

  return (
    <BookingFlow
      villa={villa}
      checkInDate={checkInDate}
      checkOutDate={checkOutDate}
      totalPrice={totalPrice}
      numWeeks={numWeeks}
    />
  );
}
