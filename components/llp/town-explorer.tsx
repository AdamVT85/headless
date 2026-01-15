'use client';

/**
 * PHASE 56: TOWN EXPLORER COMPONENT
 *
 * Interactive tabbed component for exploring towns within a region.
 * Similar to RegionExplorer but scoped to town-level navigation.
 * Supports swipe gestures on touch devices.
 */

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Generic fallback images for towns
const GENERIC_IMAGES = [
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
];

interface TownExplorerProps {
  region: string;
  towns: string[];
  regionImage?: string;
}

export function TownExplorer({ region, towns, regionImage }: TownExplorerProps) {
  const [activeTown, setActiveTown] = useState(towns[0] || 'Unknown');
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Minimum swipe distance to trigger navigation (in pixels)
  const minSwipeDistance = 50;

  // Scroll the tab into view when activeTown changes
  useEffect(() => {
    const activeButton = tabRefs.current[activeTown];
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
  }, [activeTown]);

  // Navigate to next/previous town
  const navigateTown = (direction: 'next' | 'prev') => {
    const currentIndex = towns.indexOf(activeTown);
    let newIndex: number;

    if (direction === 'next') {
      newIndex = currentIndex < towns.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : towns.length - 1;
    }

    setActiveTown(towns[newIndex]);
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
      navigateTown('next');
    } else if (isRightSwipe) {
      navigateTown('prev');
    }

    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Generate consistent fallback image based on town name
  const getTownImage = (townName: string) => {
    if (regionImage) return regionImage;
    const index = townName.length % GENERIC_IMAGES.length;
    return GENERIC_IMAGES[index];
  };

  // Generate town description
  const getTownDescription = (townName: string) => {
    return `Discover our beautiful luxury villas in ${townName}, ${region}. Each property has been personally inspected to ensure the highest standards. The perfect destination for your next Mediterranean holiday escape.`;
  };

  if (towns.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#F3F0E9]">
      {/* Section Header */}
      <div className="text-center pt-8 pb-4">
        <h3 className="text-2xl font-serif text-[#3A443C]">Browse our villas by town</h3>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center border-b border-gray-300">
        <div
          ref={tabContainerRef}
          className="flex space-x-4 md:space-x-8 px-4 pt-4 pb-4 overflow-x-auto scroll-smooth"
        >
          {towns.map((town) => (
            <button
              key={town}
              ref={(el) => { tabRefs.current[town] = el; }}
              onClick={() => setActiveTown(town)}
              className={`text-sm font-serif uppercase tracking-widest pb-4 transition-all whitespace-nowrap ${
                activeTown === town
                  ? 'border-b-2 border-gray-800 font-semibold text-black -mb-[1px]'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {town}
            </button>
          ))}
        </div>
      </div>

      {/* Spotlight Content - Swipeable */}
      <div
        className="flex flex-col md:flex-row h-auto md:h-[400px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Image Side */}
        <div className="w-full md:w-1/2 h-[250px] md:h-full relative bg-gray-200 overflow-hidden">
          <Image
            key={activeTown}
            src={getTownImage(activeTown)}
            alt={`${activeTown} landscape`}
            fill
            className="object-cover transition-opacity duration-500 animate-fadeIn"
          />
        </div>

        {/* Text Side */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[#F3F0E9]">
          <div key={activeTown} className="animate-fadeIn">
            <h3 className="text-2xl md:text-3xl font-serif text-[#3A443C] mb-4">
              Villas in {activeTown}
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {getTownDescription(activeTown)}
            </p>
            <div>
              <Link
                href={`/search?location=${encodeURIComponent(activeTown)}`}
                className="bg-[#3A443C] text-white px-6 py-3 font-serif uppercase tracking-widest text-xs hover:bg-black transition-colors inline-block"
              >
                View Villas in {activeTown}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="bg-white py-4 text-center">
        <Link
          href={`/search?region=${encodeURIComponent(region)}`}
          className="text-xs uppercase tracking-widest text-gray-500 cursor-pointer hover:underline"
        >
          View All Villas in {region}
        </Link>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </section>
  );
}
