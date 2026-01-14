/**
 * Destination Tabs - Client Component
 * Interactive tabbed destination selector with CMS content
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Helper to convert destination name to URL slug (e.g., "Spain" -> "spain")
const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

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
    imageUrl: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&h=800&fit=crop',
    introduction: 'Discover our handpicked selection of luxury villas in Spain, carefully chosen for their authentic character and stunning locations.',
    description: 'From hidden countryside retreats to spectacular coastal properties, each villa offers the perfect blend of comfort and local charm.',
  },
  'France': {
    title: 'France',
    slug: 'france',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=800&fit=crop',
    introduction: 'Experience the romance of France with our collection of carefully selected villas across Provence, the Côte d\'Azur, and beyond.',
    description: 'From lavender fields to Mediterranean shores, discover authentic French living at its finest.',
  },
  'Italy': {
    title: 'Italy',
    slug: 'italy',
    imageUrl: 'https://images.unsplash.com/photo-1534445867742-43195f401b6c?w=800&h=800&fit=crop',
    introduction: 'La dolce vita awaits in our handpicked Italian villas, from Tuscan hilltops to the stunning Amalfi Coast.',
    description: 'Experience authentic Italian culture, cuisine, and breathtaking scenery in properties that capture the essence of Italy.',
  },
  'Greece': {
    title: 'Greece',
    slug: 'greece',
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&h=800&fit=crop',
    introduction: 'Discover the magic of Greece with our collection of island villas and mainland retreats.',
    description: 'From the iconic whitewashed villages of the Cyclades to the lush greenery of Corfu, find your perfect Greek escape.',
  },
  'Balearic Islands': {
    title: 'Balearic Islands',
    slug: 'balearic-islands',
    imageUrl: 'https://images.unsplash.com/photo-1573576267803-8b6c3e0e5f5f?w=800&h=800&fit=crop',
    introduction: 'Experience the magic of Mallorca, Menorca, Ibiza, and Formentera with our exclusive villa collection.',
    description: 'Crystal-clear waters, charming villages, and world-class dining await in these Mediterranean gems.',
  },
  'Turkey': {
    title: 'Turkey',
    slug: 'turkey',
    imageUrl: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&h=800&fit=crop',
    introduction: 'Where East meets West - discover Turkey\'s stunning Aegean and Mediterranean coasts.',
    description: 'Ancient ruins, turquoise waters, and legendary hospitality combine in our Turkish villa collection.',
  },
  'Croatia': {
    title: 'Croatia',
    slug: 'croatia',
    imageUrl: 'https://images.unsplash.com/photo-1555990538-1e7a0e3e8b77?w=800&h=800&fit=crop',
    introduction: 'Crystal-clear Adriatic waters and historic towns await in our Croatian villa collection.',
    description: 'From the ancient walls of Dubrovnik to the hidden coves of the Dalmatian coast, discover Croatia\'s magic.',
  },
  'Portugal': {
    title: 'Portugal',
    slug: 'portugal',
    imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&h=800&fit=crop',
    introduction: 'Discover the Algarve\'s golden beaches and Portugal\'s charming coastal towns.',
    description: 'Exceptional cuisine, warm hospitality, and stunning Atlantic scenery define our Portuguese collection.',
  },
};

const destinationKeys = ['Spain', 'France', 'Italy', 'Greece', 'Balearic Islands', 'Turkey', 'Croatia', 'Portugal'];

export function DestinationTabsClient({ destinations, sectionTitle }: DestinationTabsClientProps) {
  const [activeTab, setActiveTab] = useState('Spain');

  // Merge CMS data with defaults
  const getDestinationContent = (key: string): DestinationContent => {
    const cmsContent = destinations?.[key];
    const defaultContent = defaultDestinations[key] || defaultDestinations['Spain'];

    return {
      title: cmsContent?.title || defaultContent.title,
      slug: cmsContent?.slug || defaultContent.slug,
      imageUrl: cmsContent?.imageUrl || defaultContent.imageUrl,
      introduction: cmsContent?.introduction || defaultContent.introduction,
      description: cmsContent?.description || defaultContent.description,
    };
  };

  const activeContent = getDestinationContent(activeTab);

  return (
    <section className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-center font-serif text-3xl mb-12">
          {sectionTitle || 'Where do you want to go?'}
        </h3>

        <div className="flex flex-wrap justify-center gap-4 md:gap-12 mb-20 border-b border-gray-200">
          {destinationKeys.map(dest => (
            <button
              key={dest}
              onClick={() => setActiveTab(dest)}
              className={`pb-4 px-2 text-sm font-medium transition-all relative ${
                activeTab === dest ? 'text-vintage-green' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {dest === 'Balearic Islands' ? 'Balearics' : dest}
              {activeTab === dest && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-vintage-green"></div>
              )}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="relative z-10 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] overflow-hidden h-[500px] w-full border-[12px] border-white shadow-xl">
              <Image
                src={activeContent.imageUrl || defaultDestinations['Spain'].imageUrl!}
                alt={activeContent.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-20 w-32 h-32 bg-white/90 backdrop-blur rounded-full flex flex-col items-center justify-center p-4 border border-vintage-green/20 text-center">
              <span className="text-[10px] uppercase tracking-widest text-vintage-green mb-1">Our Heritage</span>
              <span className="font-serif italic text-lg">Vintage Pick</span>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-5xl font-serif text-vintage-green">Villas in {activeContent.title === 'Balearic Islands' ? 'the Balearics' : activeContent.title}</h2>
            <p className="text-gray-600 leading-relaxed italic">
              {activeContent.introduction}
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              {activeContent.description}
            </p>
            <div className="pt-6">
              <Link href={`/villas-in-${activeContent.slug}`} className="bg-vintage-green text-white px-10 py-4 text-xs tracking-widest uppercase font-semibold hover:bg-black transition-colors inline-block">
                VIEW VILLAS IN {activeContent.title === 'Balearic Islands' ? 'THE BALEARICS' : activeContent.title.toUpperCase()}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
