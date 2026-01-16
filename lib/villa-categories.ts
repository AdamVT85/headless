/**
 * VILLA CATEGORIES
 * Maps friendly URL slugs to search filter configurations
 * Used for SEO-friendly filtered search pages
 */

export interface VillaCategory {
  slug: string;
  title: string;
  description: string;
  filters: {
    facilities?: string[];
    minSleeps?: number;
    maxSleeps?: number;
  };
}

export const VILLA_CATEGORIES: VillaCategory[] = [
  {
    slug: 'family-friendly-villas',
    title: 'Family-Friendly Villas',
    description: 'Villas with children\'s pools and fenced pool areas, perfect for family holidays.',
    filters: {
      facilities: ["Children's Pool", "Fenced/Gated Pool"],
    },
  },
  {
    slug: 'villas-for-couples',
    title: 'Villas for Couples',
    description: 'Intimate villas ideal for romantic getaways and couples retreats.',
    filters: {
      maxSleeps: 4,
    },
  },
  {
    slug: 'large-villas',
    title: 'Large Villas',
    description: 'Spacious villas perfect for large groups and multi-family holidays.',
    filters: {
      minSleeps: 8,
    },
  },
  {
    slug: 'villas-with-sea-views',
    title: 'Villas with Sea Views',
    description: 'Stunning villas with breathtaking views of the Mediterranean.',
    filters: {
      facilities: ['Great Views'],
    },
  },
  {
    slug: 'beachside-villas',
    title: 'Beachside Villas',
    description: 'Villas within walking distance of beautiful beaches.',
    filters: {
      facilities: ['Beach - Walk (within 1.5km)'],
    },
  },
  {
    slug: 'secluded-villas',
    title: 'Secluded Villas',
    description: 'Private retreats offering total seclusion and tranquility.',
    filters: {
      facilities: ['Grounds offer TOTAL PRIVACY'],
    },
  },
  {
    slug: 'car-free-villas',
    title: 'Car-Free Villas',
    description: 'Villas where you can explore without needing a car.',
    filters: {
      facilities: ['Car NOT Essential'],
    },
  },
  {
    slug: 'villas-with-heated-pools',
    title: 'Villas with Heated Pools',
    description: 'Villas with heated swimming pools for year-round swimming.',
    filters: {
      facilities: ['Heated Pool'],
    },
  },
];

// Quick lookup by slug
export const CATEGORY_BY_SLUG: Record<string, VillaCategory> = Object.fromEntries(
  VILLA_CATEGORIES.map(cat => [cat.slug, cat])
);

// Get all category slugs for route matching
export const CATEGORY_SLUGS = VILLA_CATEGORIES.map(cat => cat.slug);

// Check if a slug is a known category
export function isVillaCategory(slug: string): boolean {
  return CATEGORY_BY_SLUG.hasOwnProperty(slug);
}

// Get category by slug
export function getVillaCategory(slug: string): VillaCategory | undefined {
  return CATEGORY_BY_SLUG[slug];
}
