/**
 * CATEGORY PAGE
 * Handles filtered villa searches with SEO-friendly URLs
 *
 * Routes:
 * - /family-friendly-villas → all family-friendly villas
 * - /spain/family-friendly-villas → family-friendly villas in Spain
 * - /spain/andalucia/family-friendly-villas → family-friendly villas in Andalucia
 */

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getAllVillas } from '@/lib/crm-client';
import { VILLA_CATEGORIES, CATEGORY_SLUGS, getVillaCategory, isVillaCategory } from '@/lib/villa-categories';
import { COUNTRY_REGIONS, CountryConfig, CountryRegion } from '@/lib/country-regions-config';
import { VillaCard } from '@/components/ui/villa-card';
import { MockVilla } from '@/lib/mock-db';
import Link from 'next/link';

interface PageParams {
  path: string[];
}

interface PageProps {
  params: Promise<PageParams>;
}

// Parse the path to extract country, region, and category
function parsePath(path: string[]): { country?: string; region?: string; category: string } | null {
  if (path.length === 0) return null;

  // Last segment should be the category
  const categorySlug = path[path.length - 1];
  if (!isVillaCategory(categorySlug)) return null;

  if (path.length === 1) {
    // Just category: /family-friendly-villas
    return { category: categorySlug };
  } else if (path.length === 2) {
    // Country + category: /spain/family-friendly-villas
    return { country: path[0], category: categorySlug };
  } else if (path.length === 3) {
    // Country + region + category: /spain/andalucia/family-friendly-villas
    return { country: path[0], region: path[1], category: categorySlug };
  }

  return null;
}

// Find location config by slug
function findLocationConfig(countrySlug?: string, regionSlug?: string): { country?: CountryConfig; region?: CountryRegion } {
  if (!countrySlug) return {};

  const country = COUNTRY_REGIONS[countrySlug];
  if (!country) return {};

  if (!regionSlug) return { country };

  const region = country.regions.find(r => r.id === regionSlug);
  return { country, region };
}

// Generate static params for all category combinations
export async function generateStaticParams(): Promise<PageParams[]> {
  const params: PageParams[] = [];

  // All categories at top level
  for (const slug of CATEGORY_SLUGS) {
    params.push({ path: [slug] });
  }

  // All countries + categories
  for (const country of Object.values(COUNTRY_REGIONS)) {
    for (const slug of CATEGORY_SLUGS) {
      params.push({ path: [country.slug, slug] });
    }

    // All regions + categories
    for (const region of country.regions) {
      for (const slug of CATEGORY_SLUGS) {
        params.push({ path: [country.slug, region.id, slug] });
      }
    }
  }

  return params;
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { path } = await params;
  const parsed = parsePath(path);
  if (!parsed) return { title: 'Not Found' };

  const category = getVillaCategory(parsed.category);
  if (!category) return { title: 'Not Found' };

  const { country, region } = findLocationConfig(parsed.country, parsed.region);

  let title = category.title;
  let description = category.description;

  if (region && country) {
    title = `${category.title} in ${region.label}, ${country.label}`;
    description = `Discover ${category.title.toLowerCase()} in ${region.label}, ${country.label}. ${category.description}`;
  } else if (country) {
    title = `${category.title} in ${country.label}`;
    description = `Discover ${category.title.toLowerCase()} in ${country.label}. ${category.description}`;
  }

  return {
    title: `${title} | Vintage Travel`,
    description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { path } = await params;
  const parsed = parsePath(path);

  if (!parsed) {
    notFound();
  }

  const category = getVillaCategory(parsed.category);
  if (!category) {
    notFound();
  }

  const { country, region } = findLocationConfig(parsed.country, parsed.region);

  // If country/region specified but not found, 404
  if (parsed.country && !country) {
    notFound();
  }
  if (parsed.region && !region) {
    notFound();
  }

  // Fetch all villas
  const allVillas = await getAllVillas();

  // Apply location filters
  let filteredVillas: MockVilla[] = allVillas;

  if (region) {
    // Filter by region
    const regionLabel = region.label.toLowerCase();
    filteredVillas = filteredVillas.filter(villa => {
      const villaRegion = (villa.region || '').toLowerCase();
      return villaRegion.includes(regionLabel) || regionLabel.includes(villaRegion);
    });
  } else if (country) {
    // Filter by country
    const countryLabel = country.label.toLowerCase();
    filteredVillas = filteredVillas.filter(villa => {
      const villaCountry = (villa.country || '').toLowerCase();
      return villaCountry === countryLabel || villaCountry.includes(countryLabel);
    });
  }

  // Apply category filters
  const { facilities, minSleeps, maxSleeps } = category.filters;

  if (facilities && facilities.length > 0) {
    filteredVillas = filteredVillas.filter(villa => {
      const villaFacilities = (villa.facilities || []).map(f => f.toLowerCase().trim());
      return facilities.some(reqFacility =>
        villaFacilities.some(vf => vf === reqFacility.toLowerCase().trim())
      );
    });
  }

  if (minSleeps) {
    filteredVillas = filteredVillas.filter(villa => (villa.maxGuests || 0) >= minSleeps);
  }

  if (maxSleeps) {
    filteredVillas = filteredVillas.filter(villa => (villa.maxGuests || 0) <= maxSleeps);
  }

  // Build page title
  let pageTitle = category.title;
  let locationName = '';

  if (region && country) {
    locationName = `${region.label}, ${country.label}`;
    pageTitle = `${category.title} in ${region.label}`;
  } else if (country) {
    locationName = country.label;
    pageTitle = `${category.title} in ${country.label}`;
  }

  // Build breadcrumb links
  const breadcrumbs: { label: string; href: string }[] = [
    { label: 'Home', href: '/' },
  ];
  if (country) {
    breadcrumbs.push({ label: country.label, href: `/${country.slug}` });
  }
  if (region && country) {
    breadcrumbs.push({ label: region.label, href: `/${country.slug}/${region.id}` });
  }
  breadcrumbs.push({ label: category.title, href: '#' });

  return (
    <main className="min-h-screen bg-[#F3F0E9]">
      {/* Header */}
      <div className="pt-24 pb-8 px-6 md:px-20">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="text-sm text-gray-500 mb-4">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.href}>
                {index > 0 && <span className="mx-2">/</span>}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-[#3A443C]">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-[#3A443C] transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <h1 className="text-3xl md:text-4xl font-serif text-[#3A443C] mb-2">
            {pageTitle}
          </h1>
          <p className="text-gray-600">
            {category.description}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            <span className="font-semibold">{filteredVillas.length}</span>{' '}
            {filteredVillas.length === 1 ? 'villa' : 'villas'} found
          </p>
        </div>
      </div>

      {/* Results Grid */}
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
              <p className="text-gray-600 mb-4">No villas found matching this criteria.</p>
              <Link
                href="/search"
                className="inline-block bg-[#3A443C] text-white px-6 py-3 text-sm uppercase tracking-wider hover:bg-[#3A443C]/90 transition-colors"
              >
                View All Villas
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
