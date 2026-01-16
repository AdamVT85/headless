/**
 * VILLAS FOR MENU - Collections Dropdown
 * Compact full-width dropdown with collections and traveller types
 * Links match the homepage "What are you looking for" section
 */

import Link from 'next/link';
import { MENU_DATA } from '@/lib/navigation-data';

// Map collection IDs to their destination page URLs
const collectionUrls: Record<string, string> = {
  'mallorca': '/balearics/mallorca',
  'corfu': '/greece/corfu',
  'algarve': '/portugal/algarve',
};

// Map traveller type IDs to friendly URLs
const travellerTypeUrls: Record<string, string> = {
  'family': '/family-friendly-villas',
  'couples': '/villas-for-couples',
  'large': '/large-villas',
};

interface CardProps {
  title: string;
  imageUrl: string;
  href: string;
}

function Card({ title, imageUrl, href }: CardProps) {
  return (
    <Link href={href} className="relative group cursor-pointer overflow-hidden h-28 w-48">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-base font-serif tracking-wide drop-shadow-md text-center px-2">
          {title}
        </span>
      </div>
    </Link>
  );
}

export function VillasForMenu() {
  const { collections, travellerTypes } = MENU_DATA.villasFor;

  return (
    <div className="w-max bg-white shadow-xl border border-stone-200 rounded-sm">
      <div className="px-5 py-4">

        {/* Top Section - Collections */}
        <div className="mb-5">
          <h3 className="text-vintage-green font-serif text-sm mb-3">Our hottest collections</h3>
          <div className="grid grid-cols-3 gap-3">
            {collections.map((item) => (
              <Card
                key={item.id}
                title={item.title}
                imageUrl={item.imageUrl}
                href={collectionUrls[item.id] || `/search?region=${item.title}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Section - Traveller Types */}
        <div className="mb-5">
          <h3 className="text-vintage-green font-serif text-sm mb-3">Villas for every traveller</h3>
          <div className="grid grid-cols-3 gap-3">
            {travellerTypes.map((item) => (
              <Card
                key={item.id}
                title={item.title}
                imageUrl={item.imageUrl}
                href={travellerTypeUrls[item.id] || '/search'}
              />
            ))}
          </div>
        </div>

        {/* Footer Button */}
        <div className="flex justify-center pt-2">
          <Link
            href="/search"
            className="bg-vintage-green text-white px-6 py-2 text-xs tracking-wider uppercase hover:bg-opacity-90 transition-colors"
          >
            View All Villas
          </Link>
        </div>

      </div>
    </div>
  );
}
