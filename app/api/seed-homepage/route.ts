/**
 * SEED HOMEPAGE API ROUTE
 *
 * Populates Sanity CMS with the default homepage content.
 * Run via: GET /api/seed-homepage
 *
 * Requires SANITY_WRITE_TOKEN environment variable for mutations.
 */

import { createClient } from '@sanity/client';
import { NextResponse } from 'next/server';

// Create a write-capable Sanity client
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

// Homepage content to seed (from existing defaultData)
const homepageData = {
  _id: 'pageHome',
  _type: 'pageHome',

  // Hero Section
  heroTitle: 'The art of the\nMediterranean',
  heroSubtitle: 'Carefully chosen villas in beautiful locations.',
  heroLocationLabel: 'Villa Bacic, Dubrovnik',
  heroCtaText: 'Explore Villas',
  heroCtaLink: '/search',

  // USP Section
  uspSectionTitle: 'Why book with Vintage?',
  usps: [
    {
      _key: 'usp1',
      _type: 'usp',
      icon: 'map-pin',
      title: 'Reps in location',
      description: 'Our representatives are based in each destination, ensuring you have local support throughout your stay.',
      linkText: 'Learn More',
      linkUrl: '/about',
    },
    {
      _key: 'usp2',
      _type: 'usp',
      icon: 'search',
      title: 'Personally inspected',
      description: 'Every villa has been personally visited and carefully selected by our team of travel specialists.',
      linkText: 'Learn More',
      linkUrl: '/about',
    },
    {
      _key: 'usp3',
      _type: 'usp',
      icon: 'star',
      title: 'Expert knowledge',
      description: 'With over 30 years of experience, we provide insider tips and personalized recommendations.',
      linkText: 'Learn More',
      linkUrl: '/about',
    },
  ],

  // Collections Section
  collectionsSectionTitle: 'Our hottest collections',
  collectionsCtaText: 'Search All Villas',
  collectionsCtaLink: '/search',
  collections: [
    { _key: 'col1', _type: 'collection', title: 'Villas with a view', linkUrl: '/search?feature=view' },
    { _key: 'col2', _type: 'collection', title: 'Villas by the sea', linkUrl: '/search?feature=beachfront' },
    { _key: 'col3', _type: 'collection', title: 'Villas in Tuscany', linkUrl: '/villas-in-italy/tuscany' },
    { _key: 'col4', _type: 'collection', title: 'Family-friendly villas', linkUrl: '/search?feature=family' },
  ],

  // Destinations Section
  destinationsTitle: 'Where do you want to go?',

  // Call to Action Section
  ctaTitle: 'Book online or call... 01954 261 431',
  ctaDescription: 'Our UK-based team of specialists have visited all of our villas and can answer any questions you have or simply help you to book your villa, car hire and flights.',
  ctaPhoneNumber: '+441954261431',
  ctaPrimaryButtonText: 'Call Us',
  ctaSecondaryButtonText: 'Email Us',
  ctaSecondaryButtonLink: '/contact',

  // Villa Categories Section
  categoriesSectionSubtitle: 'Villas for X',
  categoriesSectionTitle: 'What are you looking for?',
  villaCategories: [
    { _key: 'cat1', _type: 'category', title: 'Family-friendly villas', description: 'Spacious villas with pools, games rooms, and child-safe features perfect for families.', linkUrl: '/search?feature=family' },
    { _key: 'cat2', _type: 'category', title: 'Villas for couples', description: 'Romantic retreats with private pools, stunning views, and intimate settings.', linkUrl: '/search?feature=couples' },
    { _key: 'cat3', _type: 'category', title: 'Large villas', description: 'Impressive properties with 5+ bedrooms, ideal for groups and celebrations.', linkUrl: '/search?beds=5' },
    { _key: 'cat4', _type: 'category', title: 'Car not essential', description: 'Walkable locations near beaches, restaurants, and local amenities.', linkUrl: '/search?feature=walkable' },
    { _key: 'cat5', _type: 'category', title: 'Villas near beaches', description: 'Properties within walking distance or a short drive to beautiful beaches.', linkUrl: '/search?feature=beach' },
    { _key: 'cat6', _type: 'category', title: 'Secluded villas', description: 'Private retreats offering peace, tranquility, and complete privacy.', linkUrl: '/search?feature=secluded' },
  ],

  // Testimonials Section
  testimonialsTitle: 'What our customers say',
  testimonialsAverageRating: 4.9,
  testimonialsReviewCount: 3845,
  testimonialsRatingSource: 'feefo',
  testimonials: [
    {
      _key: 'test1',
      _type: 'testimonial',
      author: 'Mrs Karen Reynolds',
      date: '14 September 2025',
      rating: 5,
      tagline: 'Excellent staff',
      quote: 'Excellent knowledgeable patient staff.',
    },
    {
      _key: 'test2',
      _type: 'testimonial',
      author: 'Mrs Karen Reynolds',
      date: '15 September 2025',
      rating: 5,
      tagline: 'Excellent and patient staff',
      quote: 'Excellent, helpful informative staff.',
    },
    {
      _key: 'test3',
      _type: 'testimonial',
      author: 'Mr Graham Thomas',
      date: '10 September 2025',
      rating: 5,
      tagline: 'Excellent',
      quote: 'Excellent service from start to finish.',
    },
    {
      _key: 'test4',
      _type: 'testimonial',
      author: 'Mr John Walker',
      date: '10 September 2025',
      rating: 5,
      tagline: 'Excellent',
      quote: 'Faultless booking experience.',
    },
  ],

  // Newsletter Section
  newsletterTitle: 'Sign up to our newsletter',
  newsletterDescription: 'Get exclusive offers, travel inspiration, and insider tips delivered straight to your inbox.',
  newsletterButtonText: 'Sign Me Up',

  // Featured Villas Section
  featuredVillasTitle: 'Featured Villas',

  // SEO
  seo: {
    metaTitle: 'Vintage Travel - Luxury Villa Rentals in the Mediterranean',
    metaDescription: 'Discover carefully chosen luxury villas in stunning Mediterranean locations. Expert knowledge, personal service, and 30+ years of experience.',
  },
};

export async function GET() {
  // Check for write token
  if (!process.env.SANITY_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error: 'SANITY_WRITE_TOKEN not configured',
        message: 'Add SANITY_WRITE_TOKEN to your .env.local file to enable seeding.',
        instructions: [
          '1. Go to https://www.sanity.io/manage',
          '2. Select your project (jhm6yd7l)',
          '3. Go to API → Tokens',
          '4. Create a new token with "Editor" permissions',
          '5. Add to .env.local: SANITY_WRITE_TOKEN=your_token_here',
          '6. Restart the dev server and try again',
        ],
        // Include the data so it can be manually entered if needed
        dataToSeed: homepageData,
      },
      { status: 400 }
    );
  }

  try {
    // Use createOrReplace to upsert the document
    const result = await writeClient.createOrReplace(homepageData);

    return NextResponse.json({
      success: true,
      message: 'Homepage content seeded successfully!',
      documentId: result._id,
      note: 'Images need to be uploaded manually through Sanity Studio.',
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed homepage',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
