/**
 * VINTAGE TRAVEL - CRM CLIENT (SALESFORCE PRODUCTION MODE)
 *
 * PHASE 28: Restored Salesforce connection with automatic placeholder images
 * Connects to Salesforce CRM using jsforce and injects high-quality placeholders
 * for villas missing Hero_Image_URL__c
 */

import jsforce from 'jsforce';
import { MockVilla } from '@/lib/mock-db';
import { WeeklyRate } from '@/types/villa';
import { addWeeks, startOfDay, parseISO, format, addDays } from 'date-fns';
import { mapCRMVillasToVillas } from '@/lib/mappers/crm-mapper';

// ===== CONFIGURATION =====

const { SF_USERNAME, SF_PASSWORD, SF_TOKEN, SF_LOGIN_URL, USE_MOCK_DATA } = process.env;

// PHASE 28: High-quality placeholder images for villas missing photos
// Updated with verified working Unsplash villa images
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&h=1080&fit=crop&q=80', // Modern villa with pool
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920&h=1080&fit=crop&q=80', // Classic Mediterranean
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&h=1080&fit=crop&q=80', // Luxury stone villa
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=1080&fit=crop&q=80', // Pool villa sunset
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1920&h=1080&fit=crop&q=80', // Charming cottage
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&h=1080&fit=crop&q=80', // Modern home exterior
  'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1920&h=1080&fit=crop&q=80', // Seaside villa
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1920&h=1080&fit=crop&q=80', // Grand estate
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1920&h=1080&fit=crop&q=80', // White luxury villa
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&h=1080&fit=crop&q=80', // Luxury pool house
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&h=1080&fit=crop&q=80', // Modern villa architecture
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&h=1080&fit=crop&q=80', // Mediterranean style
];

// ===== TYPES =====

/**
 * Salesforce villa record type matching CRM schema
 */
export interface SalesforceVillaRecord {
  Id: string;
  Name: string;
  Slug__c?: string;
  P_Accom_Text__c?: string; // Description (being replaced by P_First_Para__c)
  P_No_Bedrooms__c?: number;

  // PHASE 45: Location Hierarchy - Primary source
  P_Property_Location__c?: string; // "Town, Region, Country" format (e.g., "Spartia, Kefalonia, Greece")

  // DEPRECATED: Old location fields (kept as fallback)
  P_Country__c?: string; // Country (used for region mapping)
  P_Region__c?: string; // PHASE 40: Specific region within country
  P_Board_Group_Name__c?: string; // Town/locality
  P_Address_Line_1__c?: string; // PHASE 40: Physical address

  Hero_Image_URL__c?: string; // PHASE 28: Optional hero image
  Max_Guests__c?: number;
  Bathrooms__c?: number;
  Price_Per_Week__c?: number;
  X2026_Prices_Loaded__c?: boolean;

  // PHASE 40: Rich Text Content Fields
  P_First_Para__c?: string; // Primary description (HTML)
  P_Facility_Summary__c?: string; // Facilities summary (HTML)
  P_Follow_on_text__c?: string; // Additional content (HTML)
}

/**
 * Salesforce weekly rate record
 */
export interface SalesforceWeeklyRateRecord {
  Id: string;
  WR_Week_Start_Date__c: string;
  WR_Live_Sell_This_Year__c: number | null;
  WR_Status__c: string;
}

// ===== CONNECTION MANAGEMENT =====

let conn: InstanceType<typeof jsforce.Connection> | null = null;

/**
 * Get authenticated Salesforce connection
 * Reuses existing connection if available
 *
 * @returns Authenticated jsforce connection
 * @throws Error if credentials are missing or login fails
 */
async function getConn(): Promise<InstanceType<typeof jsforce.Connection>> {
  // Reuse existing connection if available
  if (conn) {
    return conn;
  }

  // Validate credentials
  if (!SF_USERNAME || !SF_PASSWORD || !SF_TOKEN) {
    throw new Error(
      '[CRM] Missing Salesforce credentials. Please set SF_USERNAME, SF_PASSWORD, and SF_TOKEN in .env.local'
    );
  }

  // Create new connection
  const connection = new jsforce.Connection({
    loginUrl: SF_LOGIN_URL || 'https://login.salesforce.com',
  });

  try {
    // Login with username + password + security token
    await connection.login(SF_USERNAME, SF_PASSWORD + SF_TOKEN);
    console.log('[CRM] ✓ Connected to Salesforce successfully');
    console.log(`[CRM] User: ${(connection.userInfo as any)?.display_name || SF_USERNAME}`);

    conn = connection;
    return conn;
  } catch (error) {
    console.error('[CRM] ✗ Failed to connect to Salesforce:', error);
    throw new Error(`Salesforce authentication failed: ${error}`);
  }
}

/**
 * Test Salesforce connection
 *
 * @returns true if connection succeeds, false otherwise
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await getConn();
    // Verify connection with a simple query
    await connection.query('SELECT Id FROM Property__c LIMIT 1');
    console.log('[CRM] Connection test passed');
    return true;
  } catch (error) {
    console.error('[CRM] Connection test failed:', error);
    return false;
  }
}

/**
 * Clear cached connection
 * Useful for forcing re-authentication
 */
export function clearConnection(): void {
  conn = null;
  console.log('[CRM] Connection cleared');
}

// ===== VILLA DATA FETCHING =====

/**
 * Get the lowest available price for multiple villas in bulk
 * Queries all weekly rates for the given villas and returns the minimum available price for each
 *
 * @param villaIds - Array of villa Salesforce IDs
 * @returns Map of villa ID to lowest available price
 */
async function getLowestPricesForVillas(villaIds: string[]): Promise<Record<string, number>> {
  if (villaIds.length === 0) {
    return {};
  }

  try {
    const connection = await getConn();
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // Build IN clause for villa IDs
    const idList = villaIds.map(id => `'${id}'`).join(',');

    // Query all weekly rates for these villas (regardless of availability status)
    // This ensures we show pricing even if all weeks are currently booked
    const result = await connection.query(
      `SELECT WR_Contract__r.CON_Property__c, WR_Live_Sell_This_Year__c
       FROM Weekly_Rate__c
       WHERE WR_Contract__r.CON_Property__c IN (${idList})
         AND WR_Week_Start_Date__c >= ${todayStr}
         AND WR_Live_Sell_This_Year__c > 0
       ORDER BY WR_Live_Sell_This_Year__c ASC`
    ).execute({ autoFetch: true, maxFetch: 10000 });

    // Group by villa ID and find minimum price
    const priceMap: Record<string, number> = {};
    result.records.forEach((rec: any) => {
      const villaId = rec.WR_Contract__r?.CON_Property__c;
      const price = rec.WR_Live_Sell_This_Year__c;

      if (villaId && price && price > 0) {
        if (!priceMap[villaId] || price < priceMap[villaId]) {
          priceMap[villaId] = price;
        }
      }
    });

    console.log(`[CRM PRICING] Found lowest prices for ${Object.keys(priceMap).length}/${villaIds.length} villas`);
    return priceMap;

  } catch (error) {
    console.error('[CRM PRICING] Error fetching prices:', error);
    return {};
  }
}

/**
 * Fetch all villas from Salesforce
 * PHASE 28: Automatically injects placeholder images for villas missing Hero_Image_URL__c
 * PHASE 32: Added debug logging to diagnose data issues
 *
 * @returns Array of villa records with guaranteed hero images
 */
export async function getAllVillas(): Promise<MockVilla[]> {
  try {
    console.log('[CRM DEBUG] ========== STARTING VILLA FETCH ==========');
    console.log('[CRM DEBUG] Step 1: Getting Salesforce connection...');
    const connection = await getConn();

    // PHASE 32: First, do a simple query to verify the object exists
    console.log('[CRM DEBUG] Step 2: Testing basic query...');
    const testResult = await connection.query<SalesforceVillaRecord>(
      'SELECT Id, Name FROM Property__c LIMIT 5'
    );

    console.log(`[CRM DEBUG] ✓ Basic query successful! Found ${testResult.totalSize} total records in Property__c`);
    console.log(`[CRM DEBUG] ✓ Retrieved ${testResult.records.length} test records`);

    if (testResult.records.length === 0) {
      console.warn('[CRM DEBUG] ⚠️ WARNING: Property__c object exists but contains NO records!');
      console.warn('[CRM DEBUG] 👉 HINT: Add some villa records in Salesforce first.');
      return [];
    }

    console.log('[CRM DEBUG] First villa name:', testResult.records[0].Name);

    // PHASE 45: Fetch 2026-Ready properties with new location hierarchy
    console.log('[CRM DEBUG] Step 3: Fetching 2026-Ready Inventory with pagination...');
    const result = await connection.query<SalesforceVillaRecord>(
      `SELECT
        Id,
        Name,
        P_Accom_Text__c,
        P_First_Para__c,
        P_Facility_Summary__c,
        P_Follow_on_text__c,
        P_No_Bedrooms__c,
        P_Property_Location__c,
        P_Country__c,
        P_Region__c,
        P_Board_Group_Name__c,
        P_Address_Line_1__c
      FROM Property__c
      WHERE P_Archive_Suppress__c = false`
    ).execute({ autoFetch: true, maxFetch: 5000 });

    console.log(`[CRM DEBUG] ✓ Full query successful! ${result.records.length} active villas retrieved`);

    if (result.records.length === 0) {
      console.warn('[CRM DEBUG] ⚠️ WARNING: Query returned 0 records!');
      console.warn('[CRM DEBUG] 👉 HINT: No properties match the filter criteria');
      console.warn('[CRM DEBUG] 👉 CHECK: P_Archive_Suppress__c = false');
      console.warn('[CRM DEBUG] 👉 ACTION: Ensure properties are not suppressed in Salesforce');
      return [];
    }

    console.log('[CRM DEBUG] Step 4: Sample of first record:');
    console.log('[CRM DEBUG]', JSON.stringify(result.records[0], null, 2));

    // Map Salesforce records to app Villa interface
    console.log('[CRM DEBUG] Step 5: Mapping records to Villa interface...');
    let mappedVillas = mapCRMVillasToVillas(result.records);
    console.log(`[CRM DEBUG] ✓ Mapped ${mappedVillas.length} villas successfully`);

    if (mappedVillas.length === 0) {
      console.error('[CRM DEBUG] ❌ ERROR: Mapping returned 0 villas!');
      console.error('[CRM DEBUG] 👉 This means mapCRMVillasToVillas() filtered out all records');
      console.error('[CRM DEBUG] 👉 Check crm-mapper.ts for field name mismatches');
      return [];
    }

    console.log('[CRM DEBUG] Step 6: Sample of first mapped villa:');
    console.log('[CRM DEBUG]', JSON.stringify(mappedVillas[0], null, 2));

    // Step 6.5: Fetch lowest available prices for all villas
    console.log('[CRM DEBUG] Step 6.5: Fetching lowest available prices...');
    const villaIds = mappedVillas.map(v => v.id);
    const lowestPrices = await getLowestPricesForVillas(villaIds);

    // Update villa prices with actual lowest available prices
    mappedVillas = mappedVillas.map(villa => ({
      ...villa,
      pricePerWeek: lowestPrices[villa.id] || null,
      pricePerNight: lowestPrices[villa.id] ? Math.round(lowestPrices[villa.id] / 7) : null,
    }));

    console.log(`[CRM DEBUG] ✓ Updated ${Object.keys(lowestPrices).length} villas with pricing`);

    // PHASE 28: Inject placeholder images for villas missing photos
    console.log('[CRM DEBUG] Step 7: Injecting placeholder images...');
    let placeholderCount = 0;
    mappedVillas = mappedVillas.map((villa, index) => {
      // Check if villa is missing a hero image or has a potentially broken Unsplash URL
      const needsPlaceholder =
        !villa.heroImageUrl ||
        villa.heroImageUrl.trim() === '' ||
        villa.heroImageUrl.includes('cdn.sanity.io/images/mock-project') ||
        villa.heroImageUrl.includes('images.unsplash.com'); // Replace all Unsplash URLs with our verified placeholders

      if (needsPlaceholder) {
        placeholderCount++;
        // Cycle through placeholders deterministically based on index
        const placeholder = PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];

        return {
          ...villa,
          heroImageUrl: placeholder,
          // Ensure gallery has at least the hero image if empty
          galleryImages: villa.galleryImages && villa.galleryImages.length > 0
            ? villa.galleryImages
            : [{ url: placeholder, alt: `${villa.title} Exterior` }]
        };
      }

      return villa;
    });

    console.log(`[CRM DEBUG] ✓ Placeholder injection complete (${placeholderCount} villas needed placeholders)`);
    console.log(`[CRM DEBUG] ========== FINAL RESULT: ${mappedVillas.length} villas ==========`);

    return mappedVillas;
  } catch (error: any) {
    console.error('[CRM DEBUG] ❌ ========== ERROR OCCURRED ==========');
    console.error('[CRM DEBUG] Error type:', error.constructor.name);
    console.error('[CRM DEBUG] Error message:', error.message);
    console.error('[CRM DEBUG] Full error:', error);

    // Help the user identify the issue
    if (error.errorCode === 'INVALID_TYPE') {
      console.error('[CRM DEBUG] 👉 HINT: The object "Property__c" does not exist in your Salesforce.');
      console.error('[CRM DEBUG] 👉 ACTION: Check Object Manager in Salesforce Setup.');
    } else if (error.errorCode === 'INVALID_FIELD') {
      console.error('[CRM DEBUG] 👉 HINT: One of the fields in the query is wrong.');
      console.error('[CRM DEBUG] 👉 ACTION: Check the error message above for the specific field name.');
    } else if (error.message?.includes('INVALID_SESSION_ID')) {
      console.error('[CRM DEBUG] 👉 HINT: Salesforce session expired or credentials are invalid.');
      console.error('[CRM DEBUG] 👉 ACTION: Check SF_USERNAME, SF_PASSWORD, SF_TOKEN in .env.local');
    }

    console.error('[CRM DEBUG] ========================================');
    // Return empty array instead of crashing the app
    return [];
  }
}

/**
 * Fetch a single villa by ID or slug
 *
 * @param idOrSlug - Villa Salesforce ID or slug
 * @returns Villa record or null if not found
 */
export async function getVillaById(idOrSlug: string): Promise<MockVilla | null> {
  try {
    console.log(`[CRM] Fetching villa: ${idOrSlug}`);
    const connection = await getConn();

    // Try to find by ID first (PHASE 45: Include P_Property_Location__c)
    let query = `SELECT
      Id,
      Name,
      Slug__c,
      P_Accom_Text__c,
      P_First_Para__c,
      P_Facility_Summary__c,
      P_Follow_on_text__c,
      P_No_Bedrooms__c,
      P_Property_Location__c,
      P_Country__c,
      P_Region__c,
      P_Board_Group_Name__c,
      P_Address_Line_1__c,
      Hero_Image_URL__c,
      Max_Guests__c,
      Bathrooms__c,
      Price_Per_Week__c,
      X2026_Prices_Loaded__c
    FROM Property__c
    WHERE Id = '${idOrSlug}' OR Slug__c = '${idOrSlug}'
    LIMIT 1`;

    const result = await connection.query<SalesforceVillaRecord>(query);

    if (result.records.length === 0) {
      console.warn(`[CRM] Villa not found: ${idOrSlug}`);
      return null;
    }

    const mappedVillas = mapCRMVillasToVillas(result.records);
    let villa = mappedVillas[0];

    // Inject placeholder if needed
    const needsPlaceholder =
      !villa.heroImageUrl ||
      villa.heroImageUrl.trim() === '' ||
      villa.heroImageUrl.includes('cdn.sanity.io/images/mock-project');

    if (needsPlaceholder) {
      const placeholder = PLACEHOLDER_IMAGES[0]; // Use first placeholder for single villas
      villa = {
        ...villa,
        heroImageUrl: placeholder,
        galleryImages: villa.galleryImages && villa.galleryImages.length > 0
          ? villa.galleryImages
          : [{ url: placeholder, alt: `${villa.title} Exterior` }]
      };
    }

    return villa;
  } catch (error) {
    console.error(`[CRM] Error fetching villa ${idOrSlug}:`, error);
    return null;
  }
}

/**
 * Fetch a single villa by slug
 *
 * @param slug - Villa slug
 * @returns Villa record or null if not found
 */
export async function getVilla(slug: string): Promise<MockVilla | null> {
  return getVillaById(slug);
}

// ===== AVAILABILITY DATA FETCHING =====

/**
 * Format a price value safely for display
 *
 * @param price - Price value (can be null)
 * @returns Formatted price string or "Call to Book" for null/zero prices
 */
export function formatWeeklyPrice(price: number | null | undefined): string {
  if (price == null || price === 0) {
    return 'Call to Book';
  }

  return `£${price.toLocaleString('en-GB')}`;
}

/**
 * Fetch weekly availability and pricing for a villa from Salesforce
 * PHASE 35: Updated to query via WR_Contract__r relationship
 *
 * @param villaId - Villa Salesforce ID (Property__c.Id)
 * @returns Array of weekly rates with availability and pricing
 */
export async function getVillaAvailability(villaId: string): Promise<WeeklyRate[]> {
  try {
    console.log(`[CRM AVAILABILITY] ========== FETCHING AVAILABILITY ==========`);
    console.log(`[CRM AVAILABILITY] Property ID: ${villaId}`);
    const connection = await getConn();

    // PHASE 35: Query weekly rates linked via Contract relationship
    // Weekly_Rate__c -> WR_Contract__r -> CON_Property__c = villaId
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    console.log(`[CRM AVAILABILITY] Querying rates >= ${todayStr}`);

    const result = await connection.query<SalesforceWeeklyRateRecord>(
      `SELECT
        Id,
        WR_Week_Start_Date__c,
        WR_Week_End_Date__c,
        WR_Live_Sell_This_Year__c,
        WR_Status__c
      FROM Weekly_Rate__c
      WHERE WR_Contract__r.CON_Property__c = '${villaId}'
        AND WR_Week_Start_Date__c >= ${todayStr}
      ORDER BY WR_Week_Start_Date__c ASC
      LIMIT 52`
    );

    console.log(`[CRM AVAILABILITY] ✓ Found ${result.records.length} weekly rates`);

    if (result.records.length === 0) {
      console.warn(`[CRM AVAILABILITY] ⚠️ No weekly rates found for property ${villaId}`);
      console.warn(`[CRM AVAILABILITY] 👉 Check if this property has contracts with weekly rates`);
      return [];
    }

    // Log first rate for debugging
    if (result.records.length > 0) {
      const firstRate = result.records[0];
      console.log(`[CRM AVAILABILITY] First rate: ${firstRate.WR_Week_Start_Date__c} - Status: ${firstRate.WR_Status__c}, Price: ${firstRate.WR_Live_Sell_This_Year__c}`);
    }

    // Map Salesforce records to WeeklyRate interface
    const weeklyRates: WeeklyRate[] = result.records.map((record) => {
      const weekStartDate = parseISO(record.WR_Week_Start_Date__c);

      return {
        id: record.Id,
        weekStartDate,
        price: record.WR_Live_Sell_This_Year__c,
        status: record.WR_Status__c || 'Unknown',
        rawDateString: record.WR_Week_Start_Date__c,
      };
    });

    console.log(`[CRM AVAILABILITY] ========== AVAILABILITY FETCH COMPLETE ==========`);
    return weeklyRates;
  } catch (error: any) {
    console.error(`[CRM AVAILABILITY] ❌ ========== ERROR OCCURRED ==========`);
    console.error(`[CRM AVAILABILITY] Error type:`, error.constructor.name);
    console.error(`[CRM AVAILABILITY] Error message:`, error.message);
    console.error(`[CRM AVAILABILITY] Full error:`, error);

    // Help diagnose relationship/field issues
    if (error.errorCode === 'INVALID_FIELD') {
      console.error(`[CRM AVAILABILITY] 👉 HINT: Check relationship names`);
      console.error(`[CRM AVAILABILITY] 👉 Verify: WR_Contract__r.CON_Property__c is correct`);
      console.error(`[CRM AVAILABILITY] 👉 Alternative: Try querying Weekly_Rate__c fields directly`);
    } else if (error.errorCode === 'INVALID_TYPE') {
      console.error(`[CRM AVAILABILITY] 👉 HINT: Weekly_Rate__c object doesn't exist`);
    }

    console.error(`[CRM AVAILABILITY] ========================================`);
    // Don't crash - return empty availability
    // This allows the villa page to still load even if availability fetch fails
    return [];
  }
}

/**
 * PHASE 46: EXTRACT UNIQUE LOCATIONS FOR AUTOSUGGEST (EXACT HIERARCHY)
 * Extracts unique towns, regions, and countries from all 2026-active villas
 * Preserves exact values from P_Property_Location__c without normalization
 *
 * @returns Object with unique countries, regions, and towns
 */
export async function extractUniqueLocations(): Promise<{
  countries: Set<string>;
  regions: Set<string>;
  towns: Set<string>;
}> {
  try {
    const villas = await getAllVillas();

    const countries = new Set<string>();
    const regions = new Set<string>();
    const towns = new Set<string>();

    villas.forEach((villa) => {
      // Add country (third part of P_Property_Location__c, e.g., "Greece")
      if (villa.country) {
        countries.add(villa.country);
      }

      // Add region (second part of P_Property_Location__c, e.g., "Kefalonia")
      if (villa.region && villa.region !== 'Unknown Region') {
        regions.add(villa.region);
      }

      // Add town (first part of P_Property_Location__c, e.g., "Spartia")
      if (villa.town) {
        towns.add(villa.town);
      }
    });

    console.log(`[CRM LOCATIONS] Extracted ${countries.size} countries, ${regions.size} regions, ${towns.size} towns from ${villas.length} villas`);

    return { countries, regions, towns };
  } catch (error) {
    console.error('[CRM LOCATIONS] Error extracting locations:', error);
    return { countries: new Set(), regions: new Set(), towns: new Set() };
  }
}

/**
 * PHASE 36: BULK AVAILABILITY QUERY (FIXED)
 * Get all villa IDs that have AT LEAST ONE available week in the date range
 * This is MUCH faster than checking each villa individually
 *
 * IMPORTANT: Returns villas WITH availability (not without)
 * The search-client.ts will filter to INCLUDE these IDs
 *
 * @param startDate - Start of requested date range (YYYY-MM-DD string)
 * @param endDate - End of requested date range (YYYY-MM-DD string)
 * @returns Set of villa IDs that have at least one available week
 */
export async function getUnavailableVillaIds(
  startDate: string,
  endDate: string
): Promise<Set<string>> {
  try {
    const conn = await getConn();
    console.log(`[CRM BULK AVAILABILITY] Checking for villas with availability ${startDate} to ${endDate}`);

    // Find IDs of properties that have AT LEAST ONE available week
    const result = await conn.query(
      `SELECT WR_Contract__r.CON_Property__c
       FROM Weekly_Rate__c
       WHERE WR_Week_Start_Date__c >= ${startDate}
       AND WR_Week_Start_Date__c <= ${endDate}
       AND WR_Status__c = 'Available'
       AND WR_Live_Sell_This_Year__c > 0`
    ).execute({ autoFetch: true, maxFetch: 5000 });

    const ids = new Set<string>();
    result.records.forEach((rec: any) => {
      const villaId = rec.WR_Contract__r?.CON_Property__c;
      if (villaId) ids.add(villaId);
    });

    console.log(`[CRM BULK AVAILABILITY] Found ${ids.size} properties with availability`);
    return ids;

  } catch (error) {
    console.error('[CRM ERROR] Bulk Check Failed:', error);
    return new Set();
  }
}
