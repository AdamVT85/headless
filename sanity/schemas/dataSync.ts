/**
 * DATA SYNC SCHEMA
 *
 * Singleton document for managing data synchronization between
 * Salesforce and the local cache.
 *
 * Provides a UI in Sanity Studio to:
 * - View sync status
 * - Trigger manual facility sync
 */

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'dataSync',
  title: 'Data Sync',
  type: 'document',
  icon: () => '🔄',

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Data Synchronization',
      readOnly: true,
    }),

    defineField({
      name: 'facilitySyncInfo',
      title: 'Facility Sync Information',
      type: 'object',
      fields: [
        defineField({
          name: 'lastSyncedAt',
          title: 'Last Synced',
          type: 'datetime',
          description: 'When facilities were last synced from Salesforce',
          readOnly: true,
        }),
        defineField({
          name: 'lastSyncedBy',
          title: 'Synced By',
          type: 'string',
          description: 'Who triggered the last sync',
          readOnly: true,
        }),
        defineField({
          name: 'facilitiesCount',
          title: 'Total Facilities',
          type: 'number',
          description: 'Number of facilities in Salesforce',
          readOnly: true,
        }),
        defineField({
          name: 'villasWithFacilities',
          title: 'Villas with Facilities',
          type: 'number',
          description: 'Number of villas that have facility assignments',
          readOnly: true,
        }),
      ],
    }),

    defineField({
      name: 'syncNotes',
      title: 'Sync Notes',
      type: 'text',
      rows: 3,
      description: 'Optional notes about the sync (e.g., reason for manual sync)',
    }),
  ],

  preview: {
    select: {
      lastSynced: 'facilitySyncInfo.lastSyncedAt',
    },
    prepare({ lastSynced }) {
      return {
        title: 'Data Sync Settings',
        subtitle: lastSynced
          ? `Last synced: ${new Date(lastSynced).toLocaleString()}`
          : 'Never synced',
      };
    },
  },
});
