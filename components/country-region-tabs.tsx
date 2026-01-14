'use client';

import React, { useState } from 'react';
import { CountryRegion } from '@/lib/country-regions-config';

interface CountryRegionTabsProps {
  regions: CountryRegion[];
  countryLabel: string;
}

export function CountryRegionTabs({ regions, countryLabel }: CountryRegionTabsProps) {
  const [activeTab, setActiveTab] = useState(regions[0]);

  return (
    <section className="bg-[#F3F0E9]">
      {/* Tabs */}
      <div className="flex justify-center border-b border-gray-300">
        <div className="flex space-x-8 md:space-x-16 px-4 pt-8 pb-4 overflow-x-auto hide-scrollbar">
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => setActiveTab(region)}
              className={`text-sm font-serif uppercase tracking-widest pb-4 transition-all whitespace-nowrap ${
                activeTab.id === region.id
                  ? 'border-b-2 border-gray-800 -mb-[1px] font-semibold text-black'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {region.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row h-auto md:h-[500px]">
        {/* Left Image */}
        <div className="w-full md:w-1/2 h-[300px] md:h-full relative bg-gray-200">
          <img
            key={activeTab.id}
            src={`https://images.unsplash.com/photo-${Math.abs(activeTab.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 1000000000}-1613490493576?w=1000&h=800&fit=crop&q=80`}
            alt={`${activeTab.label} landscape`}
            className="w-full h-full object-cover animate-[fadeIn_0.5s_ease-in-out]"
          />
          <div className="absolute bottom-4 left-4 border border-white p-2 text-white text-xs cursor-pointer hover:bg-white/20 transition-colors">
            VIEW GALLERIES
          </div>
        </div>

        {/* Right Content */}
        <div className="w-full md:w-1/2 p-10 md:p-20 flex flex-col justify-center bg-[#F3F0E9]">
          <div key={activeTab.id} className="animate-[fadeIn_0.5s_ease-in-out]">
            <h3 className="text-3xl font-serif text-vintage-green mb-6">{activeTab.title}</h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {activeTab.description1}
            </p>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
              {activeTab.description2}
            </p>
            <div>
              <button className="bg-[#3A443C] text-white px-6 py-3 font-serif uppercase tracking-widest text-xs hover:bg-black transition-colors">
                {activeTab.buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bar of section */}
      <div className="bg-white py-4 text-center">
        <span className="text-xs uppercase tracking-widest text-gray-500 cursor-pointer hover:underline">
          View All Villas in {countryLabel}
        </span>
      </div>

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
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
