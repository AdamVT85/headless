/**
 * HOMEPAGE SANITY QUERIES
 * GROQ queries and TypeScript types for the homepage
 */

import { client, urlFor } from '../sanity.client';

// TypeScript types for homepage data
export interface AwardBadge {
  _key: string;
  image: SanityImage;
  alt: string;
  link?: string;
}

export interface HomePageData {
  // Hero
  heroTitle: string;
  heroSubtitle?: string;
  heroImage?: SanityImage;
  heroLocationLabel?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
  heroAwardBadges?: AwardBadge[];

  // USP Section
  uspSectionTitle?: string;
  usps?: USP[];

  // Collections
  collectionsSectionTitle?: string;
  collections?: Collection[];
  collectionsCtaText?: string;
  collectionsCtaLink?: string;

  // Destinations
  destinationsTitle?: string;
  featuredDestinations?: FeaturedDestination[];

  // CTA Section
  ctaTitle?: string;
  ctaDescription?: string;
  ctaPhoneNumber?: string;
  ctaBackgroundImage?: SanityImage;
  ctaPrimaryButtonText?: string;
  ctaSecondaryButtonText?: string;
  ctaSecondaryButtonLink?: string;

  // Villa Categories
  categoriesSectionSubtitle?: string;
  categoriesSectionTitle?: string;
  villaCategories?: VillaCategory[];

  // Testimonials
  testimonialsTitle?: string;
  testimonialsAverageRating?: number;
  testimonialsReviewCount?: number;
  testimonialsRatingSource?: string;
  testimonials?: Testimonial[];

  // Newsletter
  newsletterTitle?: string;
  newsletterDescription?: string;
  newsletterBackgroundImage?: SanityImage;
  newsletterButtonText?: string;

  // Featured Villas
  featuredVillasTitle?: string;
  featuredVillas?: FeaturedVilla[];

  // SEO
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

export interface SanityImage {
  _type: 'image';
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

export interface USP {
  _key: string;
  icon?: string;
  title: string;
  description?: string;
  linkText?: string;
  linkUrl?: string;
}

export interface Collection {
  _key: string;
  title: string;
  image?: SanityImage;
  linkUrl?: string;
}

export interface FeaturedDestination {
  _id: string;
  title: string;
  slug: { current: string };
  type: 'country' | 'region' | 'town';
  heroImage?: SanityImage;
  thumbnail?: SanityImage;
  introduction?: string;
}

export interface VillaCategory {
  _key: string;
  title: string;
  description?: string;
  image?: SanityImage;
  linkUrl?: string;
}

export interface Testimonial {
  _key: string;
  tagline?: string;
  quote?: string;
  author?: string;
  date?: string;
  rating?: number;
}

export interface FeaturedVilla {
  _id: string;
  title?: string;
  salesforceId: string;
  slug?: { current: string };
  heroImage?: SanityImage;
  gallery?: SanityImage[];
  introduction?: string;
}

// GROQ query for homepage
export const homepageQuery = `*[_type == "pageHome"][0]{
  // Hero
  heroTitle,
  heroSubtitle,
  heroImage,
  heroLocationLabel,
  heroCtaText,
  heroCtaLink,
  heroAwardBadges[]{
    _key,
    image,
    alt,
    link
  },

  // USP Section
  uspSectionTitle,
  usps[]{
    _key,
    icon,
    title,
    description,
    linkText,
    linkUrl
  },

  // Collections
  collectionsSectionTitle,
  collections[]{
    _key,
    title,
    image,
    linkUrl
  },
  collectionsCtaText,
  collectionsCtaLink,

  // Destinations
  destinationsTitle,
  featuredDestinations[]->{
    _id,
    title,
    slug,
    type,
    heroImage,
    thumbnail,
    introduction
  },

  // CTA Section
  ctaTitle,
  ctaDescription,
  ctaPhoneNumber,
  ctaBackgroundImage,
  ctaPrimaryButtonText,
  ctaSecondaryButtonText,
  ctaSecondaryButtonLink,

  // Villa Categories
  categoriesSectionSubtitle,
  categoriesSectionTitle,
  villaCategories[]{
    _key,
    title,
    description,
    image,
    linkUrl
  },

  // Testimonials
  testimonialsTitle,
  testimonialsAverageRating,
  testimonialsReviewCount,
  testimonialsRatingSource,
  testimonials[]{
    _key,
    tagline,
    quote,
    author,
    date,
    rating
  },

  // Newsletter
  newsletterTitle,
  newsletterDescription,
  newsletterBackgroundImage,
  newsletterButtonText,

  // Featured Villas
  featuredVillasTitle,
  featuredVillas[]->{
    _id,
    title,
    salesforceId,
    slug,
    heroImage,
    gallery,
    introduction
  },

  // SEO
  seo
}`;

// Fetch function
export async function getHomepageData(): Promise<HomePageData | null> {
  try {
    const data = await client.fetch<HomePageData>(homepageQuery, {}, {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    return data;
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return null;
  }
}

// Query for destination tab content (8 countries)
const destinationCountriesQuery = `*[_type == "location" && type == "country"]{
  _id,
  title,
  "slug": slug.current,
  heroImage,
  introduction,
  content
}`;

export interface DestinationCountry {
  _id: string;
  title: string;
  slug: string;
  heroImage?: SanityImage;
  introduction?: string;
}

// Fetch destination countries for tabs
export async function getDestinationCountries(): Promise<DestinationCountry[]> {
  try {
    const data = await client.fetch<DestinationCountry[]>(destinationCountriesQuery, {}, {
      next: { revalidate: 60 }
    });
    return data || [];
  } catch (error) {
    console.error('Error fetching destination countries:', error);
    return [];
  }
}

// Helper to get image URL with proper typing
export function getImageUrl(image: SanityImage | undefined, width?: number): string | null {
  if (!image?.asset) return null;

  let builder = urlFor(image);
  if (width) {
    builder = builder.width(width);
  }
  return builder.url();
}
