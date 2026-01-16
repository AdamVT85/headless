'use client';

/**
 * REGION VILLAS SECTION
 * Shows all villas in a region with map view and filter functionality.
 * Used on region landing pages to replace the simple "Featured Villas" section.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import dynamicImport from 'next/dynamic';
import { Map, LayoutGrid, SlidersHorizontal, X, Check } from 'lucide-react';
import { MockVilla } from '@/lib/mock-db';
import { VillaCard, VillaCardGrid } from '@/components/ui/villa-card';
import { VillaCardRow } from '@/components/search/villa-card-row';
import { cn } from '@/lib/utils';

// Dynamic import for MapView (client-side only, no SSR)
const MapView = dynamicImport(() => import('@/components/search/map-view'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-clay-100">
      <div className="text-olive animate-pulse">Loading map...</div>
    </div>
  ),
});

// Curated list of facilities to show in the filter
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

interface RegionVillasSectionProps {
  villas: MockVilla[];
  regionName: string;
}

export function RegionVillasSection({ villas, regionName }: RegionVillasSectionProps) {
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMapView, setIsMapView] = useState(false);
  const [hoveredVillaId, setHoveredVillaId] = useState<string | null>(null);
  const [selectedVillaId, setSelectedVillaId] = useState<string | null>(null);
  const [highlightFromMap, setHighlightFromMap] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter villas based on selected facilities
  const filteredVillas = useMemo(() => {
    if (selectedFacilities.length === 0) return villas;

    return villas.filter(villa => {
      const villaFacilities = (villa.facilities || []).map(f => f.toLowerCase().trim());
      return selectedFacilities.every(req =>
        villaFacilities.some(vf => vf === req.toLowerCase().trim())
      );
    });
  }, [villas, selectedFacilities]);

  // Calculate facility counts
  const facilityCount = useMemo(() => {
    const counts: Record<string, number> = {};
    villas.forEach(villa => {
      (villa.facilities || []).forEach(facilityName => {
        const normalizedName = facilityName.toLowerCase().trim();
        FILTER_FACILITIES.forEach(f => {
          if (f.sfName.toLowerCase() === normalizedName) {
            counts[f.sfName] = (counts[f.sfName] || 0) + 1;
          }
        });
      });
    });
    return counts;
  }, [villas]);

  // Prevent body scroll when modal is open on mobile
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFilterOpen]);

  // Handle hover from list
  const handleListHover = useCallback((villaId: string | null) => {
    setHighlightFromMap(false);
    setSelectedVillaId(null);
    setHoveredVillaId(villaId);
  }, []);

  // Handle hover from map
  const handleMapHover = useCallback((villaId: string | null) => {
    if (selectedVillaId && villaId === null) return;
    setHighlightFromMap(true);
    setHoveredVillaId(villaId);
  }, [selectedVillaId]);

  // Handle marker click on desktop
  const handleMarkerClick = useCallback((villaId: string) => {
    setHighlightFromMap(true);
    setSelectedVillaId(villaId);
    setHoveredVillaId(villaId);
  }, []);

  // Toggle facility selection
  const toggleFacility = (sfName: string) => {
    setSelectedFacilities(prev =>
      prev.includes(sfName)
        ? prev.filter(f => f !== sfName)
        : [...prev, sfName]
    );
  };

  // Clear all filters
  const clearFacilities = () => {
    setSelectedFacilities([]);
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

  // Toggle map view
  const toggleMapView = () => {
    setIsMapView(!isMapView);
  };

  // Close mobile map
  const closeMobileMap = () => {
    setIsMapView(false);
  };

  const hasSelectedFacilities = selectedFacilities.length > 0;

  if (villas.length === 0) {
    return (
      <section className="bg-[#F3F0E9] pt-16 pb-8 px-6 md:px-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-serif text-[#3A443C] mb-6">Villas in {regionName}</h2>
          <p className="text-gray-600 mb-8">
            We&apos;re currently updating our villa collection for {regionName}. Please check back soon.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#F3F0E9]">
      {/* Header with Title and Controls */}
      <div className="pt-16 pb-6 px-6 md:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-serif text-[#3A443C]">Villas in {regionName}</h2>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-semibold">{filteredVillas.length}</span>{' '}
                {filteredVillas.length === 1 ? 'villa' : 'villas'} available
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter Button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all',
                  'border hover:border-[#3A443C]',
                  hasSelectedFacilities
                    ? 'bg-[#3A443C] text-white border-[#3A443C]'
                    : 'bg-white text-[#3A443C] border-gray-300 hover:bg-gray-50'
                )}
              >
                <SlidersHorizontal size={18} />
                <span>Filters</span>
                {hasSelectedFacilities && (
                  <span className="ml-1 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {selectedFacilities.length}
                  </span>
                )}
              </button>

              {/* Map View Toggle */}
              <button
                onClick={toggleMapView}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all',
                  'border hover:border-[#3A443C]',
                  isMapView
                    ? 'bg-[#3A443C] text-white border-[#3A443C]'
                    : 'bg-white text-[#3A443C] border-gray-300 hover:bg-gray-50'
                )}
              >
                {isMapView ? (
                  <>
                    <LayoutGrid size={18} />
                    <span>Grid View</span>
                  </>
                ) : (
                  <>
                    <Map size={18} />
                    <span>Map View</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-50 transition-opacity duration-300"
            onClick={() => setIsFilterOpen(false)}
          />

          {/* Panel */}
          <div
            className={cn(
              'fixed z-50 bg-white shadow-2xl transition-transform duration-300 ease-out',
              'inset-0 md:inset-auto',
              'md:right-0 md:top-0 md:bottom-0 md:w-[420px] md:max-w-full'
            )}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-serif text-xl text-[#3A443C]">Filters</h2>
                {hasSelectedFacilities && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {selectedFacilities.length} {selectedFacilities.length === 1 ? 'filter' : 'filters'} selected
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close filters"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Filter Options */}
            <div className="px-6 py-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
              <div className="space-y-3">
                {FILTER_FACILITIES.map((facility) => {
                  const isSelected = selectedFacilities.includes(facility.sfName);
                  const count = facilityCount[facility.sfName] || 0;
                  const canSelect = count > 0 && (isSelected || wouldHaveResults(facility.sfName));
                  const isDisabled = count === 0;

                  return (
                    <button
                      key={facility.key}
                      onClick={() => canSelect && toggleFacility(facility.sfName)}
                      disabled={isDisabled}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-4 rounded-lg border-2 transition-all duration-200',
                        isSelected
                          ? 'border-[#3A443C] bg-[#3A443C]/5'
                          : canSelect
                            ? 'border-gray-200 hover:border-[#3A443C]/50 hover:bg-gray-50'
                            : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <div
                          className={cn(
                            'w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all',
                            isSelected
                              ? 'bg-[#3A443C] border-[#3A443C]'
                              : 'border-gray-300 bg-white'
                          )}
                        >
                          {isSelected && <Check size={16} className="text-white" strokeWidth={3} />}
                        </div>

                        {/* Label */}
                        <span
                          className={cn(
                            'font-medium',
                            isSelected ? 'text-[#3A443C]' : 'text-gray-700'
                          )}
                        >
                          {facility.label}
                        </span>
                      </div>

                      {/* Count Badge */}
                      <span
                        className={cn(
                          'text-sm px-2.5 py-1 rounded-full',
                          isSelected
                            ? 'bg-[#3A443C] text-white'
                            : count > 0
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-gray-100 text-gray-400'
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
              {hasSelectedFacilities && (
                <button
                  onClick={clearFacilities}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-sm hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsFilterOpen(false)}
                className={cn(
                  'flex-1 px-4 py-3 bg-[#3A443C] text-white font-medium rounded-sm hover:bg-[#3A443C]/90 transition-colors',
                  !hasSelectedFacilities && 'flex-[2]'
                )}
              >
                {hasSelectedFacilities
                  ? `Show ${filteredVillas.length} ${filteredVillas.length === 1 ? 'Villa' : 'Villas'}`
                  : 'Done'
                }
              </button>
            </div>
          </div>
        </>
      )}

      {/* Results Section */}
      {isMapView && !isMobile ? (
        // Desktop Map View - 50/50 Split
        <div className="flex h-[600px] border-t border-gray-200">
          {/* Left: Villa List */}
          <div
            ref={listRef}
            className="w-1/2 overflow-y-auto border-r border-gray-200 bg-white"
          >
            <div className="p-4">
              {filteredVillas.length > 0 ? (
                <div className="space-y-4">
                  {filteredVillas.map((villa) => (
                    <VillaCardRow
                      key={villa.id}
                      villa={villa}
                      isHighlighted={hoveredVillaId === villa.id || selectedVillaId === villa.id}
                      onHover={handleListHover}
                      shouldScrollIntoView={highlightFromMap}
                      scrollContainerRef={listRef}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No villas found matching your filters.</p>
                  <button
                    onClick={clearFacilities}
                    className="mt-4 text-[#3A443C] underline text-sm"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Map */}
          <div className="w-1/2 h-full">
            <MapView
              villas={filteredVillas}
              hoveredVillaId={hoveredVillaId}
              selectedVillaId={selectedVillaId}
              onMarkerHover={handleMapHover}
              onMarkerClick={handleMarkerClick}
              isMobile={false}
            />
          </div>
        </div>
      ) : isMapView && isMobile ? (
        // Mobile Map View - Full Screen Overlay
        <div className="fixed inset-0 z-50 bg-white">
          {/* Mobile Map Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-serif text-lg text-[#3A443C]">Map View</p>
              <p className="text-xs text-gray-500">
                {filteredVillas.length} {filteredVillas.length === 1 ? 'villa' : 'villas'}
              </p>
            </div>
            <button
              onClick={closeMobileMap}
              className="flex items-center gap-2 px-4 py-2 bg-[#3A443C] text-white text-sm"
            >
              <LayoutGrid size={16} />
              <span>List</span>
            </button>
          </div>

          {/* Full Screen Map */}
          <div className="h-full pt-16">
            <MapView
              villas={filteredVillas}
              hoveredVillaId={hoveredVillaId}
              selectedVillaId={selectedVillaId}
              onMarkerHover={handleMapHover}
              onMarkerClick={handleMarkerClick}
              isMobile={true}
            />
          </div>
        </div>
      ) : (
        // Standard Grid View
        <div className="px-6 md:px-20 pb-16">
          <div className="max-w-6xl mx-auto">
            {filteredVillas.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVillas.map((villa) => (
                  <VillaCard
                    key={villa.id}
                    id={villa.id}
                    slug={villa.slug}
                    title={villa.title}
                    region={villa.region}
                    town={villa.town}
                    heroImageUrl={villa.heroImageUrl}
                    pricePerWeek={villa.pricePerWeek}
                    maxGuests={villa.maxGuests}
                    bedrooms={villa.bedrooms}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No villas found matching your filters.</p>
                <button
                  onClick={clearFacilities}
                  className="mt-4 text-[#3A443C] underline text-sm"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
