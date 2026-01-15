/**
 * Destination Tabs - Client Component
 * Grid-based destination selector matching location page styling
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';

// Destination content from CMS
export interface DestinationContent {
  title: string;
  slug: string;
  imageUrl?: string;
  introduction?: string;
  description?: string;
}

interface DestinationTabsClientProps {
  destinations?: Record<string, DestinationContent>;
  sectionTitle?: string;
}

// Default fallback content for destinations
const defaultDestinations: Record<string, DestinationContent> = {
  'Spain': {
    title: 'Spain',
    slug: 'spain',
    imageUrl: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=600&h=400&fit=crop',
    introduction: 'Discover our handpicked selection of luxury villas in Spain.',
  },
  'France': {
    title: 'France',
    slug: 'france',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop',
    introduction: 'Experience the romance of France with our carefully selected villas.',
  },
  'Italy': {
    title: 'Italy',
    slug: 'italy',
    imageUrl: 'https://images.unsplash.com/photo-1534445867742-43195f401b6c?w=600&h=400&fit=crop',
    introduction: 'La dolce vita awaits in our handpicked Italian villas.',
  },
  'Greece': {
    title: 'Greece',
    slug: 'greece',
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&h=400&fit=crop',
    introduction: 'Discover the magic of Greece with our island villas.',
  },
  'Balearic Islands': {
    title: 'Balearics',
    slug: 'balearics',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    introduction: 'Experience Mallorca, Menorca, Ibiza, and Formentera.',
  },
  'Turkey': {
    title: 'Turkey',
    slug: 'turkey',
    imageUrl: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600&h=400&fit=crop',
    introduction: 'Where East meets West on the stunning Aegean coast.',
  },
  'Croatia': {
    title: 'Croatia',
    slug: 'croatia',
    imageUrl: 'https://images.unsplash.com/photo-1555990538-1e7a0e3e8b77?w=600&h=400&fit=crop',
    introduction: 'Crystal-clear Adriatic waters and historic towns.',
  },
  'Portugal': {
    title: 'Portugal',
    slug: 'portugal',
    imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&h=400&fit=crop',
    introduction: 'Discover the Algarve\'s golden beaches.',
  },
};

const destinationKeys = ['Spain', 'France', 'Italy', 'Greece', 'Balearic Islands', 'Turkey', 'Croatia', 'Portugal'];

export function DestinationTabsClient({ destinations, sectionTitle }: DestinationTabsClientProps) {
  // Merge CMS data with defaults
  const getDestinationContent = (key: string): DestinationContent => {
    const cmsContent = destinations?.[key];
    const defaultContent = defaultDestinations[key] || defaultDestinations['Spain'];

    return {
      title: cmsContent?.title || defaultContent.title,
      slug: cmsContent?.slug || defaultContent.slug,
      imageUrl: cmsContent?.imageUrl || defaultContent.imageUrl,
      introduction: cmsContent?.introduction || defaultContent.introduction,
    };
  };

  return (
    <section className="bg-[#F3F0E9] py-16 px-6 md:px-20">
      <div className="text-center mb-12">
        <h4 className="text-lg font-serif text-gray-600 mb-2">Our Destinations</h4>
        <h2 className="text-3xl md:text-4xl font-serif text-[#3A443C] italic">
          {sectionTitle || 'Where do you want to go?'}
        </h2>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {destinationKeys.map((key) => {
          const dest = getDestinationContent(key);
          const displayTitle = key === 'Balearic Islands' ? 'Balearics' : dest.title;

          return (
            <Link
              key={key}
              href={`/villas-in-${dest.slug}`}
              className="relative h-48 md:h-56 group cursor-pointer overflow-hidden block"
            >
              <Image
                src={dest.imageUrl || defaultDestinations['Spain'].imageUrl!}
                alt={displayTitle}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center p-4">
                <h3 className="text-white text-xl md:text-2xl font-serif text-center drop-shadow-md">
                  {displayTitle}
                </h3>
                <span className="text-white/80 text-[10px] uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Villas
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
