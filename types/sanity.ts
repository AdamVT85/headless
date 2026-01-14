/**
 * VINTAGE TRAVEL - SANITY CMS SCHEMA DEFINITIONS
 *
 * This file defines the shape of documents stored in Sanity CMS.
 * These are TypeScript representations of the Sanity schema.
 *
 * CRITICAL: sfccId is the FOREIGN KEY that links Sanity content to SFCC commerce data
 */

// ===== BASE SANITY TYPES =====

export interface SanityImage {
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

export interface SanitySlug {
  _type: 'slug';
  current: string;
}

export interface SanityBlock {
  _type: 'block';
  children: Array<{
    _type: 'span';
    text: string;
    marks?: string[];
  }>;
  style?: string;
  markDefs?: unknown[];
}

// ===== VILLA DOCUMENT SCHEMA =====

/**
 * Villa Document in Sanity CMS
 *
 * This is the main content document for a luxury villa.
 * It contains all STATIC content (text, images, descriptions)
 * but NO pricing or availability (that comes from SFCC via sfccId)
 */
export interface SanityVillaDocument {
  _id: string;
  _type: 'villa';
  _createdAt: string;
  _updatedAt: string;

  // CRITICAL: Foreign key to SFCC
  // This links the content (Sanity) to the commerce data (SFCC)
  sfccId: string;

  // Core content fields
  title: string;
  slug: SanitySlug;
  heroImage?: SanityImage;
  gallery?: SanityImage[];

  // Rich text description
  richDescription?: SanityBlock[];

  // Structured data
  amenities?: string[];
  region?: string;
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;

  // SEO
  seoTitle?: string;
  seoDescription?: string;

  // Status
  published?: boolean;
}

// ===== PROCESSED/HYDRATED TYPES =====

/**
 * Villa with processed image URLs
 * (After image refs are resolved to actual URLs)
 */
export interface ProcessedSanityVilla {
  _id: string;
  _type: 'villa';
  sfccId: string;
  title: string;
  slug: string;
  heroImageUrl?: string;
  galleryImages?: Array<{
    url: string;
    alt?: string;
  }>;
  richDescription?: SanityBlock[];
  amenities?: string[];
  region?: string;
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  seoTitle?: string;
  seoDescription?: string;
}

// ===== HELPER TYPES =====

/**
 * Sanity Image URL Builder Config
 */
export interface SanityImageUrlConfig {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpg' | 'png' | 'webp';
  fit?: 'clip' | 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'min';
}

/**
 * Rich text to plain text conversion result
 */
export type PlainText = string;
