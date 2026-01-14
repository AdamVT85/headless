/**
 * VINTAGE TRAVEL - VILLA DATA TYPES
 *
 * HYBRID DATA MODEL:
 * - Static Content (Sanity CMS): name, slug, images, description, maxSleeps
 * - Dynamic Content (SFCC): pricePerWeek, calendar availability
 */

// ===== SANITY CMS TYPES (STATIC CONTENT) =====

export interface VillaImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface VillaContentFromSanity {
  id: string;
  sku: string; // SKU used to match with SFCC
  name: string;
  slug: string;
  images: VillaImage[];
  description: string;
  maxSleeps: number;
  region?: string;
  amenities?: string[];
}

// ===== SFCC TYPES (DYNAMIC CONTENT) =====

export type AvailabilityStatus = 'available' | 'booked' | 'hold';

export interface CalendarDate {
  date: string; // ISO 8601 format: YYYY-MM-DD
  status: AvailabilityStatus;
  pricePerNight?: number; // Optional: price can vary by date
}

export interface VillaAvailabilityFromSFCC {
  sku: string;
  pricePerWeek: number;
  calendar: CalendarDate[];
  lastUpdated: Date;
}

// ===== SALESFORCE CRM TYPES (REAL-TIME AVAILABILITY) =====

/**
 * Weekly Rate record from Salesforce
 * Represents a single week's availability and pricing
 */
export interface WeeklyRate {
  id: string; // Weekly_Rate__c.Id
  weekStartDate: Date; // WR_Week_Start_Date__c (Saturday changeover)
  price: number | null; // WR_Live_Sell_This_Year__c
  status: string; // WR_Status__c (e.g., 'Available', 'Booked')
  rawDateString: string; // Original date string from Salesforce for debugging
}

// ===== HYBRID VILLA TYPE =====

export interface Villa extends VillaContentFromSanity {
  availability?: VillaAvailabilityFromSFCC; // Optional: may not be loaded yet
}

// ===== BOOKING REQUEST TYPES =====

export interface BookingRequest {
  sku: string;
  startDate: Date;
  endDate: Date;
  guests?: number;
}

export interface BookingResponse {
  success: boolean;
  basketId?: string;
  error?: BookingError;
}

// ===== ERROR TYPES =====

export enum BookingErrorType {
  DATE_UNAVAILABLE = 'DATE_UNAVAILABLE',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  VILLA_NOT_FOUND = 'VILLA_NOT_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class DateUnavailableError extends Error {
  public readonly type = BookingErrorType.DATE_UNAVAILABLE;
  public readonly sku: string;
  public readonly startDate: Date;
  public readonly endDate: Date;

  constructor(sku: string, startDate: Date, endDate: Date, message?: string) {
    super(message || `Villa ${sku} is not available for ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    this.name = 'DateUnavailableError';
    this.sku = sku;
    this.startDate = startDate;
    this.endDate = endDate;
    Object.setPrototypeOf(this, DateUnavailableError.prototype);
  }
}

export interface BookingError {
  type: BookingErrorType;
  message: string;
  details?: unknown;
}

// ===== PHASE 43: CALENDAR WIDGET TYPES =====

/**
 * Simplified availability for calendar widget
 * Used for week-block selection UI
 */
export interface Availability {
  startDate: string; // ISO 8601 format: YYYY-MM-DD (Saturday)
  price: number; // Weekly rate price
  status: 'Available' | 'Booked' | 'Hold'; // Week status
}
