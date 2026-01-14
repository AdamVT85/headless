/**
 * PHASE 44: MULTI-WEEK BLOCK SELECTION CALENDAR (STRING-BASED)
 *
 * Interactive calendar widget for selecting week blocks (Saturday to Saturday).
 * - Click 1: Selects start week
 * - Click 2: Selects end week
 * - Validates all intermediate weeks are available
 * - Calculates total price by summing weekly rates
 * - Checkout date = Start date of last selected week + 7 days
 *
 * FIX: Uses PURE string-based comparison (YYYY-MM-DD) for all logic
 */

'use client';

import { useState, useMemo } from 'react';
import { format, addDays, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, startOfDay } from 'date-fns';
import { Availability } from '@/types/villa';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarWidgetProps {
  availability: Availability[]; // Array of Weekly Rates (Start Date, Price, Status)
  onBooking: (start: Date, end: Date, price: number) => void;
}

export function CalendarWidget({ availability, onBooking }: CalendarWidgetProps) {
  // 1. Navigation State - Determine initial month from first available week
  const getInitialMonth = () => {
    const firstAvailable = availability.find(a => a.status === 'Available');
    if (firstAvailable) {
      return startOfDay(parseISO(firstAvailable.startDate));
    }
    return new Date(2026, 5, 1); // Default to June 2026
  };

  const [currentMonth, setCurrentMonth] = useState(getInitialMonth());

  // 2. Selection State (STRING-BASED: YYYY-MM-DD)
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);

  // 3. Data Normalization: Create a Map for O(1) lookups by "YYYY-MM-DD"
  const availabilityMap = useMemo(() => {
    const map = new Map<string, Availability>();
    availability.forEach(item => {
      map.set(item.startDate, item);
    });
    console.log('[CALENDAR] Availability Map created with', map.size, 'entries');
    console.log('[CALENDAR] First 5 keys:', Array.from(map.keys()).slice(0, 5));
    return map;
  }, [availability]);

  // Helper: Get data using a date string
  const getWeekData = (dateStr: string) => {
    return availabilityMap.get(dateStr);
  };

  // Helper: Convert Date to YYYY-MM-DD string
  const toDateString = (date: Date): string => {
    return format(startOfDay(date), 'yyyy-MM-dd');
  };

  // Helper: Add weeks to a date string
  const addWeeksToDateString = (dateStr: string, weeks: number): string => {
    const date = parseISO(dateStr);
    const newDate = addDays(date, weeks * 7);
    return format(newDate, 'yyyy-MM-dd');
  };

  // 4. Validation Logic (STRING-BASED)
  const isRangeValid = (startStr: string, endStr: string): boolean => {
    console.log('[CALENDAR] Validating range:', startStr, 'to', endStr);

    // Generate all week dates in the range
    const weekDates: string[] = [];
    let current = startStr;

    while (current <= endStr) {
      weekDates.push(current);
      current = addWeeksToDateString(current, 1);
    }

    console.log('[CALENDAR] Checking weeks:', weekDates);

    // Check each week is available
    for (const weekDate of weekDates) {
      const week = getWeekData(weekDate);
      console.log('[CALENDAR]  -', weekDate, ':', week?.status);

      if (!week || week.status !== 'Available') {
        console.log('[CALENDAR] ❌ Range invalid at', weekDate);
        return false;
      }
    }

    console.log('[CALENDAR] ✓ Range valid -', weekDates.length, 'weeks');
    return true;
  };

  // 5. Click Handler (STRING-BASED)
  const handleDateClick = (date: Date) => {
    const dateStr = toDateString(date);
    const clickedWeek = getWeekData(dateStr);

    console.log('[CALENDAR] Date clicked:', dateStr, '- Week data:', clickedWeek);

    // Only interact with Available start dates
    if (!clickedWeek || clickedWeek.status !== 'Available') {
      console.log('[CALENDAR] Ignoring click - not available');
      return;
    }

    // SCENARIO A: Start Fresh (Nothing selected, or fully selected)
    if (!rangeStart || (rangeStart && rangeEnd)) {
      console.log('[CALENDAR] Starting new selection at', dateStr);
      setRangeStart(dateStr);
      setRangeEnd(null);
      return;
    }

    // SCENARIO B: Complete Selection (Clicking AFTER start)
    if (dateStr > rangeStart) {
      console.log('[CALENDAR] Attempting to complete range from', rangeStart, 'to', dateStr);
      if (isRangeValid(rangeStart, dateStr)) {
        console.log('[CALENDAR] ✓ Completing valid range');
        setRangeEnd(dateStr);
      } else {
        console.log('[CALENDAR] ❌ Invalid range - resetting to new start');
        setRangeStart(dateStr);
        setRangeEnd(null);
      }
    }
    // SCENARIO C: Reset (Clicking BEFORE or SAME as start)
    else {
      console.log('[CALENDAR] Clicked before/at start - resetting to', dateStr);
      setRangeStart(dateStr);
      setRangeEnd(null);
    }
  };

  // 6. Calculate Totals (STRING-BASED)
  const summary = useMemo(() => {
    if (!rangeStart) return { price: 0, weeks: 0, checkout: null, startDate: null, endDate: null };

    const endStr = rangeEnd || rangeStart;
    let total = 0;
    let count = 0;
    let current = rangeStart;

    // Count weeks and sum prices
    while (current <= endStr) {
      const data = getWeekData(current);
      if (data) total += data.price;
      count++;
      current = addWeeksToDateString(current, 1);
    }

    // Calculate checkout date (7 days after last selected week)
    const checkoutDate = addDays(parseISO(endStr), 7);

    console.log('[CALENDAR] Summary:', { start: rangeStart, end: endStr, weeks: count, price: total });

    return {
      price: total,
      weeks: count,
      checkout: checkoutDate,
      startDate: parseISO(rangeStart),
      endDate: checkoutDate,
    };
  }, [rangeStart, rangeEnd, availabilityMap]);

  // 7. Styling Helper (STRING-BASED)
  const getDayClass = (day: Date) => {
    const dateStr = toDateString(day);
    const week = getWeekData(dateStr);
    if (!week) return "text-stone-300 cursor-default"; // Not a changeover day

    let classes = "cursor-pointer font-medium transition-colors ";

    // Status Styling
    if (week.status === 'Booked' || week.status === 'Hold') {
      return classes + "bg-stone-100 text-stone-400 line-through cursor-not-allowed";
    }

    // Selection Styling (STRING-BASED)
    const isSelected = rangeStart && (
      dateStr === rangeStart ||
      (rangeEnd && dateStr === rangeEnd) ||
      (rangeEnd && dateStr > rangeStart && dateStr < rangeEnd)
    );

    if (isSelected) {
      return classes + "bg-olive text-white shadow-md";
    }

    return classes + "bg-stone-50 text-stone-700 hover:bg-olive/20 hover:text-olive";
  };

  const getPriceDisplay = (day: Date) => {
    const dateStr = toDateString(day);
    const week = getWeekData(dateStr);
    if (!week || week.status !== 'Available') return null;
    return `£${week.price.toLocaleString()}`;
  };

  // 8. Generate calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add padding days for proper grid alignment (Sunday = 0, Monday = 1, etc.)
  const firstDayOfWeek = getDay(monthStart);
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => null);
  const allDays = [...paddingDays, ...calendarDays];

  // 9. Navigation handlers
  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
      {/* Header with Month Navigation */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-serif text-lg text-stone-800">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-stone-100 rounded-sm transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5 text-stone-600" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-stone-100 rounded-sm transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5 text-stone-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="text-center text-xs font-medium text-stone-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {allDays.map((day, index) => {
            if (!day) {
              return (
                <div
                  key={`padding-${index}`}
                  className="aspect-square"
                />
              );
            }

            const dateStr = toDateString(day);
            const week = getWeekData(dateStr);
            const hasData = !!week;
            const price = getPriceDisplay(day);

            return (
              <div
                key={day.toISOString()}
                onClick={() => hasData && handleDateClick(day)}
                className={cn(
                  "aspect-square flex flex-col items-center justify-center rounded-sm text-sm relative",
                  getDayClass(day)
                )}
              >
                <span className="text-base">{format(day, 'd')}</span>
                {price && (
                  <span className="text-[10px] mt-1 opacity-75">{price}</span>
                )}
                {/* Highlight Saturdays (changeover days) with a dot */}
                {hasData && getDay(day) === 6 && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-current opacity-50" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-6 text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-stone-50 border border-stone-200 rounded-sm" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-olive rounded-sm" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-stone-100 border border-stone-200 rounded-sm" />
          <span>Booked</span>
        </div>
      </div>

      {/* SUMMARY FOOTER */}
      <div className="border-t border-stone-100 pt-4 space-y-4">
        {rangeStart ? (
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-stone-500">
                {summary.weeks} week{summary.weeks > 1 ? 's' : ''} selected
              </p>
              <div className="text-3xl font-serif text-olive">
                £{summary.price.toLocaleString()}
              </div>
            </div>
            <div className="text-right text-sm text-stone-600">
              <p><span className="font-medium">Check-in:</span> {summary.startDate ? format(summary.startDate, 'dd MMM yyyy') : '-'}</p>
              <p><span className="font-medium">Check-out:</span> {summary.checkout ? format(summary.checkout, 'dd MMM yyyy') : '-'}</p>
            </div>
          </div>
        ) : (
          <div className="text-stone-400 text-sm">Select a check-in date (Saturdays highlighted)</div>
        )}

        <Button
          onClick={() => summary.startDate && summary.checkout && onBooking(summary.startDate, summary.checkout, summary.price)}
          disabled={!rangeStart}
          className="w-full bg-terracotta hover:bg-terracotta/90 text-white h-12 text-lg"
        >
          {rangeStart ? 'Reserve Now' : 'Check Availability'}
        </Button>
      </div>
    </div>
  );
}
