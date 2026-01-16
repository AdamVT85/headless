/**
 * VINTAGE TRAVEL - CENTRALIZED MOCK DATABASE
 *
 * Single Source of Truth for all villa data
 * Used by SFCC Mock, Sanity Mock, and Algolia Mock
 *
 * This prevents data inconsistencies across different API mocks
 */

// ===== VILLA MASTER DATA =====

export interface MockVilla {
  // Identifiers
  id: string;
  sfccId: string; // SKU for SFCC
  sanityId: string;
  slug: string;

  // Content (Sanity-style)
  title: string;
  name: string; // Alias for title (for search compatibility)
  region: string;
  country?: string; // Raw country field from CRM
  town?: string; // Town/locality
  address?: string; // PHASE 40: P_Address_Line_1__c - Physical address
  heroImageUrl: string;
  galleryImages: Array<{ url: string; alt: string }>;
  description: string; // PHASE 40: Maps to P_First_Para__c
  amenities: string[];

  // PHASE 40: Rich Text Content
  facilitySummary?: string; // P_Facility_Summary__c - Facilities description (HTML)
  followOnText?: string; // P_Follow_on_text__c - Additional text content (HTML)

  // Map coordinates (can be string or number from Salesforce)
  latitude?: number | string; // P_Map_Loc_Lat__c
  longitude?: number | string; // P_Map_Loc_Long__c

  // Capacity
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;

  // Commerce (SFCC-style)
  pricePerWeek: number | null;
  pricePerNight: number | null;
  bookedDates: string[]; // ISO format dates (YYYY-MM-DD)

  // Facilities (from Property_Facilities__c junction)
  facilities?: string[]; // Array of facility names

  // Status
  published: boolean;
}

// ===== MOCK DATABASE =====

export const MOCK_VILLAS: MockVilla[] = [
  // THE CONFLICT VILLA (from Phase 1)
  {
    id: '1',
    sfccId: 'villa-conflict-123',
    sanityId: 'villa-conflict-doc',
    slug: 'villa-bella-vista',

    title: 'Villa Bella Vista',
    name: 'Villa Bella Vista',
    region: 'Amalfi Coast, Italy',
    heroImageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1920&auto=format&fit=crop',
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1920&auto=format&fit=crop',
        alt: 'Modern Villa Exterior',
      },
      {
        url: 'https://images.unsplash.com/photo-1613977257377-2342d88a2e1d?q=80&w=1920&auto=format&fit=crop',
        alt: 'Pool Area',
      },
      {
        url: 'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=1920&auto=format&fit=crop',
        alt: 'Living Room',
      },
      {
        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1920&auto=format&fit=crop',
        alt: 'Bedroom',
      },
    ],
    description:
      'Experience unparalleled luxury at Villa Bella Vista, a stunning hilltop retreat offering breathtaking panoramic views of the Mediterranean coastline. This exquisite 5-bedroom villa combines modern elegance with traditional charm, featuring an infinity pool, private terraces, and meticulously landscaped gardens.',
    amenities: [
      'Infinity Pool',
      'Sea Views',
      'Air Conditioning',
      'WiFi',
      'Fully Equipped Kitchen',
      'BBQ Grill',
      'Private Parking',
      'Outdoor Dining',
      'Garden',
      'Smart TV',
    ],

    maxGuests: 10,
    bedrooms: 5,
    bathrooms: 4,

    pricePerWeek: 5000,
    pricePerNight: 714,

    // CRITICAL: These dates are BOOKED (for race condition testing)
    bookedDates: [
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
      '2026-06-04',
      '2026-06-05',
      '2026-06-06',
      '2026-06-07',
    ],

    published: true,
  },

  // NORMAL VILLA (from Phase 2)
  {
    id: '2',
    sfccId: 'villa-normal-456',
    sanityId: 'villa-normal-doc',
    slug: 'casa-del-sol',

    title: 'Casa del Sol',
    name: 'Casa del Sol',
    region: 'Andalusia, Spain',
    heroImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1920&auto=format&fit=crop',
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1920&auto=format&fit=crop',
        alt: 'Stone Villa Exterior',
      },
      {
        url: 'https://images.unsplash.com/photo-1595878715977-2a8f875148f3?q=80&w=1920&auto=format&fit=crop',
        alt: 'Garden',
      },
      {
        url: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=1920&auto=format&fit=crop',
        alt: 'Rustic Living Room',
      },
    ],
    description:
      'Discover the charm of Casa del Sol, a beautifully restored Spanish villa nestled in the heart of Andalusia. With its traditional architecture, private courtyard, and sun-drenched terraces, this 3-bedroom gem offers an authentic taste of southern Spanish living.',
    amenities: [
      'Private Courtyard',
      'Air Conditioning',
      'WiFi',
      'Kitchen',
      'Terrace',
      'Village Location',
    ],

    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,

    pricePerWeek: 2500,
    pricePerNight: 357,

    bookedDates: [], // All dates available

    published: true,
  },

  // SMALL VILLA (for filtering tests)
  {
    id: '3',
    sfccId: 'villa-small-789',
    sanityId: 'villa-small-doc',
    slug: 'petite-maison',

    title: 'Petite Maison',
    name: 'Petite Maison',
    region: 'Provence, France',
    heroImageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1920&auto=format&fit=crop',
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1920&auto=format&fit=crop',
        alt: 'Charming French Cottage',
      },
      {
        url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1920&auto=format&fit=crop',
        alt: 'Cozy Interior',
      },
    ],
    description:
      'A charming 2-bedroom cottage in the heart of Provence, perfect for couples or small families seeking an intimate French escape.',
    amenities: ['Garden', 'WiFi', 'Kitchen', 'Parking'],

    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,

    pricePerWeek: 1800,
    pricePerNight: 257,

    bookedDates: [],

    published: true,
  },

  // LARGE VILLA (for filtering tests)
  {
    id: '4',
    sfccId: 'villa-large-101',
    sanityId: 'villa-large-doc',
    slug: 'grand-chateau',

    title: 'Grand Chateau',
    name: 'Grand Chateau',
    region: 'Loire Valley, France',
    heroImageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1920&auto=format&fit=crop',
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1920&auto=format&fit=crop',
        alt: 'Grand Chateau Exterior',
      },
      {
        url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=1920&auto=format&fit=crop',
        alt: 'Elegant Interior',
      },
      {
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1920&auto=format&fit=crop',
        alt: 'Estate Grounds',
      },
    ],
    description:
      'A magnificent 8-bedroom chateau set in 5 acres of private grounds. Perfect for large groups, weddings, and special celebrations.',
    amenities: [
      'Private Pool',
      'Tennis Court',
      'Wine Cellar',
      'Chef Kitchen',
      'Event Space',
      'Gardens',
    ],

    maxGuests: 16,
    bedrooms: 8,
    bathrooms: 6,

    pricePerWeek: 12000,
    pricePerNight: 1714,

    bookedDates: [],

    published: true,
  },

  // PARTIALLY BOOKED VILLA (for date overlap testing)
  {
    id: '5',
    sfccId: 'villa-partial-202',
    sanityId: 'villa-partial-doc',
    slug: 'villa-azure',

    title: 'Villa Azure',
    name: 'Villa Azure',
    region: 'Amalfi Coast, Italy',
    heroImageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1920&auto=format&fit=crop',
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1920&auto=format&fit=crop',
        alt: 'Seaside Villa',
      },
      {
        url: 'https://images.unsplash.com/photo-1572331165267-854da2b00ca1?q=80&w=1920&auto=format&fit=crop',
        alt: 'Pool View',
      },
    ],
    description:
      'A stunning 4-bedroom villa with direct beach access and breathtaking coastal views.',
    amenities: ['Beach Access', 'Pool', 'WiFi', 'Air Conditioning', 'Kitchen'],

    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 3,

    pricePerWeek: 4200,
    pricePerNight: 600,

    // Booked in mid-June (different from conflict villa)
    bookedDates: [
      '2026-06-10',
      '2026-06-11',
      '2026-06-12',
      '2026-06-13',
      '2026-06-14',
      '2026-06-15',
      '2026-06-16',
    ],

    published: true,
  },
];

// ===== HELPER FUNCTIONS =====

/**
 * Get villa by SFCC ID
 */
export function getVillaBySfccId(sfccId: string): MockVilla | undefined {
  return MOCK_VILLAS.find((v) => v.sfccId === sfccId);
}

/**
 * Get villa by slug
 */
export function getVillaBySlug(slug: string): MockVilla | undefined {
  return MOCK_VILLAS.find((v) => v.slug === slug);
}

/**
 * Get all published villas
 */
export function getAllPublishedVillas(): MockVilla[] {
  return MOCK_VILLAS.filter((v) => v.published);
}

/**
 * Check if date range overlaps with booked dates
 * CRITICAL: This is the core logic for preventing double-bookings
 */
export function hasDateOverlap(
  bookedDates: string[],
  requestedStart: string,
  requestedEnd: string
): boolean {
  if (bookedDates.length === 0) return false;

  // Convert to Date objects for comparison
  const startDate = new Date(requestedStart);
  const endDate = new Date(requestedEnd);

  // Check if any booked date falls within the requested range
  return bookedDates.some((bookedDate) => {
    const date = new Date(bookedDate);
    return date >= startDate && date <= endDate;
  });
}

/**
 * Check if villa is available for date range
 */
export function isVillaAvailable(
  villa: MockVilla,
  startDate: string,
  endDate: string
): boolean {
  return !hasDateOverlap(villa.bookedDates, startDate, endDate);
}
