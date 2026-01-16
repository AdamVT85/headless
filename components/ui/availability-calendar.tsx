/**
 * VINTAGE TRAVEL - AVAILABILITY CALENDAR (MULTI-WEEK SELECTION)
 * Visual calendar showing available and booked dates with real-time pricing
 * Connected to Salesforce CRM Weekly_Rate__c data
 *
 * PHASE 44: Multi-week block selection
 * - Click 1: Selects start week
 * - Click 2: Selects end week (validates range)
 * - Calculates total price by summing all weeks
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, formatWeeklyPrice } from '@/lib/utils';
import { WeeklyRate } from '@/types/villa';

interface AvailabilityCalendarProps {
  availability?: WeeklyRate[]; // Real-time availability from Salesforce
  villaId: string; // Villa ID for booking URL construction
  onWeekSelect?: (weekRate: WeeklyRate) => void; // Called when user selects an available week
  initialStartDate?: string; // ISO date string to pre-select (e.g., "2026-06-06")
  className?: string;
}

/**
 * Format date for display
 * @param date - Date to format
 * @returns Formatted string like "27 June 2026"
 */
function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Find the first available week in the dataset
 * "Available" means: status === 'Available' AND price is not null/zero
 */
function findFirstAvailableWeek(availability: WeeklyRate[]): WeeklyRate | undefined {
  return availability.find(
    (rate) => rate.status === 'Available' && rate.price != null && rate.price > 0
  );
}

/**
 * Determine the initial month to display
 * Prioritizes the first available week, falls back to current month
 */
function getInitialMonth(availability: WeeklyRate[]): Date {
  const firstAvailable = findFirstAvailableWeek(availability);

  if (firstAvailable) {
    const date = new Date(firstAvailable.weekStartDate);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  if (availability.length > 0) {
    const firstDate = new Date(availability[0].weekStartDate);
    return new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
  }

  return new Date();
}

/**
 * Format date to YYYY-MM-DD without timezone conversion
 */
const formatDateISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function AvailabilityCalendar({
  availability = [],
  villaId,
  onWeekSelect,
  initialStartDate,
  className,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => getInitialMonth(availability));

  // PHASE 44: Multi-week selection state (STRING-BASED)
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);

  // Create availability map for O(1) lookups
  const availabilityMap = useMemo(() => {
    const map = new Map<string, WeeklyRate>();
    availability.forEach(rate => {
      const key = formatDateISO(rate.weekStartDate);
      map.set(key, rate);
    });
    console.log('[Calendar] Availability Map created with', map.size, 'entries');
    return map;
  }, [availability]);

  // Helper: Get week data by date string
  const getWeekData = (dateStr: string) => {
    return availabilityMap.get(dateStr);
  };

  // Helper: Add weeks to a date string
  const addWeeksToDateString = (dateStr: string, weeks: number): string => {
    const date = new Date(dateStr + 'T00:00:00');
    date.setDate(date.getDate() + (weeks * 7));
    return formatDateISO(date);
  };

  // Validate range: all intermediate weeks must be available
  const isRangeValid = (startStr: string, endStr: string): boolean => {
    console.log('[Calendar] Validating range:', startStr, 'to', endStr);

    const weekDates: string[] = [];
    let current = startStr;

    while (current <= endStr) {
      weekDates.push(current);
      current = addWeeksToDateString(current, 1);
    }

    console.log('[Calendar] Checking weeks:', weekDates);

    for (const weekDate of weekDates) {
      const week = getWeekData(weekDate);
      console.log('[Calendar]  -', weekDate, ':', week?.status);

      if (!week || week.status !== 'Available') {
        console.log('[Calendar] ❌ Range invalid at', weekDate);
        return false;
      }
    }

    console.log('[Calendar] ✓ Range valid -', weekDates.length, 'weeks');
    return true;
  };

  // Calculate summary for selected range
  const summary = useMemo(() => {
    if (!rangeStart) return { price: 0, weeks: 0, startDate: null, endDate: null, weekRates: [] };

    const endStr = rangeEnd || rangeStart;
    let total = 0;
    let count = 0;
    let current = rangeStart;
    const weekRates: WeeklyRate[] = [];

    while (current <= endStr) {
      const data = getWeekData(current);
      if (data) {
        total += data.price || 0;
        weekRates.push(data);
      }
      count++;
      current = addWeeksToDateString(current, 1);
    }

    const startDate = new Date(rangeStart + 'T00:00:00');
    const endDate = new Date(endStr + 'T00:00:00');
    endDate.setDate(endDate.getDate() + 7); // Checkout is 7 days after last week start

    console.log('[Calendar] Summary:', { start: rangeStart, end: endStr, weeks: count, price: total });

    return { price: total, weeks: count, startDate, endDate, weekRates };
  }, [rangeStart, rangeEnd, availabilityMap]);

  // Update displayed month when availability data changes
  useEffect(() => {
    if (availability.length > 0) {
      const firstAvailable = findFirstAvailableWeek(availability);
      if (firstAvailable) {
        const date = new Date(firstAvailable.weekStartDate);
        const targetMonth = new Date(date.getFullYear(), date.getMonth(), 1);

        const hasDataInCurrentMonth = availability.some((rate) => {
          const rateDate = new Date(rate.weekStartDate);
          return rateDate.getFullYear() === currentMonth.getFullYear() &&
                 rateDate.getMonth() === currentMonth.getMonth();
        });

        if (!hasDataInCurrentMonth) {
          console.log(`[Calendar] 📅 Smart jump to first available month`);
          setCurrentMonth(targetMonth);
        }
      }
    }
  }, [availability]);

  // Auto-select week from URL parameter
  useEffect(() => {
    if (initialStartDate && availability.length > 0) {
      console.log('[Calendar] 🎯 Auto-selecting from URL param:', initialStartDate);

      const matchingWeek = availability.find((rate) => {
        return formatDateISO(rate.weekStartDate) === initialStartDate;
      });

      if (matchingWeek) {
        const targetDate = new Date(matchingWeek.weekStartDate);
        const targetMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        setCurrentMonth(targetMonth);
        setRangeStart(initialStartDate);
        setRangeEnd(null);
      }
    }
  }, [initialStartDate, availability]);

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // PHASE 44: Handle date click with range selection (ALLOWS EXTENDING)
  const handleDateClick = (date: Date) => {
    const dateStr = formatDateISO(date);
    const clickedWeek = getWeekData(dateStr);

    console.log('[Calendar] 🎯 Date clicked:', dateStr, '- Week data:', clickedWeek);

    // Only interact with Available dates
    if (!clickedWeek || clickedWeek.status !== 'Available') {
      console.log('[Calendar] Ignoring click - not available');
      return;
    }

    // SCENARIO A: No selection yet - Start new range
    if (!rangeStart) {
      console.log('[Calendar] Starting new selection at', dateStr);
      setRangeStart(dateStr);
      setRangeEnd(null);
      return;
    }

    // SCENARIO B: Start only (no end yet)
    if (rangeStart && !rangeEnd) {
      // Toggle: Clicking on the same week deselects it
      if (dateStr === rangeStart) {
        console.log('[Calendar] Toggling off single week selection');
        setRangeStart(null);
        setRangeEnd(null);
        return;
      }
      // Clicking after start → Try to set end
      if (dateStr > rangeStart) {
        console.log('[Calendar] Attempting to set end from', rangeStart, 'to', dateStr);
        if (isRangeValid(rangeStart, dateStr)) {
          console.log('[Calendar] ✓ Setting range end');
          setRangeEnd(dateStr);
        } else {
          console.log('[Calendar] ❌ Invalid range - resetting to new start');
          setRangeStart(dateStr);
          setRangeEnd(null);
        }
      }
      // Clicking before start → Reset to new start
      else {
        console.log('[Calendar] Clicked before start - resetting to', dateStr);
        setRangeStart(dateStr);
        setRangeEnd(null);
      }
      return;
    }

    // SCENARIO C: Complete range (start + end) - Allow extending
    if (rangeStart && rangeEnd) {
      // Clicking after end → Try to extend end
      if (dateStr > rangeEnd) {
        console.log('[Calendar] Attempting to extend range from', rangeEnd, 'to', dateStr);
        if (isRangeValid(rangeStart, dateStr)) {
          console.log('[Calendar] ✓ Extending range end');
          setRangeEnd(dateStr);
        } else {
          console.log('[Calendar] ❌ Invalid extension - resetting to new start');
          setRangeStart(dateStr);
          setRangeEnd(null);
        }
      }
      // Clicking before start → Reset to new start
      else if (dateStr < rangeStart) {
        console.log('[Calendar] Clicked before start - resetting to', dateStr);
        setRangeStart(dateStr);
        setRangeEnd(null);
      }
      // Clicking within range → Reset to new start
      else {
        console.log('[Calendar] Clicked within range - resetting to', dateStr);
        setRangeStart(dateStr);
        setRangeEnd(null);
      }
      return;
    }
  };

  // Check if a date is in the selected range
  const isDateInRange = (dateStr: string): boolean => {
    if (!rangeStart) return false;
    const endStr = rangeEnd || rangeStart;
    return dateStr >= rangeStart && dateStr <= endStr;
  };

  // Navigation
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Generate calendar days
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <div className={cn('bg-white border border-stone-200 rounded-sm p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-clay rounded-sm transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5 text-olive" />
        </button>

        <h3 className="font-serif text-lg font-medium text-olive">
          {monthName}
        </h3>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-clay rounded-sm transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5 text-olive" />
        </button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-stone-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />;
          }

          const date = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
          );
          const dateStr = formatDateISO(date);
          const isPast = isPastDate(date);
          const weeklyRate = getWeekData(dateStr);

          // No rate data - show as plain date
          if (!weeklyRate) {
            return (
              <div
                key={day}
                className="aspect-square flex items-center justify-center text-sm text-stone-400"
              >
                {day}
              </div>
            );
          }

          const isAvailable = weeklyRate.status === 'Available' && !isPast;
          const isBooked = weeklyRate.status === 'Booked';
          const isInRange = isDateInRange(dateStr);
          const isRangeStart = dateStr === rangeStart;
          const isRangeEnd = dateStr === rangeEnd;

          return (
            <button
              key={day}
              onClick={() => handleDateClick(date)}
              disabled={!isAvailable}
              className={cn(
                'aspect-square flex flex-col items-center justify-center text-xs rounded-sm transition-all border-2',
                // Available dates - clickable
                isAvailable && !isInRange && 'bg-palm-50 border-palm-200 hover:bg-palm-100 hover:border-palm cursor-pointer text-palm-700',
                // Selected range
                isInRange && isAvailable && 'bg-palm text-white border-palm',
                // Range start/end emphasis
                (isRangeStart || isRangeEnd) && 'ring-2 ring-olive',
                // Booked dates
                isBooked && 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed',
                // Past or no data
                (!weeklyRate || isPast) && 'bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed'
              )}
              aria-label={`${monthName} ${day}${isAvailable ? ' - Available' : isBooked ? ' - Booked' : ' - Unavailable'}`}
            >
              <span className={cn('font-semibold', isBooked && 'line-through')}>
                {day}
              </span>
              {weeklyRate && (
                <span className={cn('text-[10px] mt-0.5', isBooked && 'line-through')}>
                  {formatWeeklyPrice(weeklyRate.price)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-stone-200 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-palm-50 rounded-sm border-2 border-palm-200" />
          <span className="text-stone-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-palm rounded-sm border-2 border-palm" />
          <span className="text-stone-600">Selected Range</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-stone-100 rounded-sm border-2 border-stone-200 relative">
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="h-px w-3/4 bg-stone-400" />
            </span>
          </div>
          <span className="text-stone-600">Booked</span>
        </div>
      </div>

      {/* Booking Summary Panel - PHASE 44: Multi-week */}
      {rangeStart && summary.startDate && (
        <div className="mt-6 p-4 bg-stone-50 border border-stone-200 rounded-sm space-y-3">
          <h4 className="font-serif text-lg font-medium text-olive">
            Booking Summary
          </h4>

          {/* Week count */}
          <div className="text-sm text-stone-600">
            <span className="font-semibold text-olive">{summary.weeks}</span> week{summary.weeks > 1 ? 's' : ''} selected
          </div>

          {/* Check-in and Check-out Dates */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Check-in:</span>
              <span className="font-medium text-olive">
                {formatDateDisplay(summary.startDate)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Check-out:</span>
              <span className="font-medium text-olive">
                {summary.endDate ? formatDateDisplay(summary.endDate) : '-'}
              </span>
            </div>
          </div>

          {/* Price Display */}
          <div className="pt-3 border-t border-stone-300">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-stone-600">Total:</span>
              <span className="font-serif text-2xl text-terracotta">
                {summary.price > 0
                  ? `£${summary.price.toLocaleString('en-GB')}`
                  : 'Price on Request'}
              </span>
            </div>
          </div>

          {/* Call to Action Button */}
          <Link
            href={`/book/${villaId}?startDate=${rangeStart}${rangeEnd ? `&endDate=${rangeEnd}` : ''}`}
            className="block w-full bg-terracotta hover:bg-terracotta/90 text-white text-center py-3 rounded-sm transition-colors font-semibold mt-4"
          >
            {summary.price > 0 ? 'Start Booking' : 'Enquire Now'}
          </Link>

          <p className="text-xs text-stone-500 text-center mt-2">
            {summary.weeks}-week stay • Saturday to Saturday
          </p>
        </div>
      )}
    </div>
  );
}
