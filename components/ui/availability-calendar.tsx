/**
 * VINTAGE TRAVEL - AVAILABILITY CALENDAR WITH WEEK SELECTOR
 * CMA-compliant pricing: shows true total cost upfront
 *
 * Two modes:
 * 1. WEEKLY MODE (default): Saturday-to-Saturday week blocks
 * 2. DAILY MODE (WR_Display_Daily_rate__c = true): Flexible day-by-day booking
 *    - Every day within available weeks is clickable
 *    - Saturdays highlighted as normal changeover days
 *    - Supports irregular stays (e.g. 9 nights)
 *    - Price calculated as daily rate × nights
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

const TOURIST_TAX_PER_PERSON_PER_WEEK = 10;
const DAMAGE_WAIVER_PER_PERSON_PER_WEEK = 2.5;
const DEFAULT_TAX_AGE_THRESHOLD = 16;
const GREECE_TAX_AGE_THRESHOLD = 13;
const LOWER_AGE_THRESHOLD_COUNTRIES = ['greece'];

// ===== DAILY AVAILABILITY TYPES =====

interface DailyAvailability {
  status: string;
  dailyRate: number;
  weekStartDate: string; // The parent week this day belongs to
  isChangeover: boolean; // True for Saturdays (normal changeover day)
}

// ===== PROPS =====

interface AvailabilityCalendarProps {
  availability?: WeeklyRate[];
  villaId: string;
  onWeekSelect?: (weekRate: WeeklyRate) => void;
  initialStartDate?: string;
  country?: string;
  maxGuests?: number;
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

/** Advance a date string by N days */
function addDaysToDateString(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return formatDateISO(d);
}

/** Count nights between two date strings */
function countNights(startStr: string, endStr: string): number {
  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

/** Check if a date falls on a Saturday (day index 6) */
function isSaturday(dateStr: string): boolean {
  return new Date(dateStr + 'T00:00:00').getDay() === 6;
}

function getTouristTaxAgeThreshold(country: string): number {
  return LOWER_AGE_THRESHOLD_COUNTRIES.includes(country.toLowerCase())
    ? GREECE_TAX_AGE_THRESHOLD
    : DEFAULT_TAX_AGE_THRESHOLD;
}

function countTaxQualifyingGuests(guests: GuestInfo, ageThreshold: number): number {
  let qualifying = guests.adults;
  qualifying += guests.childAges.filter(age => age > ageThreshold).length;
  return qualifying;
}

function getRateForGroupSize(rates: WeeklyRate[], totalGuests: number): WeeklyRate | undefined {
  if (rates.length === 0) return undefined;
  const ratesWithGroup = rates.filter(r => r.groupOf != null);
  if (ratesWithGroup.length === 0) return rates[0];
  const sorted = [...ratesWithGroup].sort((a, b) => (a.groupOf || 0) - (b.groupOf || 0));
  const matching = sorted.find(r => (r.groupOf || 0) >= totalGuests);
  return matching || sorted[sorted.length - 1];
}

/**
 * Calculate CMA-compliant price breakdown (weekly mode)
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
    touristTaxDetails: { qualifyingGuests, ratePerPerson: TOURIST_TAX_PER_PERSON_PER_WEEK, ageThreshold },
    damageWaiverDetails: { totalGuests, ratePerPerson: DAMAGE_WAIVER_PER_PERSON_PER_WEEK },
  };
}

/**
 * Calculate CMA-compliant price breakdown (daily mode)
 * Fees are prorated per-night from the weekly rates
 */
function calculateDailyPriceBreakdown(
  rentalTotal: number,
  nights: number,
  guests: GuestInfo,
  country: string
): PriceBreakdown {
  const totalGuests = guests.adults + guests.children;
  const ageThreshold = getTouristTaxAgeThreshold(country);
  const qualifyingGuests = countTaxQualifyingGuests(guests, ageThreshold);

  // Prorate weekly fees to per-night
  const touristTaxPerNight = qualifyingGuests * (TOURIST_TAX_PER_PERSON_PER_WEEK / 7);
  const damageWaiverPerNight = totalGuests * (DAMAGE_WAIVER_PER_PERSON_PER_WEEK / 7);

  const touristTax = Math.round(touristTaxPerNight * nights * 100) / 100;
  const damageWaiver = Math.round(damageWaiverPerNight * nights * 100) / 100;

  return {
    weeklyRate: rentalTotal,
    touristTax,
    damageWaiver,
    totalPerWeek: 0, // Not applicable in daily mode
    totalPrice: rentalTotal + touristTax + damageWaiver,
    weeks: nights, // Repurposed as nights in daily mode
    touristTaxDetails: {
      qualifyingGuests,
      ratePerPerson: Math.round((TOURIST_TAX_PER_PERSON_PER_WEEK / 7) * 100) / 100,
      ageThreshold,
    },
    damageWaiverDetails: {
      totalGuests,
      ratePerPerson: Math.round((DAMAGE_WAIVER_PER_PERSON_PER_WEEK / 7) * 100) / 100,
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

  const updateChildren = useCallback((newCount: number) => {
    const clamped = Math.max(0, Math.min(newCount, maxGuests - guests.adults));
    setGuests(prev => {
      const newAges = [...prev.childAges];
      while (newAges.length < clamped) newAges.push(5);
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

  // ===== DETECT DAILY RATE MODE =====
  // If any rate for this villa has displayDailyRate === true, enable daily mode
  const isDailyRateMode = useMemo(() => {
    return availability.some(rate => rate.displayDailyRate === true);
  }, [availability]);

  // ===== WEEKLY MODE: availability map (dateStr -> WeeklyRate[]) =====
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

  const getWeekData = useCallback((dateStr: string): WeeklyRate | undefined => {
    const rates = availabilityByDate.get(dateStr);
    if (!rates) return undefined;
    return getRateForGroupSize(rates, totalGuests);
  }, [availabilityByDate, totalGuests]);

  // ===== DAILY MODE: expand weekly rates into per-day availability =====
  const dailyAvailabilityMap = useMemo(() => {
    const map = new Map<string, DailyAvailability>();
    if (!isDailyRateMode) return map;

    // Deduplicate by week start date, pick best rate for group size
    const seen = new Set<string>();
    availability.forEach(rate => {
      const weekDateStr = formatDateISO(rate.weekStartDate);
      if (seen.has(weekDateStr)) return;
      seen.add(weekDateStr);

      const bestRate = getWeekData(weekDateStr);
      if (!bestRate) return;

      const start = new Date(bestRate.weekStartDate);
      for (let d = 0; d < 7; d++) {
        const day = new Date(start);
        day.setDate(day.getDate() + d);
        const dateStr = formatDateISO(day);
        if (!map.has(dateStr)) {
          map.set(dateStr, {
            status: bestRate.status,
            dailyRate: bestRate.price ? Math.round((bestRate.price / 7) * 100) / 100 : 0,
            weekStartDate: weekDateStr,
            isChangeover: day.getDay() === 6, // Saturday
          });
        }
      }
    });
    return map;
  }, [isDailyRateMode, availability, getWeekData]);

  // ===== HELPERS =====

  const addWeeksToDateString = (dateStr: string, weeks: number): string => {
    const date = new Date(dateStr + 'T00:00:00');
    date.setDate(date.getDate() + (weeks * 7));
    return formatDateISO(date);
  };

  // Weekly mode: validate all intermediate weeks are available
  const isWeekRangeValid = (startStr: string, endStr: string): boolean => {
    let current = startStr;
    while (current <= endStr) {
      const week = getWeekData(current);
      if (!week || week.status !== 'Available') return false;
      current = addWeeksToDateString(current, 1);
    }
    return true;
  };

  // Daily mode: validate all days in range are available
  const isDailyRangeValid = useCallback((startStr: string, endStr: string): boolean => {
    let current = startStr;
    while (current <= endStr) {
      const dayData = dailyAvailabilityMap.get(current);
      if (!dayData || dayData.status !== 'Available') return false;
      current = addDaysToDateString(current, 1);
    }
    return true;
  }, [dailyAvailabilityMap]);

  // ===== MONTH WEEKS (for week selector buttons) =====
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

  // ===== SUMMARY =====
  const summary = useMemo(() => {
    if (!rangeStart) return null;

    if (isDailyRateMode) {
      // Daily mode: count nights, sum daily rates
      const endStr = rangeEnd || addDaysToDateString(rangeStart, 1); // Default: 1 night
      const nights = countNights(rangeStart, endStr);

      let rentalTotal = 0;
      let current = rangeStart;
      // Sum daily rates for each night (check-in day through day before checkout)
      while (current < endStr) {
        const dayData = dailyAvailabilityMap.get(current);
        if (dayData) rentalTotal += dayData.dailyRate;
        current = addDaysToDateString(current, 1);
      }

      const startDate = new Date(rangeStart + 'T00:00:00');
      const endDate = new Date(endStr + 'T00:00:00');
      const breakdown = calculateDailyPriceBreakdown(
        Math.round(rentalTotal * 100) / 100,
        nights,
        guests,
        country
      );

      return { startDate, endDate, nights, isDaily: true, breakdown, weekRates: [] as WeeklyRate[] };
    } else {
      // Weekly mode: count weeks, sum weekly rates
      const endStr = rangeEnd || rangeStart;
      let rentalTotal = 0;
      let count = 0;
      let current = rangeStart;
      const weekRates: WeeklyRate[] = [];

      while (current <= endStr) {
        const data = getWeekData(current);
        if (data) { rentalTotal += data.price || 0; weekRates.push(data); }
        count++;
        current = addWeeksToDateString(current, 1);
      }

      const startDate = new Date(rangeStart + 'T00:00:00');
      const endDate = new Date(endStr + 'T00:00:00');
      endDate.setDate(endDate.getDate() + 7);

      const avgWeeklyRate = count > 0 ? rentalTotal / count : 0;
      const breakdown = calculatePriceBreakdown(avgWeeklyRate, count, guests, country);
      breakdown.weeklyRate = rentalTotal;
      breakdown.totalPrice = rentalTotal + breakdown.touristTax + breakdown.damageWaiver;

      return { startDate, endDate, nights: count * 7, isDaily: false, breakdown, weekRates };
    }
  }, [rangeStart, rangeEnd, getWeekData, dailyAvailabilityMap, guests, country, isDailyRateMode]);

  // ===== EFFECTS =====

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

  // ===== CALENDAR HELPERS =====

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // ===== CLICK HANDLERS =====

  // Weekly mode: click handler for week-start dates
  const handleWeeklyDateClick = (date: Date) => {
    const dateStr = formatDateISO(date);
    const clickedWeek = getWeekData(dateStr);
    if (!clickedWeek || clickedWeek.status !== 'Available') return;

    if (!rangeStart) { setRangeStart(dateStr); setRangeEnd(null); return; }

    if (rangeStart && !rangeEnd) {
      if (dateStr === rangeStart) { setRangeStart(null); setRangeEnd(null); return; }
      if (dateStr > rangeStart) {
        if (isWeekRangeValid(rangeStart, dateStr)) { setRangeEnd(dateStr); }
        else { setRangeStart(dateStr); setRangeEnd(null); }
      } else { setRangeStart(dateStr); setRangeEnd(null); }
      return;
    }

    if (rangeStart && rangeEnd) {
      if (dateStr > rangeEnd) {
        if (isWeekRangeValid(rangeStart, dateStr)) { setRangeEnd(dateStr); }
        else { setRangeStart(dateStr); setRangeEnd(null); }
      } else { setRangeStart(dateStr); setRangeEnd(null); }
    }
  };

  // Daily mode: click handler for any available day
  const handleDailyDateClick = (date: Date) => {
    const dateStr = formatDateISO(date);
    const dayData = dailyAvailabilityMap.get(dateStr);
    if (!dayData || dayData.status !== 'Available') return;

    // No selection yet → set check-in
    if (!rangeStart) {
      setRangeStart(dateStr);
      setRangeEnd(null);
      return;
    }

    // Check-in set, no checkout yet
    if (rangeStart && !rangeEnd) {
      if (dateStr === rangeStart) { setRangeStart(null); setRangeEnd(null); return; }
      if (dateStr > rangeStart) {
        // Validate all days from check-in to day before checkout are available
        if (isDailyRangeValid(rangeStart, addDaysToDateString(dateStr, -1))) {
          setRangeEnd(dateStr); // dateStr = checkout date
        } else {
          setRangeStart(dateStr); setRangeEnd(null);
        }
      } else {
        setRangeStart(dateStr); setRangeEnd(null);
      }
      return;
    }

    // Both set → start new selection
    setRangeStart(dateStr);
    setRangeEnd(null);
  };

  const handleDateClick = isDailyRateMode ? handleDailyDateClick : handleWeeklyDateClick;

  const handleWeekButtonClick = (rate: WeeklyRate) => {
    const dateStr = formatDateISO(rate.weekStartDate);
    if (rate.status !== 'Available') return;

    if (isDailyRateMode) {
      // In daily mode, week button selects Sat-to-Sat (7 nights)
      const endDateStr = addDaysToDateString(dateStr, 7);
      if (rangeStart === dateStr && rangeEnd === endDateStr) {
        setRangeStart(null); setRangeEnd(null); return;
      }
      setRangeStart(dateStr);
      setRangeEnd(endDateStr);
    } else {
      if (rangeStart === dateStr && !rangeEnd) { setRangeStart(null); setRangeEnd(null); return; }
      setRangeStart(dateStr);
      setRangeEnd(null);
    }
    if (onWeekSelect) onWeekSelect(rate);
  };

  // ===== RANGE CHECK =====

  const isDateInRange = useCallback((dateStr: string): boolean => {
    if (!rangeStart) return false;
    if (isDailyRateMode) {
      const endStr = rangeEnd || addDaysToDateString(rangeStart, 1);
      // Highlight check-in through checkout (inclusive for visual)
      return dateStr >= rangeStart && dateStr <= endStr;
    } else {
      const endStr = rangeEnd || rangeStart;
      return dateStr >= rangeStart && dateStr <= endStr;
    }
  }, [rangeStart, rangeEnd, isDailyRateMode]);

  const previousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  // ===== CALENDAR GRID DATA =====

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

        {/* Child Ages */}
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

        <p className="text-[9px] text-stone-400 mt-1.5">
          Max {maxGuests} guests
          {totalGuests >= maxGuests && <span className="text-terracotta font-medium"> — capacity reached</span>}
        </p>
      </div>

      {/* Daily Rate Mode Indicator */}
      {isDailyRateMode && (
        <div className="px-3 py-1.5 bg-soleil-50 border-b border-soleil-200">
          <p className="text-[10px] text-soleil-700 font-medium">
            Flexible dates — choose any check-in and check-out date
          </p>
        </div>
      )}

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

      {/* Calendar Grid */}
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
            if (day === null) return <div key={`empty-${index}`} className="h-7" />;

            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const dateStr = formatDateISO(date);
            const isPast = isPastDate(date);
            const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat

            if (isDailyRateMode) {
              // ===== DAILY MODE RENDERING =====
              const dayData = dailyAvailabilityMap.get(dateStr);

              if (!dayData) {
                return (
                  <div key={day} className="h-7 flex items-center justify-center text-[11px] text-stone-300">
                    {day}
                  </div>
                );
              }

              const isAvailable = dayData.status === 'Available' && !isPast;
              const isBooked = dayData.status !== 'Available';
              const isInRange = isDateInRange(dateStr);
              const isCheckIn = dateStr === rangeStart;
              const isCheckOut = dateStr === rangeEnd;
              const isChangeoverDay = dayOfWeek === 6; // Saturday

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(date)}
                  disabled={!isAvailable}
                  className={cn(
                    'h-7 flex flex-col items-center justify-center text-[11px] rounded-sm transition-all relative',
                    // Available days
                    isAvailable && !isInRange && 'bg-palm-50 text-palm-700 hover:bg-palm-100 cursor-pointer font-medium',
                    // Selected range
                    isInRange && isAvailable && 'bg-palm text-white font-bold',
                    // Check-in/out emphasis
                    (isCheckIn || isCheckOut) && 'ring-1 ring-olive ring-offset-1',
                    // Booked days
                    isBooked && 'bg-stone-100 text-stone-300 cursor-not-allowed line-through',
                    // Past days
                    (isPast && !isBooked) && 'text-stone-300 cursor-not-allowed',
                    // Changeover day (Saturday) border highlight
                    isChangeoverDay && isAvailable && !isInRange && 'border border-soleil-400',
                    isChangeoverDay && isInRange && 'border border-soleil-300',
                  )}
                  aria-label={`${day} ${shortMonthName}${isAvailable ? ' - Available' : ''}${isChangeoverDay ? ' (changeover day)' : ''}`}
                >
                  {day}
                  {/* Changeover day dot indicator */}
                  {isChangeoverDay && isAvailable && (
                    <span className={cn(
                      'absolute bottom-0.5 w-1 h-1 rounded-full',
                      isInRange ? 'bg-soleil-200' : 'bg-soleil-400'
                    )} />
                  )}
                </button>
              );
            } else {
              // ===== WEEKLY MODE RENDERING =====
              const weeklyRate = getWeekData(dateStr);

              if (!weeklyRate) {
                return (
                  <div key={day} className="h-7 flex items-center justify-center text-[11px] text-stone-300">
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
                    'h-7 flex items-center justify-center text-[11px] rounded-sm transition-all relative',
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
            }
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-stone-100 flex-wrap">
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
          {isDailyRateMode && (
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 bg-palm-50 rounded-sm border border-soleil-400 relative">
                <span className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-soleil-400" />
              </div>
              <span className="text-[9px] text-stone-500">Changeover</span>
            </div>
          )}
        </div>
      </div>

      {/* Week Selector Buttons */}
      <div className="border-t border-stone-200">
        <div className="px-3 py-2 bg-stone-50 border-b border-stone-100">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {isDailyRateMode
              ? `Available periods in ${currentMonth.toLocaleDateString('en-US', { month: 'long' })}`
              : `Available weeks in ${currentMonth.toLocaleDateString('en-US', { month: 'long' })}`}
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

            const weekBreakdown = rate.price
              ? (isDailyRateMode
                ? calculateDailyPriceBreakdown(rate.price, 7, guests, country)
                : calculatePriceBreakdown(rate.price, 1, guests, country))
              : null;

            const dailyRate = rate.price ? Math.round((rate.price / 7) * 100) / 100 : 0;

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
                  <div className={cn(
                    'text-[9px] leading-tight',
                    isSelected ? 'text-white/70' : 'text-stone-400'
                  )}>
                    {isDailyRateMode && dailyRate > 0
                      ? `from £${dailyRate.toFixed(0)}/night`
                      : weekBreakdown ? 'total incl. fees' : ''}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Booked weeks */}
          {bookedWeeksInMonth.map((rate) => {
            const startDate = new Date(rate.weekStartDate);
            const endDate = new Date(startDate.getTime() + 6 * 86400000);
            return (
              <div
                key={rate.id}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-sm border border-stone-100 bg-stone-50 opacity-50"
              >
                <div>
                  <div className="text-xs text-stone-400 leading-tight line-through">{formatShortDate(startDate)}</div>
                  <div className="text-[10px] text-stone-300 leading-tight line-through">to {formatShortDate(endDate)}</div>
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
            <div>
              <span className="text-[9px] text-stone-400 block">{isDailyRateMode ? 'Check-in' : 'From'}</span>
              <span>{formatDateDisplay(summary.startDate)}</span>
            </div>
            <span className="text-stone-300 px-1 self-end">&rarr;</span>
            <div className="text-right">
              <span className="text-[9px] text-stone-400 block">{isDailyRateMode ? 'Check-out' : 'To'}</span>
              <span>{summary.endDate ? formatDateDisplay(summary.endDate) : '-'}</span>
            </div>
          </div>

          {/* Total price */}
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              {isDailyRateMode
                ? `${summary.nights} night${summary.nights !== 1 ? 's' : ''}`
                : `${summary.breakdown.weeks} week${summary.breakdown.weeks > 1 ? 's' : ''}`}
              {' '}&middot; {totalGuests} guest{totalGuests > 1 ? 's' : ''}
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
                  Villa rental ({isDailyRateMode ? `${summary.nights} night${summary.nights !== 1 ? 's' : ''}` : `${summary.breakdown.weeks} week${summary.breakdown.weeks > 1 ? 's' : ''}`})
                </span>
                <span className="font-medium text-olive">
                  £{summary.breakdown.weeklyRate.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-500">
                  Tourist tax ({summary.breakdown.touristTaxDetails.qualifyingGuests} guest{summary.breakdown.touristTaxDetails.qualifyingGuests !== 1 ? 's' : ''} over {summary.breakdown.touristTaxDetails.ageThreshold} &times; £{summary.breakdown.touristTaxDetails.ratePerPerson.toFixed(2)}/{isDailyRateMode ? 'nt' : 'wk'})
                </span>
                <span className="font-medium text-olive">
                  £{summary.breakdown.touristTax.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-500">
                  Damage waiver ({summary.breakdown.damageWaiverDetails.totalGuests} guest{summary.breakdown.damageWaiverDetails.totalGuests !== 1 ? 's' : ''} &times; £{summary.breakdown.damageWaiverDetails.ratePerPerson.toFixed(2)}/{isDailyRateMode ? 'nt' : 'wk'})
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
            href={`/book/${villaId}?startDate=${rangeStart}${rangeEnd ? `&endDate=${rangeEnd}` : ''}&adults=${guests.adults}&children=${guests.children}${guests.childAges.length > 0 ? `&childAges=${guests.childAges.join(',')}` : ''}${isDailyRateMode ? '&mode=daily' : ''}`}
            className="block w-full bg-terracotta hover:bg-terracotta/90 text-white text-center py-2.5 rounded-sm transition-colors font-semibold text-sm mt-1"
          >
            {summary.breakdown.totalPrice > 0 ? 'Book Now' : 'Enquire Now'}
          </Link>

          <p className="text-[10px] text-stone-400 text-center">
            {isDailyRateMode
              ? 'Flexible dates available — price includes all mandatory fees'
              : 'Saturday to Saturday — price includes all mandatory fees'}
          </p>
        </div>
      )}
    </div>
  );
}
