/**
 * NAVIGATION SCHEMA - Global Menu
 *
 * PURPOSE: Fully editable main navigation menu.
 * Supports nested dropdowns and various link types.
 */

import { defineType, defineField, defineArrayMember } from 'sanity';

// === NAVIGATION ITEM TYPE (for nested structure) ===
const navigationItem = defineType({
  name: 'navigationItem',
  title: 'Navigation Item',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Display text for the menu item.',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'linkType',
      title: 'Link Type',
      type: 'string',
      options: {
        list: [
          { title: 'Internal Page', value: 'internal' },
          { title: 'Location Reference', value: 'location' },
          { title: 'External URL', value: 'external' },
          { title: 'Dropdown Only (no link)', value: 'dropdown' },
        ],
        layout: 'radio',
      },
      initialValue: 'internal',
    }),

    defineField({
      name: 'internalLink',
      title: 'Internal Link',
      type: 'string',
      description: 'Path to internal page (e.g., "/search", "/about").',
      hidden: ({ parent }) => parent?.linkType !== 'internal',
    }),

    defineField({
      name: 'locationRef',
      title: 'Location Reference',
      type: 'reference',
      to: [{ type: 'location' }],
      description: 'Link to a location page.',
      hidden: ({ parent }) => parent?.linkType !== 'location',
    }),

    defineField({
      name: 'externalUrl',
      title: 'External URL',
      type: 'url',
      description: 'Full URL including https://',
      hidden: ({ parent }) => parent?.linkType !== 'external',
    }),

    defineField({
      name: 'openInNewTab',
      title: 'Open in New Tab',
      type: 'boolean',
      description: 'Open external links in a new browser tab.',
      initialValue: true,
      hidden: ({ parent }) => parent?.linkType !== 'external',
    }),

    defineField({
      name: 'children',
      title: 'Dropdown Items',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'childItem',
          title: 'Child Item',
          fields: [
            {
              name: 'label',
              title: 'Label',
              type: 'string',
            },
            {
              name: 'linkType',
              title: 'Link Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Internal Page', value: 'internal' },
                  { title: 'Location Reference', value: 'location' },
                  { title: 'External URL', value: 'external' },
                ],
              },
              initialValue: 'internal',
            },
            {
              name: 'internalLink',
              title: 'Internal Link',
              type: 'string',
              hidden: ({ parent }: { parent?: { linkType?: string } }) => parent?.linkType !== 'internal',
            },
            {
              name: 'locationRef',
              title: 'Location Reference',
              type: 'reference',
              to: [{ type: 'location' }],
              hidden: ({ parent }: { parent?: { linkType?: string } }) => parent?.linkType !== 'location',
            },
            {
              name: 'externalUrl',
              title: 'External URL',
              type: 'url',
              hidden: ({ parent }: { parent?: { linkType?: string } }) => parent?.linkType !== 'external',
            },
            {
              name: 'description',
              title: 'Description',
              type: 'string',
              description: 'Optional description shown in mega menu.',
            },
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              description: 'Optional image for mega menu display.',
              options: { hotspot: true },
            },
          ],
          preview: {
            select: {
              title: 'label',
              linkType: 'linkType',
              media: 'image',
            },
            prepare(selection) {
              const { title, linkType, media } = selection;
              return {
                title: title || 'Untitled',
                subtitle: linkType || 'No link type',
                media,
              };
            },
          },
        },
      ],
      description: 'Nested menu items for dropdowns.',
    }),

    defineField({
      name: 'isMegaMenu',
      title: 'Mega Menu Style',
      type: 'boolean',
      description: 'Display children in a wide mega menu layout.',
      initialValue: false,
    }),

    defineField({
      name: 'highlightStyle',
      title: 'Highlight Style',
      type: 'string',
      options: {
        list: [
          { title: 'Normal', value: 'normal' },
          { title: 'Primary Button', value: 'primary' },
          { title: 'Secondary Button', value: 'secondary' },
        ],
      },
      initialValue: 'normal',
      description: 'Visual style for this menu item.',
    }),
  ],
  preview: {
    select: {
      title: 'label',
      linkType: 'linkType',
      childCount: 'children.length',
    },
    prepare({ title, linkType, childCount }) {
      const hasChildren = childCount && childCount > 0;
      return {
        title: title || 'Untitled',
        subtitle: `${linkType || 'No link'}${hasChildren ? ` • ${childCount} children` : ''}`,
      };
    },
  },
});

// === MAIN NAVIGATION DOCUMENT ===
const navigation = defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Menu Name',
      type: 'string',
      description: 'Internal name for this navigation menu.',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'identifier',
      title: 'Identifier',
      type: 'string',
      description: 'Unique key to fetch this menu (e.g., "main-nav", "footer-nav").',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'items',
      title: 'Menu Items',
      type: 'array',
      of: [{ type: 'navigationItem' }],
      description: 'Top-level navigation items.',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      identifier: 'identifier',
      itemCount: 'items.length',
    },
    prepare({ title, identifier, itemCount }) {
      return {
        title: title || 'Untitled Menu',
        subtitle: `${identifier || 'No ID'} • ${itemCount || 0} items`,
      };
    },
  },
});

// Export both types
export { navigationItem };
export default navigation;
