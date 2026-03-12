/**
 * VINTAGE TRAVEL - AVAILABILITY CALENDAR WITH WEEK SELECTOR
 * Compact calendar + week selection buttons for quick booking
 * Connected to Salesforce CRM Weekly_Rate__c data
 *
 * Features:
 * - Compact month calendar with availability colour-coding
 * - Week selector buttons showing date range + price per week
 * - Click a week button or calendar date to select
 * - Multi-week selection by clicking start then end
 * - Booking summary with total price and CTA
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar, Check } from 'lucide-react';
import { cn, formatWeeklyPrice } from '@/lib/utils';
import { WeeklyRate } from '@/types/villa';

interface AvailabilityCalendarProps {
  availability?: WeeklyRate[];
  villaId: string;
  onWeekSelect?: (weekRate: WeeklyRate) => void;
  initialStartDate?: string;
  className?: string;
}

/** Format date like "Sat 13 Jun" */
function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** Format date like "27 June 2026" */
function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function findFirstAvailableWeek(availability: WeeklyRate[]): WeeklyRate | undefined {
  return availability.find(
    (rate) => rate.status === 'Available' && rate.price != null && rate.price > 0
  );
}

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
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);

  // Availability map for O(1) lookups
  const availabilityMap = useMemo(() => {
    const map = new Map<string, WeeklyRate>();
    availability.forEach(rate => {
      const key = formatDateISO(rate.weekStartDate);
      map.set(key, rate);
    });
    return map;
  }, [availability]);

  const getWeekData = (dateStr: string) => availabilityMap.get(dateStr);

  const addWeeksToDateString = (dateStr: string, weeks: number): string => {
    const date = new Date(dateStr + 'T00:00:00');
    date.setDate(date.getDate() + (weeks * 7));
    return formatDateISO(date);
  };

  const isRangeValid = (startStr: string, endStr: string): boolean => {
    let current = startStr;
    while (current <= endStr) {
      const week = getWeekData(current);
      if (!week || week.status !== 'Available') return false;
      current = addWeeksToDateString(current, 1);
    }
    return true;
  };

  // Weeks available in the currently displayed month (for week selector buttons)
  const monthWeeks = useMemo(() => {
    const weeks: WeeklyRate[] = [];
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    availability.forEach(rate => {
      const weekDate = new Date(rate.weekStartDate);
      // Include weeks that start in this month OR whose 7-day span overlaps this month
      if (
        (weekDate >= monthStart && weekDate <= monthEnd) ||
        (weekDate < monthStart && new Date(weekDate.getTime() + 6 * 86400000) >= monthStart)
      ) {
        weeks.push(rate);
      }
    });

    return weeks.sort((a, b) => a.weekStartDate.getTime() - b.weekStartDate.getTime());
  }, [availability, currentMonth]);

  // Summary for selected range
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
    endDate.setDate(endDate.getDate() + 7);

    return { price: total, weeks: count, startDate, endDate, weekRates };
  }, [rangeStart, rangeEnd, availabilityMap]);

  // Smart jump to first available month
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
          setCurrentMonth(targetMonth);
        }
      }
    }
  }, [availability]);

  // Auto-select from URL parameter
  useEffect(() => {
    if (initialStartDate && availability.length > 0) {
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

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Handle date click (calendar or week button)
  const handleDateClick = (date: Date) => {
    const dateStr = formatDateISO(date);
    const clickedWeek = getWeekData(dateStr);

    if (!clickedWeek || clickedWeek.status !== 'Available') return;

    // No selection yet - start new
    if (!rangeStart) {
      setRangeStart(dateStr);
      setRangeEnd(null);
      return;
    }

    // Start only, no end yet
    if (rangeStart && !rangeEnd) {
      if (dateStr === rangeStart) {
        setRangeStart(null);
        setRangeEnd(null);
        return;
      }
      if (dateStr > rangeStart) {
        if (isRangeValid(rangeStart, dateStr)) {
          setRangeEnd(dateStr);
        } else {
          setRangeStart(dateStr);
          setRangeEnd(null);
        }
      } else {
        setRangeStart(dateStr);
        setRangeEnd(null);
      }
      return;
    }

    // Complete range - allow extending or resetting
    if (rangeStart && rangeEnd) {
      if (dateStr > rangeEnd) {
        if (isRangeValid(rangeStart, dateStr)) {
          setRangeEnd(dateStr);
        } else {
          setRangeStart(dateStr);
          setRangeEnd(null);
        }
      } else if (dateStr < rangeStart) {
        setRangeStart(dateStr);
        setRangeEnd(null);
      } else {
        setRangeStart(dateStr);
        setRangeEnd(null);
      }
    }
  };

  // Handle week button click - select single week
  const handleWeekButtonClick = (rate: WeeklyRate) => {
    const dateStr = formatDateISO(rate.weekStartDate);

    if (rate.status !== 'Available') return;

    // If this week is already selected as a single week, deselect
    if (rangeStart === dateStr && !rangeEnd) {
      setRangeStart(null);
      setRangeEnd(null);
      return;
    }

    // Select this single week
    setRangeStart(dateStr);
    setRangeEnd(null);

    if (onWeekSelect) {
      onWeekSelect(rate);
    }
  };

  const isDateInRange = (dateStr: string): boolean => {
    if (!rangeStart) return false;
    const endStr = rangeEnd || rangeStart;
    return dateStr >= rangeStart && dateStr <= endStr;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Calendar grid data
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const shortMonthName = currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let day = 1; day <= daysInMonth; day++) days.push(day);

  const availableWeeksInMonth = monthWeeks.filter(w => w.status === 'Available' && !isPastDate(w.weekStartDate));
  const bookedWeeksInMonth = monthWeeks.filter(w => w.status !== 'Available');

  return (
    <div className={cn('bg-white border border-stone-200 rounded-sm', className)}>
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-stone-100 bg-stone-50">
        <button
          onClick={previousMonth}
          className="p-1 hover:bg-stone-200 rounded transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4 text-olive" />
        </button>
        <h3 className="font-serif text-sm font-medium text-olive">{monthName}</h3>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-stone-200 rounded transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4 text-olive" />
        </button>
      </div>

      {/* Compact Calendar Grid */}
      <div className="px-2 pt-1 pb-2">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-0.5">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={`${day}-${i}`} className="text-center text-[10px] font-semibold text-stone-400 py-0.5">
              {day}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7 gap-px">
          {days.map((day, index) => {
            if (day === null) return <div key={`empty-${index}`} className="h-6" />;

            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const dateStr = formatDateISO(date);
            const isPast = isPastDate(date);
            const weeklyRate = getWeekData(dateStr);

            if (!weeklyRate) {
              return (
                <div key={day} className="h-6 flex items-center justify-center text-[11px] text-stone-300">
                  {day}
                </div>
              );
            }

            const isAvailable = weeklyRate.status === 'Available' && !isPast;
            const isBooked = weeklyRate.status === 'Booked';
            const isInRange = isDateInRange(dateStr);
            const isRangeStartDate = dateStr === rangeStart;
            const isRangeEndDate = dateStr === rangeEnd;

            return (
              <button
                key={day}
                onClick={() => handleDateClick(date)}
                disabled={!isAvailable}
                className={cn(
                  'h-6 flex items-center justify-center text-[11px] rounded-sm transition-all relative',
                  isAvailable && !isInRange && 'bg-palm-50 text-palm-700 hover:bg-palm-100 cursor-pointer font-medium',
                  isInRange && isAvailable && 'bg-palm text-white font-bold',
                  (isRangeStartDate || isRangeEndDate) && 'ring-1 ring-olive ring-offset-1',
                  isBooked && 'bg-stone-100 text-stone-300 cursor-not-allowed line-through',
                  (!isAvailable && !isBooked) && 'text-stone-300 cursor-not-allowed'
                )}
                aria-label={`${day} ${shortMonthName}${isAvailable ? ' - Available' : isBooked ? ' - Booked' : ''}`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Compact Legend */}
        <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-stone-100">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-palm-50 rounded-sm border border-palm-200" />
            <span className="text-[9px] text-stone-500">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-palm rounded-sm" />
            <span className="text-[9px] text-stone-500">Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-stone-100 rounded-sm border border-stone-200" />
            <span className="text-[9px] text-stone-500">Booked</span>
          </div>
        </div>
      </div>

      {/* Week Selector Buttons */}
      <div className="border-t border-stone-200">
        <div className="px-3 py-2 bg-stone-50 border-b border-stone-100">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            Available weeks in {currentMonth.toLocaleDateString('en-US', { month: 'long' })}
          </h4>
        </div>

        <div className="px-2 py-2 space-y-1 max-h-[210px] overflow-y-auto">
          {availableWeeksInMonth.length === 0 && bookedWeeksInMonth.length === 0 && (
            <p className="text-xs text-stone-400 text-center py-3">No availability data for this month</p>
          )}

          {availableWeeksInMonth.length === 0 && bookedWeeksInMonth.length > 0 && (
            <p className="text-xs text-stone-400 text-center py-3">No available weeks this month</p>
          )}

          {availableWeeksInMonth.map((rate) => {
            const startDate = new Date(rate.weekStartDate);
            const endDate = new Date(startDate.getTime() + 6 * 86400000);
            const dateStr = formatDateISO(startDate);
            const isSelected = isDateInRange(dateStr);

            return (
              <button
                key={rate.id}
                onClick={() => handleWeekButtonClick(rate)}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-2 rounded-sm border text-left transition-all group',
                  isSelected
                    ? 'bg-palm text-white border-palm shadow-sm'
                    : 'bg-white border-stone-200 hover:border-palm-300 hover:bg-palm-50'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                  <div className="min-w-0">
                    <div className={cn(
                      'text-xs font-medium leading-tight',
                      isSelected ? 'text-white' : 'text-olive'
                    )}>
                      {formatShortDate(startDate)}
                    </div>
                    <div className={cn(
                      'text-[10px] leading-tight',
                      isSelected ? 'text-white/80' : 'text-stone-400'
                    )}>
                      to {formatShortDate(endDate)}
                    </div>
                  </div>
                </div>
                <div className={cn(
                  'text-xs font-bold flex-shrink-0 ml-2',
                  isSelected ? 'text-white' : 'text-terracotta'
                )}>
                  {formatWeeklyPrice(rate.price)}
                </div>
              </button>
            );
          })}

          {/* Show booked weeks greyed out */}
          {bookedWeeksInMonth.map((rate) => {
            const startDate = new Date(rate.weekStartDate);
            const endDate = new Date(startDate.getTime() + 6 * 86400000);

            return (
              <div
                key={rate.id}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-sm border border-stone-100 bg-stone-50 opacity-50"
              >
                <div>
                  <div className="text-xs text-stone-400 leading-tight line-through">
                    {formatShortDate(startDate)}
                  </div>
                  <div className="text-[10px] text-stone-300 leading-tight line-through">
                    to {formatShortDate(endDate)}
                  </div>
                </div>
                <span className="text-[10px] font-medium text-stone-400">Booked</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Summary */}
      {rangeStart && summary.startDate && (
        <div className="border-t border-stone-200 px-3 py-3 bg-stone-50 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              {summary.weeks} week{summary.weeks > 1 ? 's' : ''} selected
            </span>
            <span className="font-serif text-lg text-terracotta font-medium">
              {summary.price > 0
                ? `£${summary.price.toLocaleString('en-GB')}`
                : 'Price on Request'}
            </span>
          </div>

          <div className="flex justify-between text-[11px] text-stone-500">
            <span>{formatDateDisplay(summary.startDate)}</span>
            <span className="text-stone-300 px-1">&rarr;</span>
            <span>{summary.endDate ? formatDateDisplay(summary.endDate) : '-'}</span>
          </div>

          <Link
            href={`/book/${villaId}?startDate=${rangeStart}${rangeEnd ? `&endDate=${rangeEnd}` : ''}`}
            className="block w-full bg-terracotta hover:bg-terracotta/90 text-white text-center py-2.5 rounded-sm transition-colors font-semibold text-sm mt-1"
          >
            {summary.price > 0 ? 'Book Now' : 'Enquire Now'}
          </Link>

          <p className="text-[10px] text-stone-400 text-center">
            Saturday to Saturday
          </p>
        </div>
      )}
    </div>
  );
}
