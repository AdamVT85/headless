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
    introduction: 'Discover our handpicked selection of luxury villas in Spain, carefully chosen for their authentic character and stunning locations. From hidden countryside retreats to spectacular coastal properties, each villa offers the perfect blend of comfort and local charm.',
  },
  'France': {
    title: 'France',
    slug: 'france',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    introduction: 'Experience the romance of France with our collection of carefully selected villas across Provence, the Côte d\'Azur, and beyond. From lavender fields to Mediterranean shores, discover authentic French living at its finest.',
  },
  'Italy': {
    title: 'Italy',
    slug: 'italy',
    imageUrl: 'https://images.unsplash.com/photo-1534445867742-43195f401b6c?auto=format&fit=crop&w=1200&q=80',
    introduction: 'La dolce vita awaits in our handpicked Italian villas, from Tuscan hilltops to the stunning Amalfi Coast. Experience authentic Italian culture, cuisine, and breathtaking scenery in properties that capture the essence of Italy.',
  },
  'Greece': {
    title: 'Greece',
    slug: 'greece',
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    introduction: 'Discover the magic of Greece with our collection of island villas and mainland retreats. From the iconic whitewashed villages of the Cyclades to the lush greenery of Corfu, find your perfect Greek escape.',
  },
  'Balearic Islands': {
    title: 'Balearics',
    slug: 'balearics',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
    introduction: 'Experience the magic of Mallorca, Menorca, Ibiza, and Formentera with our exclusive villa collection. Crystal-clear waters, charming villages, and world-class dining await in these Mediterranean gems.',
  },
  'Turkey': {
    title: 'Turkey',
    slug: 'turkey',
    imageUrl: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80',
    introduction: 'Where East meets West - discover Turkey\'s stunning Aegean and Mediterranean coasts. Ancient ruins, turquoise waters, and legendary hospitality combine in our Turkish villa collection.',
  },
  'Croatia': {
    title: 'Croatia',
    slug: 'croatia',
    imageUrl: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=1200&q=80',
    introduction: 'Crystal-clear Adriatic waters and historic towns await in our Croatian villa collection. From the ancient walls of Dubrovnik to the hidden coves of the Dalmatian coast, discover Croatia\'s magic.',
  },
  'Portugal': {
    title: 'Portugal',
    slug: 'portugal',
    imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80',
    introduction: 'Discover the Algarve\'s golden beaches and Portugal\'s charming coastal towns. Exceptional cuisine, warm hospitality, and stunning Atlantic scenery define our Portuguese collection.',
  },
};

const destinationKeys = ['Spain', 'France', 'Italy', 'Greece', 'Balearic Islands', 'Turkey', 'Croatia', 'Portugal'];

export function DestinationTabsClient({ destinations, sectionTitle }: DestinationTabsClientProps) {
  const [activeTab, setActiveTab] = useState('Spain');
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
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
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      navigateDestination('next');
    } else if (isRightSwipe) {
      navigateDestination('prev');
    }

    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
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
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-[#F3F0E9]">
          <div>
            <h3 className="text-3xl font-serif text-[#3A443C] mb-6">
              Villas in {displayTitle}
            </h3>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
              {activeContent.introduction}
            </p>
            <div>
              <Link
                href={`/villas-in-${activeContent.slug}`}
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
