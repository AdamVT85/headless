/**
 * INTERACTIVE FILTER PILLS
 * Expandable filter controls for search results page
 *
 * Features:
 * - Location: Click to see sibling regions, X to remove
 * - Dates: Click to show weeks (±4 weeks from original date)
 * - Guests: Click to show +/- controls for each age group
 * - Apply Filter button: Changes only applied when clicked
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { MapPin, Calendar, Users, X, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COUNTRY_REGIONS } from '@/lib/country-regions-config';
import { format, addDays, subDays, parseISO, isValid } from 'date-fns';

// Custom hook for horizontal drag scrolling
function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    setIsDragging(true);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  }, []);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 2;
    ref.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const onMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch support
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!ref.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !ref.current) return;
    const x = e.touches[0].pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 2;
    ref.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const onTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    ref,
    isDragging,
    handlers: {
      onMouseDown,
      onMouseUp,
      onMouseMove,
      onMouseLeave,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}

interface FilterPillsProps {
  location?: string;
  locationType?: string;
  startDate?: string;
  endDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
}

type ExpandedPill = 'location' | 'dates' | 'guests' | null;

// Pending changes interface
interface PendingChanges {
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  adults?: number;
  children?: number;
  infants?: number;
}

export function InteractiveFilterPills({
  location: propLocation,
  locationType: propLocationType,
  startDate: propStartDate,
  endDate: propEndDate,
  adults: propAdults = 0,
  children: propChildren = 0,
  infants: propInfants = 0,
}: FilterPillsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState<ExpandedPill>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dateScrollRef = useRef<HTMLDivElement>(null);
  const dragScroll = useDragScroll();

  // Read current filter values directly from URL for immediate UI updates
  // This ensures pills update instantly when URL changes, not waiting for search results
  const location = searchParams.get('loc') || searchParams.get('location') || searchParams.get('region') || searchParams.get('q') || undefined;
  const startDate = searchParams.get('start') || undefined;
  const endDate = searchParams.get('end') || undefined;
  const adults = parseInt(searchParams.get('adults') || '0') || 0;
  const children = parseInt(searchParams.get('children') || '0') || 0;
  const infants = parseInt(searchParams.get('infants') || '0') || 0;

  // Scroll to center (original date) when dates pill expands
  useEffect(() => {
    if (expanded === 'dates' && dragScroll.ref.current) {
      // Find the original date button (index 12 in a 25-item array: 12 before + 1 original + 12 after)
      const container = dragScroll.ref.current;
      const originalButton = container.querySelector('[data-original="true"]') as HTMLElement;
      if (originalButton) {
        const containerWidth = container.offsetWidth;
        const buttonLeft = originalButton.offsetLeft;
        const buttonWidth = originalButton.offsetWidth;
        // Center the original button
        container.scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
      }
    }
  }, [expanded]);

  // Pending changes (not applied until "Apply" is clicked)
  const [pending, setPending] = useState<PendingChanges>({});
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // Reset pending changes when collapsing
  useEffect(() => {
    if (expanded === null) {
      setPending({});
      setHasPendingChanges(false);
    }
  }, [expanded]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setExpanded(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Apply all pending changes to URL
  const applyChanges = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (pending.location !== undefined) {
      if (pending.location === null) {
        params.delete('loc');
        params.delete('location');
        params.delete('region');
        params.delete('q');
        params.delete('type');
      } else {
        params.set('loc', pending.location);
        params.set('type', 'region');
      }
    }

    if (pending.startDate !== undefined) {
      if (pending.startDate === null) {
        params.delete('start');
        params.delete('end');
        params.delete('flex');
        params.delete('rangeStart');
        params.delete('rangeEnd');
        params.delete('duration');
      } else {
        params.set('start', pending.startDate);
        if (pending.endDate) {
          params.set('end', pending.endDate);
        }
      }
    }

    if (pending.adults !== undefined || pending.children !== undefined || pending.infants !== undefined) {
      const newAdults = pending.adults ?? adults;
      const newChildren = pending.children ?? children;
      const newInfants = pending.infants ?? infants;

      if (newAdults > 0) {
        params.set('adults', newAdults.toString());
      } else {
        params.delete('adults');
      }
      if (newChildren > 0) {
        params.set('children', newChildren.toString());
      } else {
        params.delete('children');
      }
      if (newInfants > 0) {
        params.set('infants', newInfants.toString());
      } else {
        params.delete('infants');
      }
    }

    router.push(`${pathname}?${params.toString()}`);
    setExpanded(null);
    setPending({});
    setHasPendingChanges(false);
  };

  // Immediate removal functions (for X button clicks - no staging required)
  const removeLocationImmediate = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('loc');
    params.delete('location');
    params.delete('region');
    params.delete('q');
    params.delete('type');
    router.push(`${pathname}?${params.toString()}`);
  };

  const removeDatesImmediate = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('start');
    params.delete('end');
    params.delete('flex');
    params.delete('rangeStart');
    params.delete('rangeEnd');
    params.delete('duration');
    router.push(`${pathname}?${params.toString()}`);
  };

  const removeGuestsImmediate = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('adults');
    params.delete('children');
    params.delete('infants');
    router.push(`${pathname}?${params.toString()}`);
  };

  // Find sibling regions for current location
  const getSiblingRegions = (): { id: string; label: string }[] => {
    if (!location) return [];

    const normalizedLocation = location.toLowerCase();

    for (const [countrySlug, countryConfig] of Object.entries(COUNTRY_REGIONS)) {
      if (countrySlug === normalizedLocation || countryConfig.label.toLowerCase() === normalizedLocation) {
        return countryConfig.regions.map(r => ({ id: r.id, label: r.label }));
      }

      const matchingRegion = countryConfig.regions.find(
        r => r.label.toLowerCase() === normalizedLocation || r.id === normalizedLocation
      );

      if (matchingRegion) {
        return countryConfig.regions.map(r => ({ id: r.id, label: r.label }));
      }
    }

    return [];
  };

  const siblingRegions = getSiblingRegions();
  const hasLocation = !!location;
  const hasGuests = adults > 0 || children > 0 || infants > 0;
  const hasDates = !!startDate && !!endDate;
  const totalGuests = adults + children + infants;

  // Get effective values (pending or current)
  const effectiveLocation = pending.location !== undefined ? pending.location : location;
  const effectiveAdults = pending.adults ?? adults;
  const effectiveChildren = pending.children ?? children;
  const effectiveInfants = pending.infants ?? infants;
  const effectiveStartDate = pending.startDate !== undefined ? pending.startDate : startDate;
  const effectiveEndDate = pending.endDate !== undefined ? pending.endDate : endDate;

  // Remove location filter (staged)
  const stageRemoveLocation = () => {
    setPending(p => ({ ...p, location: null }));
    setHasPendingChanges(true);
  };

  // Select sibling region (staged)
  const stageSelectRegion = (regionLabel: string) => {
    setPending(p => ({ ...p, location: regionLabel }));
    setHasPendingChanges(true);
  };

  // Select week (staged)
  const stageSelectWeek = (start: Date, end: Date) => {
    setPending(p => ({
      ...p,
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    }));
    setHasPendingChanges(true);
  };

  // Remove dates (staged)
  const stageRemoveDates = () => {
    setPending(p => ({ ...p, startDate: null, endDate: null }));
    setHasPendingChanges(true);
  };

  // Update guests (staged)
  const stageUpdateGuests = (field: 'adults' | 'children' | 'infants', delta: number) => {
    const currentValue = field === 'adults' ? effectiveAdults :
                         field === 'children' ? effectiveChildren : effectiveInfants;
    const newValue = Math.max(0, currentValue + delta);

    setPending(p => ({ ...p, [field]: newValue }));
    setHasPendingChanges(true);
  };

  // Remove guests (staged)
  const stageRemoveGuests = () => {
    setPending(p => ({ ...p, adults: 0, children: 0, infants: 0 }));
    setHasPendingChanges(true);
  };

  // Parse dates for the week picker
  const parsedStartDate = startDate ? parseISO(startDate) : null;
  const parsedEndDate = endDate ? parseISO(endDate) : null;

  // Calculate trip duration
  const tripDuration = parsedStartDate && parsedEndDate
    ? Math.ceil((parsedEndDate.getTime() - parsedStartDate.getTime()) / (1000 * 60 * 60 * 24))
    : 7;

  // Generate week options (±12 weeks from original date for scrolling)
  const generateWeekOptions = () => {
    if (!parsedStartDate || !isValid(parsedStartDate)) return [];

    const weeks: { start: Date; end: Date; label: string; isOriginal: boolean }[] = [];

    // 12 weeks before (scrollable)
    for (let i = 12; i >= 1; i--) {
      const weekStart = subDays(parsedStartDate, i * 7);
      const weekEnd = addDays(weekStart, tripDuration);
      weeks.push({
        start: weekStart,
        end: weekEnd,
        label: format(weekStart, 'd MMM'),
        isOriginal: false,
      });
    }

    // Original week (center)
    weeks.push({
      start: parsedStartDate,
      end: parsedEndDate || addDays(parsedStartDate, tripDuration),
      label: format(parsedStartDate, 'd MMM'),
      isOriginal: true,
    });

    // 12 weeks after (scrollable)
    for (let i = 1; i <= 12; i++) {
      const weekStart = addDays(parsedStartDate, i * 7);
      const weekEnd = addDays(weekStart, tripDuration);
      weeks.push({
        start: weekStart,
        end: weekEnd,
        label: format(weekStart, 'd MMM'),
        isOriginal: false,
      });
    }

    return weeks;
  };

  const weekOptions = generateWeekOptions();

  // Check if a week is selected (either original or pending)
  const isWeekSelected = (weekStart: Date) => {
    const checkDate = effectiveStartDate ? parseISO(effectiveStartDate) : parsedStartDate;
    if (!checkDate) return false;
    return format(weekStart, 'yyyy-MM-dd') === format(checkDate, 'yyyy-MM-dd');
  };

  // Check if a week is the original selection
  const isOriginalWeek = (weekStart: Date) => {
    if (!parsedStartDate) return false;
    return format(weekStart, 'yyyy-MM-dd') === format(parsedStartDate, 'yyyy-MM-dd');
  };

  if (!hasLocation && !hasGuests && !hasDates) {
    return null;
  }

  return (
    <div ref={containerRef} className="mt-6 relative">
      {/* Pills Container - wraps on mobile */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Location Pill */}
        {hasLocation && (
          <div className="relative">
            <div
              className={cn(
                'flex items-center gap-2 bg-olive/10 rounded-full transition-all duration-300',
                expanded === 'location' ? 'pr-2' : 'px-4 py-2'
              )}
            >
              {expanded !== 'location' && (
                <>
                  <button
                    onClick={() => setExpanded('location')}
                    className="flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4 text-olive" />
                    <span className="text-sm font-medium text-stone-800">{location}</span>
                  </button>
                  <button
                    onClick={removeLocationImmediate}
                    className="p-0.5 hover:bg-stone-200 rounded-full transition-colors ml-1"
                  >
                    <X className="h-3.5 w-3.5 text-stone-500" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Guests Pill */}
        {hasGuests && (
          <div className="relative">
            <div className="flex items-center gap-2 bg-olive/10 rounded-full px-4 py-2">
              {expanded !== 'guests' && (
                <>
                  <button
                    onClick={() => setExpanded('guests')}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4 text-olive" />
                    <span className="text-sm font-medium text-stone-800">
                      {totalGuests} {totalGuests === 1 ? 'Guest' : 'Guests'}
                    </span>
                  </button>
                  <button
                    onClick={removeGuestsImmediate}
                    className="p-0.5 hover:bg-stone-200 rounded-full transition-colors ml-1"
                  >
                    <X className="h-3.5 w-3.5 text-stone-500" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Dates Pill */}
        {hasDates && (
          <div className="relative">
            <div className="flex items-center bg-olive/10 rounded-full px-4 py-2">
              {expanded !== 'dates' && (
                <>
                  <button
                    onClick={() => setExpanded('dates')}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4 text-olive" />
                    <span className="text-sm font-medium text-stone-800">
                      {startDate && endDate
                        ? `${format(parseISO(startDate), 'd MMM')} - ${format(parseISO(endDate), 'd MMM')}`
                        : 'Any Dates'
                      }
                    </span>
                  </button>
                  <button
                    onClick={removeDatesImmediate}
                    className="p-0.5 hover:bg-stone-200 rounded-full transition-colors ml-1"
                  >
                    <X className="h-3.5 w-3.5 text-stone-500" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expanded Panel - Full width below pills */}
      {expanded && (
        <div className="mt-3 bg-white border border-stone-200 rounded-lg shadow-lg p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Location Expanded */}
          {expanded === 'location' && (
            <div className="flex flex-wrap items-center gap-2">
              <MapPin className="h-4 w-4 text-olive flex-shrink-0" />
              {siblingRegions.length > 0 ? (
                siblingRegions.map((region) => {
                  const isSelected = (effectiveLocation || '').toLowerCase() === region.label.toLowerCase();
                  const isOriginal = location?.toLowerCase() === region.label.toLowerCase();

                  return (
                    <button
                      key={region.id}
                      onClick={() => stageSelectRegion(region.label)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                        isSelected
                          ? 'bg-olive text-white'
                          : isOriginal
                            ? 'bg-olive/30 text-stone-800'
                            : 'bg-stone-100 text-stone-700 hover:bg-olive/20'
                      )}
                    >
                      {region.label}
                    </button>
                  );
                })
              ) : (
                <span className="px-3 py-1.5 text-sm text-stone-600">{location}</span>
              )}
              <button
                onClick={() => setExpanded(null)}
                className="p-1.5 hover:bg-stone-200 rounded-full transition-colors ml-auto"
              >
                <X className="h-4 w-4 text-stone-500" />
              </button>
            </div>
          )}

          {/* Guests Expanded */}
          {expanded === 'guests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Users className="h-4 w-4 text-olive" />
                <button
                  onClick={() => setExpanded(null)}
                  className="p-1.5 hover:bg-stone-200 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-stone-500" />
                </button>
              </div>
              <div className="flex flex-wrap gap-4 md:gap-6">
                {/* Adults */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-stone-600 uppercase tracking-wide w-16">Adults</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => stageUpdateGuests('adults', -1)}
                      disabled={effectiveAdults <= 0}
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                        effectiveAdults <= 0
                          ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                          : 'bg-white text-olive hover:bg-olive hover:text-white border border-olive'
                      )}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{effectiveAdults}</span>
                    <button
                      onClick={() => stageUpdateGuests('adults', 1)}
                      className="w-8 h-8 rounded-full bg-white text-olive hover:bg-olive hover:text-white border border-olive flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-stone-600 uppercase tracking-wide w-16">Children</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => stageUpdateGuests('children', -1)}
                      disabled={effectiveChildren <= 0}
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                        effectiveChildren <= 0
                          ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                          : 'bg-white text-olive hover:bg-olive hover:text-white border border-olive'
                      )}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{effectiveChildren}</span>
                    <button
                      onClick={() => stageUpdateGuests('children', 1)}
                      className="w-8 h-8 rounded-full bg-white text-olive hover:bg-olive hover:text-white border border-olive flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-stone-600 uppercase tracking-wide w-16">Infants</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => stageUpdateGuests('infants', -1)}
                      disabled={effectiveInfants <= 0}
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                        effectiveInfants <= 0
                          ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                          : 'bg-white text-olive hover:bg-olive hover:text-white border border-olive'
                      )}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{effectiveInfants}</span>
                    <button
                      onClick={() => stageUpdateGuests('infants', 1)}
                      className="w-8 h-8 rounded-full bg-white text-olive hover:bg-olive hover:text-white border border-olive flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dates Expanded */}
          {expanded === 'dates' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Calendar className="h-4 w-4 text-olive" />
                <button
                  onClick={() => setExpanded(null)}
                  className="p-1.5 hover:bg-stone-200 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-stone-500" />
                </button>
              </div>
              <div
                ref={dragScroll.ref}
                {...dragScroll.handlers}
                className={cn(
                  'flex items-center gap-2 py-1 overflow-x-auto scrollbar-hide',
                  dragScroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'
                )}
                style={{ scrollBehavior: dragScroll.isDragging ? 'auto' : 'smooth' }}
              >
                {weekOptions.map((week, index) => {
                  const selected = isWeekSelected(week.start);

                  return (
                    <button
                      key={index}
                      data-original={week.isOriginal}
                      onClick={() => !dragScroll.isDragging && stageSelectWeek(week.start, week.end)}
                      className={cn(
                        'px-3 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0 select-none',
                        selected
                          ? 'bg-olive text-white'
                          : week.isOriginal
                            ? 'bg-olive/30 text-stone-800 ring-1 ring-olive/50'
                            : 'bg-stone-100 text-stone-700 hover:bg-olive/20'
                      )}
                    >
                      {week.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Apply Button */}
          <div className="mt-4 pt-3 border-t border-stone-100">
            <button
              onClick={applyChanges}
              disabled={!hasPendingChanges}
              className={cn(
                'w-full md:w-auto px-6 py-2 rounded-full text-sm font-medium transition-all duration-200',
                hasPendingChanges
                  ? 'bg-olive text-white hover:bg-olive/90 shadow-md'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              )}
            >
              Apply Filter
            </button>
          </div>
        </div>
      )}

      {/* Scrollbar hide styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
