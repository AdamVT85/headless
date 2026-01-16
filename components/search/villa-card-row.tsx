'use client';

/**
 * VILLA CARD ROW COMPONENT
 * Landscape-oriented villa card for map view list
 * Shows villa info in horizontal layout with hover highlight support
 */

import { forwardRef, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Bed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MockVilla } from '@/lib/mock-db';
import { FavouriteButton } from '@/components/ui/favourite-button';

interface VillaCardRowProps {
  villa: MockVilla;
  isHighlighted: boolean;
  onHover: (villaId: string | null) => void;
  shouldScrollIntoView?: boolean;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export const VillaCardRow = forwardRef<HTMLDivElement, VillaCardRowProps>(
  function VillaCardRow({ villa, isHighlighted, onHover, shouldScrollIntoView, scrollContainerRef }, ref) {
    const cardRef = useRef<HTMLDivElement>(null);

    // Scroll into view when highlighted from map hover
    // Uses manual scroll calculation to only scroll the container, not the window
    useEffect(() => {
      if (shouldScrollIntoView && isHighlighted && cardRef.current && scrollContainerRef?.current) {
        const container = scrollContainerRef.current;
        const card = cardRef.current;

        // Calculate position to center the card in the container
        const containerRect = container.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();

        // Current scroll position + card position relative to container - center offset
        const scrollTop = container.scrollTop + (cardRect.top - containerRect.top) - (containerRect.height / 2) + (cardRect.height / 2);

        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth',
        });
      }
    }, [isHighlighted, shouldScrollIntoView, scrollContainerRef]);

    const priceDisplay = villa.pricePerWeek
      ? `£${villa.pricePerWeek.toLocaleString()}`
      : 'POA';

    return (
      <div
        ref={cardRef}
        onMouseEnter={() => onHover(villa.id)}
        onMouseLeave={() => onHover(null)}
        className={cn(
          'transition-all duration-300 rounded-sm overflow-hidden',
          isHighlighted
            ? 'ring-2 ring-terracotta bg-terracotta-50 scale-[1.01]'
            : 'bg-white hover:shadow-md'
        )}
      >
        <Link
          href={`/villas/${villa.slug}`}
          className="flex flex-row h-[140px] md:h-[160px]"
        >
          {/* Image */}
          <div className="relative w-[140px] md:w-[200px] flex-shrink-0 overflow-hidden">
            <Image
              src={villa.heroImageUrl || '/placeholder-villa.svg'}
              alt={villa.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="200px"
            />
            {/* Favourite button */}
            <div className="absolute top-2 right-2">
              <FavouriteButton villaId={villa.id} size="sm" />
            </div>

            {/* Location badge */}
            <div className="absolute top-2 left-2">
              <span className="bg-white/90 px-2 py-0.5 rounded-sm text-[10px] font-semibold text-olive backdrop-blur-sm">
                {villa.town || villa.region}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-3 md:p-4 flex flex-col justify-between min-w-0">
            {/* Title */}
            <div>
              <h3
                className={cn(
                  'font-serif text-base md:text-lg line-clamp-1 transition-colors',
                  isHighlighted ? 'text-terracotta' : 'text-olive'
                )}
              >
                {villa.title}
              </h3>

              {/* Capacity */}
              <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                {villa.maxGuests && villa.maxGuests > 0 && (
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {villa.maxGuests}
                  </span>
                )}
                {villa.bedrooms && villa.bedrooms > 0 && (
                  <span className="flex items-center gap-1">
                    <Bed size={12} />
                    {villa.bedrooms}
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="mt-auto">
              <p className="text-[10px] text-stone-400 uppercase tracking-wide">From</p>
              <p
                className={cn(
                  'text-lg md:text-xl font-serif transition-colors',
                  isHighlighted ? 'text-terracotta' : 'text-terracotta-500'
                )}
              >
                {priceDisplay}
                <span className="text-xs font-normal text-stone-400"> /wk</span>
              </p>
            </div>
          </div>
        </Link>
      </div>
    );
  }
);

/**
 * Villa Card Row Skeleton
 * Loading state for list view
 */
export function VillaCardRowSkeleton() {
  return (
    <div className="flex flex-row h-[140px] md:h-[160px] bg-white rounded-sm overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="w-[140px] md:w-[200px] flex-shrink-0 bg-stone-200" />

      {/* Content skeleton */}
      <div className="flex-1 p-3 md:p-4 flex flex-col justify-between">
        <div>
          <div className="h-5 bg-stone-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-stone-200 rounded w-1/3" />
        </div>
        <div>
          <div className="h-2 bg-stone-200 rounded w-12 mb-1" />
          <div className="h-5 bg-stone-200 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export default VillaCardRow;
