'use server';

import { getAllVillas, getUnavailableVillaIds, getPricesForDateRange } from '@/lib/crm-client';
import { SearchParams } from '@/types/search';
import { MockVilla } from '@/lib/mock-db';

/**
 * REGION HIERARCHY MAPPING
 * Maps sub-regions to their parent regions for better search results
 * Based on analysis of Salesforce P_Property_Location__c data
 */
const REGION_HIERARCHY = new Map<string, string[]>([
  // Greek Islands - Ionian
  ['kefalonia', [
    'svoronata', 'fiskardo', 'trapezaki', 'assos', 'avithos', 'sami',
    'agia effimia', 'lourdas', 'antisamos', 'katelios', 'skala',
    'poros', 'argostoli', 'lixouri', 'pessada', 'katelios', 'skala'
  ]],
  ['corfu', [
    'ermones', 'nissaki', 'barbati', 'perithea', 'agios georgios',
    'aghios stefanos', 'san stefanos', 'acharavi', 'corfu town',
    'kassiopi', 'roda', 'sidari', 'paleokastritsa', 'gouvia'
  ]],
  ['lefkada', [
    'nydri', 'vassiliki', 'kathisma', 'agios nikitas', 'lefkada town'
  ]],
  ['zakynthos', [
    'vasilikos', 'kalipado', 'machairado', 'agios nikolaos', 'tsilivi',
    'laganas', 'kalamaki', 'vassilikos'
  ]],
  ['meganisi', []],

  // Greek Islands - Aegean
  ['crete', [
    'chania area', 'chania', 'rethymno', 'tavronitis', 'platanias',
    'maleme', 'kalives', 'almyrida', 'georgioupolis'
  ]],

  // Greek Mainland
  ['parga', ['parga town']],
  ['peloponnese', [
    'messinia', 'navarino bay', 'stoupa', 'kalamata', 'kardamyli',
    'methoni', 'koroni'
  ]],

  // Spanish Islands - Balearics
  ['mallorca', [
    'pollenca', 'port de pollenca', 'cala d\'or', 'santanyi',
    'alcudia', 'puerto pollensa', 'soller', 'deia', 'pollensa',
    'ca\'s concos'
  ]],
  ['menorca', [
    'alaior', 'binibeca', 'ciutadella', 'arenal d\'en castell',
    'mahon', 'es castell', 'fornells'
  ]],
  ['ibiza', ['san antonio', 'santa eulalia', 'ibiza town']],

  // Spanish Mainland
  ['andalucia', [
    'arcos de la frontera', 'el bosque', 'vejer de la frontera',
    'conil de la frontera', 'grazalema', 'ronda', 'marbella'
  ]],
  ['catalunya', [
    'tamariu', 'palafrugell area', 'calella de palafrugell',
    'calonge area', 'pals', 'begur', 'les arques'
  ]],
  ['galicia', [
    'cangas', 'nigran', 'mondariz balneario', 'sanxenxo and surrounding villages',
    'negreira', 'hio', 'o porriño', 'cesantes'
  ]],
  ['costa blanca', [
    'xabia (javea)', 'benitachell', 'teulada/moraira', 'denia',
    'javea', 'moraira', 'calpe', 'altea'
  ]],

  // Portugal
  ['algarve', [
    'boliqueime', 'estoi', 'carvoeiro', 'tavira', 'gale', 'almancil',
    'loule', 'vilamoura', 'albufeira'
  ]],
  ['costa verde & minho', [
    'ponte de lima', 'povoa de lanhoso', 'vila praia de ancora',
    'caminha', 'esposende', 'vila verde', 'braga', 'gondomar'
  ]],

  // France
  ['south west france', [
    'bergerac', 'najac', 'rabastens', 'sainte foy la grande',
    'miramont-de-guyenne', 'castillonnès', 'lorgues', 'villeréal',
    'montcuq', 'bordeaux', 'duras', 'prats-du-périgord', 'monflanquin',
    'albi', 'carcassonne'
  ]],
  ['côte d\'azur', [
    'grasse', 'st cézaire sur siagne', 'la garde-freinet',
    'sainte-maxime', 'saint tropez', 'cannes', 'nice', 'antibes'
  ]],
  ['provence', [
    'saint rémy de provence', 'gordes', 'pernes les fontaines',
    'roussillon', 'lourmarin', 'bonnieux', 'menerbes', 'villars'
  ]],
  ['languedoc', [
    'pézenas', 'montpellier', 'narbonne', 'beziers'
  ]],

  // Italy
  ['tuscany', [
    'cortona', 'bagni di lucca', 'lucca', 'florence', 'siena',
    'montepulciano', 'pienza', 'san gimignano'
  ]],
  ['umbria', ['perugia', 'todi', 'deruta', 'assisi', 'spoleto']],
  ['lazio', ['rome', 'bolsena']],

  // Croatia
  ['istria', [
    'sveti lovrec', 'svetvincenat', 'novigrad', 'liznjan', 'motovun',
    'rovinj', 'pula', 'porec'
  ]],
  ['dubrovnik', ['konavle valley', 'cavtat', 'mlini']],

  // Turkey
  ['lycian coast', ['kas', 'kalkan', 'patara', 'oludeniz', 'fethiye']],
]);

/**
 * COUNTRY EXCLUSION MAPPING
 * When searching for a country, exclude villas from these related countries
 * This prevents Balearic Islands from appearing in Spain searches
 */
const COUNTRY_EXCLUSIONS = new Map<string, string[]>([
  ['spain', ['balearic islands', 'balearics']],
  // Add more exclusions as needed
]);

/**
 * Normalize country name for comparison
 */
function normalizeCountry(country: string | undefined | null): string {
  if (!country) return '';
  return country.toLowerCase().trim();
}

/**
 * PHASE 39: OPTIMIZED SEARCH WITH PAYLOAD LIMITING
 *
 * Main search function - filters villas by location, guests, and availability
 * Returns lightweight villa objects (stripped descriptions) to prevent payload overflow
 */
export async function searchVillas(params: SearchParams): Promise<MockVilla[]> {
  console.log('[SEARCH] ========== NEW SEARCH REQUEST ==========');
  console.log('[SEARCH] Raw params:', params);
  console.log('[SEARCH] Params type:', typeof params);
  console.log('[SEARCH] Params location:', params?.location);
  console.log('[SEARCH] Params country:', params?.country);
  console.log('[SEARCH] Params JSON:', JSON.stringify(params, null, 2));

  try {
    // 1. Fetch ALL villas (Now filtered by 2026 prices)
    let villas = await getAllVillas();
    console.log(`[SEARCH] Starting with ${villas.length} total villas from Salesforce`);

    // 2. Filter by Country (EXACT MATCH with exclusions)
    if (params.country) {
      const countryTerm = normalizeCountry(params.country);
      const exclusions = COUNTRY_EXCLUSIONS.get(countryTerm) || [];

      villas = villas.filter(v => {
        const villaCountry = normalizeCountry(v.country);

        // Exact country match
        if (villaCountry === countryTerm) {
          return true;
        }

        // Also match if the country contains the term but is NOT in exclusions
        // This handles cases like "Spain" matching "Spain" but not "Balearic Islands"
        if (villaCountry.includes(countryTerm)) {
          // Check if this villa's country is in the exclusion list
          const isExcluded = exclusions.some(excl => villaCountry.includes(excl));
          return !isExcluded;
        }

        return false;
      });

      console.log(`[SEARCH] After country filter (${countryTerm}): ${villas.length} villas`);
      if (exclusions.length > 0) {
        console.log(`[SEARCH] Excluded countries: ${exclusions.join(', ')}`);
      }
      // DEBUG: Log villa names for Spain search
      if (countryTerm === 'spain') {
        console.log(`[SEARCH DEBUG] Spain villa names: ${villas.map(v => v.name).join(', ')}`);
      }
    }

    // 3. Filter by Location (flexible text search - region, town, name)
    if (params.location) {
      const term = params.location.toLowerCase().trim();

      // Check if the search term is a parent region with sub-regions
      const subRegions = REGION_HIERARCHY.get(term);

      villas = villas.filter(v => {
        // Standard location matching (name, region, town) - NOT country (handled separately)
        const standardMatch =
          v.name.toLowerCase().includes(term) ||
          v.region.toLowerCase().includes(term) ||
          (v.town && v.town.toLowerCase().includes(term));

        // If there's a match, return true
        if (standardMatch) return true;

        // If searching for a parent region, also match villas in sub-regions
        if (subRegions && subRegions.length > 0) {
          const regionLower = v.region.toLowerCase();
          return subRegions.includes(regionLower);
        }

        return false;
      });
      console.log(`[SEARCH] After location filter (${term}): ${villas.length} villas`);
      if (subRegions && subRegions.length > 0) {
        console.log(`[SEARCH] Including sub-regions: ${subRegions.join(', ')}`);
      }
    }

    // 4. Filter by Guests
    if (params.guests) {
      const totalGuests = (params.guests.adults || 0) + (params.guests.children || 0);
      if (totalGuests > 0) {
        villas = villas.filter(v => v.maxGuests >= totalGuests);
        console.log(`[SEARCH] After guest filter (${totalGuests} guests): ${villas.length} villas`);
      }
    }

    // 5. Filter by Availability (Bulk Check) and get date-specific pricing
    let dateSpecificPrices: Record<string, number> = {};
    if (params.dates?.startDate && params.dates?.endDate) {
      console.log(`[SEARCH] Applying availability filter: ${params.dates.startDate} to ${params.dates.endDate}`);

      // Get Set of IDs that have AT LEAST ONE available week
      const availableIds = await getUnavailableVillaIds(
        params.dates.startDate,
        params.dates.endDate
      );

      // Include only villas with availability
      villas = villas.filter(villa => availableIds.has(villa.id));
      console.log(`[SEARCH] After availability filter: ${villas.length} villas have availability`);

      // Get date-specific prices for the filtered villas
      if (villas.length > 0) {
        const villaIds = villas.map(v => v.id);
        dateSpecificPrices = await getPricesForDateRange(
          villaIds,
          params.dates.startDate,
          params.dates.endDate
        );
        console.log(`[SEARCH] Got date-specific prices for ${Object.keys(dateSpecificPrices).length} villas`);
      }
    }

    // 6. CRITICAL: PAYLOAD OPTIMIZATION
    // Strip heavy text fields to keep JSON small
    console.log(`[SEARCH] Returning ${villas.length} villas`);

    // Strip heavy fields and return only what's needed for the grid
    // Use date-specific prices when available, otherwise fall back to general lowest price
    const optimizedVillas = villas.map(v => {
      // Use date-specific price if we have one, otherwise use the villa's general price
      const effectivePrice = dateSpecificPrices[v.id] || v.pricePerWeek;

      return {
        // Identifiers
        id: v.id,
        sfccId: v.sfccId,
        sanityId: v.sanityId,
        slug: v.slug,

        // Content (lightweight)
        title: v.title,
        name: v.name,
        region: v.region,
        country: v.country,
        town: v.town,
        heroImageUrl: v.heroImageUrl,

        // Map coordinates
        latitude: v.latitude,
        longitude: v.longitude,
        galleryImages: v.galleryImages,
        description: '', // ⚠️ STRIPPED: Not needed for grid card
        amenities: [], // ⚠️ STRIPPED: Not needed for grid card

        // Capacity
        maxGuests: v.maxGuests,
        bedrooms: v.bedrooms,
        bathrooms: v.bathrooms,

        // Commerce - Use date-specific price when available
        pricePerWeek: effectivePrice,
        pricePerNight: effectivePrice ? Math.round(effectivePrice / 7) : v.pricePerNight,
        bookedDates: [], // ⚠️ STRIPPED: Not needed for grid card

        // Status
        published: v.published,
      } as MockVilla;
    });

    console.log('[SEARCH] ========== SEARCH COMPLETE ==========');
    console.log(`[SEARCH] Returning ${optimizedVillas.length} optimized villas`);

    return optimizedVillas;

  } catch (error) {
    console.error('[SEARCH] ========== SEARCH FAILED ==========');
    console.error('[SEARCH] Error:', error);
    console.error('[SEARCH] Stack:', error instanceof Error ? error.stack : 'No stack');

    // Return empty results instead of throwing - more graceful
    return [];
  }
}
