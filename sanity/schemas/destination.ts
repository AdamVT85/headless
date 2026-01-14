/**
 * DESTINATION SCHEMA
 * Represents high-level destinations (e.g., "Greece", "Italy", "Spain")
 * Matches "Locations" page in Adobe XD (Screen 2)
 */

import { defineType } from 'sanity';

export default defineType({
  name: 'destination',
  title: 'Destination',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Destination Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g., "Greece", "Italy", "Spain"',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        },
      ],
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'Brief description of the destination',
    },
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show on homepage as featured destination',
      initialValue: false,
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Sort order on Locations page (lower numbers first)',
      validation: (Rule) => Rule.integer().min(0),
    },
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'description',
      media: 'heroImage',
    },
  },
});
