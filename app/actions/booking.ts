/**
 * VINTAGE TRAVEL - BOOKING SERVER ACTIONS
 *
 * Next.js Server Actions for booking flow
 * Handles basket creation, item addition, and checkout redirect
 *
 * CRITICAL: Server-side validation prevents client-side manipulation
 */

'use server';

import {
  createBasket,
  addItemToBasket,
  getCheckoutUrl,
} from '@/lib/sfcc-client';
import { DateUnavailableError } from '@/types/villa';

// ===== TYPES =====

export interface BookingResult {
  success: boolean;
  checkoutUrl?: string;
  basketId?: string;
  error?: {
    type: 'INVENTORY_UNAVAILABLE' | 'BASKET_ERROR' | 'UNKNOWN_ERROR';
    message: string;
  };
}

// ===== SERVER ACTIONS =====

/**
 * Initiate booking flow - Server Action
 *
 * This orchestrates the complete booking process:
 * 1. Create a new basket
 * 2. Add the villa to the basket (with availability check)
 * 3. Generate checkout URL
 * 4. Return URL for client-side redirect
 *
 * CRITICAL: Re-checks availability server-side to prevent race conditions
 *
 * @param sku - Villa SKU
 * @param startDate - Check-in date (ISO format)
 * @param endDate - Check-out date (ISO format)
 * @returns Booking result with checkout URL or error
 */
export async function initiateBooking(
  sku: string,
  startDate: string,
  endDate: string
): Promise<BookingResult> {
  try {
    // Step 1: Create a new basket
    console.log(`[Booking] Creating basket for ${sku}...`);
    const basket = await createBasket();

    // Step 2: Add item to basket (with availability check)
    console.log(`[Booking] Adding item to basket ${basket.basketId}...`);
    const addItemResult = await addItemToBasket(
      basket.basketId,
      sku,
      startDate,
      endDate
    );

    // Check if item was added successfully
    if (!addItemResult.success) {
      return {
        success: false,
        error: {
          type: 'BASKET_ERROR',
          message: addItemResult.error?.message || 'Failed to add item to basket',
        },
      };
    }

    // Step 3: Generate checkout URL
    console.log(`[Booking] Generating checkout URL...`);
    const checkoutUrl = await getCheckoutUrl(basket.basketId);

    console.log(`[Booking] Success! Checkout URL: ${checkoutUrl}`);

    return {
      success: true,
      basketId: basket.basketId,
      checkoutUrl,
    };
  } catch (error) {
    // Handle DateUnavailableError (race condition)
    if (error instanceof DateUnavailableError) {
      console.log(`[Booking] Inventory unavailable: ${error.message}`);
      return {
        success: false,
        error: {
          type: 'INVENTORY_UNAVAILABLE',
          message: error.message,
        },
      };
    }

    // Handle other errors
    console.error('[Booking] Error:', error);
    return {
      success: false,
      error: {
        type: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
    };
  }
}

/**
 * Quick booking action (convenience wrapper)
 * Validates inputs and calls initiateBooking
 */
export async function quickBook(
  sku: string,
  startDate: string,
  endDate: string
): Promise<BookingResult> {
  // Validate inputs
  if (!sku || !startDate || !endDate) {
    return {
      success: false,
      error: {
        type: 'UNKNOWN_ERROR',
        message: 'Missing required fields',
      },
    };
  }

  // Validate date format
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
    return {
      success: false,
      error: {
        type: 'UNKNOWN_ERROR',
        message: 'Invalid date format',
      },
    };
  }

  // Validate date range
  if (endDateObj <= startDateObj) {
    return {
      success: false,
      error: {
        type: 'UNKNOWN_ERROR',
        message: 'End date must be after start date',
      },
    };
  }

  return initiateBooking(sku, startDate, endDate);
}
