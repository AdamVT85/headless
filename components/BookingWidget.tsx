'use client';

/**
 * VINTAGE TRAVEL - BOOKING WIDGET (CLIENT COMPONENT)
 *
 * This component demonstrates the critical "NEVER CACHE" availability pattern:
 * - Fetches LIVE availability from SFCC on every mount
 * - Shows loading state while fetching
 * - Handles the race condition (DateUnavailableError)
 * - Provides immediate basket reservation when user selects dates
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getVillaAvailability,
} from '@/lib/sfcc-client';
import {
  VillaAvailabilityFromSFCC,
} from '@/types/villa';
import { initiateBooking } from '@/app/actions/booking';

interface BookingWidgetProps {
  sfccId: string;
  villaTitle: string;
}

export default function BookingWidget({ sfccId, villaTitle }: BookingWidgetProps) {
  const router = useRouter();
  const [availability, setAvailability] = useState<VillaAvailabilityFromSFCC | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [selectedDates, setSelectedDates] = useState<{
    start: string;
    end: string;
  } | null>(null);

  // CRITICAL: Fetch availability on mount (and NEVER cache)
  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true);
      setError(null);

      try {
        // Fetch 30 days of availability starting today
        const startDate = new Date('2026-06-01'); // Fixed for testing
        const endDate = new Date('2026-06-30');

        const data = await getVillaAvailability(sfccId, startDate, endDate);
        setAvailability(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load availability');
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, [sfccId]);

  // Handle booking attempt using Server Action (PHASE 4)
  const handleBooking = async (startDate: string, endDate: string) => {
    setBookingError(null);
    setBookingSuccess(null);
    setBookingInProgress(true);

    try {
      // Call Server Action to initiate booking
      const result = await initiateBooking(sfccId, startDate, endDate);

      if (result.success && result.checkoutUrl) {
        // Success: Show message then redirect to checkout
        setBookingSuccess(`Reservation successful! Redirecting to checkout...`);

        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push(result.checkoutUrl!);
        }, 1500);
      } else {
        // Error: Show error message
        setBookingError(result.error?.message || 'Booking failed. Please try again.');
      }
    } catch (err) {
      setBookingError('An unexpected error occurred. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setBookingInProgress(false);
    }
  };

  // Quick test function to try booking conflict dates
  const handleQuickTestConflict = () => {
    handleBooking('2026-06-01', '2026-06-07');
  };

  // Quick test function to try booking available dates
  const handleQuickTestAvailable = () => {
    handleBooking('2026-06-15', '2026-06-20');
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
        <p className="text-sm text-gray-500 mt-4">Loading availability...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">Error loading availability: {error}</p>
      </div>
    );
  }

  if (!availability) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">No availability data found.</p>
      </div>
    );
  }

  // Count available vs booked dates
  const availableDates = availability.calendar.filter(d => d.status === 'available').length;
  const bookedDates = availability.calendar.filter(d => d.status === 'booked').length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Book Your Stay</h3>

      {/* Price Display */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">From</p>
        <p className="text-3xl font-bold text-gray-900" data-testid="price-display">
          £{availability.pricePerWeek.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">per week</p>
      </div>

      {/* Availability Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">{availableDates}</span> available dates
        </p>
        <p className="text-sm text-gray-500">
          <span className="font-semibold">{bookedDates}</span> already booked
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Last updated: {availability.lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      {/* Test Buttons (for demo/testing) */}
      <div className="space-y-3 mb-6">
        <button
          onClick={handleQuickTestAvailable}
          disabled={bookingInProgress}
          className={`w-full px-4 py-3 rounded-lg transition font-semibold ${
            bookingInProgress
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
          data-testid="book-available-btn"
        >
          {bookingInProgress ? 'Processing...' : 'Test: Book Available Dates (June 15-20)'}
        </button>
        <button
          onClick={handleQuickTestConflict}
          disabled={bookingInProgress}
          className={`w-full px-4 py-3 rounded-lg transition font-semibold ${
            bookingInProgress
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
          data-testid="book-conflict-btn"
        >
          {bookingInProgress ? 'Processing...' : 'Test: Book Conflict Dates (June 1-7)'}
        </button>
      </div>

      {/* Booking Success */}
      {bookingSuccess && (
        <div
          className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"
          data-testid="booking-success"
        >
          <p className="text-green-800 font-semibold">{bookingSuccess}</p>
        </div>
      )}

      {/* Booking Error (THE RACE CONDITION ALERT) */}
      {bookingError && (
        <div
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
          data-testid="booking-error"
        >
          <p className="text-red-800 font-semibold">⚠️ {bookingError}</p>
        </div>
      )}

      {/* Calendar Preview */}
      <div className="border-t pt-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">June 2026 Availability:</p>
        <div className="grid grid-cols-7 gap-1">
          {availability.calendar.slice(0, 14).map((date) => (
            <div
              key={date.date}
              className={`text-xs p-2 rounded text-center ${
                date.status === 'available'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
              title={`${date.date}: ${date.status}`}
            >
              {new Date(date.date).getDate()}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        className="w-full mt-6 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
        disabled
      >
        Select Dates to Book (Demo)
      </button>
      <p className="text-xs text-gray-500 text-center mt-2">
        * Use test buttons above to simulate booking
      </p>
    </div>
  );
}
