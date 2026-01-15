/**
 * PAGE HOME SCHEMA - Homepage Singleton
 *
 * PURPOSE: Editable homepage content including all sections.
 * This is a singleton document (only one instance exists).
 */

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'pageHome',
  title: 'Homepage',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero Section' },
    { name: 'usp', title: 'USP Section' },
    { name: 'collections', title: 'Hottest Collections' },
    { name: 'destinations', title: 'Destinations' },
    { name: 'cta', title: 'Call to Action' },
    { name: 'categories', title: 'Villa Categories' },
    { name: 'testimonials', title: 'Testimonials' },
    { name: 'newsletter', title: 'Newsletter Signup' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // === HERO SECTION ===
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      description: 'Main headline on the homepage hero.',
      validation: (Rule) => Rule.required(),
      group: 'hero',
    }),

    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      rows: 2,
      description: 'Supporting text below the main headline.',
      group: 'hero',
    }),

    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
        },
      ],
      description: 'Background image for the hero section.',
      validation: (Rule) => Rule.required(),
      group: 'hero',
    }),

    defineField({
      name: 'heroLocationLabel',
      title: 'Hero Location Label',
      type: 'string',
      description: 'Location caption shown on the hero image (e.g., "Villa Bacic, Dubrovnik").',
      group: 'hero',
    }),

    defineField({
      name: 'heroCtaText',
      title: 'Hero CTA Text',
      type: 'string',
      description: 'Text for the main call-to-action button.',
      initialValue: 'Explore Villas',
      group: 'hero',
    }),

    defineField({
      name: 'heroCtaLink',
      title: 'Hero CTA Link',
      type: 'string',
      description: 'URL for the call-to-action button.',
      initialValue: '/search',
      group: 'hero',
    }),

    defineField({
      name: 'heroAwardBadges',
      title: 'Award Badges',
      type: 'array',
      group: 'hero',
      of: [
        {
          type: 'object',
          name: 'awardBadge',
          title: 'Award Badge',
          fields: [
            {
              name: 'image',
              title: 'Badge Image',
              type: 'image',
              options: { hotspot: true },
              validation: (Rule: any) => Rule.required(),
              description: 'Award or certification badge image (recommended: transparent PNG)',
            },
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'Accessibility description of the badge',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'link',
              title: 'Link URL',
              type: 'string',
              description: 'Optional link when badge is clicked',
            },
          ],
          preview: {
            select: {
              alt: 'alt',
              media: 'image',
            },
            prepare(selection) {
              const { alt, media } = selection;
              return {
                title: alt || 'Award Badge',
                media,
              };
            },
          },
        },
      ],
      description: 'Award badges displayed in the bottom-left of the hero section (recommended: 2 badges)',
      validation: (Rule) => Rule.max(4).warning('Consider showing 2-3 badges for best layout'),
    }),

    // === USP SECTION ===
    defineField({
      name: 'uspSectionTitle',
      title: 'USP Section Title',
      type: 'string',
      description: 'Heading for the USP section.',
      initialValue: 'Why book with Vintage?',
      group: 'usp',
    }),

    defineField({
      name: 'usps',
      title: 'Unique Selling Points',
      type: 'array',
      group: 'usp',
      of: [
        {
          type: 'object',
          name: 'usp',
          title: 'USP',
          fields: [
            {
              name: 'icon',
              title: 'Icon',
              type: 'string',
              options: {
                list: [
                  { title: 'Map Pin', value: 'map-pin' },
                  { title: 'Search', value: 'search' },
                  { title: 'Star', value: 'star' },
                  { title: 'Check Circle', value: 'check-circle' },
                  { title: 'Users', value: 'users' },
                  { title: 'Shield', value: 'shield' },
                  { title: 'Phone', value: 'phone' },
                  { title: 'Heart', value: 'heart' },
                  { title: 'Home', value: 'home' },
                  { title: 'Award', value: 'award' },
                ],
              },
            },
            {
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
            },
            {
              name: 'linkText',
              title: 'Link Text',
              type: 'string',
              initialValue: 'Learn More',
            },
            {
              name: 'linkUrl',
              title: 'Link URL',
              type: 'string',
              initialValue: '/about',
            },
          ],
          preview: {
            select: {
              title: 'title',
              icon: 'icon',
            },
            prepare(selection) {
              const { title, icon } = selection;
              return {
                title: title || 'Untitled USP',
                subtitle: icon || 'No icon',
              };
            },
          },
        },
      ],
      description: 'Key selling points displayed on the homepage.',
    }),

    // === HOTTEST COLLECTIONS ===
    defineField({
      name: 'collectionsSectionTitle',
      title: 'Collections Section Title',
      type: 'string',
      description: 'Heading for the collections section.',
      initialValue: 'Our hottest collections',
      group: 'collections',
    }),

    defineField({
      name: 'collections',
      title: 'Collections',
      type: 'array',
      group: 'collections',
      of: [
        {
          type: 'object',
          name: 'collection',
          title: 'Collection',
          fields: [
            {
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'linkUrl',
              title: 'Link URL',
              type: 'string',
              description: 'URL to navigate to when clicked.',
              initialValue: '/search',
            },
          ],
          preview: {
            select: {
              title: 'title',
              media: 'image',
            },
          },
        },
      ],
      description: 'Featured villa collection cards (recommended: 4 items).',
      validation: (Rule) => Rule.max(6).warning('Consider showing 4 collections for best layout'),
    }),

    defineField({
      name: 'collectionsCtaText',
      title: 'Collections CTA Text',
      type: 'string',
      description: 'Text for the button below collections.',
      initialValue: 'Search All Villas',
      group: 'collections',
    }),

    defineField({
      name: 'collectionsCtaLink',
      title: 'Collections CTA Link',
      type: 'string',
      description: 'URL for the collections CTA button.',
      initialValue: '/search',
      group: 'collections',
    }),

    // === DESTINATIONS SECTION ===
    defineField({
      name: 'destinationsTitle',
      title: 'Destinations Section Title',
      type: 'string',
      initialValue: 'Where do you want to go?',
      group: 'destinations',
    }),

    defineField({
      name: 'featuredDestinations',
      title: 'Featured Destinations',
      type: 'array',
      group: 'destinations',
      of: [
        {
          type: 'reference',
          to: [{ type: 'location' }],
          options: {
            filter: 'type == "country" || type == "region"',
          },
        },
      ],
      description: 'Countries or regions to highlight on the homepage.',
      validation: (Rule) => Rule.max(8).warning('Consider showing 4-6 destinations'),
    }),

    // === CALL TO ACTION SECTION ===
    defineField({
      name: 'ctaTitle',
      title: 'CTA Title',
      type: 'string',
      description: 'Main headline for the call-to-action section.',
      initialValue: 'Book online or call... 01954 261 431',
      group: 'cta',
    }),

    defineField({
      name: 'ctaDescription',
      title: 'CTA Description',
      type: 'text',
      rows: 3,
      description: 'Supporting text for the CTA section.',
      group: 'cta',
    }),

    defineField({
      name: 'ctaPhoneNumber',
      title: 'Phone Number',
      type: 'string',
      description: 'Phone number to display and link to.',
      initialValue: '+441954261431',
      group: 'cta',
    }),

    defineField({
      name: 'ctaBackgroundImage',
      title: 'CTA Background Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Background image for the CTA section.',
      group: 'cta',
    }),

    defineField({
      name: 'ctaPrimaryButtonText',
      title: 'Primary Button Text',
      type: 'string',
      initialValue: 'Call Us',
      group: 'cta',
    }),

    defineField({
      name: 'ctaSecondaryButtonText',
      title: 'Secondary Button Text',
      type: 'string',
      initialValue: 'Email Us',
      group: 'cta',
    }),

    defineField({
      name: 'ctaSecondaryButtonLink',
      title: 'Secondary Button Link',
      type: 'string',
      initialValue: '/contact',
      group: 'cta',
    }),

    // === VILLA CATEGORIES (Villas For X) ===
    defineField({
      name: 'categoriesSectionSubtitle',
      title: 'Categories Section Subtitle',
      type: 'string',
      description: 'Small italic text above the main title.',
      initialValue: 'Villas for X',
      group: 'categories',
    }),

    defineField({
      name: 'categoriesSectionTitle',
      title: 'Categories Section Title',
      type: 'string',
      description: 'Main heading for the categories section.',
      initialValue: 'What are you looking for?',
      group: 'categories',
    }),

    defineField({
      name: 'villaCategories',
      title: 'Villa Categories',
      type: 'array',
      group: 'categories',
      of: [
        {
          type: 'object',
          name: 'category',
          title: 'Category',
          fields: [
            {
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 2,
              description: 'Short description shown on hover.',
            },
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'linkUrl',
              title: 'Link URL',
              type: 'string',
              description: 'URL to navigate to when clicked.',
              initialValue: '/search',
            },
          ],
          preview: {
            select: {
              title: 'title',
              media: 'image',
            },
          },
        },
      ],
      description: 'Villa category cards (recommended: 6 items).',
      validation: (Rule) => Rule.max(9).warning('Consider showing 6 categories for best layout'),
    }),

    // === TESTIMONIALS SECTION ===
    defineField({
      name: 'testimonialsTitle',
      title: 'Testimonials Section Title',
      type: 'string',
      initialValue: 'What our customers say',
      group: 'testimonials',
    }),

    defineField({
      name: 'testimonialsAverageRating',
      title: 'Average Rating',
      type: 'number',
      description: 'Average customer rating (e.g., 4.9).',
      validation: (Rule) => Rule.min(0).max(5),
      initialValue: 4.9,
      group: 'testimonials',
    }),

    defineField({
      name: 'testimonialsReviewCount',
      title: 'Total Review Count',
      type: 'number',
      description: 'Total number of reviews.',
      initialValue: 3845,
      group: 'testimonials',
    }),

    defineField({
      name: 'testimonialsRatingSource',
      title: 'Rating Source',
      type: 'string',
      description: 'Source of the ratings (e.g., "feefo").',
      initialValue: 'feefo',
      group: 'testimonials',
    }),

    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      group: 'testimonials',
      of: [
        {
          type: 'object',
          name: 'testimonial',
          title: 'Testimonial',
          fields: [
            {
              name: 'tagline',
              title: 'Tagline',
              type: 'string',
              description: 'Short headline (e.g., "Excellent staff").',
            },
            {
              name: 'quote',
              title: 'Quote',
              type: 'text',
              rows: 3,
            },
            {
              name: 'author',
              title: 'Author Name',
              type: 'string',
            },
            {
              name: 'date',
              title: 'Date',
              type: 'string',
              description: 'Display date (e.g., "14 September 2025").',
            },
            {
              name: 'rating',
              title: 'Rating',
              type: 'number',
              options: {
                list: [1, 2, 3, 4, 5],
              },
              initialValue: 5,
            },
          ],
          preview: {
            select: {
              quote: 'quote',
              author: 'author',
              rating: 'rating',
            },
            prepare(selection) {
              const { quote, author, rating } = selection;
              const stars = rating ? '★'.repeat(rating as number) : '';
              const quoteText = quote as string | undefined;
              return {
                title: author || 'Anonymous',
                subtitle: `${stars} ${quoteText?.substring(0, 50) || ''}...`,
              };
            },
          },
        },
      ],
    }),

    // === NEWSLETTER SIGNUP SECTION ===
    defineField({
      name: 'newsletterTitle',
      title: 'Newsletter Title',
      type: 'string',
      initialValue: 'Sign up to our newsletter',
      group: 'newsletter',
    }),

    defineField({
      name: 'newsletterDescription',
      title: 'Newsletter Description',
      type: 'text',
      rows: 2,
      description: 'Supporting text for the newsletter signup.',
      group: 'newsletter',
    }),

    defineField({
      name: 'newsletterBackgroundImage',
      title: 'Newsletter Background Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Background image for the newsletter section.',
      group: 'newsletter',
    }),

    defineField({
      name: 'newsletterButtonText',
      title: 'Newsletter Button Text',
      type: 'string',
      initialValue: 'Sign Me Up',
      group: 'newsletter',
    }),

    // === FEATURED VILLAS (optional - for explicit curation) ===
    defineField({
      name: 'featuredVillasTitle',
      title: 'Featured Villas Section Title',
      type: 'string',
      description: 'Heading for the featured villas section (if used).',
      initialValue: 'Featured Villas',
      group: 'collections',
    }),

    defineField({
      name: 'featuredVillas',
      title: 'Featured Villas',
      type: 'array',
      group: 'collections',
      of: [
        {
          type: 'reference',
          to: [{ type: 'villa' }],
        },
      ],
      description: 'Hand-picked villas to showcase on the homepage.',
      validation: (Rule) => Rule.max(12).warning('Consider showing 4-8 villas for best UX'),
    }),

    // === SEO ===
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      group: 'seo',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'Page title for search engines.',
          validation: (Rule) => Rule.max(70).warning('Keep under 70 characters'),
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 2,
          description: 'Description for search engine results.',
          validation: (Rule) => Rule.max(160).warning('Keep under 160 characters'),
        },
      ],
      options: {
        collapsible: true,
        collapsed: true,
      },
    }),
  ],

  // === PREVIEW ===
  preview: {
    select: {
      title: 'heroTitle',
      media: 'heroImage',
    },
    prepare({ title, media }) {
      return {
        title: 'Homepage',
        subtitle: title || 'No hero title set',
        media,
      };
    },
  },
});
