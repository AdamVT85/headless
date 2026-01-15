/**
 * AREA/REGION PAGE
 * Displays region details with filtered villa grid
 * Matches Adobe XD Screen 3
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { client } from '@/lib/sanity.client';
import { PortableText } from '@portabletext/react';
import { getAllVillasFromSource } from '@/lib/villa-data-source';
import { VillaCard, VillaCardGrid } from '@/components/ui/villa-card';

interface RegionPageProps {
  params: Promise<{
    slug: string;
    regionSlug: string;
  }>;
}

interface Region {
  _id: string;
  name: string;
  slug: { current: string };
  destination: {
    name: string;
    slug: { current: string };
  };
  heroImage: {
    asset: {
      url: string;
    };
    alt: string;
  };
  description?: any; // PortableText
  highlights?: string[];
}

async function getRegion(regionSlug: string): Promise<Region | null> {
  const query = `*[_type == "region" && slug.current == $regionSlug][0] {
    _id,
    name,
    slug,
    "destination": destination-> {
      name,
      slug
    },
    "heroImage": {
      "asset": heroImage.asset->,
      "alt": heroImage.alt
    },
    description,
    highlights
  }`;

  try {
    const region = await client.fetch<Region | null>(query, { regionSlug });
    return region;
  } catch (error) {
    console.error('[Region] Failed to fetch region:', error);
    return null;
  }
}

export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
  const { regionSlug } = await params;
  const region = await getRegion(regionSlug);

  if (!region) {
    return {
      title: 'Region Not Found | Vintage Travel',
    };
  }

  return {
    title: `${region.name} Villas | Vintage Travel`,
    description: `Discover luxury villas in ${region.name}, ${region.destination.name}`,
  };
}

export default async function RegionPage({ params }: RegionPageProps) {
  const { regionSlug } = await params;
  const region = await getRegion(regionSlug);

  if (!region) {
    notFound();
  }

  // Fetch all villas and filter by region
  const allVillas = await getAllVillasFromSource();
  const regionVillas = allVillas.filter(
    (villa) => villa.region.toLowerCase() === region.name.toLowerCase()
  );

  const imageUrl = region.heroImage?.asset?.url || '/placeholder-villa.svg';

  return (
    <main className="min-h-screen bg-clay">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Link href="/" className="hover:text-terracotta transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/destinations"
              className="hover:text-terracotta transition-colors"
            >
              Destinations
            </Link>
            <span>/</span>
            <Link
              href={`/destinations/${region.destination.slug.current}`}
              className="hover:text-terracotta transition-colors"
            >
              {region.destination.name}
            </Link>
            <span>/</span>
            <span className="text-olive">{region.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px]">
        <Image
          src={imageUrl}
          alt={region.heroImage?.alt || region.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-olive-900/60 via-olive-900/40 to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-6 text-center text-white">
            <h1 className="font-serif font-light text-5xl md:text-6xl lg:text-7xl mb-4">
              {region.name}
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              {region.destination.name}
            </p>
          </div>
        </div>
      </section>

      {/* Region Description */}
      {region.description && (
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg prose-stone max-w-none">
              <PortableText
                value={region.description}
                components={{
                  block: {
                    h2: ({ children }) => (
                      <h2 className="font-serif text-3xl font-medium text-olive mt-8 mb-4">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="font-serif text-2xl font-medium text-olive mt-6 mb-3">
                        {children}
                      </h3>
                    ),
                    normal: ({ children }) => (
                      <p className="text-stone-700 leading-relaxed mb-4">
                        {children}
                      </p>
                    ),
                  },
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Highlights */}
      {region.highlights && region.highlights.length > 0 && (
        <section className="container mx-auto px-6 pb-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-2xl font-medium text-olive mb-6">
              Highlights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {region.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-palm text-lg">✓</span>
                  <span className="text-stone-700">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Villas in Region */}
      <section className="container mx-auto px-6 py-12">
        <h2 className="font-serif text-4xl font-light text-olive mb-8 text-center">
          Villas in {region.name}
        </h2>

        {regionVillas.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-600 text-lg">
              No villas available in this region at this time.
            </p>
          </div>
        ) : (
          <>
            <p className="text-center text-stone-600 mb-8">
              {regionVillas.length} {regionVillas.length === 1 ? 'villa' : 'villas'} available
            </p>
            <VillaCardGrid>
              {regionVillas.map((villa) => (
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
          </>
        )}
      </section>

      {/* Back to Destinations */}
      <section className="container mx-auto px-6 pb-12">
        <div className="text-center">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 text-terracotta hover:text-olive transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="font-semibold">Back to all destinations</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
