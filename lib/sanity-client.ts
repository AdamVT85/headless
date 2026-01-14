/**
 * VINTAGE TRAVEL - MOCK SANITY CMS CLIENT
 *
 * Mock implementation of Sanity CMS client
 * In production, this would use @sanity/client and GROQ queries
 *
 * Returns STATIC content for villas (text, images, descriptions)
 * Does NOT return pricing or availability (that comes from SFCC)
 */

import {
  SanityVillaDocument,
  ProcessedSanityVilla,
  SanityBlock,
} from '@/types/sanity';

// ===== MOCK DATA STORE =====

const MOCK_VILLAS: SanityVillaDocument[] = [
  {
    _id: 'villa-conflict-doc',
    _type: 'villa',
    _createdAt: '2024-01-01T00:00:00Z',
    _updatedAt: '2024-01-15T00:00:00Z',

    // CRITICAL: This sfccId links to SFCC
    sfccId: 'villa-conflict-123',

    title: 'Villa Bella Vista',
    slug: {
      _type: 'slug',
      current: 'villa-bella-vista',
    },
    heroImage: {
      asset: {
        _ref: 'image-hero-bella-vista-1920x1080-jpg',
        _type: 'reference',
      },
      alt: 'Stunning hilltop villa with panoramic Mediterranean views',
    },
    gallery: [
      {
        asset: {
          _ref: 'image-gallery-bella-vista-1-jpg',
          _type: 'reference',
        },
        alt: 'Infinity pool overlooking the sea',
      },
      {
        asset: {
          _ref: 'image-gallery-bella-vista-2-jpg',
          _type: 'reference',
        },
        alt: 'Spacious open-plan living area',
      },
      {
        asset: {
          _ref: 'image-gallery-bella-vista-3-jpg',
          _type: 'reference',
        },
        alt: 'Master bedroom suite',
      },
    ],
    richDescription: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Experience unparalleled luxury at Villa Bella Vista, a stunning hilltop retreat offering breathtaking panoramic views of the Mediterranean coastline. This exquisite 5-bedroom villa combines modern elegance with traditional charm, featuring an infinity pool, private terraces, and meticulously landscaped gardens.',
            marks: [],
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Perfect for families or groups seeking privacy and sophistication, Villa Bella Vista includes a fully equipped gourmet kitchen, spacious living areas with floor-to-ceiling windows, and an outdoor dining pavilion ideal for al fresco meals under the stars.',
            marks: [],
          },
        ],
      },
    ],
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
    region: 'Amalfi Coast, Italy',
    maxGuests: 10,
    bedrooms: 5,
    bathrooms: 4,
    seoTitle: 'Villa Bella Vista - Luxury Amalfi Coast Villa Rental',
    seoDescription: 'Book Villa Bella Vista for an unforgettable Mediterranean escape. Stunning 5-bedroom luxury villa with infinity pool and panoramic sea views.',
    published: true,
  },
  {
    _id: 'villa-normal-doc',
    _type: 'villa',
    _createdAt: '2024-01-02T00:00:00Z',
    _updatedAt: '2024-01-16T00:00:00Z',

    sfccId: 'villa-normal-456',

    title: 'Casa del Sol',
    slug: {
      _type: 'slug',
      current: 'casa-del-sol',
    },
    heroImage: {
      asset: {
        _ref: 'image-hero-casa-sol-1920x1080-jpg',
        _type: 'reference',
      },
      alt: 'Charming Spanish villa with courtyard',
    },
    richDescription: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Discover the charm of Casa del Sol, a beautifully restored Spanish villa nestled in the heart of Andalusia. With its traditional architecture, private courtyard, and sun-drenched terraces, this 3-bedroom gem offers an authentic taste of southern Spanish living.',
            marks: [],
          },
        ],
      },
    ],
    amenities: [
      'Private Courtyard',
      'Air Conditioning',
      'WiFi',
      'Kitchen',
      'Terrace',
      'Village Location',
    ],
    region: 'Andalusia, Spain',
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    seoTitle: 'Casa del Sol - Authentic Spanish Villa in Andalusia',
    seoDescription: 'Experience authentic Andalusian charm at Casa del Sol. Traditional 3-bedroom villa with private courtyard in the heart of Spain.',
    published: true,
  },
];

// ===== HELPER FUNCTIONS =====

/**
 * Mock Sanity Image URL Builder
 * In production, this would use @sanity/image-url
 */
function buildImageUrl(imageRef: string, width: number = 1920): string {
  // Extract the asset ID from the reference
  const assetId = imageRef.replace('image-', '').replace(/-jpg$/, '');
  return `https://cdn.sanity.io/images/mock-project/production/${assetId}.jpg?w=${width}&q=80`;
}

/**
 * Convert Sanity blocks to plain text
 */
function blocksToPlainText(blocks?: SanityBlock[]): string {
  if (!blocks) return '';
  return blocks
    .map(block =>
      block.children
        .map(child => child.text)
        .join('')
    )
    .join('\n\n');
}

// ===== MOCK SANITY CLIENT =====

/**
 * Get villa by slug from Sanity CMS (MOCK)
 *
 * Returns STATIC content only (no pricing/availability)
 * Uses sfccId to link to SFCC commerce data
 *
 * @param slug - URL-friendly villa identifier
 * @returns Processed villa data or null if not found
 */
export async function getVillaBySlug(
  slug: string
): Promise<ProcessedSanityVilla | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50));

  // Find villa by slug
  const villa = MOCK_VILLAS.find(v => v.slug.current === slug);

  if (!villa) {
    return null;
  }

  // Process and return villa with resolved image URLs
  const processed: ProcessedSanityVilla = {
    _id: villa._id,
    _type: villa._type,
    sfccId: villa.sfccId,
    title: villa.title,
    slug: villa.slug.current,
    heroImageUrl: villa.heroImage
      ? buildImageUrl(villa.heroImage.asset._ref, 1920)
      : undefined,
    galleryImages: villa.gallery?.map(img => ({
      url: buildImageUrl(img.asset._ref, 1200),
      alt: img.alt,
    })),
    richDescription: villa.richDescription,
    amenities: villa.amenities,
    region: villa.region,
    maxGuests: villa.maxGuests,
    bedrooms: villa.bedrooms,
    bathrooms: villa.bathrooms,
    seoTitle: villa.seoTitle,
    seoDescription: villa.seoDescription,
  };

  return processed;
}

/**
 * Get all published villa slugs (for static generation)
 */
export async function getAllVillaSlugs(): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return MOCK_VILLAS
    .filter(v => v.published)
    .map(v => v.slug.current);
}

/**
 * Get villa by SFCC ID (reverse lookup)
 * Useful when you have SFCC data and need Sanity content
 */
export async function getVillaBySfccId(
  sfccId: string
): Promise<ProcessedSanityVilla | null> {
  await new Promise(resolve => setTimeout(resolve, 50));

  const villa = MOCK_VILLAS.find(v => v.sfccId === sfccId);

  if (!villa) {
    return null;
  }

  return getVillaBySlug(villa.slug.current);
}

/**
 * Convert rich description blocks to plain text
 * Useful for excerpts, meta descriptions, etc.
 */
export function richDescriptionToText(blocks?: SanityBlock[]): string {
  return blocksToPlainText(blocks);
}
