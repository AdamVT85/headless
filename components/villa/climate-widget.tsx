'use client';

/**
 * CLIMATE WIDGET COMPONENT
 * Displays 12-month historical weather averages
 * Based on 10-year Open-Meteo data
 */

import { useEffect, useRef } from 'react';
import { Sun, Thermometer } from 'lucide-react';
import { MonthlyClimate } from '@/lib/weather';

interface ClimateWidgetProps {
  data: MonthlyClimate[];
  region?: string;
}

export function ClimateWidget({ data, region }: ClimateWidgetProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to April (index 3) on mobile on mount
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Only scroll on mobile (when horizontal scroll is active)
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      // Each month card is ~70px wide + 8px gap = 78px
      // April is index 3, so scroll to position 3 * 78 = 234px
      const aprilIndex = 3;
      const cardWidth = 78; // 70px min-width + 8px gap
      container.scrollLeft = aprilIndex * cardWidth;
    }
  }, []);

  if (!data || data.length === 0) {
    return null;
  }

  // Find peak months for highlighting
  const maxTemp = Math.max(...data.map(d => d.temp));
  const maxSun = Math.max(...data.map(d => d.sun));

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-serif text-2xl text-vintage-green mb-2">
          Climate & Weather
        </h3>
        <p className="text-sm text-gray-500">
          Historical averages based on the last 10 years of data
          {region && ` for ${region}`}.
        </p>
      </div>

      {/* Monthly Grid - Horizontal Scroll on Mobile */}
      <div ref={scrollContainerRef} className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex md:grid md:grid-cols-12 gap-2 min-w-max md:min-w-0">
          {data.map((month) => {
            const isWarmest = month.temp === maxTemp;
            const isSunniest = month.sun === maxSun;

            return (
              <div
                key={month.month}
                className={`
                  flex flex-col items-center p-3 rounded-lg transition-all
                  ${isWarmest || isSunniest
                    ? 'bg-vintage-gold/10 border border-vintage-gold/30'
                    : 'bg-gray-50 border border-gray-100'
                  }
                  min-w-[70px] md:min-w-0
                `}
              >
                {/* Month Name */}
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                  {month.month}
                </span>

                {/* Sun Icon */}
                <Sun
                  size={20}
                  className={`mb-2 ${
                    isSunniest ? 'text-vintage-gold' : 'text-yellow-400'
                  }`}
                  strokeWidth={isSunniest ? 2.5 : 1.5}
                />

                {/* Temperature */}
                <div className="flex items-center gap-1 mb-1">
                  <span
                    className={`text-lg font-serif font-semibold ${
                      isWarmest ? 'text-terracotta' : 'text-vintage-green'
                    }`}
                  >
                    {month.temp}°
                  </span>
                </div>

                {/* Sunshine Hours */}
                <span className="text-[10px] text-gray-500">
                  {month.sun}h sun
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Thermometer size={12} className="text-terracotta" />
          <span>Average daily high temperature (°C)</span>
        </div>
        <div className="flex items-center gap-1">
          <Sun size={12} className="text-yellow-400" />
          <span>Average daily sunshine hours</span>
        </div>
      </div>
    </div>
  );
}

export default ClimateWidget;
