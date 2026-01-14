/**
 * VINTAGE TRAVEL - CRM TO VILLA MAPPER
 *
 * Maps Salesforce CRM fields (with __c suffix) to our clean Villa interface
 * Handles field naming conventions and data transformation
 */

import { SalesforceVillaRecord } from '@/lib/crm-client';
import { MockVilla } from '@/lib/mock-db';

// Re-export for convenience
export type { SalesforceVillaRecord };

/**
 * Generate a slug from villa name
 * Converts "Villa Bella Vista" -> "villa-bella-vista"
 *
 * @param name - Villa name
 * @returns URL-friendly slug
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * PHASE 49: STRICT COUNTRY VALIDATION
 * Only 8 valid countries allowed. Anything else gets reclassified as a region.
 */
const VALID_COUNTRIES = new Set([
  "Balearics",
  "Spain",
  "France",
  "Croatia",
  "Turkey",
  "Greece",
  "Italy",
  "Portugal"
]);

/**
 * PHASE 49: Parse location hierarchy with STRICT country validation
 * Format: "Town, Region, Country" (e.g., "Spartia, Kefalonia, Greece")
 *
 * STRICT VALIDATION: Only 8 valid countries allowed
 * Valid Countries: Balearics, Spain, France, Croatia, Turkey, Greece, Italy, Portugal
 *
 * @param locationString - P_Property_Location__c value
 * @returns Parsed location object { town, region, country }
 */
function parseLocationHierarchy(locationString: string | undefined): {
  town: string;
  region: string;
  country: string;
} {
  if (!locationString || locationString.trim() === '') {
    console.warn('[Mapper] WARNING: Empty P_Property_Location__c');
    return { town: '', region: '', country: '' };
  }

  const parts = locationString.split(',').map((s: string) => s.trim());

  // Default values
  let town = '';
  let region = '';
  let country = '';

  if (parts.length >= 3) {
    // "Spartia, Kefalonia, Greece"
    town = parts[0];
    region = parts[1];
    country = parts[2];
  } else if (parts.length === 2) {
    // "Kefalonia, Greece" (no town specified)
    region = parts[0];
    country = parts[1];
  } else if (parts.length === 1 && parts[0]) {
    // "Greece" (only country)
    country = parts[0];
  }

  // PHASE 49: NORMALIZE SPECIFIC CASES
  if (country === "Balearic Islands") country = "Balearics";
  if (region === "Balearic Islands") region = "Balearics";

  // PHASE 49: STRICT COUNTRY CLASSIFICATION
  if (!VALID_COUNTRIES.has(country)) {
    // INVALID COUNTRY DETECTED (e.g., "Tuscany", "Algarve", "Kefalonia")
    // Downgrade it to Region
    if (country && country.length > 2 && country !== "Unknown") {
      console.log(`[Mapper] Reclassifying "${country}" as region (not in valid countries)`);
      // If there was already a distinct region, keep it
      // Otherwise, use the invalid country as the region
      if (!region || region === country) {
        region = country;
      }
      // Set country to empty - will be set to default later in mapCRMVillaToVilla
      country = '';
    }
  }

  return { town, region, country };
}

/**
 * Normalize region name from Salesforce P_Country__c field
 * Aggregates sub-regions into 8 parent countries/destinations
 *
 * CRITICAL: Balearic Islands and Spain must be mutually exclusive
 * CRITICAL: All sub-regions MUST map to one of 8 main destinations
 *
 * @param rawRegion - Raw region value from Salesforce
 * @returns Normalized region name (one of 8 main destinations)
 */
function normalizeRegion(rawRegion: string | undefined): string {
  if (!rawRegion) {
    console.warn('[Mapper] WARNING: Villa has no region specified');
    return 'Unknown';
  }

  const region = rawRegion.trim();

  // STRICT parent country aggregation
  // Every villa must map to exactly one of these 8 destinations
  const regionMap: Record<string, string> = {
    // ===== ITALY (Target: ~28) =====
    'Italy': 'Italy',
    'IT': 'Italy',
    'Amalfi Coast': 'Italy',
    'Tuscany': 'Italy',
    'Umbria': 'Italy',
    'Sicily': 'Italy',
    'Sardinia': 'Italy',
    'Italian Lakes': 'Italy',
    'Puglia': 'Italy',
    'Apulia': 'Italy',
    'Lake Como': 'Italy',
    'Lake Garda': 'Italy',
    'Calabria': 'Italy',

    // ===== SPAIN (Target: ~113) =====
    // CRITICAL: Exclude Balearic Islands from Spain
    'Spain': 'Spain',
    'ES': 'Spain',
    'Mainland Spain': 'Spain',
    'Andalusia': 'Spain',
    'Andalucia': 'Spain',
    'Catalonia': 'Spain',
    'Catalunya': 'Spain',
    'Costa Blanca': 'Spain',
    'Costa Brava': 'Spain',
    'Costa del Sol': 'Spain',
    'Marbella': 'Spain',
    'Valencia': 'Spain',
    'Galicia': 'Spain',
    'Basque Country': 'Spain',
    'Canary Islands': 'Spain',
    'Canary Islands, Spain': 'Spain',
    'Canarias': 'Spain',

    // ===== BALEARIC ISLANDS (Target: ~80) =====
    // CRITICAL: Must remain separate from Spain
    'Balearic Islands': 'Balearic Islands',
    'Balearic Islands, Spain': 'Balearic Islands', // CRITICAL: Salesforce format
    'Balearics': 'Balearic Islands',
    'Balearics, Spain': 'Balearic Islands',
    'Mallorca': 'Balearic Islands',
    'Mallorca, Spain': 'Balearic Islands',
    'Majorca': 'Balearic Islands',
    'Majorca, Spain': 'Balearic Islands',
    'Menorca': 'Balearic Islands',
    'Menorca, Spain': 'Balearic Islands',
    'Minorca': 'Balearic Islands',
    'Minorca, Spain': 'Balearic Islands',
    'Ibiza': 'Balearic Islands',
    'Ibiza, Spain': 'Balearic Islands',
    'Formentera': 'Balearic Islands',
    'Formentera, Spain': 'Balearic Islands',

    // ===== FRANCE (Target: ~84) =====
    'France': 'France',
    'FR': 'France',
    'Provence': 'France',
    'Loire Valley': 'France',
    'Cote d\'Azur': 'France',
    'Côte d\'Azur': 'France',
    'French Riviera': 'France',
    'Dordogne': 'France',
    'Corsica': 'France',
    'Brittany': 'France',
    'Normandy': 'France',
    'Languedoc': 'France',
    'Aquitaine': 'France',

    // ===== GREECE (Target: ~153) =====
    'Greece': 'Greece',
    'GR': 'Greece',
    'Crete': 'Greece',
    'Corfu': 'Greece',
    'Mykonos': 'Greece',
    'Santorini': 'Greece',
    'Rhodes': 'Greece',
    'Peloponnese': 'Greece',
    'Cyclades': 'Greece',
    'Ionian Islands': 'Greece',
    'Kefalonia': 'Greece',
    'Zakynthos': 'Greece',
    'Paros': 'Greece',
    'Naxos': 'Greece',

    // ===== PORTUGAL (Target: ~65) =====
    'Portugal': 'Portugal',
    'PT': 'Portugal',
    'Algarve': 'Portugal',
    'Douro Valley': 'Portugal',
    'Comporta': 'Portugal',
    'Lisbon Coast': 'Portugal',
    'Alentejo': 'Portugal',
    'Porto': 'Portugal',

    // ===== TURKEY (Target: ~33) =====
    'Turkey': 'Turkey',
    'TR': 'Turkey',
    'Kalkan': 'Turkey',
    'Bodrum': 'Turkey',
    'Fethiye': 'Turkey',
    'Kas': 'Turkey',
    'Kaş': 'Turkey',

    // ===== CROATIA (Target: ~17) =====
    'Croatia': 'Croatia',
    'HR': 'Croatia',
    'Dubrovnik': 'Croatia',
    'Istria': 'Croatia',
    'Split': 'Croatia',
    'Hvar': 'Croatia',
    'Dalmatia': 'Croatia',
  };

  // Try exact match first
  if (regionMap[region]) {
    return regionMap[region];
  }

  // Try case-insensitive match
  const regionLower = region.toLowerCase();
  for (const [key, value] of Object.entries(regionMap)) {
    if (key.toLowerCase() === regionLower) {
      return value;
    }
  }

  // Unknown region - log warning but don't lose the villa
  console.warn(`[Mapper] WARNING: Unknown region "${region}" - mapping to "Unknown"`);
  console.warn(`[Mapper] Please add "${region}" to the regionMap in crm-mapper.ts`);

  return 'Unknown';
}

/**
 * PHASE 59: Infer country from region name
 * Uses EXACT matching only to avoid false positives
 *
 * @param region - Region name from P_Property_Location__c
 * @returns Country name or null if not found
 */
function inferCountryFromRegion(region: string | undefined): string | null {
  if (!region) return null;

  const regionLower = region.toLowerCase().trim();

  // Region to country mapping - EXACT MATCHES ONLY
  const regionToCountry: Record<string, string> = {
    // ===== ITALY =====
    'italy': 'Italy',
    'amalfi coast': 'Italy',
    'tuscany': 'Italy',
    'umbria': 'Italy',
    'sicily': 'Italy',
    'sardinia': 'Italy',
    'italian lakes': 'Italy',
    'puglia': 'Italy',
    'apulia': 'Italy',
    'lake como': 'Italy',
    'lake garda': 'Italy',
    'calabria': 'Italy',
    'lazio': 'Italy',
    // Italian towns/sub-regions
    'cortona': 'Italy',
    'lucca': 'Italy',
    'bagni di lucca': 'Italy',
    'perugia': 'Italy',
    'todi': 'Italy',
    'deruta': 'Italy',
    'noci & putignano': 'Italy', // Puglia

    // ===== SPAIN (Mainland only) =====
    'spain': 'Spain',
    'mainland spain': 'Spain',
    'andalusia': 'Spain',
    'andalucia': 'Spain',
    'catalonia': 'Spain',
    'catalunya': 'Spain',
    'costa blanca': 'Spain',
    'costa brava': 'Spain',
    'costa del sol': 'Spain',
    'marbella': 'Spain',
    'valencia': 'Spain',
    'galicia': 'Spain',
    'basque country': 'Spain',
    'canary islands': 'Spain',
    'canarias': 'Spain',
    // Spanish towns/sub-regions
    'el bosque': 'Spain',
    'arcos de la frontera': 'Spain',
    'vejer de la frontera': 'Spain',
    'conil de la frontera': 'Spain',
    'tamariu': 'Spain',
    'palafrugell area': 'Spain',
    'calella de palafrugell': 'Spain',
    'calonge area': 'Spain',
    'pals': 'Spain',
    'xabia (javea)': 'Spain',
    'javea': 'Spain',
    'denia': 'Spain',
    'teulada/moraira': 'Spain',
    'benitachell': 'Spain',
    // Galicia towns
    'cangas': 'Spain',
    'nigran': 'Spain',
    'mondariz balneario': 'Spain',
    'sanxenxo and surrounding villages': 'Spain',
    'negreira': 'Spain',
    'hio': 'Spain',
    'o porriño': 'Spain',
    'cesantes': 'Spain',
    'gondomar': 'Spain', // Galicia, NOT Portugal!
    'orgiva': 'Spain', // Andalucia

    // ===== BALEARIC ISLANDS =====
    'balearic islands': 'Balearic Islands',
    'balearics': 'Balearic Islands',
    'mallorca': 'Balearic Islands',
    'majorca': 'Balearic Islands',
    'menorca': 'Balearic Islands',
    'minorca': 'Balearic Islands',
    'ibiza': 'Balearic Islands',
    'formentera': 'Balearic Islands',
    'pollensa': 'Balearic Islands',
    'pollença': 'Balearic Islands',
    'pollenca': 'Balearic Islands', // Without accent
    'port de pollenca': 'Balearic Islands',
    'alcudia': 'Balearic Islands',
    'soller': 'Balearic Islands',
    'sóller': 'Balearic Islands',
    'deia': 'Balearic Islands',
    'deià': 'Balearic Islands',
    'cala d\'or': 'Balearic Islands',
    'santanyi': 'Balearic Islands',
    'alaior': 'Balearic Islands',
    'ciutadella': 'Balearic Islands',
    'arenal d\'en castell': 'Balearic Islands',
    'binibeca': 'Balearic Islands',
    'ca\'s concos': 'Balearic Islands',
    'buger': 'Balearic Islands', // Mallorca
    'artà': 'Balearic Islands', // Mallorca
    'arta': 'Balearic Islands', // Mallorca (without accent)

    // ===== FRANCE =====
    'france': 'France',
    'provence': 'France',
    'loire valley': 'France',
    'cote d\'azur': 'France',
    'côte d\'azur': 'France',
    'french riviera': 'France',
    'dordogne': 'France',
    'corsica': 'France',
    'brittany': 'France',
    'normandy': 'France',
    'languedoc': 'France',
    'aquitaine': 'France',
    'south west france': 'France',
    // French towns/sub-regions
    'saint rémy de provence': 'France',
    'gordes': 'France',
    'pernes les fontaines': 'France',
    'grasse': 'France',
    'st cézaire sur siagne': 'France',
    'la garde-freinet': 'France',
    'sainte-maxime': 'France',
    'lorgues': 'France',
    'pézenas': 'France',
    'bergerac': 'France',
    'rabastens': 'France',
    'najac': 'France',
    'sainte foy la grande': 'France',
    'miramont-de-guyenne': 'France',
    'castillonnès': 'France',
    'villeréal': 'France',
    'montcuq': 'France',
    'bordeaux': 'France',
    'duras': 'France',
    'prats-du-périgord': 'France',
    'monflanquin': 'France',
    'albi': 'France',
    'carcassonne': 'France',
    'les arques': 'France',
    'villars': 'France',
    'mandelieu': 'France', // Côte d'Azur
    'lalinde': 'France', // South West France (Dordogne)
    'beauville': 'France', // South West France
    'frayssinet-le-gelat': 'France', // South West France (Lot)

    // ===== GREECE =====
    'greece': 'Greece',
    'crete': 'Greece',
    'corfu': 'Greece',
    'mykonos': 'Greece',
    'santorini': 'Greece',
    'rhodes': 'Greece',
    'peloponnese': 'Greece',
    'cyclades': 'Greece',
    'ionian islands': 'Greece',
    'kefalonia': 'Greece',
    'zakynthos': 'Greece',
    'paros': 'Greece',
    'naxos': 'Greece',
    'lefkada': 'Greece',
    'meganisi': 'Greece',
    'parga': 'Greece',
    'messinia': 'Greece',
    // Greek towns/sub-regions
    'chania area': 'Greece',
    'chania': 'Greece',
    'rethymno': 'Greece',
    'tavronitis': 'Greece',
    'ermones': 'Greece',
    'nissaki': 'Greece',
    'barbati': 'Greece',
    'perithea': 'Greece',
    'agios georgios': 'Greece',
    'aghios stefanos': 'Greece',
    'san stefanos': 'Greece',
    'acharavi': 'Greece',
    'corfu town': 'Greece',
    'kassiopi': 'Greece',
    'lefkimmi': 'Greece',
    'fiskardo': 'Greece',
    'svoronata': 'Greece',
    'trapezaki': 'Greece',
    'assos': 'Greece',
    'avithos': 'Greece',
    'sami': 'Greece',
    'agia effimia': 'Greece',
    'fterno': 'Greece',
    'vasilikos': 'Greece',
    'machairado': 'Greece',
    'kalipado': 'Greece',
    'navarino bay': 'Greece',
    'stoupa': 'Greece',
    'kalamata': 'Greece',
    'parga town': 'Greece',

    // ===== PORTUGAL =====
    'portugal': 'Portugal',
    'algarve': 'Portugal',
    'douro valley': 'Portugal',
    'comporta': 'Portugal',
    'lisbon coast': 'Portugal',
    'alentejo': 'Portugal',
    'porto': 'Portugal',
    'costa verde & minho': 'Portugal',
    'minho': 'Portugal',
    // Portuguese towns/sub-regions
    'estoi': 'Portugal',
    'carvoeiro': 'Portugal',
    'tavira': 'Portugal',
    'gale': 'Portugal',
    'almancil': 'Portugal',
    'boliqueime': 'Portugal',
    'ponte de lima': 'Portugal',
    'povoa de lanhoso': 'Portugal',
    'vila praia de ancora': 'Portugal',
    'caminha': 'Portugal',
    'esposende': 'Portugal',
    'vila verde': 'Portugal',
    'braga': 'Portugal',

    // ===== TURKEY =====
    'turkey': 'Turkey',
    'kalkan': 'Turkey',
    'bodrum': 'Turkey',
    'fethiye': 'Turkey',
    'kas': 'Turkey',
    'kaş': 'Turkey',
    'lycian coast': 'Turkey',

    // ===== CROATIA =====
    'croatia': 'Croatia',
    'dubrovnik': 'Croatia',
    'istria': 'Croatia',
    'split': 'Croatia',
    'hvar': 'Croatia',
    'dalmatia': 'Croatia',
    // Croatian towns/sub-regions
    'konavle valley': 'Croatia',
    'sveti lovrec': 'Croatia',
    'svetvincenat': 'Croatia',
    'novigrad': 'Croatia',
    'liznjan': 'Croatia',
    'motovun': 'Croatia',
  };

  // Try exact match only (case-insensitive)
  if (regionToCountry[regionLower]) {
    return regionToCountry[regionLower];
  }

  // NO partial matching - it causes too many false positives
  return null;
}

/**
 * Map Salesforce CRM villa record to our Villa interface
 *
 * CRITICAL: Creates a NEW clean object without Salesforce metadata
 * This prevents "Maximum call stack size exceeded" errors when serializing
 * for Server Actions (jsforce records contain circular references in attributes)
 *
 * CRM Fields -> Villa Fields:
 * - Id -> id (Salesforce ID)
 * - Name -> title
 * - P_Accom_Text__c -> description
 * - P_No_Bedrooms__c -> bedrooms
 * - P_Country__c -> region
 *
 * @param crmRecord - Raw Salesforce villa record
 * @returns Clean, serializable villa object
 */
export function mapCRMVillaToVilla(crmRecord: SalesforceVillaRecord): MockVilla {
  // CRITICAL: Extract primitive values to avoid circular references
  // jsforce adds an 'attributes' property with circular references
  const id = String(crmRecord.Id);
  const name = String(crmRecord.Name);

  // PHASE 40: Prefer P_First_Para__c for description, fallback to P_Accom_Text__c
  const description = crmRecord.P_First_Para__c
    ? String(crmRecord.P_First_Para__c)
    : (crmRecord.P_Accom_Text__c ? String(crmRecord.P_Accom_Text__c) : 'Luxury villa accommodation');

  // PHASE 40: Rich text content fields
  const facilitySummary = crmRecord.P_Facility_Summary__c ? String(crmRecord.P_Facility_Summary__c) : undefined;
  const followOnText = crmRecord.P_Follow_on_text__c ? String(crmRecord.P_Follow_on_text__c) : undefined;

  const bedroomCount = Number(crmRecord.P_No_Bedrooms__c) || 0;

  // PHASE 46: Parse location hierarchy - PRESERVE EXACT VALUES (NO NORMALIZATION)
  let parsedLocation = parseLocationHierarchy(crmRecord.P_Property_Location__c);

  // Fallback to old fields if P_Property_Location__c is empty
  if (!parsedLocation.country && !parsedLocation.region && !parsedLocation.town) {
    console.warn(`[Mapper] Villa ${name}: P_Property_Location__c empty, using legacy fields`);
    parsedLocation = {
      town: crmRecord.P_Board_Group_Name__c ? String(crmRecord.P_Board_Group_Name__c) : '',
      region: crmRecord.P_Region__c ? String(crmRecord.P_Region__c) : '',
      country: crmRecord.P_Country__c ? String(crmRecord.P_Country__c) : '',
    };
  }

  // PHASE 46: Set defaults if still empty (preserve exact values, no normalization)
  if (!parsedLocation.region) {
    parsedLocation.region = 'Unknown Region';
  }

  // PHASE 59: Infer country from region if country is empty
  // This fixes villas where the "country" in P_Property_Location__c is actually a region name
  if (!parsedLocation.country && parsedLocation.region) {
    const inferredCountry = inferCountryFromRegion(parsedLocation.region);
    if (inferredCountry) {
      parsedLocation.country = inferredCountry;
      console.log(`[Mapper] Inferred country "${inferredCountry}" from region "${parsedLocation.region}"`);
    }
  }

  // Only default to Unknown if we still can't determine the country
  if (!parsedLocation.country) {
    console.warn(`[Mapper] WARNING: Could not determine country for region "${parsedLocation.region}"`);
    parsedLocation.country = 'Unknown';
  }

  // PHASE 59: CRITICAL - Reclassify Balearic Islands based on region OR town
  // Salesforce sends "Spain" for Balearic villas, but they must be separate
  // Use a Set for O(1) lookup with EXACT matching only
  const balearicRegionsSet = new Set([
    // Main islands
    'mallorca', 'majorca', 'menorca', 'minorca', 'ibiza', 'formentera', 'balearics', 'balearic islands',
    // Mallorca sub-regions/towns
    'pollensa', 'pollença', 'pollenca', 'port de pollensa', 'puerto pollensa', 'alcudia', 'port d\'alcudia',
    'soller', 'sóller', 'port de soller', 'deia', 'deià', 'valldemossa', 'andratx',
    'cala d\'or', 'cala dor', 'santanyi', 'santanyí', 'campos', 'llucmajor', 'felanitx',
    'manacor', 'arta', 'artà', 'capdepera', 'son servera', 'porto cristo',
    'palma', 'palma de mallorca', 'calvia', 'calvià', 'santa ponsa', 'peguera',
    'cas concos', 'ca\'s concos', 'binissalem', 'inca', 'sineu', 'petra', 'buger',
    // Menorca sub-regions/towns
    'mahon', 'maó', 'ciutadella', 'es castell', 'alaior', 'alayor', 'ferreries',
    'es mercadal', 'fornells', 'binibeca', 'cala en porter', 'arenal d\'en castell',
    'son parc', 'coves noves', 'son bou', 'torre soli (son bou)', 'ses mongetes', 'cala morell',
    // Ibiza sub-regions/towns
    'san antonio', 'sant antoni', 'santa eulalia', 'santa eulària', 'ibiza town', 'eivissa',
    'san jose', 'sant josep', 'san juan', 'sant joan', 'cala llonga', 'cala tarida',
    // Additional Mallorca towns from Salesforce data
    'cala sa nau', 'cala egos', 'banyalbufar', 'cala sa nau/cala mitjana', 'portocolom', 'son vent',
  ]);
  const regionLower = parsedLocation.region.toLowerCase();
  const townLower = (parsedLocation.town || '').toLowerCase();
  // EXACT MATCH ONLY - no partial matching to avoid false positives like "Santa Marta" matching "Santa Ponsa"
  if (balearicRegionsSet.has(regionLower) || balearicRegionsSet.has(townLower)) {
    parsedLocation.country = 'Balearic Islands';
    console.log(`[Mapper] Reclassified "${name}" from Spain to Balearic Islands (region: ${parsedLocation.region}, town: ${parsedLocation.town})`);
  }

  // Keep the full location string as address (for display purposes)
  const address = crmRecord.P_Property_Location__c
    ? String(crmRecord.P_Property_Location__c)
    : crmRecord.P_Address_Line_1__c
      ? String(crmRecord.P_Address_Line_1__c)
      : undefined;

  // Estimate other capacity fields based on bedrooms
  // Typical ratios: 2 guests per bedroom, 1 bathroom per 2 bedrooms
  const maxGuests = bedroomCount * 2;
  const bathrooms = Math.max(1, Math.floor(bedroomCount / 2));

  // Generate slug from name
  const slug = generateSlug(name);

  // PHASE 28: Use Hero_Image_URL__c from Salesforce if available
  // Fallback to placeholder URL that will be replaced in crm-client.ts
  const heroImageUrl = crmRecord.Hero_Image_URL__c && crmRecord.Hero_Image_URL__c.trim() !== ''
    ? String(crmRecord.Hero_Image_URL__c)
    : `https://cdn.sanity.io/images/mock-project/production/hero-${slug}-1920x1080.jpg?w=1920&q=80`;

  // CRITICAL: Return a NEW object with ONLY the fields we need
  // Do NOT spread the original record - it contains non-serializable metadata
  const cleanVilla: MockVilla = {
    // Identifiers
    id: id,
    sfccId: id, // Use Salesforce ID as SKU
    sanityId: id,
    slug: slug,

    // Content
    title: name,
    name: name, // Alias for search compatibility

    // PHASE 46: Location Hierarchy - EXACT VALUES PRESERVED
    region: parsedLocation.region, // Exact region from P_Property_Location__c (e.g., "Kefalonia")
    country: parsedLocation.country, // Exact country from P_Property_Location__c (e.g., "Greece")
    town: parsedLocation.town || undefined, // Town from P_Property_Location__c (e.g., "Spartia")
    address: address, // Full location string or physical address

    heroImageUrl: heroImageUrl,
    galleryImages: [], // TODO: Add gallery images to Salesforce or fetch from media library
    description: description, // PHASE 40: P_First_Para__c or P_Accom_Text__c
    amenities: [], // TODO: Add amenities field to Salesforce or parse from description

    // PHASE 40: Rich Text Content
    facilitySummary: facilitySummary,
    followOnText: followOnText,

    // Capacity
    maxGuests: maxGuests,
    bedrooms: bedroomCount,
    bathrooms: bathrooms,

    // Commerce
    pricePerWeek: null, // Will be updated by getLowestPricesForVillas
    pricePerNight: null, // Will be updated by getLowestPricesForVillas
    bookedDates: [], // TODO: Integrate with booking system or calendar object

    // Status
    published: true, // Filtered by X2026_Prices_Loaded__c = true in query
  };

  return cleanVilla;
}

/**
 * Map multiple CRM records to Villa array
 *
 * @param crmRecords - Array of Salesforce villa records
 * @returns Array of mapped villa objects
 */
export function mapCRMVillasToVillas(
  crmRecords: SalesforceVillaRecord[]
): MockVilla[] {
  console.log(`[Mapper] Mapping ${crmRecords.length} CRM records to villas...`);

  const mappedVillas = crmRecords.map(mapCRMVillaToVilla);

  // Group by normalized region for verification
  const regionCounts = mappedVillas.reduce((acc, villa) => {
    acc[villa.region] = (acc[villa.region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('[Mapper] ====== MAPPED VILLA COUNTS BY REGION ======');
  console.table(regionCounts);

  // Calculate total
  const total = Object.values(regionCounts).reduce((sum, count) => sum + count, 0);
  console.log(`[Mapper] Total mapped villas: ${total}`);

  // PHASE 46: Show top regions (no longer normalizing to 8 destinations)
  const sortedRegions = Object.entries(regionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20);

  console.log('[Mapper] Top 20 Regions:');
  sortedRegions.forEach(([region, count]) => {
    console.log(`  ${region}: ${count} villas`);
  });

  // PHASE 59: Count villas by country
  const countryCounts: Record<string, number> = {};
  mappedVillas.forEach(villa => {
    const country = villa.country || 'Unknown';
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });

  console.log('[Mapper] ====== VILLA COUNTS BY COUNTRY ======');
  const sortedCountries = Object.entries(countryCounts).sort(([, a], [, b]) => b - a);
  sortedCountries.forEach(([country, count]) => {
    console.log(`  ${country}: ${count} villas`);
  });

  // Check for unknown regions
  const unknownCount = regionCounts['Unknown Region'] || 0;
  if (unknownCount > 0) {
    console.warn(`[Mapper] WARNING: ${unknownCount} villas have "Unknown Region"`);
  }

  console.log('[Mapper] =========================================');

  return mappedVillas;
}

/**
 * Map region/country code to full display name
 * Useful for standardizing region display
 *
 * @param countryCode - Country or region code from CRM
 * @returns Full region display name
 */
export function mapRegionName(countryCode?: string): string {
  if (!countryCode) return 'Unknown Region';

  const regionMap: Record<string, string> = {
    IT: 'Italy',
    ES: 'Spain',
    FR: 'France',
    GR: 'Greece',
    PT: 'Portugal',
    Italy: 'Italy',
    Spain: 'Spain',
    France: 'France',
    Greece: 'Greece',
    Portugal: 'Portugal',
  };

  return regionMap[countryCode] || countryCode;
}
