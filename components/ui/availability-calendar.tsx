/**
 * VINTAGE TRAVEL - AVAILABILITY CALENDAR WITH WEEK SELECTOR
 * CMA-compliant pricing: shows true total cost upfront
 *
 * Features:
 * - Guest selector (adults + children with ages) for group-size pricing
 * - Compact month calendar with availability colour-coding
 * - Week selector buttons showing date range + price per week
 * - CMA-compliant booking summary: villa rate + tourist tax + damage waiver
 * - Multi-week selection by clicking start then end
 *
 * CMA Transparency Rules (DMCCA 2024):
 * - "First Price, True Price": total includes all mandatory fees
 * - Tourist tax: £10/person/week (over 16, or over 13 in Greece)
 * - Damage waiver: £2.50/person/week
 * - Group-size pricing via Salesforce WR_Group_of__c
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar, Check, Users, Minus, Plus, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { cn, formatWeeklyPrice } from '@/lib/utils';
import { WeeklyRate, GuestInfo, PriceBreakdown } from '@/types/villa';

// ===== CMA PRICING CONSTANTS =====

const TOURIST_TAX_PER_PERSON_PER_WEEK = 10; // £10 per qualifying person per week
const DAMAGE_WAIVER_PER_PERSON_PER_WEEK = 2.5; // £2.50 per person per week
const DEFAULT_TAX_AGE_THRESHOLD = 16; // Default: tax applies to persons over 16
const GREECE_TAX_AGE_THRESHOLD = 13; // Greece: tax applies to persons over 13

/** Countries where the lower age threshold (13) applies for tourist tax */
const LOWER_AGE_THRESHOLD_COUNTRIES = ['greece'];

// ===== PROPS =====

interface AvailabilityCalendarProps {
  availability?: WeeklyRate[];
  villaId: string;
  onWeekSelect?: (weekRate: WeeklyRate) => void;
  initialStartDate?: string;
  country?: string; // Villa country - determines tourist tax age threshold
  maxGuests?: number; // Max capacity of the villa
  className?: string;
}

// ===== HELPERS =====

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
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

/**
 * Get the tourist tax age threshold for a country
 */
function getTouristTaxAgeThreshold(country: string): number {
  return LOWER_AGE_THRESHOLD_COUNTRIES.includes(country.toLowerCase())
    ? GREECE_TAX_AGE_THRESHOLD
    : DEFAULT_TAX_AGE_THRESHOLD;
}

/**
 * Count guests qualifying for tourist tax based on country rules
 */
function countTaxQualifyingGuests(guests: GuestInfo, ageThreshold: number): number {
  // All adults qualify
  let qualifying = guests.adults;
  // Children over the age threshold qualify
  qualifying += guests.childAges.filter(age => age > ageThreshold).length;
  return qualifying;
}

/**
 * Get the best weekly rate for a given group size from available rates for a week
 * If multiple rates exist (different WR_Group_of__c), pick the one matching the group size
 */
function getRateForGroupSize(rates: WeeklyRate[], totalGuests: number): WeeklyRate | undefined {
  if (rates.length === 0) return undefined;

  // If no rates have groupOf data, return the first/only rate
  const ratesWithGroup = rates.filter(r => r.groupOf != null);
  if (ratesWithGroup.length === 0) return rates[0];

  // Find the rate where groupOf >= totalGuests (smallest sufficient group rate)
  // Sort by groupOf ascending, pick the first that accommodates the group
  const sorted = [...ratesWithGroup].sort((a, b) => (a.groupOf || 0) - (b.groupOf || 0));
  const matching = sorted.find(r => (r.groupOf || 0) >= totalGuests);

  // If no rate covers the full group, use the largest available
  return matching || sorted[sorted.length - 1];
}

/**
 * Calculate full CMA-compliant price breakdown
 */
function calculatePriceBreakdown(
  weeklyRate: number,
  weeks: number,
  guests: GuestInfo,
  country: string
): PriceBreakdown {
  const totalGuests = guests.adults + guests.children;
  const ageThreshold = getTouristTaxAgeThreshold(country);
  const qualifyingGuests = countTaxQualifyingGuests(guests, ageThreshold);

  const touristTaxPerWeek = qualifyingGuests * TOURIST_TAX_PER_PERSON_PER_WEEK;
  const damageWaiverPerWeek = totalGuests * DAMAGE_WAIVER_PER_PERSON_PER_WEEK;
  const totalPerWeek = weeklyRate + touristTaxPerWeek + damageWaiverPerWeek;

  return {
    weeklyRate: weeklyRate * weeks,
    touristTax: touristTaxPerWeek * weeks,
    damageWaiver: damageWaiverPerWeek * weeks,
    totalPerWeek,
    totalPrice: totalPerWeek * weeks,
    weeks,
    touristTaxDetails: {
      qualifyingGuests,
      ratePerPerson: TOURIST_TAX_PER_PERSON_PER_WEEK,
      ageThreshold,
    },
    damageWaiverDetails: {
      totalGuests,
      ratePerPerson: DAMAGE_WAIVER_PER_PERSON_PER_WEEK,
    },
  };
}

// ===== COMPONENT =====

export function AvailabilityCalendar({
  availability = [],
  villaId,
  onWeekSelect,
  initialStartDate,
  country = '',
  maxGuests = 10,
  className,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => getInitialMonth(availability));
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);

  // Guest state
  const [guests, setGuests] = useState<GuestInfo>({ adults: 2, children: 0, childAges: [] });

  const totalGuests = guests.adults + guests.children;

  // Adjust child ages array when children count changes
  const updateChildren = useCallback((newCount: number) => {
    const clamped = Math.max(0, Math.min(newCount, maxGuests - guests.adults));
    setGuests(prev => {
      const newAges = [...prev.childAges];
      while (newAges.length < clamped) newAges.push(5); // Default child age
      while (newAges.length > clamped) newAges.pop();
      return { ...prev, children: clamped, childAges: newAges };
    });
  }, [guests.adults, maxGuests]);

  const updateAdults = useCallback((newCount: number) => {
    const clamped = Math.max(1, Math.min(newCount, maxGuests - guests.children));
    setGuests(prev => ({ ...prev, adults: clamped }));
  }, [guests.children, maxGuests]);

  const updateChildAge = useCallback((index: number, age: number) => {
    setGuests(prev => {
      const newAges = [...prev.childAges];
      newAges[index] = Math.max(0, Math.min(age, 17));
      return { ...prev, childAges: newAges };
    });
  }, []);

  // Build availability map: dateStr -> WeeklyRate[] (multiple rates per week for different group sizes)
  const availabilityByDate = useMemo(() => {
    const map = new Map<string, WeeklyRate[]>();
    availability.forEach(rate => {
      const key = formatDateISO(rate.weekStartDate);
      const existing = map.get(key) || [];
      existing.push(rate);
      map.set(key, existing);
    });
    return map;
  }, [availability]);

  // Get the best rate for the current group size
  const getWeekData = useCallback((dateStr: string): WeeklyRate | undefined => {
    const rates = availabilityByDate.get(dateStr);
    if (!rates) return undefined;
    return getRateForGroupSize(rates, totalGuests);
  }, [availabilityByDate, totalGuests]);

  // Get all rates for a date (for checking any availability)
  const getAllRatesForDate = useCallback((dateStr: string): WeeklyRate[] => {
    return availabilityByDate.get(dateStr) || [];
  }, [availabilityByDate]);

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

  // Unique weeks in current month (deduplicated by date, picking best rate for group size)
  const monthWeeks = useMemo(() => {
    const seen = new Set<string>();
    const weeks: WeeklyRate[] = [];
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    availability.forEach(rate => {
      const weekDate = new Date(rate.weekStartDate);
      const dateStr = formatDateISO(weekDate);
      if (seen.has(dateStr)) return;

      if (
        (weekDate >= monthStart && weekDate <= monthEnd) ||
        (weekDate < monthStart && new Date(weekDate.getTime() + 6 * 86400000) >= monthStart)
      ) {
        seen.add(dateStr);
        const bestRate = getWeekData(dateStr);
        if (bestRate) weeks.push(bestRate);
      }
    });

    return weeks.sort((a, b) => a.weekStartDate.getTime() - b.weekStartDate.getTime());
  }, [availability, currentMonth, getWeekData]);

  // Summary with CMA-compliant price breakdown
  const summary = useMemo(() => {
    if (!rangeStart) return null;

    const endStr = rangeEnd || rangeStart;
    let rentalTotal = 0;
    let count = 0;
    let current = rangeStart;
    const weekRates: WeeklyRate[] = [];

    while (current <= endStr) {
      const data = getWeekData(current);
      if (data) {
        rentalTotal += data.price || 0;
        weekRates.push(data);
      }
      count++;
      current = addWeeksToDateString(current, 1);
    }

    const startDate = new Date(rangeStart + 'T00:00:00');
    const endDate = new Date(endStr + 'T00:00:00');
    endDate.setDate(endDate.getDate() + 7);

    // Calculate average weekly rate for breakdown calculation
    const avgWeeklyRate = count > 0 ? rentalTotal / count : 0;
    const breakdown = calculatePriceBreakdown(avgWeeklyRate, count, guests, country);
    // Override weeklyRate with actual sum (handles varying weekly rates)
    breakdown.weeklyRate = rentalTotal;
    breakdown.totalPrice = rentalTotal + breakdown.touristTax + breakdown.damageWaiver;

    return { startDate, endDate, weekRates, breakdown };
  }, [rangeStart, rangeEnd, getWeekData, guests, country]);

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
        if (!hasDataInCurrentMonth) setCurrentMonth(targetMonth);
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
        setCurrentMonth(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1));
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

  // Date click handler
  const handleDateClick = (date: Date) => {
    const dateStr = formatDateISO(date);
    const clickedWeek = getWeekData(dateStr);
    if (!clickedWeek || clickedWeek.status !== 'Available') return;

    if (!rangeStart) {
      setRangeStart(dateStr);
      setRangeEnd(null);
      return;
    }

    if (rangeStart && !rangeEnd) {
      if (dateStr === rangeStart) { setRangeStart(null); setRangeEnd(null); return; }
      if (dateStr > rangeStart) {
        if (isRangeValid(rangeStart, dateStr)) { setRangeEnd(dateStr); }
        else { setRangeStart(dateStr); setRangeEnd(null); }
      } else { setRangeStart(dateStr); setRangeEnd(null); }
      return;
    }

    if (rangeStart && rangeEnd) {
      if (dateStr > rangeEnd) {
        if (isRangeValid(rangeStart, dateStr)) { setRangeEnd(dateStr); }
        else { setRangeStart(dateStr); setRangeEnd(null); }
      } else { setRangeStart(dateStr); setRangeEnd(null); }
    }
  };

  const handleWeekButtonClick = (rate: WeeklyRate) => {
    const dateStr = formatDateISO(rate.weekStartDate);
    if (rate.status !== 'Available') return;
    if (rangeStart === dateStr && !rangeEnd) { setRangeStart(null); setRangeEnd(null); return; }
    setRangeStart(dateStr);
    setRangeEnd(null);
    if (onWeekSelect) onWeekSelect(rate);
  };

  const isDateInRange = (dateStr: string): boolean => {
    if (!rangeStart) return false;
    const endStr = rangeEnd || rangeStart;
    return dateStr >= rangeStart && dateStr <= endStr;
  };

  const previousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

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

  const ageThreshold = getTouristTaxAgeThreshold(country);

  return (
    <div className={cn('bg-white border border-stone-200 rounded-sm', className)}>

      {/* Guest Selector */}
      <div className="px-3 py-2.5 border-b border-stone-200 bg-stone-50">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5 mb-2">
          <Users className="h-3 w-3" />
          Guests
        </h4>

        {/* Adults */}
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <span className="text-xs font-medium text-olive">Adults</span>
            <span className="text-[10px] text-stone-400 ml-1">18+</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateAdults(guests.adults - 1)}
              disabled={guests.adults <= 1}
              className="w-6 h-6 rounded-sm border border-stone-300 flex items-center justify-center hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Remove adult"
            >
              <Minus className="h-3 w-3 text-olive" />
            </button>
            <span className="text-sm font-semibold text-olive w-4 text-center">{guests.adults}</span>
            <button
              onClick={() => updateAdults(guests.adults + 1)}
              disabled={totalGuests >= maxGuests}
              className="w-6 h-6 rounded-sm border border-stone-300 flex items-center justify-center hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Add adult"
            >
              <Plus className="h-3 w-3 text-olive" />
            </button>
          </div>
        </div>

        {/* Children */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-olive">Children</span>
            <span className="text-[10px] text-stone-400 ml-1">0-17</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateChildren(guests.children - 1)}
              disabled={guests.children <= 0}
              className="w-6 h-6 rounded-sm border border-stone-300 flex items-center justify-center hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Remove child"
            >
              <Minus className="h-3 w-3 text-olive" />
            </button>
            <span className="text-sm font-semibold text-olive w-4 text-center">{guests.children}</span>
            <button
              onClick={() => updateChildren(guests.children + 1)}
              disabled={totalGuests >= maxGuests}
              className="w-6 h-6 rounded-sm border border-stone-300 flex items-center justify-center hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Add child"
            >
              <Plus className="h-3 w-3 text-olive" />
            </button>
          </div>
        </div>

        {/* Child Ages (shown when children > 0) */}
        {guests.children > 0 && (
          <div className="mt-2 pt-2 border-t border-stone-200">
            <p className="text-[10px] text-stone-400 mb-1.5">
              Child ages (needed for tourist tax calculation)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {guests.childAges.map((age, i) => (
                <div key={i} className="flex items-center gap-1 bg-white border border-stone-200 rounded-sm px-1.5 py-0.5">
                  <span className="text-[10px] text-stone-500">Child {i + 1}:</span>
                  <select
                    value={age}
                    onChange={(e) => updateChildAge(i, parseInt(e.target.value))}
                    className="text-[11px] font-medium text-olive bg-transparent border-none outline-none cursor-pointer py-0"
                    aria-label={`Age of child ${i + 1}`}
                  >
                    {Array.from({ length: 18 }, (_, a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guest capacity note */}
        <p className="text-[9px] text-stone-400 mt-1.5">
          Max {maxGuests} guests
          {totalGuests >= maxGuests && <span className="text-terracotta font-medium"> — capacity reached</span>}
        </p>
      </div>

      {/* Month Navigation Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-stone-100">
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
        <div className="grid grid-cols-7 mb-0.5">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={`${day}-${i}`} className="text-center text-[10px] font-semibold text-stone-400 py-0.5">
              {day}
            </div>
          ))}
        </div>

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

            // Calculate total price for this week (CMA-compliant)
            const weekBreakdown = rate.price
              ? calculatePriceBreakdown(rate.price, 1, guests, country)
              : null;

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
                <div className="text-right flex-shrink-0 ml-2">
                  <div className={cn(
                    'text-xs font-bold',
                    isSelected ? 'text-white' : 'text-terracotta'
                  )}>
                    {weekBreakdown
                      ? `£${weekBreakdown.totalPrice.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                      : formatWeeklyPrice(rate.price)}
                  </div>
                  {weekBreakdown && (
                    <div className={cn(
                      'text-[9px] leading-tight',
                      isSelected ? 'text-white/70' : 'text-stone-400'
                    )}>
                      total incl. fees
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {/* Booked weeks greyed out */}
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

      {/* CMA-Compliant Booking Summary */}
      {summary && summary.startDate && (
        <div className="border-t border-stone-200 px-3 py-3 bg-stone-50 space-y-2">
          {/* Dates */}
          <div className="flex justify-between text-[11px] text-stone-500">
            <span>{formatDateDisplay(summary.startDate)}</span>
            <span className="text-stone-300 px-1">&rarr;</span>
            <span>{summary.endDate ? formatDateDisplay(summary.endDate) : '-'}</span>
          </div>

          {/* Total price - first price is the true price (CMA requirement) */}
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              {summary.breakdown.weeks} week{summary.breakdown.weeks > 1 ? 's' : ''} &middot; {totalGuests} guest{totalGuests > 1 ? 's' : ''}
            </span>
            <span className="font-serif text-xl text-terracotta font-medium">
              {summary.breakdown.totalPrice > 0
                ? `£${summary.breakdown.totalPrice.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                : 'Price on Request'}
            </span>
          </div>

          {/* Price Breakdown Toggle */}
          <button
            onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
            className="flex items-center gap-1 text-[10px] text-olive hover:text-olive-600 transition-colors"
          >
            <Info className="h-3 w-3" />
            <span className="underline">Price breakdown</span>
            {showPriceBreakdown ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {/* Expanded Price Breakdown */}
          {showPriceBreakdown && summary.breakdown.totalPrice > 0 && (
            <div className="bg-white border border-stone-200 rounded-sm p-2.5 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-stone-500">
                  Villa rental ({summary.breakdown.weeks} week{summary.breakdown.weeks > 1 ? 's' : ''})
                </span>
                <span className="font-medium text-olive">
                  £{summary.breakdown.weeklyRate.toLocaleString('en-GB')}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-500">
                  Tourist tax ({summary.breakdown.touristTaxDetails.qualifyingGuests} guest{summary.breakdown.touristTaxDetails.qualifyingGuests !== 1 ? 's' : ''} over {summary.breakdown.touristTaxDetails.ageThreshold} &times; £{summary.breakdown.touristTaxDetails.ratePerPerson}/wk)
                </span>
                <span className="font-medium text-olive">
                  £{summary.breakdown.touristTax.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-500">
                  Damage waiver ({summary.breakdown.damageWaiverDetails.totalGuests} guest{summary.breakdown.damageWaiverDetails.totalGuests !== 1 ? 's' : ''} &times; £{summary.breakdown.damageWaiverDetails.ratePerPerson.toFixed(2)}/wk)
                </span>
                <span className="font-medium text-olive">
                  £{summary.breakdown.damageWaiver.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between pt-1.5 border-t border-stone-200 font-semibold">
                <span className="text-olive">Total</span>
                <span className="text-terracotta">
                  £{summary.breakdown.totalPrice.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>

              {country && (
                <p className="text-[9px] text-stone-400 pt-1">
                  Tourist tax applies to guests over {ageThreshold} in {country}.
                  All mandatory fees are included in the total price shown.
                </p>
              )}
            </div>
          )}

          {/* Book Now CTA */}
          <Link
            href={`/book/${villaId}?startDate=${rangeStart}${rangeEnd ? `&endDate=${rangeEnd}` : ''}&adults=${guests.adults}&children=${guests.children}${guests.childAges.length > 0 ? `&childAges=${guests.childAges.join(',')}` : ''}`}
            className="block w-full bg-terracotta hover:bg-terracotta/90 text-white text-center py-2.5 rounded-sm transition-colors font-semibold text-sm mt-1"
          >
            {summary.breakdown.totalPrice > 0 ? 'Book Now' : 'Enquire Now'}
          </Link>

          <p className="text-[10px] text-stone-400 text-center">
            Saturday to Saturday &middot; Price includes all mandatory fees
          </p>
        </div>
      )}
    </div>
  );
}
