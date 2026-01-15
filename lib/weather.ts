/**
 * WEATHER UTILITY - OPEN-METEO HISTORICAL DATA
 * Fetches 10-year climate averages for villa locations
 * Uses Open-Meteo Archive API (free, no API key required)
 */

import { unstable_cache } from 'next/cache';

export interface MonthlyClimate {
  month: string;
  temp: number; // Average max temperature in Celsius
  sun: number;  // Average sunshine hours per day
}

interface OpenMeteoResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    sunshine_duration: number[];
  };
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Fetches and calculates 10-year climate averages for a location
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Array of 12 monthly climate objects
 */
async function fetchClimateAverages(lat: number, lng: number): Promise<MonthlyClimate[]> {
  // Validate coordinates
  if (!lat || !lng || lat === 0 || lng === 0) {
    console.log('[Weather] Invalid coordinates, skipping fetch');
    return [];
  }

  // Calculate date range: last 10 full years
  const currentYear = new Date().getFullYear();
  const endYear = currentYear - 1; // Last complete year
  const startYear = endYear - 9;   // 10 years total

  const startDate = `${startYear}-01-01`;
  const endDate = `${endYear}-12-31`;

  console.log(`[Weather] Fetching climate data for ${lat}, ${lng} from ${startDate} to ${endDate}`);

  try {
    const url = new URL('https://archive-api.open-meteo.com/v1/archive');
    url.searchParams.set('latitude', lat.toString());
    url.searchParams.set('longitude', lng.toString());
    url.searchParams.set('start_date', startDate);
    url.searchParams.set('end_date', endDate);
    url.searchParams.set('daily', 'temperature_2m_max,sunshine_duration');
    url.searchParams.set('timezone', 'auto');

    const response = await fetch(url.toString(), {
      next: { revalidate: 604800 } // 1 week in seconds
    });

    if (!response.ok) {
      console.error(`[Weather] API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data: OpenMeteoResponse = await response.json();

    if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
      console.error('[Weather] No daily data in response');
      return [];
    }

    // Group data by month
    const monthlyData: { temp: number[]; sun: number[] }[] = Array.from(
      { length: 12 },
      () => ({ temp: [], sun: [] })
    );

    for (let i = 0; i < data.daily.time.length; i++) {
      const date = new Date(data.daily.time[i]);
      const month = date.getMonth(); // 0-11

      const temp = data.daily.temperature_2m_max[i];
      const sunSeconds = data.daily.sunshine_duration[i];

      // Only add valid values
      if (temp !== null && !isNaN(temp)) {
        monthlyData[month].temp.push(temp);
      }
      if (sunSeconds !== null && !isNaN(sunSeconds)) {
        // Convert seconds to hours
        monthlyData[month].sun.push(sunSeconds / 3600);
      }
    }

    // Calculate averages for each month
    const result: MonthlyClimate[] = monthlyData.map((data, index) => {
      const avgTemp = data.temp.length > 0
        ? Math.round(data.temp.reduce((a, b) => a + b, 0) / data.temp.length)
        : 0;

      const avgSun = data.sun.length > 0
        ? Math.round(data.sun.reduce((a, b) => a + b, 0) / data.sun.length)
        : 0;

      return {
        month: MONTH_NAMES[index],
        temp: avgTemp,
        sun: avgSun,
      };
    });

    console.log(`[Weather] Successfully calculated averages for ${lat}, ${lng}`);
    return result;

  } catch (error) {
    console.error('[Weather] Failed to fetch climate data:', error);
    return [];
  }
}

/**
 * Cached version of climate data fetcher
 * Cache key based on rounded coordinates (to 2 decimal places)
 * Revalidates every week (604800 seconds)
 */
export const getClimateAverages = unstable_cache(
  fetchClimateAverages,
  ['climate-averages'],
  {
    revalidate: 604800, // 1 week
    tags: ['weather'],
  }
);
