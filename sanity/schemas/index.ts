/**
 * SANITY SCHEMAS INDEX
 * Central export for all content schemas
 *
 * MEDIA-FIRST HYBRID MODEL:
 * - Sanity owns: Photos, Hero Images, SEO, Text Overrides
 * - Salesforce owns: ID, Name, Price, Availability, Room Counts
 */

import aboutPage from './aboutPage';
import essentialInfoPage from './essentialInfoPage';
import destination from './destination';
import region from './region';

// New media-first schemas
import villa from './villa';
import location from './location';
import navigation, { navigationItem } from './navigation';
import pageHome from './pageHome';
import dataSync from './dataSync';

export const schemaTypes = [
  // === SINGLETONS ===
  aboutPage,
  essentialInfoPage,
  pageHome,
  dataSync,

  // === MEDIA-FIRST CONTENT ===
  villa,          // Primary source for villa photography
  location,       // Unified destination (country/region/town)
  navigation,     // Global navigation menus
  navigationItem, // Nested navigation items

  // === LEGACY (for migration) ===
  destination,
  region,
];
