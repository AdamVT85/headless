/**
 * LOCATION SCHEMA - Unified Destination
 *
 * PURPOSE: Unified schema for Countries, Regions, and Towns.
 * Supports hierarchical relationships (Town -> Region -> Country).
 *
 * DATA SPLIT:
 * - Sanity owns: Hero images, SEO content, marketing text
 * - Salesforce owns: Location IDs for property mapping
 */

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'location',
  title: 'Location',
  type: 'document',
  fields: [
    // === BASIC INFO ===
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Display name (e.g., "Kefalonia", "Greece", "Fiskardo").',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      description: 'URL-friendly identifier (auto-generated from title).',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'type',
      title: 'Location Type',
      type: 'string',
      options: {
        list: [
          { title: 'Country', value: 'country' },
          { title: 'Region', value: 'region' },
          { title: 'Town', value: 'town' },
        ],
        layout: 'radio',
      },
      description: 'What level of the location hierarchy is this?',
      validation: (Rule) => Rule.required(),
    }),

    // === SALESFORCE BRIDGE ===
    defineField({
      name: 'salesforceId',
      title: 'Salesforce ID',
      type: 'string',
      description: 'Location identifier from Salesforce CRM (e.g., P_Property_Location__c value).',
    }),

    // === HIERARCHY ===
    defineField({
      name: 'parent',
      title: 'Parent Location',
      type: 'reference',
      to: [{ type: 'location' }],
      description: 'Parent location in hierarchy (e.g., Region -> Country, Town -> Region).',
      options: {
        filter: ({ document }) => {
          // Only allow appropriate parent types
          const type = document?.type;
          if (type === 'region') {
            return { filter: 'type == "country"' };
          }
          if (type === 'town') {
            return { filter: 'type == "region" || type == "country"' };
          }
          return { filter: '_id == "none"' }; // Countries have no parent
        },
      },
    }),

    // === MEDIA ===
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
          description: 'Describe the image for accessibility.',
        },
      ],
      description: 'Main image for location landing pages.',
    }),

    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Smaller image for navigation menus and cards.',
    }),

    // === CONTENT ===
    defineField({
      name: 'introduction',
      title: 'Introduction',
      type: 'text',
      rows: 3,
      description: 'Short summary for search results and cards (150-200 characters).',
      validation: (Rule) => Rule.max(300).warning('Keep introductions under 300 characters'),
    }),

    defineField({
      name: 'content',
      title: 'Full Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Heading 4', value: 'h4' },
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
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
      description: 'SEO-friendly content for landing pages.',
    }),

    // === DISPLAY OPTIONS ===
    defineField({
      name: 'isPopular',
      title: 'Popular Destination',
      type: 'boolean',
      description: 'Highlight in navigation and featured sections.',
      initialValue: false,
    }),

    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Order in navigation menus (lower numbers appear first).',
      initialValue: 100,
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
          description: 'Override page title for search engines.',
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
      title: 'title',
      type: 'type',
      parentTitle: 'parent.title',
      media: 'heroImage',
      isPopular: 'isPopular',
    },
    prepare({ title, type, parentTitle, media, isPopular }) {
      const typeLabel = type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown';
      const parentInfo = parentTitle ? ` → ${parentTitle}` : '';
      return {
        title: `${title}${isPopular ? ' ⭐' : ''}`,
        subtitle: `${typeLabel}${parentInfo}`,
        media,
      };
    },
  },

  // === ORDERING ===
  orderings: [
    {
      title: 'Type then Title',
      name: 'typeTitle',
      by: [
        { field: 'type', direction: 'asc' },
        { field: 'sortOrder', direction: 'asc' },
        { field: 'title', direction: 'asc' },
      ],
    },
    {
      title: 'Sort Order',
      name: 'sortOrder',
      by: [{ field: 'sortOrder', direction: 'asc' }],
    },
    {
      title: 'Popular First',
      name: 'popularFirst',
      by: [
        { field: 'isPopular', direction: 'desc' },
        { field: 'title', direction: 'asc' },
      ],
    },
  ],
});
