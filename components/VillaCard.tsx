/**
 * VINTAGE TRAVEL - VILLA CARD COMPONENT
 *
 * Reusable card component for displaying villa information
 * Used in search results, listings, and recommendations
 */

import Link from 'next/link';
import { MockVilla } from '@/lib/mock-db';

interface VillaCardProps {
  villa: MockVilla;
  showPrice?: boolean;
  className?: string;
}

export default function VillaCard({
  villa,
  showPrice = true,
  className = '',
}: VillaCardProps) {
  return (
    <Link
      href={`/villas/${villa.slug}`}
      className={`block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden ${className}`}
      data-testid={`villa-card-${villa.sfccId}`}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={villa.heroImageUrl}
          alt={villa.title}
          className="w-full h-full object-cover"
        />
        {/* Region Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-800">
          📍 {villa.region}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2" data-testid="villa-title">
          {villa.title}
        </h3>

        {/* Capacity */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span>👥 {villa.maxGuests} guests</span>
          <span>🛏️ {villa.bedrooms} beds</span>
          <span>🚿 {villa.bathrooms} baths</span>
        </div>

        {/* Amenities (first 3) */}
        {villa.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {villa.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {amenity}
              </span>
            ))}
            {villa.amenities.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{villa.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Description Preview */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {villa.description}
        </p>

        {/* Price & CTA */}
        <div className="flex items-center justify-between border-t pt-3">
          {showPrice && villa.pricePerWeek && (
            <div>
              <p className="text-sm text-gray-600">From</p>
              <p className="text-2xl font-bold text-gray-900" data-testid="villa-price">
                £{villa.pricePerWeek.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">per week</p>
            </div>
          )}
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm">
            View Details →
          </button>
        </div>
      </div>
    </Link>
  );
}

/**
 * Skeleton loader for VillaCard
 */
export function VillaCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="flex gap-2 mb-3">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
        <div className="flex items-center justify-between border-t pt-3">
          <div className="h-8 bg-gray-200 rounded w-24" />
          <div className="h-10 bg-gray-200 rounded w-32" />
        </div>
      </div>
    </div>
  );
}
