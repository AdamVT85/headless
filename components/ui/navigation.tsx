/**
 * VINTAGE TRAVEL - MAIN NAVIGATION
 * Redesigned navigation with mega menus
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Heart, Menu, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TopBar } from './top-bar';
import { MegaMenu } from './mega-menu';
import { VillasForMenu } from './villas-for-menu';
import { useFavourites } from '@/contexts/favourites-context';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLocationsOpen, setIsLocationsOpen] = useState(false);
  const [isVillasForOpen, setIsVillasForOpen] = useState(false);
  const pathname = usePathname();
  const { favourites } = useFavourites();
  const favouriteCount = favourites.length;

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Top Bar with phone and trust badges */}
      <TopBar />

      {/* Main Navigation */}
      <nav className="bg-cream relative z-40 border-b border-stone-200">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-20 flex justify-between items-center">

          {/* Left Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8 text-vintage-green text-sm font-medium tracking-wide">

            {/* Locations Dropdown */}
            <div
              className="h-20 flex items-center cursor-pointer relative"
              onMouseEnter={() => setIsLocationsOpen(true)}
              onMouseLeave={() => setIsLocationsOpen(false)}
            >
              <span className={cn(
                'border-b-2 py-1 transition-colors',
                isLocationsOpen ? 'border-vintage-green' : 'border-transparent'
              )}>
                Locations
              </span>
              <div className={cn(
                'absolute top-full left-0 z-50 transition-all duration-200 origin-top',
                isLocationsOpen ? 'opacity-100 visible scale-y-100' : 'opacity-0 invisible scale-y-95'
              )}>
                <MegaMenu />
              </div>
            </div>

            {/* Villas For Dropdown */}
            <div
              className="h-20 flex items-center cursor-pointer relative"
              onMouseEnter={() => setIsVillasForOpen(true)}
              onMouseLeave={() => setIsVillasForOpen(false)}
            >
              <span className={cn(
                'border-b-2 py-1 transition-colors',
                isVillasForOpen ? 'border-vintage-green' : 'border-transparent'
              )}>
                Villas for
              </span>
              <div className={cn(
                'absolute top-full left-0 z-50 transition-all duration-200 origin-top',
                isVillasForOpen ? 'opacity-100 visible scale-y-100' : 'opacity-0 invisible scale-y-95'
              )}>
                <VillasForMenu />
              </div>
            </div>

            <Link href="/about" className="hover:text-stone-500 transition-colors">
              About us
            </Link>
          </div>

          {/* Logo (Center) */}
          <Link href="/" className="flex items-center group absolute left-1/2 transform -translate-x-1/2">
            <Image
              src="/logos/VT Logo - Palm.png"
              alt="Vintage Travel"
              width={180}
              height={48}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Right Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8 text-vintage-green text-sm font-medium tracking-wide">
            <Link href="/contact" className="hover:text-stone-500 transition-colors">
              Contact us
            </Link>
            <Link href="/faq" className="hover:text-stone-500 transition-colors">
              FAQ
            </Link>
            <Link href="/blog" className="hover:text-stone-500 transition-colors">
              Blog
            </Link>

            {/* Search Button - Preserved functionality */}
            <Link
              href="/search"
              className={cn(
                'hover:text-terracotta transition-colors',
                isActive('/search') && 'text-terracotta'
              )}
            >
              <Search className="h-5 w-5" />
            </Link>

            {/* Favorites */}
            <Link href="/favorites" className="relative hover:text-terracotta transition-colors">
              <Heart className="fill-vintage-green text-vintage-green hover:fill-terracotta hover:text-terracotta transition-colors" size={20} />
              {favouriteCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-terracotta text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {favouriteCount > 9 ? '9+' : favouriteCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-vintage-green hover:text-terracotta transition-colors ml-auto"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white">
            <div className="flex flex-col py-4">
              {/* Main Links */}
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-3 text-vintage-green font-medium hover:bg-cream transition-colors"
              >
                All Villas
              </Link>
              <Link
                href="/spain"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-3 text-vintage-green hover:bg-cream transition-colors"
              >
                Spain
              </Link>
              <Link
                href="/france"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-3 text-vintage-green hover:bg-cream transition-colors"
              >
                France
              </Link>
              <Link
                href="/italy"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-3 text-vintage-green hover:bg-cream transition-colors"
              >
                Italy
              </Link>
              <Link
                href="/greece"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-3 text-vintage-green hover:bg-cream transition-colors"
              >
                Greece
              </Link>
              <Link
                href="/portugal"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-3 text-vintage-green hover:bg-cream transition-colors"
              >
                Portugal
              </Link>
              <Link
                href="/croatia"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-3 text-vintage-green hover:bg-cream transition-colors"
              >
                Croatia
              </Link>

              {/* Divider */}
              <div className="border-t border-stone-200 my-2" />

              {/* Secondary Links */}
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-3 text-vintage-green hover:bg-cream transition-colors"
              >
                About us
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-3 text-vintage-green hover:bg-cream transition-colors"
              >
                Contact us
              </Link>
              <Link
                href="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-3 text-vintage-green hover:bg-cream transition-colors"
              >
                FAQ
              </Link>
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-3 text-vintage-green hover:bg-cream transition-colors"
              >
                Blog
              </Link>

              {/* Divider */}
              <div className="border-t border-stone-200 my-2" />

              {/* Utility Links */}
              <Link
                href="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-3 text-vintage-green hover:bg-cream transition-colors flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search
              </Link>
              <Link
                href="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-3 text-vintage-green hover:bg-cream transition-colors flex items-center gap-2"
              >
                <Heart className="h-4 w-4" />
                Favorites
                {favouriteCount > 0 && (
                  <span className="bg-terracotta text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                    {favouriteCount > 9 ? '9+' : favouriteCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
