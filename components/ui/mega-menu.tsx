/**
 * MEGA MENU - Locations Dropdown
 * Compact full-width dropdown with country/region navigation
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { MENU_DATA } from '@/lib/navigation-data';

export function MegaMenu() {
  const [activeCountryId, setActiveCountryId] = useState<string>('spain');

  const activeCountry = MENU_DATA.countries.find(c => c.id === activeCountryId);

  return (
    <div className="w-max bg-white shadow-xl border border-stone-200 rounded-sm">
      <div className="px-5 py-4">

        {/* Top Section: Popular Destinations */}
        <div className="mb-5">
          <h3 className="text-vintage-green font-serif text-base mb-3">Our most popular destinations</h3>
          <div className="grid grid-cols-3 gap-3">
            {MENU_DATA.popularDestinations.map((dest) => (
              <Link
                key={dest.id}
                href={`/${dest.countryId}/${dest.id}`}
                className="relative group cursor-pointer overflow-hidden h-24 w-52"
              >
                <img
                  src={dest.imageUrl}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-serif tracking-wide drop-shadow-md">{dest.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Section: Split Columns */}
        <div className="flex gap-0 border-t border-stone-200 pt-0">

          {/* Left Column: Countries List */}
          <div className="w-44 border-r border-stone-200 pt-4 pr-4">
            <ul className="space-y-0">
              {MENU_DATA.countries.map((country) => {
                const isActive = activeCountryId === country.id;
                return (
                  <li
                    key={country.id}
                    onMouseEnter={() => setActiveCountryId(country.id)}
                    className={`
                      flex items-center justify-between py-2 pr-4 cursor-pointer border-b-2 transition-all
                      ${isActive
                        ? 'text-terracotta border-terracotta font-medium'
                        : 'text-vintage-green border-transparent hover:text-stone-500'}
                    `}
                  >
                    <span className="text-sm font-serif">{country.name}</span>
                    <ChevronRight
                      size={16}
                      className={`transition-transform duration-300 ${isActive ? 'translate-x-1 text-terracotta' : 'text-stone-400'}`}
                    />
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right Column: Regions */}
          <div className="w-[420px] pl-5 pt-4">
            <h3 className="text-base font-serif text-vintage-green mb-3 border-b border-stone-200 pb-1 inline-block">
              {activeCountry?.name}
            </h3>

            <div className="grid grid-cols-2 gap-y-1 gap-x-4">
              {activeCountry?.regions.map((region) => (
                <Link
                  key={region.id}
                  href={`/${activeCountry.id}/${region.id}`}
                  className="flex items-center justify-between group text-sm text-vintage-green hover:text-terracotta py-1 transition-colors"
                >
                  <span>{region.name}</span>
                  <ChevronRight size={14} className="text-stone-400 group-hover:text-terracotta" />
                </Link>
              ))}
            </div>

            {/* Action Button */}
            <div className="mt-6">
              <Link
                href={`/${activeCountry?.id}`}
                className="inline-block bg-vintage-green text-white px-6 py-2 text-xs tracking-widest uppercase hover:bg-opacity-90 transition-colors"
              >
                View All Villas in {activeCountry?.name}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
