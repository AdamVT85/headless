/**
 * VINTAGE TRAVEL - BOOKING & COMMERCE CLIENT
 *
 * NOTE: This is now a COMMERCE LAYER that integrates with CRM
 * CRM provides villa content and availability (via crm-client.ts)
 * This file provides booking/basket/checkout functionality
 *
 * In production, this would integrate with your actual commerce platform
 * (Stripe, Commerce Tools, custom booking system, etc.)
 */

import {
  getVillaBySfccId,
  isVillaAvailable,
  hasDateOverlap,
  MockVilla,
} from '@/lib/mock-db';
import {
  VillaAvailabilityFromSFCC,
  CalendarDate,
  AvailabilityStatus,
  BookingRequest,
  BookingResponse,
  DateUnavailableError,
} from '@/types/villa';
import { getVillaAvailability as getCRMAvailability } from '@/lib/crm-client';
import { eachDayOfInterval, parseISO, format as formatDate } from 'date-fns';

// ===== BASKET TYPES =====

export interface Basket {
  basketId: string;
  items: BasketItem[];
  total: number;
  currency: string;
  createdAt: Date;
  status: 'open' | 'checkout' | 'completed';
}

export interface BasketItem {
  itemId: string;
  sku: string;
  villaName: string;
  startDate: string;
  endDate: string;
  nights: number;
  pricePerNight: number;
  totalPrice: number;
  addedAt: Date;
}

export interface AddItemToBasketResponse {
  success: boolean;
  basket?: Basket;
  error?: {
    type: string;
    message: string;
  };
}

// In-memory basket storage (would be Redis/database in production)
const BASKETS = new Map<string, Basket>();

// ===== AVAILABILITY FUNCTIONS =====

/**
 * Get villa availability from CRM (Salesforce Weekly_Rate__c)
 * Transforms weekly rates into daily calendar format for the booking widget
 */
export async function getVillaAvailability(
  sku: string,
  startDate: Date,
  endDate: Date
): Promise<VillaAvailabilityFromSFCC> {
  console.log(`[SFCC] Fetching availability for ${sku} from ${formatDate(startDate, 'yyyy-MM-dd')} to ${formatDate(endDate, 'yyyy-MM-dd')}`);

  // Fetch weekly rates from CRM
  const weeklyRates = await getCRMAvailability(sku);

  console.log(`[SFCC] Got ${weeklyRates.length} weekly rates from CRM`);

  // If no rates found, return empty calendar (all unavailable)
  if (weeklyRates.length === 0) {
    console.warn(`[SFCC] No weekly rates found for ${sku}`);
    const calendar: CalendarDate[] = eachDayOfInterval({ start: startDate, end: endDate }).map(date => ({
      date: formatDate(date, 'yyyy-MM-dd'),
      status: 'booked' as AvailabilityStatus,
      pricePerNight: 0,
    }));

    return {
      sku,
      pricePerWeek: 0,
      calendar,
      lastUpdated: new Date(),
    };
  }

  // Create a map of week start dates to their rates and status
  const weeklyRateMap = new Map<string, { price: number | null; status: string }>();
  weeklyRates.forEach(rate => {
    const weekStart = formatDate(rate.weekStartDate, 'yyyy-MM-dd');
    weeklyRateMap.set(weekStart, {
      price: rate.price,
      status: rate.status
    });
  });

  // Generate daily calendar for the requested date range
  const calendar: CalendarDate[] = [];
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  for (const day of allDays) {
    const dayStr = formatDate(day, 'yyyy-MM-dd');

    // Find which weekly rate period this day falls into
    let dailyPrice = 0;
    let dailyStatus: AvailabilityStatus = 'booked'; // Default to booked if no rate found

    // Check each weekly rate to see if this day falls within that week
    for (const [weekStart, rateInfo] of weeklyRateMap.entries()) {
      const weekStartDate = parseISO(weekStart);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 7); // Week is 7 days

      if (day >= weekStartDate && day < weekEndDate) {
        // Day falls within this week's rate period
        dailyPrice = rateInfo.price !== null ? Math.round(rateInfo.price / 7) : 0; // Weekly price / 7 days

        // Map Salesforce status to our availability status
        // Available if status is "Available" or similar
        dailyStatus = rateInfo.status.toLowerCase().includes('available') ? 'available' : 'booked';
        break;
      }
    }

    calendar.push({
      date: dayStr,
      status: dailyStatus,
      pricePerNight: dailyStatus === 'available' ? dailyPrice : 0,
    });
  }

  // Calculate average weekly price from available dates
  const availableDates = calendar.filter(d => d.status === 'available');
  const avgPricePerNight = availableDates.length > 0
    ? availableDates.reduce((sum, d) => sum + (d.pricePerNight || 0), 0) / availableDates.length
    : 0;
  const pricePerWeek = Math.round(avgPricePerNight * 7);

  console.log(`[SFCC] Generated calendar with ${calendar.length} days, ${availableDates.length} available, avg price per week: £${pricePerWeek}`);

  return {
    sku,
    pricePerWeek,
    calendar,
    lastUpdated: new Date(),
  };
}

/**
 * Legacy function for backward compatibility
 */
export async function addToBasket(
  request: BookingRequest
): Promise<BookingResponse> {
  await new Promise(resolve => setTimeout(resolve, 150));

  const { sku, startDate, endDate } = request;
  const availability = await getVillaAvailability(sku, startDate, endDate);

  const hasBooked = availability.calendar.some(date => date.status === 'booked');
  if (hasBooked) {
    throw new DateUnavailableError(
      sku,
      startDate,
      endDate,
      'Someone just booked this date. Please select different dates.'
    );
  }

  const basketId = `basket-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

  return {
    success: true,
    basketId,
  };
}

// ===== BASKET MANAGEMENT =====

export async function createBasket(): Promise<Basket> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const basketId = `basket-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

  const basket: Basket = {
    basketId,
    items: [],
    total: 0,
    currency: 'GBP',
    createdAt: new Date(),
    status: 'open',
  };

  BASKETS.set(basketId, basket);
  return basket;
}

export async function addItemToBasket(
  basketId: string,
  sku: string,
  startDate: string,
  endDate: string
): Promise<AddItemToBasketResponse> {
  await new Promise(resolve => setTimeout(resolve, 150));

  const basket = BASKETS.get(basketId);
  if (!basket) {
    return {
      success: false,
      error: {
        type: 'BASKET_NOT_FOUND',
        message: 'Basket not found',
      },
    };
  }

  if (basket.status !== 'open') {
    return {
      success: false,
      error: {
        type: 'BASKET_CLOSED',
        message: 'Basket is no longer open',
      },
    };
  }

  const villa = getVillaBySfccId(sku);
  if (!villa) {
    return {
      success: false,
      error: {
        type: 'VILLA_NOT_FOUND',
        message: 'Villa not found',
      },
    };
  }

  const available = isVillaAvailable(villa, startDate, endDate);
  if (!available) {
    throw new DateUnavailableError(
      sku,
      new Date(startDate),
      new Date(endDate),
      'Sorry, this villa was just booked by another guest. Please select different dates.'
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const totalPrice = (villa.pricePerNight ?? 0) * nights;

  const itemId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const item: BasketItem = {
    itemId,
    sku,
    villaName: villa.title,
    startDate,
    endDate,
    nights,
    pricePerNight: villa.pricePerNight ?? 0,
    totalPrice,
    addedAt: new Date(),
  };

  basket.items.push(item);
  basket.total = basket.items.reduce((sum, item) => sum + item.totalPrice, 0);
  BASKETS.set(basketId, basket);

  return {
    success: true,
    basket,
  };
}

export async function getBasket(basketId: string): Promise<Basket | null> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return BASKETS.get(basketId) || null;
}

export async function getCheckoutUrl(basketId: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 50));

  const basket = BASKETS.get(basketId);
  if (!basket) {
    throw new Error('Basket not found');
  }

  basket.status = 'checkout';
  BASKETS.set(basketId, basket);

  return `https://checkout.vintagetravel.co.uk/secure/start?basketId=${basketId}&total=${basket.total}&currency=${basket.currency}`;
}

export async function checkVillaExists(sku: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 50));
  // In mock mode, all villas "exist" for testing purposes
  return true;
}

export function clearBaskets(): void {
  BASKETS.clear();
}
