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

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, X, Calendar as CalendarIcon, Users, Minus, Plus } from 'lucide-react';
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

export function HeroSearch() {
  const router = useRouter();

  // Wizard state - auto-advance through steps
  const [activeStep, setActiveStep] = useState<ActiveStep>(null);

  // Master State
  const [location, setLocation] = useState<LocationSelection | null>(null);
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
      <div className="w-full max-w-5xl mx-auto px-4 relative z-10">
        {/* Desktop Layout - Pill Shape */}
        <div className="hidden md:flex items-center bg-white shadow-2xl rounded-full h-20 overflow-visible">
          {/* Location Section - 35% */}
          <div className="flex-[0.35] h-full border-r border-stone-200">
            <button
              onClick={() => setActiveStep('location')}
              className="h-full w-full flex items-center px-6 text-left hover:bg-stone-50 transition-colors rounded-l-full"
            >
              <MapPin className="h-5 w-5 text-olive mr-3 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-stone-500 mb-1">Where?</div>
                <div className="font-medium text-stone-800 truncate">
                  {location?.label || 'Add location'}
                </div>
              </div>
            </button>
          </div>

          {/* Dates Section - 25% */}
          <div className="flex-[0.25] h-full border-r border-stone-200">
            <button
              onClick={() => setActiveStep('dates')}
              className="h-full w-full flex items-center px-6 text-left hover:bg-stone-50 transition-colors"
            >
              <CalendarIcon className="h-5 w-5 text-olive mr-3 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-stone-500 mb-1">When?</div>
                <div className="font-medium text-stone-800 truncate">{getDateDisplayText()}</div>
              </div>
            </button>
          </div>

          {/* Guests Section - 25% */}
          <div className="flex-[0.25] h-full border-r border-stone-200">
            <button
              onClick={() => setActiveStep('guests')}
              className="h-full w-full flex items-center px-6 text-left hover:bg-stone-50 transition-colors"
            >
              <Users className="h-5 w-5 text-olive mr-3 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-stone-500 mb-1">Who?</div>
                <div className="font-medium text-stone-800 truncate">{getGuestDisplayText()}</div>
              </div>
            </button>
          </div>

          {/* Search Button - 15% */}
          <div className="flex-[0.15] h-full flex items-center justify-center px-4">
            <button
              onClick={handleSearch}
              className="w-14 h-14 bg-terracotta hover:bg-terracotta/90 rounded-full flex items-center justify-center transition-colors shadow-lg"
            >
              <Search className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        {/* Mobile Layout - Stacked */}
        <div className="md:hidden flex flex-col bg-white shadow-2xl rounded-3xl p-4 space-y-3">
          {/* Location */}
          <button
            onClick={() => setActiveStep('location')}
            className="flex items-center px-4 py-3 bg-stone-50 rounded-lg border border-stone-200 text-left hover:bg-stone-100 transition-colors"
          >
            <MapPin className="h-5 w-5 text-olive mr-3" />
            <span className="flex-1 text-stone-800">{location?.label || 'Where to?'}</span>
          </button>

          {/* Dates */}
          <button
            onClick={() => setActiveStep('dates')}
            className="flex items-center px-4 py-3 bg-stone-50 rounded-lg border border-stone-200 text-left hover:bg-stone-100 transition-colors"
          >
            <CalendarIcon className="h-5 w-5 text-olive mr-3" />
            <span className="flex-1 text-stone-800">{getDateDisplayText()}</span>
          </button>

          {/* Guests */}
          <button
            onClick={() => setActiveStep('guests')}
            className="flex items-center px-4 py-3 bg-stone-50 rounded-lg border border-stone-200 text-left hover:bg-stone-100 transition-colors"
          >
            <Users className="h-5 w-5 text-olive mr-3" />
            <span className="flex-1 text-stone-800">{getGuestDisplayText()}</span>
          </button>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full bg-terracotta hover:bg-terracotta/90 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            <Search className="h-5 w-5" />
            Search Villas
          </button>
        </div>
      </div>

      {/* RALPH AUDIT: BREAKOUT MODALS - Fixed positioning with z-[9999] */}

      {/* Location Modal */}
      {activeStep === 'location' && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-[9990]"
            onClick={() => setActiveStep(null)}
          />

          {/* Desktop: Centered Command Palette */}
          <div className="hidden md:block fixed top-1/4 left-1/2 -translate-x-1/2 w-[800px] max-w-[90vw] max-h-[80vh] bg-white z-[9999] shadow-2xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
          <div className="md:hidden fixed inset-0 h-[100dvh] w-screen bg-white z-[9999] flex flex-col animate-in slide-in-from-bottom duration-300">
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
                className="w-full px-4 py-3 bg-stone-50 rounded-lg border border-stone-200 outline-none focus:border-olive transition-colors"
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
        </>
      )}

      {/* Date Picker Modal */}
      {activeStep === 'dates' && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-[9990]"
            onClick={() => setActiveStep(null)}
          />

          {/* Desktop: Centered Modal */}
          <div className="hidden md:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] max-w-[90vw] max-h-[85vh] bg-white z-[9999] shadow-2xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <h3 className="font-serif text-lg font-medium text-olive">Select Dates</h3>
              <button
                onClick={() => setActiveStep(null)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-stone-500" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto max-h-[calc(85vh-80px)] min-h-[500px]">
              <DatePicker
                value={dates}
                onChange={handleDateChange}
                forceOpen
                onComplete={() => setActiveStep('guests')}
              />
            </div>
          </div>

          {/* Mobile: Full-Screen Modal */}
          <div className="md:hidden fixed inset-0 h-[100dvh] w-screen bg-white z-[9999] flex flex-col animate-in slide-in-from-bottom duration-300">
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
        </>
      )}

      {/* Guest Picker Modal */}
      {activeStep === 'guests' && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-[9990]"
            onClick={() => setActiveStep(null)}
          />

          {/* Desktop: Centered Modal */}
          <div className="hidden md:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] max-w-[90vw] bg-white z-[9999] shadow-2xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                onClick={() => setActiveStep(null)}
                className="w-full bg-olive hover:bg-olive/90 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>

          {/* Mobile: Full-Screen Modal */}
          <div className="md:hidden fixed inset-0 h-[100dvh] w-screen bg-white z-[9999] flex flex-col animate-in slide-in-from-bottom duration-300">
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
                onClick={() => setActiveStep(null)}
                className="w-full bg-olive hover:bg-olive/90 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </>
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

      {suggestions.villas.length > 0 && (
        <SuggestionGroup
          title="Villas"
          suggestions={suggestions.villas}
          onSelect={onSelect}
        />
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
