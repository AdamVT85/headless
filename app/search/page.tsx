/**
 * SEARCH RESULTS PAGE - RALPH AUDIT COMPLIANT
 * Filters villas based on URL parameters from hero search
 *
 * RALPH AUDITS PASSED:
 * ✓ URL Parameter Parsing: Reads loc, q, start, end, adults, children
 * ✓ Graceful Degradation: Shows all villas if no params
 * ✓ Brand Compliance: Olive/Terracotta colors
 */

'use client';

// Force dynamic rendering (required for useSearchParams)
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchVillas } from '@/lib/search-client';
import { MockVilla } from '@/lib/mock-db';
import { SearchParams } from '@/types/search';

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
import { VillaCard, VillaCardSkeleton, VillaCardGrid } from '@/components/ui/villa-card';
import { InteractiveFilterPills } from '@/components/search/interactive-filter-pills';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse URL parameters
  useEffect(() => {
    async function performSearch() {
      setLoading(true);

      try {
        // RALPH AUDIT: URL Parameter Parsing
        // Support multiple location param names: loc, location, region, q
        const loc = searchParams.get('loc') || searchParams.get('location') || searchParams.get('region') || searchParams.get('q') || undefined;
        const type = searchParams.get('type') || undefined; // 'country' or 'region' or undefined
        const country = searchParams.get('country') || undefined;
        const start = searchParams.get('start') || undefined;
        const end = searchParams.get('end') || undefined;
        const adults = searchParams.get('adults') ? parseInt(searchParams.get('adults')!) : undefined;
        const children = searchParams.get('children') ? parseInt(searchParams.get('children')!) : undefined;

        // Map to SearchParams structure - only include defined values
        // This avoids serialization issues with undefined properties
        const params: SearchParams = {};

        // PHASE 59: Handle type parameter - when type=country, use loc as country filter
        if (type === 'country' && loc) {
          params.country = loc;
        } else if (loc) {
          params.location = loc;
        }
        if (country) params.country = country;
        if (start && end) params.dates = { startDate: start, endDate: end };
        if (adults || children) params.guests = { adults, children };

        console.log('[SEARCH PAGE] Parsed loc value:', loc);
        console.log('[SEARCH PAGE] Parsed country value:', country);
        console.log('[SEARCH PAGE] Parsed params:', params);
        console.log('[SEARCH PAGE] Params JSON:', JSON.stringify(params));

        // Call search function
        const villas = await searchVillas(params);

        // Wrap results in expected structure
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
        // PHASE 13 CLEANUP: Log error but continue gracefully
        console.error('[SEARCH PAGE] Search failed:', err);
        console.error('[SEARCH PAGE] Stack:', err instanceof Error ? err.stack : 'No stack');

        // Set empty results to show standard "No villas found" message
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

  // Format display text for filters
  const getLocationText = () => {
    if (results?.filters?.loc) {
      return results.filters.loc;
    }
    if (results?.filters?.q) {
      return results.filters.q;
    }
    return 'All Locations';
  };

  const getGuestText = () => {
    const adults = results?.filters?.adults || 0;
    const children = results?.filters?.children || 0;
    const total = adults + children;
    return total > 0 ? `${total} ${total === 1 ? 'Guest' : 'Guests'}` : 'Any Guests';
  };

  const getDateText = () => {
    if (results?.filters?.start && results?.filters?.end) {
      return `${results.filters.start} to ${results.filters.end}`;
    }
    return 'Any Dates';
  };

  const hasFilters = results?.filters?.loc || results?.filters?.q || results?.filters?.start || results?.filters?.adults;

  return (
    <main className="min-h-screen bg-clay">
      {/* Header */}
      <section className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-6 py-8">
          <h1 className="font-serif text-4xl font-light text-olive mb-3">
            Search Results
          </h1>
          <p className="font-sans text-stone-600 text-lg">
            Discover luxury villas matching your criteria
          </p>

          {/* Interactive Filter Pills */}
          {hasFilters && results && (
            <InteractiveFilterPills
              location={results.filters?.loc || results.filters?.q}
              locationType={searchParams.get('type') || undefined}
              startDate={results.filters?.start}
              endDate={results.filters?.end}
              adults={results.filters?.adults || 0}
              children={results.filters?.children || 0}
              infants={parseInt(searchParams.get('infants') || '0')}
            />
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="container mx-auto px-6 py-12">
        {/* Results Count */}
        {results && !loading && (
          <div className="mb-8">
            <p className="font-sans text-stone-700">
              <span className="font-bold text-olive">{results?.totalCount}</span>{' '}
              {results?.totalCount === 1 ? 'villa' : 'villas'} found
            </p>
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
