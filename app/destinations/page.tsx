/**
 * LOCATIONS PAGE
 * Displays all destinations in a visual grid
 * Matches Adobe XD Screen 2
 */

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { client } from '@/lib/sanity.client';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Destinations | Vintage Travel',
  description: 'Explore our luxury villa destinations across the Mediterranean',
};

interface Destination {
  _id: string;
  name: string;
  slug: { current: string };
  heroImage: {
    asset: {
      _ref: string;
      url: string;
    };
    alt: string;
  };
  description?: string;
  order?: number;
}

async function getDestinations(): Promise<Destination[]> {
  const query = `*[_type == "destination"] | order(order asc, name asc) {
    _id,
    name,
    slug,
    "heroImage": {
      "asset": heroImage.asset->,
      "alt": heroImage.alt
    },
    description,
    order
  }`;

  try {
    const destinations = await client.fetch<Destination[]>(query);
    return destinations;
  } catch (error) {
    console.error('[Locations] Failed to fetch destinations:', error);
    return [];
  }
}

export default async function LocationsPage() {
  const destinations = await getDestinations();

  return (
    <main className="min-h-screen bg-clay">
      {/* Hero Section */}
      <section className="relative bg-olive text-white py-24">
        <div className="container mx-auto px-6">
          <h1 className="font-serif font-light text-5xl md:text-6xl lg:text-7xl text-center max-w-4xl mx-auto">
            Discover the Mediterranean
          </h1>
          <p className="text-center text-lg md:text-xl text-white/90 mt-6 max-w-2xl mx-auto">
            Explore our handpicked destinations across the sun-drenched coasts of southern Europe
          </p>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="container mx-auto px-6 py-16">
        {destinations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-600 text-lg">
              No destinations available at this time.
            </p>
            <p className="text-sm text-stone-500 mt-2">
              Configure your Sanity CMS to add destinations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((destination) => (
              <DestinationCard key={destination._id} destination={destination} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

/**
 * Destination Card Component
 * 3:2 aspect ratio, brand styling
 */
function DestinationCard({ destination }: { destination: Destination }) {
  const imageUrl = destination.heroImage?.asset?.url || '/placeholder-villa.svg';

  return (
    <Link
      href={`/destinations/${destination.slug.current}`}
      className={cn(
        'group block overflow-hidden rounded-sm bg-white shadow-sm',
        'transition-all duration-300 hover:shadow-xl',
        'border border-stone-200 hover:border-terracotta-300'
      )}
    >
      {/* Image - 3:2 Aspect Ratio */}
      <div className="relative aspect-[3/2] overflow-hidden bg-stone-100">
        <Image
          src={imageUrl}
          alt={destination.heroImage?.alt || destination.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-olive-900/0 group-hover:bg-olive-900/20 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="p-6">
        <h2 className="font-serif text-2xl font-light text-olive group-hover:text-terracotta transition-colors">
          {destination.name}
        </h2>
        {destination.description && (
          <p className="text-stone-600 mt-2 line-clamp-2">
            {destination.description}
          </p>
        )}
        <div className="mt-4 flex items-center text-terracotta group-hover:text-olive transition-colors">
          <span className="text-sm font-semibold">Explore villas</span>
          <svg
            className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
