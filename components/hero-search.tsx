/**
 * HERO SEARCH BAR - RALPH AUDIT COMPLIANT (BREAKOUT UI STRATEGY)
 * Main search interface for luxury villa bookings
 *
 * RALPH AUDITS PASSED:
 * ✓ Z-Index Nuke: All modals use z-[9999] to escape parent constraints
 * ✓ Fixed Positioning: Dropdowns render at viewport level, never clipped
 * ✓ Stale-While-Revalidate: Old results stay visible during loading
 * ✓ Mobile Full-Screen: All pickers use consistent full-screen modals
 * ✓ Close Buttons: Every modal has clear exit path
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Search, MapPin, X, Calendar as CalendarIcon, Users, Minus, Plus, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DatePicker, type DateSelection } from './search/date-picker';
import { type GuestCounts } from './search/guest-picker';
import { getSearchSuggestions, type SearchSuggestion, type GroupedSuggestions } from '@/app/actions/get-search-suggestions';

interface LocationSelection {
  label: string;
  value: string;
  type: 'country' | 'region' | 'town' | 'villa';
  villaId?: string;
  slug?: string;
}

type ActiveStep = 'location' | 'dates' | 'guests' | null;

interface HeroSearchProps {
  initialLocation?: {
    label: string;
    value: string;
    type: 'country' | 'region';
  };
}

export function HeroSearch({ initialLocation }: HeroSearchProps = {}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Mount check for portal (SSR safety)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Wizard state - auto-advance through steps
  const [activeStep, setActiveStep] = useState<ActiveStep>(null);

  // Master State - initialize with provided location if available
  const [location, setLocation] = useState<LocationSelection | null>(
    initialLocation ? {
      label: initialLocation.label,
      value: initialLocation.value,
      type: initialLocation.type,
    } : null
  );
  const [dates, setDates] = useState<DateSelection>({
    mode: 'specific',
    startDate: null,
    endDate: null,
    flexibility: 3, // PHASE 16: Default to ±3 days for better UX
    rangeStart: null,
    rangeEnd: null,
    duration: 7,
  });
  const [guests, setGuests] = useState<GuestCounts>({
    adults: 2,
    children: 0,
    infants: 0,
  });

  // Lock body scroll when modal is open (prevents header overlap on mobile)
  useEffect(() => {
    if (activeStep) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Lock body completely
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Restore scroll position and unlock body
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
    };
  }, [activeStep]);

  // Handle guest picker "Done" - auto-search if location or dates are selected
  const handleGuestsDone = () => {
    setActiveStep(null);
    // Auto-search if location OR dates are selected
    if (location || (dates.startDate && dates.endDate) || (dates.rangeStart && dates.rangeEnd)) {
      // Small delay to allow modal to close first
      setTimeout(() => {
        handleSearch();
      }, 100);
    }
  };

  // Handle date changes with auto-advance
  const handleDateChange = (newDates: DateSelection) => {
    setDates(newDates);

    // WIZARD: Auto-advance to guests when dates are fully selected
    // PHASE 25: Only auto-advance in SPECIFIC mode
    // Flexible mode uses native date inputs which trigger onChange during navigation
    // Users must manually close the modal when done (prevents premature auto-advance)
    if (newDates.mode === 'specific' && newDates.startDate && newDates.endDate) {
      setActiveStep('guests');
    }
  };

  // PHASE 16: Guest counter helpers (unwrapped from GuestPicker)
  const incrementGuests = (field: keyof GuestCounts) => {
    setGuests({ ...guests, [field]: guests[field] + 1 });
  };

  const decrementGuests = (field: keyof GuestCounts) => {
    if (field === 'adults' && guests.adults <= 1) return; // Minimum 1 adult
    if (guests[field] > 0) {
      setGuests({ ...guests, [field]: guests[field] - 1 });
    }
  };

  // Location search state
  const [locationQuery, setLocationQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GroupedSuggestions>({
    countries: [],
    regions: [],
    towns: [],
    villas: [],
  });
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // RALPH AUDIT: Stale-While-Revalidate - Keep previous results during loading
  const [displayedSuggestions, setDisplayedSuggestions] = useState<GroupedSuggestions>({
    countries: [],
    regions: [],
    towns: [],
    villas: [],
  });

  // Debounced search with stale-while-revalidate
  useEffect(() => {
    // PHASE 14: Increased threshold to 3 characters to reduce noise
    if (locationQuery.length < 3) {
      setSuggestions({ countries: [], regions: [], towns: [], villas: [] });
      setDisplayedSuggestions({ countries: [], regions: [], towns: [], villas: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      const results = await getSearchSuggestions(locationQuery);
      setSuggestions(results);
      setDisplayedSuggestions(results); // Update displayed results when new ones arrive
      setIsLoadingSuggestions(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [locationQuery]);

  // Handle location selection with auto-advance
  const selectLocation = (suggestion: SearchSuggestion) => {
    setLocation({
      label: suggestion.label,
      value: suggestion.slug || suggestion.label,
      type: suggestion.type,
      villaId: suggestion.villaId,
      slug: suggestion.slug,
    });
    setLocationQuery(suggestion.label);
    // WIZARD: Auto-advance to dates
    setActiveStep('dates');
  };

  // Clear location
  const clearLocation = () => {
    setLocation(null);
    setLocationQuery('');
  };

  // Handle Enter key on location input
  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      // PHASE 17: Prioritize countries > regions > towns > villas for better UX
      // Select the first available suggestion and auto-advance to dates
      const firstSuggestion =
        displayedSuggestions.countries[0] ||
        displayedSuggestions.regions[0] ||
        displayedSuggestions.towns[0] ||
        displayedSuggestions.villas[0];

      if (firstSuggestion) {
        // selectLocation() will auto-advance to 'dates' step
        selectLocation(firstSuggestion);
        return;
      }

      // PHASE 17: Scenario B - No suggestions found
      // Keep user in wizard flow instead of immediate navigation
      // Option: Could show a message or keep location modal open
      if (locationQuery.trim().length >= 3) {
        // User has typed enough but no match - could treat as general search
        // For now, just keep the location picker open (do nothing)
        console.log('[Location Search] No matches found for:', locationQuery);
      }
    }
  };

  // Handle search submission
  const handleSearch = () => {
    // RALPH AUDIT: Empty State Prevention
    if (!location && !dates.startDate && !dates.rangeStart) {
      alert('Please select a destination or dates to search');
      return;
    }

    // RALPH AUDIT: Villa Direct Navigation with Date Context
    if (location?.type === 'villa' && location.slug) {
      const villaParams = new URLSearchParams();

      // Pass date parameters to pre-select calendar
      if (dates.mode === 'specific' && dates.startDate) {
        villaParams.set('startDate', format(dates.startDate, 'yyyy-MM-dd'));
        if (dates.endDate) {
          villaParams.set('endDate', format(dates.endDate, 'yyyy-MM-dd'));
        }
      }

      // Pass guest counts
      if (guests.adults > 0) villaParams.set('adults', guests.adults.toString());
      if (guests.children > 0) villaParams.set('children', guests.children.toString());
      if (guests.infants > 0) villaParams.set('infants', guests.infants.toString());

      const queryString = villaParams.toString();
      router.push(`/villas/${location.slug}${queryString ? `?${queryString}` : ''}`);
      return;
    }

    // RALPH AUDIT: Date Format - ISO strings for URL
    const params = new URLSearchParams();

    if (location) {
      params.set('loc', location.value);
      params.set('type', location.type);
    }

    if (dates.mode === 'specific' && dates.startDate) {
      params.set('start', format(dates.startDate, 'yyyy-MM-dd'));
      if (dates.endDate) {
        params.set('end', format(dates.endDate, 'yyyy-MM-dd'));
      }
      params.set('flex', dates.flexibility.toString());
    } else if (dates.mode === 'flexible' && dates.rangeStart && dates.rangeEnd) {
      params.set('rangeStart', format(dates.rangeStart, 'yyyy-MM-dd'));
      params.set('rangeEnd', format(dates.rangeEnd, 'yyyy-MM-dd'));
      params.set('duration', dates.duration.toString());
    }

    params.set('adults', guests.adults.toString());
    if (guests.children > 0) params.set('children', guests.children.toString());
    if (guests.infants > 0) params.set('infants', guests.infants.toString());

    router.push(`/search?${params.toString()}`);
  };

  // Display text helpers
  const getDateDisplayText = () => {
    if (dates.mode === 'specific' && dates.startDate) {
      const flexText = dates.flexibility > 0 ? ` ±${dates.flexibility}d` : '';
      return `${format(dates.startDate, 'MMM d')}${flexText}`;
    } else if (dates.mode === 'flexible' && dates.rangeStart && dates.rangeEnd) {
      return `${format(dates.rangeStart, 'MMM d')} - ${format(dates.rangeEnd, 'MMM d')}`;
    }
    return 'Add dates';
  };

  const getGuestDisplayText = () => {
    const total = guests.adults + guests.children + guests.infants;
    return total > 0 ? `${total} ${total === 1 ? 'Guest' : 'Guests'}` : 'Add guests';
  };

  const hasAnySuggestions = displayedSuggestions.countries.length > 0 ||
    displayedSuggestions.regions.length > 0 ||
    displayedSuggestions.towns.length > 0 ||
    displayedSuggestions.villas.length > 0;

  return (
    <>
      <div className="w-full max-w-[90%] md:max-w-[800px] mx-auto relative z-10">
        {/* Desktop Layout - Location Page Style */}
        <div className="hidden md:flex bg-white shadow-xl">
          {/* Location Section */}
          <div className="flex-1 p-4 border-r border-gray-200">
            <button
              onClick={() => setActiveStep('location')}
              className="w-full text-left"
            >
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Location</label>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-serif">{location?.label || 'Any destination'}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            </button>
          </div>

          {/* Dates Section */}
          <div className="flex-1 p-4 border-r border-gray-200">
            <button
              onClick={() => setActiveStep('dates')}
              className="w-full text-left"
            >
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Dates</label>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-serif">{getDateDisplayText() === 'Add dates' ? 'Select date' : getDateDisplayText()}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            </button>
          </div>

          {/* Guests Section */}
          <div className="flex-1 p-4">
            <button
              onClick={() => setActiveStep('guests')}
              className="w-full text-left"
            >
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Guests</label>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-serif">{getGuestDisplayText() === 'Add guests' ? 'Any' : getGuestDisplayText()}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            </button>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="bg-[#3A443C] text-white px-8 py-4 font-serif uppercase tracking-widest text-sm hover:bg-[#2F3B34] transition-colors flex items-center justify-center gap-2"
          >
            Search
          </button>
        </div>

        {/* Mobile Layout - Stacked */}
        <div className="md:hidden flex flex-col bg-white shadow-xl">
          {/* Location */}
          <button
            onClick={() => setActiveStep('location')}
            className="p-4 border-b border-gray-200 text-left"
          >
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Location</label>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-serif">{location?.label || 'Any destination'}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </button>

          {/* Dates */}
          <button
            onClick={() => setActiveStep('dates')}
            className="p-4 border-b border-gray-200 text-left"
          >
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Dates</label>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-serif">{getDateDisplayText() === 'Add dates' ? 'Select date' : getDateDisplayText()}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </button>

          {/* Guests */}
          <button
            onClick={() => setActiveStep('guests')}
            className="p-4 border-b border-gray-200 text-left"
          >
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Guests</label>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-serif">{getGuestDisplayText() === 'Add guests' ? 'Any' : getGuestDisplayText()}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </button>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="bg-[#3A443C] text-white px-8 py-4 font-serif uppercase tracking-widest text-sm hover:bg-[#2F3B34] transition-colors flex items-center justify-center gap-2"
          >
            Search
          </button>
        </div>
      </div>

      {/* RALPH AUDIT: BREAKOUT MODALS - Rendered via Portal to escape transform containers */}
      {mounted && activeStep === 'location' && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-[99990]"
            onClick={() => setActiveStep(null)}
          />

          {/* Desktop: Centered Command Palette */}
          <div className="hidden md:block fixed top-1/4 left-1/2 -translate-x-1/2 w-[800px] max-w-[90vw] max-h-[80vh] bg-white z-[99999] shadow-2xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={handleLocationKeyDown}
                placeholder="Search destinations..."
                autoFocus
                className="flex-1 bg-transparent border-none outline-none text-stone-800 placeholder:text-stone-400 font-medium text-lg"
              />
              {location && (
                <button
                  onClick={clearLocation}
                  className="ml-2 p-1 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-stone-500" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="overflow-y-auto max-h-[400px]">
              {isLoadingSuggestions && !hasAnySuggestions ? (
                <div className="p-6 text-center text-stone-500">
                  Searching...
                </div>
              ) : hasAnySuggestions ? (
                <SuggestionsList
                  suggestions={displayedSuggestions}
                  onSelect={selectLocation}
                  isLoading={isLoadingSuggestions}
                />
              ) : locationQuery.length >= 2 ? (
                <div className="p-6 text-center text-stone-500">
                  No results found
                </div>
              ) : (
                <div className="p-6 text-center text-stone-500">
                  Type to search destinations
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Full-Screen Modal */}
          <div className="md:hidden fixed inset-0 h-[100dvh] w-screen bg-white z-[99999] flex flex-col animate-in slide-in-from-bottom duration-300 isolate">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-stone-200">
              <h3 className="font-serif text-lg font-medium text-olive">
                Select Location
              </h3>
              <button
                onClick={() => setActiveStep(null)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-stone-500" />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-4 py-3 border-b border-stone-200">
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={handleLocationKeyDown}
                placeholder="Search destinations..."
                autoFocus
                className="w-full px-4 py-3 bg-stone-50 rounded-lg border border-stone-200 outline-none focus:border-olive transition-colors text-stone-800 placeholder:text-stone-400"
              />
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingSuggestions && !hasAnySuggestions ? (
                <div className="p-6 text-center text-stone-500">
                  Searching...
                </div>
              ) : hasAnySuggestions ? (
                <SuggestionsList
                  suggestions={displayedSuggestions}
                  onSelect={selectLocation}
                  isLoading={isLoadingSuggestions}
                />
              ) : locationQuery.length >= 2 ? (
                <div className="p-6 text-center text-stone-500">
                  No results found
                </div>
              ) : (
                <div className="p-6 text-center text-stone-500">
                  Type to search destinations
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Date Picker Modal */}
      {mounted && activeStep === 'dates' && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-[99990]"
            onClick={() => setActiveStep(null)}
          />

          {/* Desktop: Centered Modal - Reduced size for tight fit */}
          <div className="hidden md:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[810px] max-w-[90vw] bg-white z-[99999] shadow-2xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3 border-b border-stone-200">
              <h3 className="font-serif text-base font-medium text-olive">Select Dates</h3>
              <button
                onClick={() => setActiveStep(null)}
                className="p-1.5 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-stone-500" />
              </button>
            </div>
            <div className="p-5">
              <DatePicker
                value={dates}
                onChange={handleDateChange}
                forceOpen
                onComplete={() => setActiveStep('guests')}
              />
            </div>
          </div>

          {/* Mobile: Full-Screen Modal */}
          <div className="md:hidden fixed inset-0 h-[100dvh] w-screen bg-white z-[99999] flex flex-col animate-in slide-in-from-bottom duration-300 isolate">
            <div className="flex items-center justify-between px-4 py-4 border-b border-stone-200">
              <h3 className="font-serif text-lg font-medium text-olive">Select Dates</h3>
              <button
                onClick={() => setActiveStep(null)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-stone-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <DatePicker
                value={dates}
                onChange={handleDateChange}
                forceOpen
                onComplete={() => setActiveStep('guests')}
              />
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Guest Picker Modal */}
      {mounted && activeStep === 'guests' && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-[99990]"
            onClick={() => setActiveStep(null)}
          />

          {/* Desktop: Centered Modal */}
          <div className="hidden md:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] max-w-[90vw] bg-white z-[99999] shadow-2xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <h3 className="font-serif text-lg font-medium text-olive">Select Guests</h3>
              <button
                onClick={() => setActiveStep(null)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-stone-500" />
              </button>
            </div>
            {/* PHASE 16: Unwrapped guest counters - direct render, h-auto for tight fit */}
            <div className="p-8 h-auto">
              <div className="space-y-6">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif text-lg text-stone-800">Adults</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => decrementGuests('adults')}
                      disabled={guests.adults <= 1}
                      className={cn(
                        'w-8 h-8 rounded-full border flex items-center justify-center transition-colors',
                        guests.adults <= 1
                          ? 'border-stone-200 text-stone-300 cursor-not-allowed'
                          : 'border-olive text-olive hover:bg-olive hover:text-white'
                      )}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-semibold text-stone-800">{guests.adults}</span>
                    <button
                      type="button"
                      onClick={() => incrementGuests('adults')}
                      className="w-8 h-8 rounded-full border border-olive text-olive hover:bg-olive hover:text-white flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif text-lg text-stone-800">Children</p>
                    <p className="text-sm text-stone-500">3-17 years</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => decrementGuests('children')}
                      disabled={guests.children <= 0}
                      className={cn(
                        'w-8 h-8 rounded-full border flex items-center justify-center transition-colors',
                        guests.children <= 0
                          ? 'border-stone-200 text-stone-300 cursor-not-allowed'
                          : 'border-olive text-olive hover:bg-olive hover:text-white'
                      )}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-semibold text-stone-800">{guests.children}</span>
                    <button
                      type="button"
                      onClick={() => incrementGuests('children')}
                      className="w-8 h-8 rounded-full border border-olive text-olive hover:bg-olive hover:text-white flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif text-lg text-stone-800">Infants</p>
                    <p className="text-sm text-stone-500">Under 3 years</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => decrementGuests('infants')}
                      disabled={guests.infants <= 0}
                      className={cn(
                        'w-8 h-8 rounded-full border flex items-center justify-center transition-colors',
                        guests.infants <= 0
                          ? 'border-stone-200 text-stone-300 cursor-not-allowed'
                          : 'border-olive text-olive hover:bg-olive hover:text-white'
                      )}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-semibold text-stone-800">{guests.infants}</span>
                    <button
                      type="button"
                      onClick={() => incrementGuests('infants')}
                      className="w-8 h-8 rounded-full border border-olive text-olive hover:bg-olive hover:text-white flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 pb-8 pt-4">
              <button
                onClick={handleGuestsDone}
                className="w-full bg-olive hover:bg-olive/90 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>

          {/* Mobile: Full-Screen Modal */}
          <div className="md:hidden fixed inset-0 h-[100dvh] w-screen bg-white z-[99999] flex flex-col animate-in slide-in-from-bottom duration-300 isolate">
            <div className="flex items-center justify-between px-4 py-4 border-b border-stone-200">
              <h3 className="font-serif text-lg font-medium text-olive">Select Guests</h3>
              <button
                onClick={() => setActiveStep(null)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-stone-500" />
              </button>
            </div>
            {/* PHASE 16: Unwrapped guest counters - direct render for mobile */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif text-lg text-stone-800">Adults</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => decrementGuests('adults')}
                      disabled={guests.adults <= 1}
                      className={cn(
                        'w-8 h-8 rounded-full border flex items-center justify-center transition-colors',
                        guests.adults <= 1
                          ? 'border-stone-200 text-stone-300 cursor-not-allowed'
                          : 'border-olive text-olive hover:bg-olive hover:text-white'
                      )}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-semibold text-stone-800">{guests.adults}</span>
                    <button
                      type="button"
                      onClick={() => incrementGuests('adults')}
                      className="w-8 h-8 rounded-full border border-olive text-olive hover:bg-olive hover:text-white flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif text-lg text-stone-800">Children</p>
                    <p className="text-sm text-stone-500">3-17 years</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => decrementGuests('children')}
                      disabled={guests.children <= 0}
                      className={cn(
                        'w-8 h-8 rounded-full border flex items-center justify-center transition-colors',
                        guests.children <= 0
                          ? 'border-stone-200 text-stone-300 cursor-not-allowed'
                          : 'border-olive text-olive hover:bg-olive hover:text-white'
                      )}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-semibold text-stone-800">{guests.children}</span>
                    <button
                      type="button"
                      onClick={() => incrementGuests('children')}
                      className="w-8 h-8 rounded-full border border-olive text-olive hover:bg-olive hover:text-white flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif text-lg text-stone-800">Infants</p>
                    <p className="text-sm text-stone-500">Under 3 years</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => decrementGuests('infants')}
                      disabled={guests.infants <= 0}
                      className={cn(
                        'w-8 h-8 rounded-full border flex items-center justify-center transition-colors',
                        guests.infants <= 0
                          ? 'border-stone-200 text-stone-300 cursor-not-allowed'
                          : 'border-olive text-olive hover:bg-olive hover:text-white'
                      )}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-semibold text-stone-800">{guests.infants}</span>
                    <button
                      type="button"
                      onClick={() => incrementGuests('infants')}
                      className="w-8 h-8 rounded-full border border-olive text-olive hover:bg-olive hover:text-white flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 pb-6 pt-2">
              <button
                onClick={handleGuestsDone}
                className="w-full bg-olive hover:bg-olive/90 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

/**
 * Suggestions List Component
 * Displays grouped search results
 */
interface SuggestionsListProps {
  suggestions: GroupedSuggestions;
  onSelect: (suggestion: SearchSuggestion) => void;
  isLoading: boolean;
}

function SuggestionsList({ suggestions, onSelect, isLoading }: SuggestionsListProps) {
  return (
    <div className="p-2">
      {/* Show loading indicator if loading AND we have results (stale-while-revalidate) */}
      {isLoading && (
        <div className="px-3 py-2 text-xs text-stone-400 italic">
          Updating results...
        </div>
      )}

      {suggestions.countries.length > 0 && (
        <SuggestionGroup
          title="Countries"
          suggestions={suggestions.countries}
          onSelect={onSelect}
        />
      )}
      {suggestions.regions.length > 0 && (
        <SuggestionGroup
          title="Regions"
          suggestions={suggestions.regions}
          onSelect={onSelect}
        />
      )}
      {suggestions.towns.length > 0 && (
        <SuggestionGroup
          title="Towns"
          suggestions={suggestions.towns}
          onSelect={onSelect}
        />
      )}
      {suggestions.villas.length > 0 && (
        <SuggestionGroup
          title="Villas"
          suggestions={suggestions.villas}
          onSelect={onSelect}
        />
      )}
    </div>
  );
}

/**
 * Suggestion Group Component
 */
interface SuggestionGroupProps {
  title: string;
  suggestions: SearchSuggestion[];
  onSelect: (suggestion: SearchSuggestion) => void;
}

function SuggestionGroup({ title, suggestions, onSelect }: SuggestionGroupProps) {
  return (
    <div className="mb-3">
      <div className="px-3 py-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
        {title}
      </div>
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          onClick={() => onSelect(suggestion)}
          className="w-full text-left px-3 py-2 hover:bg-stone-50 rounded-lg transition-colors flex items-center gap-2"
        >
          <MapPin className="h-4 w-4 text-olive flex-shrink-0" />
          <span className="text-stone-800">{suggestion.label}</span>
        </button>
      ))}
    </div>
  );
}
