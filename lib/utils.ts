/**
 * VINTAGE TRAVEL - UTILITY FUNCTIONS
 * Design system helpers for classname management
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence
 * Combines clsx for conditional classes with tailwind-merge for deduplication
 *
 * @param inputs - Class values to merge
 * @returns Merged and deduplicated class string
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-terracotta", "bg-clay")
 * // Returns: "px-4 py-2 bg-clay" (last bg class wins)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price value safely for display
 *
 * @param price - Price value (can be null)
 * @returns Formatted price string or "Call to Book" for null/zero prices
 */
export function formatWeeklyPrice(price: number | null | undefined): string {
  if (price == null || price === 0) {
    return 'Call to Book';
  }

  return `£${price.toLocaleString('en-GB')}`;
}
