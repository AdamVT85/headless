/**
 * Destination Tabs - Client Component
 * Tabbed destination selector matching location page styling
 * Supports swipe gestures on touch devices
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Destination content from CMS
export interface DestinationContent {
  title: string;
  slug: string;
  imageUrl?: string;
  introduction?: string;
  introductionExtended?: string;
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
    imageUrl: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1200&q=80',
    introduction: 'Discover stunning villas across Spain, from the sun-drenched Costa Brava to the rolling hills of Andalusia.',
    introductionExtended: 'Discover our handpicked selection of luxury villas in Spain, from hidden countryside retreats to spectacular coastal properties. Explore the sun-drenched Costa Brava, venture inland to the whitewashed villages of Andalusia, or relax in rustic fincas surrounded by olive groves.\n\nEvery villa in our Spanish portfolio has been personally visited by our team. Our local representatives are on hand to help you discover the very best of Spanish culture, cuisine, and natural beauty.',
  },
  'France': {
    title: 'France',
    slug: 'france',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    introduction: 'Experience the romance of France with our collection of carefully selected villas across Provence, the Côte d\'Azur, and beyond.',
    introductionExtended: 'Experience the romance of France with our carefully selected villas across Provence and the Côte d\'Azur. Picture yourself waking to the scent of lavender in a restored Provençal mas, or sipping rosé on a terrace overlooking the glittering Mediterranean.\n\nOur French properties range from elegant châteaux with manicured gardens to charming stone farmhouses nestled among vineyards. Our local experts can arrange wine tastings, cooking classes, and exclusive access to the region\'s hidden treasures.',
  },
  'Italy': {
    title: 'Italy',
    slug: 'italy',
    imageUrl: 'https://images.unsplash.com/photo-1534445867742-43195f401b6c?auto=format&fit=crop&w=1200&q=80',
    introduction: 'La dolce vita awaits in our handpicked Italian villas, from Tuscan hilltops to the stunning Amalfi Coast.',
    introductionExtended: 'La dolce vita awaits in our handpicked Italian villas. Imagine mornings exploring Renaissance art in Florence, followed by afternoons lounging by your private pool with views over the Chianti hills, or choose the dramatic Amalfi Coast where pastel villages cascade down to the sparkling sea.\n\nOur Italian portfolio includes grand historic estates and intimate trulli in Puglia\'s countryside. Our local team can arrange pasta-making classes, vineyard tours, and boat trips to hidden grottos along the coastline.',
  },
  'Greece': {
    title: 'Greece',
    slug: 'greece',
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    introduction: 'Discover the magic of Greece with our collection of island villas and mainland retreats.',
    introductionExtended: 'Discover the magic of Greece with our island villas and mainland retreats. From the world-famous sunsets of Santorini to the unspoiled beaches of the Ionian, our collection spans Cycladic cave houses to neoclassical mansions on Corfu\'s verdant hillsides.\n\nGreeks invented hospitality—philoxenia—and you\'ll experience this genuine warmth everywhere. Our local representatives can arrange sailing trips, archaeological visits, and taverna experiences with the freshest seafood.',
  },
  'Balearic Islands': {
    title: 'Balearics',
    slug: 'balearics',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
    introduction: 'Experience the magic of Mallorca, Menorca, Ibiza, and Formentera with our exclusive villa collection.',
    introductionExtended: 'Experience the magic of Mallorca, Menorca, Ibiza, and Formentera. Each island has its own personality: Mallorca\'s dramatic mountains and medieval towns, Menorca\'s unspoiled UNESCO landscapes, Ibiza\'s tranquil northern villages, and Formentera\'s Caribbean-like beaches.\n\nOur Balearic collection features restored fincas and contemporary villas with sea views. Our local team can arrange yacht charters to hidden calas, Michelin-starred dining, and access to the islands\' most exclusive beach clubs.',
  },
  'Turkey': {
    title: 'Turkey',
    slug: 'turkey',
    imageUrl: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80',
    introduction: 'Where East meets West - discover Turkey\'s stunning Aegean and Mediterranean coasts.',
    introductionExtended: 'Discover Turkey\'s stunning Aegean and Mediterranean coasts, where ancient Lycian tombs are carved into cliffsides and pine-clad hills tumble down to crystal-clear bays. The Turquoise Coast offers some of the most dramatic scenery anywhere in the Mediterranean.\n\nOur Turkish villas range from traditional stone houses in Kalkan to contemporary properties with private jetties. Our local representatives can arrange gulet cruises, visits to ancient Ephesus, and hot air ballooning over Cappadocia.',
  },
  'Croatia': {
    title: 'Croatia',
    slug: 'croatia',
    imageUrl: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=1200&q=80',
    introduction: 'Crystal-clear Adriatic waters and historic towns await in our Croatian villa collection.',
    introductionExtended: 'Discover crystal-clear Adriatic waters and historic towns from Dubrovnik\'s medieval walls to Split\'s Diocletian\'s Palace. The coastline is dotted with over a thousand islands waiting to be explored, and the sea is so clear you can see the seabed twenty metres below.\n\nChoose from restored stone villas in ancient towns or contemporary properties with panoramic views. Our local team can arrange boat trips to the Blue Cave, wine tasting on the Pelješac peninsula, and truffle hunting in Istria.',
  },
  'Portugal': {
    title: 'Portugal',
    slug: 'portugal',
    imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80',
    introduction: 'Discover the Algarve\'s golden beaches and Portugal\'s charming coastal towns.',
    introductionExtended: 'Discover the Algarve\'s golden beaches, spectacular cliffs, and over 300 days of annual sunshine. Beyond the coast, the Alentejo offers rolling cork forests and whitewashed villages, while the Douro Valley provides stunning terraced vineyards.\n\nOur Portuguese properties range from traditional quintas to contemporary villas overlooking the Atlantic. Our local representatives can arrange wine tours, surfing lessons, and explorations of Lisbon\'s vibrant neighbourhoods.',
  },
};

const destinationKeys = ['Spain', 'France', 'Italy', 'Greece', 'Balearic Islands', 'Turkey', 'Croatia', 'Portugal'];

export function DestinationTabsClient({ destinations, sectionTitle }: DestinationTabsClientProps) {
  const [activeTab, setActiveTab] = useState('Spain');
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Minimum swipe distance to trigger navigation (in pixels)
  const minSwipeDistance = 50;

  // Scroll the tab into view when activeTab changes
  useEffect(() => {
    const activeButton = tabRefs.current[activeTab];
    const container = tabContainerRef.current;

    if (activeButton && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      // Calculate if button is outside visible area
      const isLeftOfView = buttonRect.left < containerRect.left;
      const isRightOfView = buttonRect.right > containerRect.right;

      if (isLeftOfView || isRightOfView) {
        // Scroll to center the button in the container
        const scrollLeft = activeButton.offsetLeft - (container.offsetWidth / 2) + (activeButton.offsetWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [activeTab]);

  // Merge CMS data with defaults
  const getDestinationContent = (key: string): DestinationContent => {
    const cmsContent = destinations?.[key];
    const defaultContent = defaultDestinations[key] || defaultDestinations['Spain'];

    // Use default slug for consistency (CMS slugs may differ)
    return {
      title: cmsContent?.title || defaultContent.title,
      slug: defaultContent.slug, // Always use our defined slugs for URL consistency
      imageUrl: cmsContent?.imageUrl || defaultContent.imageUrl,
      introduction: cmsContent?.introduction || defaultContent.introduction,
      introductionExtended: cmsContent?.introductionExtended || defaultContent.introductionExtended,
    };
  };

  // Navigate to next/previous destination
  const navigateDestination = (direction: 'next' | 'prev') => {
    const currentIndex = destinationKeys.indexOf(activeTab);
    let newIndex: number;

    if (direction === 'next') {
      newIndex = currentIndex < destinationKeys.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : destinationKeys.length - 1;
    }

    setActiveTab(destinationKeys[newIndex]);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current || !touchStartY.current || !touchEndY.current) return;

    const distanceX = touchStartX.current - touchEndX.current;
    const distanceY = touchStartY.current - touchEndY.current;
    const absDistanceX = Math.abs(distanceX);
    const absDistanceY = Math.abs(distanceY);

    // Only trigger swipe if horizontal movement is greater than vertical
    // This prevents accidental swipes when scrolling
    const isHorizontalSwipe = absDistanceX > absDistanceY && absDistanceX > minSwipeDistance;

    if (isHorizontalSwipe) {
      if (distanceX > 0) {
        navigateDestination('next');
      } else {
        navigateDestination('prev');
      }
    }

    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;
    touchEndY.current = null;
  };

  const activeContent = getDestinationContent(activeTab);
  const displayTitle = activeTab === 'Balearic Islands' ? 'the Balearics' : activeContent.title;

  return (
    <section className="bg-[#F3F0E9]">
      {/* Tab Navigation */}
      <div className="flex justify-center border-b border-gray-300">
        <div
          ref={tabContainerRef}
          className="flex space-x-4 md:space-x-12 px-4 pt-8 pb-4 overflow-x-auto scroll-smooth"
        >
          {destinationKeys.map((key) => {
            const tabTitle = key === 'Balearic Islands' ? 'Balearics' : key;
            const isActive = activeTab === key;

            return (
              <button
                key={key}
                ref={(el) => { tabRefs.current[key] = el; }}
                onClick={() => setActiveTab(key)}
                className={`text-sm font-serif uppercase tracking-widest pb-4 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-b-2 border-gray-800 font-semibold text-black -mb-[1px]'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tabTitle}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area - Swipeable */}
      <div
        className="flex flex-col md:flex-row h-auto md:h-[500px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Image Side */}
        <div className="w-full md:w-1/2 h-[300px] md:h-full relative bg-gray-200 overflow-hidden">
          <Image
            key={activeContent.imageUrl}
            src={activeContent.imageUrl || defaultDestinations['Spain'].imageUrl!}
            alt={`${displayTitle} landscape`}
            fill
            className="object-cover transition-opacity duration-500"
          />
        </div>

        {/* Text Side */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-[#F3F0E9] overflow-hidden">
          <div className="overflow-hidden">
            <h3 className="text-2xl md:text-3xl font-serif text-[#3A443C] mb-4 md:mb-6">
              Villas in {displayTitle}
            </h3>
            {/* Mobile: short introduction */}
            <p className="md:hidden text-sm text-gray-600 mb-6 leading-relaxed line-clamp-4">
              {activeContent.introduction}
            </p>
            {/* Desktop: extended introduction */}
            <div className="hidden md:block text-sm text-gray-600 mb-6 leading-relaxed whitespace-pre-line overflow-hidden">
              {activeContent.introductionExtended || activeContent.introduction}
            </div>
            <div className="flex-shrink-0">
              <Link
                href={`/${activeContent.slug}`}
                className="bg-[#3A443C] text-white px-6 py-3 font-serif uppercase tracking-widest text-xs hover:bg-black transition-colors inline-block"
              >
                View Villas in {displayTitle}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Link */}
      <div className="bg-white py-4 text-center">
        <Link
          href="/search"
          className="text-xs uppercase tracking-widest text-gray-500 cursor-pointer hover:underline"
        >
          View All Villas
        </Link>
      </div>
    </section>
  );
}
