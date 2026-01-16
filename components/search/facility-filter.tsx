/**
 * FACILITY FILTER
 *
 * Filter panel for selecting villa facilities on the search page.
 * Shows a curated list of key facilities for web search.
 *
 * Features:
 * - Curated facility list (8 key filters)
 * - Full-screen modal on mobile
 * - Slide-out panel on desktop
 * - Shows count of villas with each facility
 * - Multiple selection with AND logic
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SlidersHorizontal, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MockVilla } from '@/lib/mock-db';

interface FacilityFilterProps {
  /** Current search results to determine available facilities */
  villas: MockVilla[];
}

// Curated list of facilities to show in the filter
// Maps display name to the Salesforce facility name
const FILTER_FACILITIES = [
  { key: 'car-not-essential', label: 'Car Not Essential', sfName: 'Car NOT Essential' },
  { key: 'kids-pool', label: "Children's Pool", sfName: "Children's Pool" },
  { key: 'fenced-pool', label: 'Fenced Pool', sfName: 'Fenced/Gated Pool' },
  { key: 'total-privacy', label: 'Total Privacy', sfName: 'Grounds offer TOTAL PRIVACY' },
  { key: 'great-views', label: 'Great Views', sfName: 'Great Views' },
  { key: 'walk-amenities', label: 'Walk to Amenities', sfName: 'Walk to Amenities' },
  { key: 'beach-walk', label: 'Beach (Walking)', sfName: 'Beach - Walk (within 1.5km)' },
  { key: 'heated-pool', label: 'Heated Pool', sfName: 'Heated Pool' },
];

export function FacilityFilter({ villas }: FacilityFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);

  // Get currently selected facilities from URL
  const selectedFacilities = searchParams.get('facilities')?.split(',').filter(Boolean) || [];

  // Prevent body scroll when modal is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Calculate which facilities are available in current results
  const getAvailableFacilities = (): Map<string, number> => {
    const facilityCount = new Map<string, number>();

    villas.forEach(villa => {
      (villa.facilities || []).forEach(facilityName => {
        const normalizedName = facilityName.toLowerCase().trim();
        // Check against our curated list
        FILTER_FACILITIES.forEach(f => {
          if (f.sfName.toLowerCase() === normalizedName) {
            const current = facilityCount.get(f.sfName) || 0;
            facilityCount.set(f.sfName, current + 1);
          }
        });
      });
    });

    return facilityCount;
  };

  const availableFacilities = getAvailableFacilities();

  // Toggle a facility selection
  const toggleFacility = (sfName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    let newSelection: string[];

    if (selectedFacilities.includes(sfName)) {
      newSelection = selectedFacilities.filter(f => f !== sfName);
    } else {
      newSelection = [...selectedFacilities, sfName];
    }

    if (newSelection.length > 0) {
      params.set('facilities', newSelection.join(','));
    } else {
      params.delete('facilities');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  // Clear all facility filters
  const clearFacilities = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('facilities');
    router.push(`${pathname}?${params.toString()}`);
  };

  // Apply and close
  const applyAndClose = () => {
    setIsOpen(false);
  };

  // Check if a facility would return results if added
  const wouldHaveResults = (sfName: string): boolean => {
    if (selectedFacilities.includes(sfName)) return true;

    const requiredFacilities = [...selectedFacilities, sfName];

    const matchingVillas = villas.filter(villa => {
      const villaFacilities = (villa.facilities || []).map(f => f.toLowerCase().trim());
      return requiredFacilities.every(req =>
        villaFacilities.some(vf => vf === req.toLowerCase().trim())
      );
    });

    return matchingVillas.length > 0;
  };

  const hasSelectedFacilities = selectedFacilities.length > 0;
  const selectedCount = selectedFacilities.length;

  return (
    <>
      {/* Filter Button - styled like Map View button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-all',
          'border border-stone-300 hover:border-olive',
          hasSelectedFacilities
            ? 'bg-olive text-white border-olive'
            : 'bg-white text-olive hover:bg-olive-50'
        )}
      >
        <SlidersHorizontal size={18} />
        <span>Filters</span>
        {hasSelectedFacilities && (
          <span className="ml-1 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
            {selectedCount}
          </span>
        )}
      </button>

      {/* Filter Panel - Full screen on mobile, overlay on desktop */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-50 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div
            className={cn(
              'fixed z-50 bg-white shadow-2xl transition-transform duration-300 ease-out',
              // Mobile: full screen from bottom
              'inset-0 md:inset-auto',
              // Desktop: right side panel
              'md:right-0 md:top-0 md:bottom-0 md:w-[420px] md:max-w-full'
            )}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-stone-200 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-serif text-lg md:text-xl text-olive">Filters</h2>
                {hasSelectedFacilities && (
                  <p className="text-xs md:text-sm text-stone-500 mt-0.5">
                    {selectedCount} {selectedCount === 1 ? 'filter' : 'filters'} selected
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 md:p-2 hover:bg-stone-100 rounded-full transition-colors"
                aria-label="Close filters"
              >
                <X size={22} className="text-stone-600 md:w-6 md:h-6" />
              </button>
            </div>

            {/* Filter Options */}
            <div className="px-4 py-4 md:px-6 md:py-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 130px)' }}>
              <div className="space-y-2 md:space-y-3">
                {FILTER_FACILITIES.map((facility) => {
                  const isSelected = selectedFacilities.includes(facility.sfName);
                  const count = availableFacilities.get(facility.sfName) || 0;
                  const canSelect = count > 0 && (isSelected || wouldHaveResults(facility.sfName));
                  const isDisabled = count === 0;

                  return (
                    <button
                      key={facility.key}
                      onClick={() => canSelect && toggleFacility(facility.sfName)}
                      disabled={isDisabled}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 md:px-4 md:py-4 rounded-lg border-2 transition-all duration-200',
                        isSelected
                          ? 'border-olive bg-olive/5'
                          : canSelect
                            ? 'border-stone-200 hover:border-olive/50 hover:bg-stone-50'
                            : 'border-stone-100 bg-stone-50 cursor-not-allowed opacity-50'
                      )}
                    >
                      <div className="flex items-center gap-2.5 md:gap-3">
                        {/* Checkbox */}
                        <div
                          className={cn(
                            'w-5 h-5 md:w-6 md:h-6 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                            isSelected
                              ? 'bg-olive border-olive'
                              : 'border-stone-300 bg-white'
                          )}
                        >
                          {isSelected && <Check size={14} className="text-white md:w-4 md:h-4" strokeWidth={3} />}
                        </div>

                        {/* Label */}
                        <span
                          className={cn(
                            'font-medium text-sm md:text-base',
                            isSelected ? 'text-olive' : 'text-stone-700'
                          )}
                        >
                          {facility.label}
                        </span>
                      </div>

                      {/* Count Badge */}
                      <span
                        className={cn(
                          'text-xs md:text-sm px-2 py-0.5 md:px-2.5 md:py-1 rounded-full flex-shrink-0',
                          isSelected
                            ? 'bg-olive text-white'
                            : count > 0
                              ? 'bg-stone-100 text-stone-600'
                              : 'bg-stone-100 text-stone-400'
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* No facilities message */}
              {availableFacilities.size === 0 && (
                <div className="text-center py-8 text-stone-500">
                  <p>No facility data available.</p>
                  <p className="text-sm mt-1">Try syncing facility data first.</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-stone-200 px-4 py-3 md:px-6 md:py-4 flex gap-2 md:gap-3">
              {hasSelectedFacilities && (
                <button
                  onClick={clearFacilities}
                  className="flex-1 px-3 py-2.5 md:px-4 md:py-3 border border-stone-300 text-stone-700 font-medium text-sm md:text-base rounded-sm hover:bg-stone-50 transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={applyAndClose}
                className={cn(
                  'flex-1 px-3 py-2.5 md:px-4 md:py-3 bg-olive text-white font-medium text-sm md:text-base rounded-sm hover:bg-olive/90 transition-colors',
                  !hasSelectedFacilities && 'flex-[2]'
                )}
              >
                {hasSelectedFacilities
                  ? `Show ${villas.length} ${villas.length === 1 ? 'Villa' : 'Villas'}`
                  : 'Done'
                }
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
