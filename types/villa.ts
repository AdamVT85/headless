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
 * WR_Group_of__c determines the max group size this rate applies to
 */
export interface WeeklyRate {
  id: string; // Weekly_Rate__c.Id
  weekStartDate: Date; // WR_Week_Start_Date__c (Saturday changeover)
  price: number | null; // WR_Live_Sell_This_Year__c
  status: string; // WR_Status__c (e.g., 'Available', 'Booked')
  groupOf: number | null; // WR_Group_of__c - max guests this rate applies to
  displayDailyRate: boolean; // WR_Display_Daily_rate__c - enables flexible day-by-day booking
  rawDateString: string; // Original date string from Salesforce for debugging
}

// ===== CMA COMPLIANCE: GUEST & PRICING TYPES =====

/**
 * Guest information for CMA-compliant pricing
 * Used to calculate tourist tax (age-dependent) and damage waiver
 */
export interface GuestInfo {
  adults: number; // Guests aged 18+
  children: number; // Guests under 18
  childAges: number[]; // Age of each child (for tourist tax calculation)
}

/**
 * CMA-compliant price breakdown
 * Shows true total cost upfront including all mandatory fees
 */
export interface PriceBreakdown {
  weeklyRate: number; // Villa rental for group size
  touristTax: number; // Per qualifying person per week
  damageWaiver: number; // Per person per week
  totalPerWeek: number; // All-inclusive weekly total
  totalPrice: number; // Grand total for entire stay
  weeks: number;
  touristTaxDetails: {
    qualifyingGuests: number;
    ratePerPerson: number;
    ageThreshold: number;
  };
  damageWaiverDetails: {
    totalGuests: number;
    ratePerPerson: number;
  };
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
