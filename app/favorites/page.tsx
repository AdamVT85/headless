'use client';

/**
 * FAVORITES PAGE
 * Displays user's favourited villas stored in localStorage
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';
import { useFavourites } from '@/contexts/favourites-context';
import { VillaCard, VillaCardGrid, VillaCardSkeleton } from '@/components/ui/villa-card';
import { getVillasByIds } from './actions';

interface Villa {
  id: string;
  slug: string;
  title: string;
  region: string;
  town?: string;
  heroImageUrl?: string | null;
  pricePerWeek?: number | null;
  maxGuests?: number;
  bedrooms?: number;
}

export default function FavoritesPage() {
  const { favourites } = useFavourites();
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVillas() {
      if (favourites.length === 0) {
        setVillas([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const fetchedVillas = await getVillasByIds(favourites);
        setVillas(fetchedVillas);
      } catch (error) {
        console.error('Failed to fetch favourite villas:', error);
        setVillas([]);
      }
      setLoading(false);
    }

    fetchVillas();
  }, [favourites]);

  return (
    <main className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-olive text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back to Search</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif font-light">
            Your Favourites
          </h1>
          <p className="mt-2 text-white/80">
            {favourites.length === 0
              ? 'Save villas you love by clicking the heart icon'
              : `${favourites.length} ${favourites.length === 1 ? 'villa' : 'villas'} saved`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <VillaCardGrid>
            {[...Array(3)].map((_, i) => (
              <VillaCardSkeleton key={i} />
            ))}
          </VillaCardGrid>
        ) : favourites.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-stone-100 mb-6">
              <Heart size={40} className="text-stone-300" />
            </div>
            <h2 className="text-2xl font-serif text-olive mb-4">
              No favourites yet
            </h2>
            <p className="text-stone-600 mb-8 max-w-md mx-auto">
              Browse our collection of beautiful villas and click the heart icon to save your favourites here.
            </p>
            <Link
              href="/search"
              className="inline-block bg-olive text-white px-8 py-3 font-serif uppercase tracking-widest text-sm hover:bg-olive/90 transition-colors"
            >
              Explore Villas
            </Link>
          </div>
        ) : (
          <VillaCardGrid>
            {villas.map((villa) => (
              <VillaCard
                key={villa.id}
                id={villa.id}
                slug={villa.slug}
                title={villa.title}
                region={villa.region}
                town={villa.town}
                heroImageUrl={villa.heroImageUrl}
                pricePerWeek={villa.pricePerWeek}
                maxGuests={villa.maxGuests}
                bedrooms={villa.bedrooms}
              />
            ))}
          </VillaCardGrid>
        )}
      </div>
    </main>
  );
}
