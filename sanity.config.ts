/**
 * SANITY CMS CONFIGURATION
 * Main configuration file for Sanity Studio integration
 */

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
// Note: visionTool temporarily removed due to version compatibility
// import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemas';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  name: 'vintage-travel',
  title: 'Vintage Travel CMS',

  projectId,
  dataset,

  // Tell Sanity where the studio is mounted
  basePath: '/studio',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // === SINGLETONS ===
            S.listItem()
              .title('Homepage')
              .icon(() => '🏠')
              .child(
                S.document()
                  .schemaType('pageHome')
                  .documentId('pageHome')
              ),
            S.listItem()
              .title('About Page')
              .child(
                S.document()
                  .schemaType('aboutPage')
                  .documentId('aboutPage')
              ),
            S.listItem()
              .title('Essential Information')
              .child(
                S.document()
                  .schemaType('essentialInfoPage')
                  .documentId('essentialInfoPage')
              ),

            S.divider(),

            // === MEDIA-FIRST CONTENT ===
            S.listItem()
              .title('Villas')
              .icon(() => '🏡')
              .child(
                S.list()
                  .title('Villas')
                  .items([
                    S.listItem()
                      .title('All Villas')
                      .child(S.documentTypeList('villa').title('All Villas')),
                    S.listItem()
                      .title('Featured Villas')
                      .child(
                        S.documentList()
                          .title('Featured Villas')
                          .filter('_type == "villa" && isFeatured == true')
                      ),
                    S.listItem()
                      .title('Villas Without Photos')
                      .child(
                        S.documentList()
                          .title('Villas Without Photos')
                          .filter('_type == "villa" && count(gallery) == 0')
                      ),
                  ])
              ),

            S.listItem()
              .title('Locations')
              .icon(() => '📍')
              .child(
                S.list()
                  .title('Locations')
                  .items([
                    S.listItem()
                      .title('All Locations')
                      .child(S.documentTypeList('location').title('All Locations')),
                    S.listItem()
                      .title('Countries')
                      .child(
                        S.documentList()
                          .title('Countries')
                          .filter('_type == "location" && type == "country"')
                      ),
                    S.listItem()
                      .title('Regions')
                      .child(
                        S.documentList()
                          .title('Regions')
                          .filter('_type == "location" && type == "region"')
                      ),
                    S.listItem()
                      .title('Towns')
                      .child(
                        S.documentList()
                          .title('Towns')
                          .filter('_type == "location" && type == "town"')
                      ),
                  ])
              ),

            S.listItem()
              .title('Navigation')
              .icon(() => '🧭')
              .child(S.documentTypeList('navigation').title('Navigation Menus')),

            S.divider(),

            // === LEGACY (for migration) ===
            S.listItem()
              .title('Legacy: Destinations')
              .child(S.documentTypeList('destination').title('Destinations')),
            S.listItem()
              .title('Legacy: Regions')
              .child(S.documentTypeList('region').title('Regions')),
          ]),
    }),
    // Vision tool removed - will add back after upgrading to Sanity v4
    // visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
