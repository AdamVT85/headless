'use client';

/**
 * VINTAGE TRAVEL - VILLA CARD COMPONENT
 * Displays villa information in a luxury, minimal design
 * Follows brand guidelines: 3:2 aspect ratio, Crimson Pro titles, Inter details
 */

import Link from "next/link";
import Image from "next/image";
import { Users, Bed } from "lucide-react";
import { cn } from "@/lib/utils";
import { FavouriteButton } from "./favourite-button";

export interface VillaCardProps {
  id: string;
  slug: string;
  title: string;
  region: string;
  town?: string;
  heroImageUrl?: string | null;
  pricePerWeek?: number | null;
  maxGuests?: number;
  bedrooms?: number;
  className?: string;
}

/**
 * Villa Card - Main display component
 * Minimal overlay, image-driven, 3:2 aspect ratio
 */
export function VillaCard({
  id,
  slug,
  title,
  region,
  town,
  heroImageUrl,
  pricePerWeek,
  maxGuests,
  bedrooms,
  className,
}: VillaCardProps) {
  // Defensive: Fallback for missing image
  const imageUrl = heroImageUrl || '/placeholder-villa.svg';

  // Defensive: Format price or show "Price on Request"
  const priceDisplay = pricePerWeek && pricePerWeek > 0
    ? `£${pricePerWeek.toLocaleString()}`
    : 'Price on Request';

  return (
    <Link
      href={`/villas/${slug}`}
      className={cn(
        "group block overflow-hidden rounded-sm bg-white shadow-sm",
        "transition-all duration-300 hover:shadow-xl",
        "border border-stone-200 hover:border-terracotta-300",
        className
      )}
    >
      {/* Image Container - 3:2 Aspect Ratio */}
      <div className="relative aspect-[3/2] overflow-hidden bg-stone-100">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.src = '/placeholder-villa.svg';
          }}
        />

        {/* Favourite button */}
        <div className="absolute top-3 left-3">
          <FavouriteButton villaId={id} size="sm" />
        </div>

        {/* Minimal overlay badge - show town, fallback to region */}
        <div className="absolute top-3 right-3">
          <span className="inline-block rounded-sm bg-white/90 px-3 py-1 text-xs font-semibold text-olive backdrop-blur-sm">
            {town || region}
          </span>
        </div>
      </div>

      {/* Content - Minimal text */}
      <div className="p-4 space-y-3">
        {/* Title - Crimson Pro serif */}
        <h3 className="font-serif text-xl font-light text-olive group-hover:text-terracotta transition-colors line-clamp-1">
          {title}
        </h3>

        {/* Details - Inter sans-serif */}
        <div className="flex items-center justify-between text-sm text-stone-600">
          <div className="flex items-center gap-4">
            {/* Guests */}
            {maxGuests && maxGuests > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{maxGuests}</span>
              </div>
            )}

            {/* Bedrooms */}
            {bedrooms && bedrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{bedrooms}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="pt-2 border-t border-stone-200">
          <p className="text-sm text-stone-500">From</p>
          <p className="text-lg font-semibold text-terracotta">
            {priceDisplay}
            {pricePerWeek && pricePerWeek > 0 && (
              <span className="text-sm font-normal text-stone-500"> / week</span>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}

/**
 * Villa Card Skeleton - Loading state
 * Matches the exact dimensions and layout of VillaCard
 */
export function VillaCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-sm bg-white shadow-sm",
        "border border-stone-200",
        "animate-pulse",
        className
      )}
    >
      {/* Image skeleton - 3:2 Aspect Ratio */}
      <div className="relative aspect-[3/2] bg-stone-200" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-6 bg-stone-200 rounded w-3/4" />

        {/* Details skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-4 bg-stone-200 rounded w-12" />
          <div className="h-4 bg-stone-200 rounded w-12" />
        </div>

        {/* Price skeleton */}
        <div className="pt-2 border-t border-stone-200 space-y-1">
          <div className="h-3 bg-stone-200 rounded w-16" />
          <div className="h-5 bg-stone-200 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * Villa Card Grid - Responsive container
 * Handles responsive layout: 1 col mobile, 2 cols tablet, 3 cols desktop
 */
export function VillaCardGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        className
      )}
    >
      {children}
    </div>
  );
}
