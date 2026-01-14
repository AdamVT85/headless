import React from 'react';
import { Users, BedDouble, Bath, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { MockVilla } from '@/lib/mock-db';

interface CountryVillaCardProps {
  villa: MockVilla;
}

export function CountryVillaCard({ villa }: CountryVillaCardProps) {
  const tags = [
    villa.region,
    `Sleeps ${villa.maxGuests}`,
    villa.pricePerWeek ? `From £${villa.pricePerWeek}/week` : 'Call for price'
  ];

  return (
    <div className="bg-white shadow-sm flex flex-col md:flex-row mb-8 min-h-[300px]">
      {/* Image Side */}
      <div className="relative w-full md:w-5/12 h-64 md:h-auto overflow-hidden group">
        <img
          src={villa.heroImageUrl}
          alt={villa.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Navigation Arrows (Visual only for demo) */}
        <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-white/80 p-2 hover:bg-white">
            <ChevronLeft size={20} />
          </button>
          <button className="bg-white/80 p-2 hover:bg-white">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Content Side */}
      <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col relative">
        {/* Header Section */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="border border-gray-400 rounded-full px-3 py-1 text-[10px] uppercase tracking-wide text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-serif text-vintage-green mb-1">{villa.title}</h3>
            <p className="text-xs text-gray-500 mb-4">
              {villa.town ? `${villa.town}, ` : ''}{villa.region}
            </p>
          </div>
          {/* Price block for Desktop */}
          <div className="hidden md:block text-right">
            <p className="text-[10px] uppercase tracking-widest text-gray-500">From</p>
            <p className="text-3xl font-serif text-vintage-green">
              {villa.pricePerWeek ? `£${villa.pricePerWeek.toLocaleString()}` : 'POA'}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-gray-500">Per Week</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-6 line-clamp-3">
          {villa.description}
        </p>

        <div className="mt-auto">
          <p className="text-xs text-gray-500 mb-2">At a glance:</p>
          <div className="flex gap-6 text-gray-700">
            <div className="flex items-center gap-2">
              <Users size={18} strokeWidth={1.5} />
              <span className="text-xs">Sleeps {villa.maxGuests}</span>
            </div>
            <div className="flex items-center gap-2">
              <BedDouble size={18} strokeWidth={1.5} />
              <span className="text-xs">{villa.bedrooms} Bedrooms</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath size={18} strokeWidth={1.5} />
              <span className="text-xs">{villa.bathrooms} Bathrooms</span>
            </div>
          </div>
        </div>

        {/* Mobile Price & Action */}
        <div className="md:hidden mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-xl font-serif text-vintage-green">
              {villa.pricePerWeek ? `£${villa.pricePerWeek.toLocaleString()}` : 'POA'}
            </p>
            <p className="text-[10px] text-gray-500">Per Week</p>
          </div>
          <Link
            href={`/villas/${villa.slug}`}
            className="bg-[#3A443C] text-white px-6 py-3 font-serif uppercase tracking-widest text-[10px] hover:bg-black transition-colors"
          >
            View Villa
          </Link>
        </div>

        {/* Desktop Button - Absolute right bottom */}
        <div className="hidden md:block absolute bottom-8 right-8">
          <Link
            href={`/villas/${villa.slug}`}
            className="bg-[#3A443C] text-white px-8 py-3 font-serif uppercase tracking-widest text-[10px] hover:bg-black transition-colors inline-block"
          >
            View Villa
          </Link>
        </div>
      </div>
    </div>
  );
}
