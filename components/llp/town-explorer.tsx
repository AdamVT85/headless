'use client';

/**
 * PHASE 56: TOWN EXPLORER COMPONENT
 *
 * Interactive tabbed component for exploring towns within a region.
 * Similar to RegionExplorer but scoped to town-level navigation.
 */

import { useState } from 'react';
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
      <div className="text-center pt-12 pb-4">
        <h3 className="text-2xl font-serif text-[#3A443C]">Browse our villas by town</h3>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center border-b border-gray-300">
        <div className="flex space-x-4 md:space-x-8 px-4 pt-4 pb-4 overflow-x-auto">
          {towns.map((town) => (
            <button
              key={town}
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

      {/* Spotlight Content */}
      <div className="flex flex-col md:flex-row h-auto md:h-[400px]">
        {/* Image Side */}
        <div className="w-full md:w-1/2 h-[250px] md:h-full relative bg-gray-200 overflow-hidden">
          <Image
            key={activeTown}
            src={getTownImage(activeTown)}
            alt={`${activeTown} landscape`}
            fill
            className="object-cover transition-opacity duration-500 animate-fadeIn"
          />
          <Link
            href={`/search?location=${encodeURIComponent(activeTown)}`}
            className="absolute bottom-4 left-4 border border-white px-4 py-2 text-white text-xs cursor-pointer hover:bg-white/20 transition-colors uppercase tracking-widest"
          >
            View Galleries
          </Link>
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
