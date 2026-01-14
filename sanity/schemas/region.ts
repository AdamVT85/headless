/**
 * REGION SCHEMA
 * Represents specific regions within destinations (e.g., "Provence" in France, "Tuscany" in Italy)
 * Matches "Area" page in Adobe XD (Screen 3)
 */

import { defineType } from 'sanity';

export default defineType({
  name: 'region',
  title: 'Region',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Region Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g., "Provence", "Tuscany", "Algarve"',
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
      name: 'destination',
      title: 'Parent Destination',
      type: 'reference',
      to: [{ type: 'destination' }],
      validation: (Rule) => Rule.required(),
      description: 'The parent country/destination this region belongs to',
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
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
          },
        },
      ],
      description: 'Rich text description of the region',
    },
    {
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Key highlights or features of this region',
    },
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show as featured region on destination page',
      initialValue: false,
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Sort order within destination (lower numbers first)',
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
      subtitle: 'destination.name',
      media: 'heroImage',
    },
  },
});
