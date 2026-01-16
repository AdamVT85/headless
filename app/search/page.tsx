/**
 * SEARCH RESULTS PAGE - WITH MAP VIEW
 * Filters villas based on URL parameters from hero search
 * Features: Grid/List toggle, Map view with 50/50 split, marker interactions
 */

'use client';

// Force dynamic rendering (required for useSearchParams)
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import { Map, LayoutGrid } from 'lucide-react';
import { searchVillas } from '@/lib/search-client';
import { MockVilla } from '@/lib/mock-db';
import { SearchParams } from '@/types/search';
import { VillaCard, VillaCardSkeleton, VillaCardGrid } from '@/components/ui/villa-card';
import { VillaCardRow, VillaCardRowSkeleton } from '@/components/search/villa-card-row';
import { InteractiveFilterPills } from '@/components/search/interactive-filter-pills';
import { FacilityFilter } from '@/components/search/facility-filter';
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

interface SearchResult {
  villas: MockVilla[];
  totalCount: number;
  filters: {
    loc?: string;
    type?: string;
    q?: string;
    start?: string;
    end?: string;
    adults?: number;
    children?: number;
  };
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
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

  // Parse URL parameters
  useEffect(() => {
    async function performSearch() {
      setLoading(true);

      try {
        const loc = searchParams.get('loc') || searchParams.get('location') || searchParams.get('region') || searchParams.get('q') || undefined;
        const type = searchParams.get('type') || undefined;
        const country = searchParams.get('country') || undefined;
        const start = searchParams.get('start') || undefined;
        const end = searchParams.get('end') || undefined;
        const adults = searchParams.get('adults') ? parseInt(searchParams.get('adults')!) : undefined;
        const children = searchParams.get('children') ? parseInt(searchParams.get('children')!) : undefined;
        const facilities = searchParams.get('facilities')?.split(',').filter(Boolean) || undefined;

        const params: SearchParams = {};

        if (type === 'country' && loc) {
          params.country = loc;
        } else if (loc) {
          params.location = loc;
        }
        if (country) params.country = country;
        if (start && end) params.dates = { startDate: start, endDate: end };
        if (adults || children) params.guests = { adults, children };
        if (facilities && facilities.length > 0) params.facilities = facilities;

        const villas = await searchVillas(params);

        setResults({
          villas,
          totalCount: villas.length,
          filters: {
            loc,
            q: searchParams.get('q') || undefined,
            start,
            end,
            adults,
            children,
          },
        });
      } catch (err) {
        console.error('[SEARCH PAGE] Search failed:', err);

        const loc = searchParams.get('loc') || searchParams.get('location') || searchParams.get('region') || searchParams.get('q') || undefined;
        const start = searchParams.get('start') || undefined;
        const end = searchParams.get('end') || undefined;
        const adults = searchParams.get('adults') ? parseInt(searchParams.get('adults')!) : undefined;
        const children = searchParams.get('children') ? parseInt(searchParams.get('children')!) : undefined;

        setResults({
          villas: [],
          totalCount: 0,
          filters: {
            loc,
            q: searchParams.get('q') || undefined,
            start,
            end,
            adults,
            children,
          },
        });
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [searchParams]);

  // Handle hover from list - update map and clear any map selection
  const handleListHover = useCallback((villaId: string | null) => {
    setHighlightFromMap(false);
    setSelectedVillaId(null); // Clear locked selection when user interacts with list
    setHoveredVillaId(villaId);
  }, []);

  // Handle hover from map - only update if no locked selection
  const handleMapHover = useCallback((villaId: string | null) => {
    // If there's a locked selection, don't change highlight on hover
    if (selectedVillaId && villaId === null) return;
    setHighlightFromMap(true);
    setHoveredVillaId(villaId);
  }, [selectedVillaId]);

  // Handle marker click on desktop - lock selection to this villa
  const handleMarkerClick = useCallback((villaId: string) => {
    setHighlightFromMap(true);
    setSelectedVillaId(villaId);
    setHoveredVillaId(villaId);
  }, []);

  // Toggle map view
  const toggleMapView = () => {
    setIsMapView(!isMapView);
  };

  // Close mobile map
  const closeMobileMap = () => {
    setIsMapView(false);
  };

  return (
    <main className="min-h-screen bg-clay">
      {/* Header */}
      <section className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl font-light text-olive mb-3">
                Search Results
              </h1>
              <p className="font-sans text-stone-600 text-lg">
                Discover luxury villas matching your criteria
              </p>
            </div>
          </div>

          {/* Filter Pills and Map Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-6">
            <div className="flex flex-wrap items-start gap-3">
              <InteractiveFilterPills />
            </div>

            {/* Map View Toggle */}
            <button
              onClick={toggleMapView}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-all',
                'border border-stone-300 hover:border-olive',
                isMapView
                  ? 'bg-olive text-white border-olive'
                  : 'bg-white text-olive hover:bg-olive-50'
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
      </section>

      {/* Results Section */}
      {isMapView && !isMobile ? (
        // Desktop Map View - 50/50 Split
        <section className="flex h-[calc(100vh-220px)]">
          {/* Left: Villa List */}
          <div
            ref={listRef}
            className="w-1/2 overflow-y-auto border-r border-stone-200 bg-white"
          >
            <div className="p-4">
              {/* Results Count and Filter */}
              {results && !loading && (
                <div className="mb-4 pb-4 border-b border-stone-100 flex items-center justify-between">
                  <p className="font-sans text-stone-700">
                    <span className="font-bold text-olive">{results?.totalCount}</span>{' '}
                    {results?.totalCount === 1 ? 'villa' : 'villas'} found
                  </p>
                  <FacilityFilter villas={results.villas} />
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <VillaCardRowSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Villa List */}
              {!loading && results && results.villas?.length > 0 && (
                <div className="space-y-4">
                  {results.villas.map((villa) => (
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
              )}

              {/* No Results */}
              {!loading && results && results.villas?.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-stone-600">No villas found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Map */}
          <div className="w-1/2 h-full">
            <MapView
              villas={results?.villas || []}
              hoveredVillaId={hoveredVillaId}
              selectedVillaId={selectedVillaId}
              onMarkerHover={handleMapHover}
              onMarkerClick={handleMarkerClick}
              isMobile={false}
            />
          </div>
        </section>
      ) : isMapView && isMobile ? (
        // Mobile Map View - Full Screen Overlay
        <div className="fixed inset-0 z-50 bg-white">
          {/* Mobile Map Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-serif text-lg text-olive">Map View</p>
              {results && (
                <p className="text-xs text-stone-500">
                  {results.totalCount} {results.totalCount === 1 ? 'villa' : 'villas'}
                </p>
              )}
            </div>
            <button
              onClick={closeMobileMap}
              className="flex items-center gap-2 px-4 py-2 bg-olive text-white rounded-sm text-sm"
            >
              <LayoutGrid size={16} />
              <span>List</span>
            </button>
          </div>

          {/* Full Screen Map */}
          <div className="h-full pt-16">
            <MapView
              villas={results?.villas || []}
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
        <section className="container mx-auto px-6 py-12">
          {/* Results Count and Filter */}
          {results && !loading && (
            <div className="mb-8 flex items-center justify-between">
              <p className="font-sans text-stone-700">
                <span className="font-bold text-olive">{results?.totalCount}</span>{' '}
                {results?.totalCount === 1 ? 'villa' : 'villas'} found
              </p>
              <FacilityFilter villas={results.villas} />
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <VillaCardGrid>
              {Array.from({ length: 6 }).map((_, i) => (
                <VillaCardSkeleton key={i} />
              ))}
            </VillaCardGrid>
          )}

          {/* Results Grid */}
          {!loading && results && (
            <>
              {results.villas?.length > 0 ? (
                <VillaCardGrid>
                  {results.villas?.map((villa) => (
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
                </VillaCardGrid>
              ) : (
                <div className="bg-stone-100 border border-stone-200 rounded-lg p-12 text-center">
                  <h2 className="font-serif text-2xl font-light text-olive mb-3">
                    No villas found
                  </h2>
                  <p className="text-stone-600 mb-6">
                    We couldn't find any villas matching your criteria. Try adjusting your search parameters.
                  </p>
                  <div className="space-y-2 text-sm text-stone-500">
                    <p>Suggestions:</p>
                    <ul className="list-disc list-inside">
                      <li>Try searching for a different location</li>
                      <li>Adjust your guest count or date range</li>
                      <li>Browse all available villas on the homepage</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </main>
  );
}

// Wrapper component with Suspense boundary
export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-clay">
        <section className="bg-white border-b border-stone-200">
          <div className="container mx-auto px-6 py-8">
            <h1 className="font-serif text-4xl font-light text-olive mb-3">
              Search Results
            </h1>
            <p className="font-sans text-stone-600 text-lg">
              Loading...
            </p>
          </div>
        </section>
      </main>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
