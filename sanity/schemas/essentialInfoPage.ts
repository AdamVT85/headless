/**
 * ESSENTIAL INFORMATION PAGE SINGLETON
 * Single document for managing the Essential Info page content
 * Uses accordion-style sections for organized information display
 */

import { defineType } from 'sanity';

export default defineType({
  name: 'essentialInfoPage',
  title: 'Essential Information Page',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
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
      name: 'introText',
      title: 'Intro Text',
      type: 'text',
      rows: 4,
      description: 'Brief introduction that appears below the hero',
    },
    {
      name: 'infoSections',
      title: 'Information Sections',
      type: 'array',
      description: 'Accordion-style sections with collapsible content',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'sectionTitle',
              title: 'Section Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'content',
              title: 'Content',
              type: 'array',
              of: [
                {
                  type: 'block',
                  styles: [
                    { title: 'Normal', value: 'normal' },
                    { title: 'H3', value: 'h3' },
                    { title: 'H4', value: 'h4' },
                    { title: 'Quote', value: 'blockquote' },
                  ],
                  lists: [
                    { title: 'Bullet', value: 'bullet' },
                    { title: 'Numbered', value: 'number' },
                  ],
                  marks: {
                    decorators: [
                      { title: 'Strong', value: 'strong' },
                      { title: 'Emphasis', value: 'em' },
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
            },
          ],
          preview: {
            select: {
              title: 'sectionTitle',
            },
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'heroImage',
    },
  },
});
