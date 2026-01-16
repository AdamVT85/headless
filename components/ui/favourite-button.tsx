'use client';

/**
 * FAVOURITE BUTTON
 * Heart toggle button for adding/removing villas from favourites
 */

import { Heart } from 'lucide-react';
import { useFavourites } from '@/contexts/favourites-context';
import { cn } from '@/lib/utils';

interface FavouriteButtonProps {
  villaId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
};

export function FavouriteButton({ villaId, className, size = 'md' }: FavouriteButtonProps) {
  const { isFavourite, toggleFavourite } = useFavourites();
  const isFav = isFavourite(villaId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation when inside a Link
    e.stopPropagation(); // Prevent event bubbling
    toggleFavourite(villaId);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex items-center justify-center rounded-full transition-all duration-200',
        'bg-white/90 backdrop-blur-sm hover:bg-white',
        'hover:scale-110 active:scale-95',
        'shadow-sm hover:shadow-md',
        sizeClasses[size],
        className
      )}
      aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
    >
      <Heart
        size={iconSizes[size]}
        className={cn(
          'transition-all duration-200',
          isFav
            ? 'fill-terracotta text-terracotta'
            : 'fill-transparent text-stone-400 hover:text-terracotta'
        )}
      />
    </button>
  );
}
