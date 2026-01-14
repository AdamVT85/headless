/**
 * VILLA SCHEMA - Media & Marketing Container
 *
 * PURPOSE: Holds the images and text overrides for a Salesforce property.
 * This schema is the PRIMARY SOURCE for villa photography.
 *
 * DATA SPLIT:
 * - Sanity owns: Photos, Hero Images, SEO, Text Overrides
 * - Salesforce owns: ID, Name, Price, Availability, Room Counts
 */

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'villa',
  title: 'Villa',
  type: 'document',
  fields: [
    // === SALESFORCE BRIDGE ===
    defineField({
      name: 'salesforceId',
      title: 'Salesforce ID',
      type: 'string',
      description: 'The Property__c ID from Salesforce CRM. This links Sanity content to CRM data.',
      validation: (Rule) => Rule.required().error('Salesforce ID is required to link to CRM data'),
    }),

    // === CONTENT OVERRIDES ===
    defineField({
      name: 'title',
      title: 'Title Override',
      type: 'string',
      description: 'Optional: Override the villa name from Salesforce. Leave blank to use CRM name.',
    }),

    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      description: 'URL-friendly identifier. Generate from title or set manually.',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),

    defineField({
      name: 'introduction',
      title: 'Introduction',
      type: 'text',
      rows: 3,
      description: 'Short summary for search results and previews (150-200 characters ideal).',
      validation: (Rule) => Rule.max(300).warning('Keep introductions under 300 characters'),
    }),

    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  },
                ],
              },
            ],
          },
        },
      ],
      description: 'Full marketing description with rich text formatting.',
    }),

    // === PHOTOGRAPHY (PRIMARY SOURCE) ===
    defineField({
      name: 'gallery',
      title: 'Photo Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true, // Enable hotspot for responsive cropping
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
              description: 'Describe the image for accessibility and SEO.',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
              description: 'Optional caption to display with the image.',
            },
            {
              name: 'category',
              type: 'string',
              title: 'Category',
              options: {
                list: [
                  { title: 'Exterior', value: 'exterior' },
                  { title: 'Interior', value: 'interior' },
                  { title: 'Bedroom', value: 'bedroom' },
                  { title: 'Bathroom', value: 'bathroom' },
                  { title: 'Kitchen', value: 'kitchen' },
                  { title: 'Pool', value: 'pool' },
                  { title: 'Garden', value: 'garden' },
                  { title: 'View', value: 'view' },
                  { title: 'Dining', value: 'dining' },
                  { title: 'Living Area', value: 'living' },
                ],
              },
              description: 'Categorize images for filtering and organization.',
            },
          ],
        },
      ],
      description: 'CRITICAL: This is the PRIMARY SOURCE for villa photos. Upload high-quality images here.',
      validation: (Rule) => Rule.min(1).error('At least one photo is required'),
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
      description: 'Main hero image. If not set, the first gallery image will be used.',
    }),

    // === MARKETING FLAGS ===
    defineField({
      name: 'isFeatured',
      title: 'Featured Villa',
      type: 'boolean',
      description: 'Show this villa in featured sections on the homepage.',
      initialValue: false,
    }),

    defineField({
      name: 'isNewListing',
      title: 'New Listing',
      type: 'boolean',
      description: 'Mark as a new listing to highlight in search results.',
      initialValue: false,
    }),

    // === SEO ===
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'Override the page title for search engines (50-60 characters).',
          validation: (Rule) => Rule.max(70).warning('Keep under 70 characters'),
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 2,
          description: 'Description for search engine results (150-160 characters).',
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
      title: 'title',
      salesforceId: 'salesforceId',
      media: 'heroImage',
      galleryFirst: 'gallery.0',
      isFeatured: 'isFeatured',
    },
    prepare({ title, salesforceId, media, galleryFirst, isFeatured }) {
      return {
        title: title || `Villa ${salesforceId}`,
        subtitle: `${salesforceId}${isFeatured ? ' ⭐ Featured' : ''}`,
        media: media || galleryFirst,
      };
    },
  },

  // === ORDERING ===
  orderings: [
    {
      title: 'Featured First',
      name: 'featuredDesc',
      by: [
        { field: 'isFeatured', direction: 'desc' },
        { field: 'title', direction: 'asc' },
      ],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
});
