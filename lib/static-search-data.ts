/**
 * STATIC SEARCH REPOSITORY
 * Hardcoded search index for instant autosuggest performance
 *
 * PERFORMANCE: 0ms latency (in-memory filtering)
 * UPDATE STRATEGY: Regenerate this file at build time or manually when villa data changes
 *
 * TODO: Create scripts/generate-search-index.ts to auto-generate this from Salesforce
 */

export interface StaticRegion {
  id: string;
  label: string;
  slug: string;
  type: 'region' | 'country';
}

export interface StaticTown {
  id: string;
  label: string;
  slug: string;
  region: string; // Parent region
  type: 'town';
}

export interface StaticVilla {
  id: string;
  label: string; // Villa name
  slug: string;
  region: string;
  type: 'villa';
}

/**
 * 8 Main Regions (Parent Countries/Destinations)
 * PHASE 14: Updated to properly mark countries vs regions for deduplication
 */
export const REGIONS: StaticRegion[] = [
  // Greece - Parent country + sub-regions
  { id: 'region-greece', label: 'Greece', slug: 'greece', type: 'country' },
  { id: 'region-crete', label: 'Crete', slug: 'crete', type: 'region' },
  { id: 'region-corfu', label: 'Corfu', slug: 'corfu', type: 'region' },
  { id: 'region-mykonos', label: 'Mykonos', slug: 'mykonos', type: 'region' },
  { id: 'region-santorini', label: 'Santorini', slug: 'santorini', type: 'region' },

  // Spain - Parent country + sub-regions (Mainland)
  { id: 'region-spain', label: 'Spain', slug: 'spain', type: 'country' },
  { id: 'region-andalusia', label: 'Andalusia', slug: 'andalusia', type: 'region' },
  { id: 'region-costa-blanca', label: 'Costa Blanca', slug: 'costa-blanca', type: 'region' },
  { id: 'region-costa-brava', label: 'Costa Brava', slug: 'costa-brava', type: 'region' },
  { id: 'region-costa-del-sol', label: 'Costa del Sol', slug: 'costa-del-sol', type: 'region' },

  // Balearic Islands - Separate region group (not sub-region of Spain)
  { id: 'region-balearic', label: 'Balearic Islands', slug: 'balearic-islands', type: 'country' },
  { id: 'region-mallorca', label: 'Mallorca', slug: 'mallorca', type: 'region' },
  { id: 'region-menorca', label: 'Menorca', slug: 'menorca', type: 'region' },
  { id: 'region-ibiza', label: 'Ibiza', slug: 'ibiza', type: 'region' },

  // France - Parent country + sub-regions
  { id: 'region-france', label: 'France', slug: 'france', type: 'country' },
  { id: 'region-provence', label: 'Provence', slug: 'provence', type: 'region' },
  { id: 'region-cote-dazur', label: 'Côte d\'Azur', slug: 'cote-dazur', type: 'region' },
  { id: 'region-dordogne', label: 'Dordogne', slug: 'dordogne', type: 'region' },

  // Italy - Parent country + sub-regions
  { id: 'region-italy', label: 'Italy', slug: 'italy', type: 'country' },
  { id: 'region-tuscany', label: 'Tuscany', slug: 'tuscany', type: 'region' },
  { id: 'region-amalfi-coast', label: 'Amalfi Coast', slug: 'amalfi-coast', type: 'region' },
  { id: 'region-sicily', label: 'Sicily', slug: 'sicily', type: 'region' },
  { id: 'region-sardinia', label: 'Sardinia', slug: 'sardinia', type: 'region' },
  { id: 'region-italian-lakes', label: 'Italian Lakes', slug: 'italian-lakes', type: 'region' },

  // Portugal - Parent country + sub-regions
  { id: 'region-portugal', label: 'Portugal', slug: 'portugal', type: 'country' },
  { id: 'region-algarve', label: 'Algarve', slug: 'algarve', type: 'region' },
  { id: 'region-comporta', label: 'Comporta', slug: 'comporta', type: 'region' },

  // Turkey - Parent country + sub-regions
  { id: 'region-turkey', label: 'Turkey', slug: 'turkey', type: 'country' },
  { id: 'region-kalkan', label: 'Kalkan', slug: 'kalkan', type: 'region' },
  { id: 'region-bodrum', label: 'Bodrum', slug: 'bodrum', type: 'region' },

  // Croatia - Parent country + sub-regions
  { id: 'region-croatia', label: 'Croatia', slug: 'croatia', type: 'country' },
  { id: 'region-dubrovnik', label: 'Dubrovnik', slug: 'dubrovnik', type: 'region' },
  { id: 'region-istria', label: 'Istria', slug: 'istria', type: 'region' },
];

/**
 * Popular Towns
 * TODO: Expand this list or generate from villa data
 */
export const TOWNS: StaticTown[] = [
  // Greece
  { id: 'town-athens', label: 'Athens', slug: 'athens', region: 'Greece', type: 'town' },
  { id: 'town-chania', label: 'Chania', slug: 'chania', region: 'Greece', type: 'town' },
  { id: 'town-rhodes', label: 'Rhodes', slug: 'rhodes', region: 'Greece', type: 'town' },

  // Spain
  { id: 'town-marbella', label: 'Marbella', slug: 'marbella', region: 'Spain', type: 'town' },
  { id: 'town-sotogrande', label: 'Sotogrande', slug: 'sotogrande', region: 'Spain', type: 'town' },
  { id: 'town-javea', label: 'Javea', slug: 'javea', region: 'Spain', type: 'town' },
  { id: 'town-moraira', label: 'Moraira', slug: 'moraira', region: 'Spain', type: 'town' },

  // Balearic Islands
  { id: 'town-pollensa', label: 'Pollensa', slug: 'pollensa', region: 'Balearic Islands', type: 'town' },
  { id: 'town-soller', label: 'Soller', slug: 'soller', region: 'Balearic Islands', type: 'town' },
  { id: 'town-mahon', label: 'Mahon', slug: 'mahon', region: 'Balearic Islands', type: 'town' },

  // France
  { id: 'town-cannes', label: 'Cannes', slug: 'cannes', region: 'France', type: 'town' },
  { id: 'town-saint-tropez', label: 'Saint-Tropez', slug: 'saint-tropez', region: 'France', type: 'town' },
  { id: 'town-nice', label: 'Nice', slug: 'nice', region: 'France', type: 'town' },

  // Italy
  { id: 'town-florence', label: 'Florence', slug: 'florence', region: 'Italy', type: 'town' },
  { id: 'town-siena', label: 'Siena', slug: 'siena', region: 'Italy', type: 'town' },
  { id: 'town-positano', label: 'Positano', slug: 'positano', region: 'Italy', type: 'town' },
  { id: 'town-sorrento', label: 'Sorrento', slug: 'sorrento', region: 'Italy', type: 'town' },

  // Portugal
  { id: 'town-lagos', label: 'Lagos', slug: 'lagos', region: 'Portugal', type: 'town' },
  { id: 'town-albufeira', label: 'Albufeira', slug: 'albufeira', region: 'Portugal', type: 'town' },

  // Turkey
  { id: 'town-fethiye', label: 'Fethiye', slug: 'fethiye', region: 'Turkey', type: 'town' },
  { id: 'town-kas', label: 'Kas', slug: 'kas', region: 'Turkey', type: 'town' },

  // Croatia
  { id: 'town-hvar', label: 'Hvar', slug: 'hvar', region: 'Croatia', type: 'town' },
  { id: 'town-split', label: 'Split', slug: 'split', region: 'Croatia', type: 'town' },
];

/**
 * Sample Villas (Top 100 most popular)
 * TODO: Auto-generate this from Salesforce with scripts/generate-search-index.ts
 *
 * For now, this is a representative sample for instant search performance
 */
export const VILLAS: StaticVilla[] = [
  // Greece - Sample
  { id: 'villa-001', label: 'Villa Elysium', slug: 'villa-elysium', region: 'Greece', type: 'villa' },
  { id: 'villa-002', label: 'Aegean Dream Villa', slug: 'aegean-dream-villa', region: 'Greece', type: 'villa' },
  { id: 'villa-003', label: 'Santorini Sunset House', slug: 'santorini-sunset-house', region: 'Greece', type: 'villa' },
  { id: 'villa-004', label: 'Mykonos Bliss', slug: 'mykonos-bliss', region: 'Greece', type: 'villa' },
  { id: 'villa-005', label: 'Crete Paradise Villa', slug: 'crete-paradise-villa', region: 'Greece', type: 'villa' },
  { id: 'villa-006', label: 'Corfu Coastal Retreat', slug: 'corfu-coastal-retreat', region: 'Greece', type: 'villa' },
  { id: 'villa-007', label: 'Rhodes Luxury Estate', slug: 'rhodes-luxury-estate', region: 'Greece', type: 'villa' },
  { id: 'villa-008', label: 'Paros White Villa', slug: 'paros-white-villa', region: 'Greece', type: 'villa' },
  { id: 'villa-009', label: 'Naxos Beach House', slug: 'naxos-beach-house', region: 'Greece', type: 'villa' },
  { id: 'villa-010', label: 'Zakynthos Blue Villa', slug: 'zakynthos-blue-villa', region: 'Greece', type: 'villa' },

  // Spain - Sample
  { id: 'villa-011', label: 'Casa Andaluz', slug: 'casa-andaluz', region: 'Spain', type: 'villa' },
  { id: 'villa-012', label: 'Villa Marbella Sol', slug: 'villa-marbella-sol', region: 'Spain', type: 'villa' },
  { id: 'villa-013', label: 'Costa Blanca Dream Home', slug: 'costa-blanca-dream-home', region: 'Spain', type: 'villa' },
  { id: 'villa-014', label: 'Sotogrande Golf Villa', slug: 'sotogrande-golf-villa', region: 'Spain', type: 'villa' },
  { id: 'villa-015', label: 'Villa Javea Vista', slug: 'villa-javea-vista', region: 'Spain', type: 'villa' },
  { id: 'villa-016', label: 'Moraira Coastal Estate', slug: 'moraira-coastal-estate', region: 'Spain', type: 'villa' },
  { id: 'villa-017', label: 'Catalonia Luxury Villa', slug: 'catalonia-luxury-villa', region: 'Spain', type: 'villa' },
  { id: 'villa-018', label: 'Costa Brava Sea View', slug: 'costa-brava-sea-view', region: 'Spain', type: 'villa' },
  { id: 'villa-019', label: 'Valencia Modern Villa', slug: 'valencia-modern-villa', region: 'Spain', type: 'villa' },
  { id: 'villa-020', label: 'Galicia Country House', slug: 'galicia-country-house', region: 'Spain', type: 'villa' },

  // Balearic Islands - Sample
  { id: 'villa-021', label: 'Mallorca Mountain Retreat', slug: 'mallorca-mountain-retreat', region: 'Balearic Islands', type: 'villa' },
  { id: 'villa-022', label: 'Villa Pollensa Bay', slug: 'villa-pollensa-bay', region: 'Balearic Islands', type: 'villa' },
  { id: 'villa-023', label: 'Ibiza White House', slug: 'ibiza-white-house', region: 'Balearic Islands', type: 'villa' },
  { id: 'villa-024', label: 'Menorca Coastal Villa', slug: 'menorca-coastal-villa', region: 'Balearic Islands', type: 'villa' },
  { id: 'villa-025', label: 'Soller Valley Estate', slug: 'soller-valley-estate', region: 'Balearic Islands', type: 'villa' },
  { id: 'villa-026', label: 'Formentera Beach Villa', slug: 'formentera-beach-villa', region: 'Balearic Islands', type: 'villa' },
  { id: 'villa-027', label: 'Deia Mountain House', slug: 'deia-mountain-house', region: 'Balearic Islands', type: 'villa' },
  { id: 'villa-028', label: 'Alcudia Port Villa', slug: 'alcudia-port-villa', region: 'Balearic Islands', type: 'villa' },
  { id: 'villa-029', label: 'Cala d\'Or Luxury Home', slug: 'cala-dor-luxury-home', region: 'Balearic Islands', type: 'villa' },
  { id: 'villa-030', label: 'Es Trenc Beach House', slug: 'es-trenc-beach-house', region: 'Balearic Islands', type: 'villa' },

  // France - Sample
  { id: 'villa-031', label: 'Villa Provence Lavender', slug: 'villa-provence-lavender', region: 'France', type: 'villa' },
  { id: 'villa-032', label: 'Côte d\'Azur Paradise', slug: 'cote-dazur-paradise', region: 'France', type: 'villa' },
  { id: 'villa-033', label: 'Cannes Riviera Villa', slug: 'cannes-riviera-villa', region: 'France', type: 'villa' },
  { id: 'villa-034', label: 'Saint-Tropez Estate', slug: 'saint-tropez-estate', region: 'France', type: 'villa' },
  { id: 'villa-035', label: 'Nice Hilltop Villa', slug: 'nice-hilltop-villa', region: 'France', type: 'villa' },
  { id: 'villa-036', label: 'Dordogne Country Manor', slug: 'dordogne-country-manor', region: 'France', type: 'villa' },
  { id: 'villa-037', label: 'Loire Valley Château', slug: 'loire-valley-chateau', region: 'France', type: 'villa' },
  { id: 'villa-038', label: 'Corsica Beach Villa', slug: 'corsica-beach-villa', region: 'France', type: 'villa' },
  { id: 'villa-039', label: 'Brittany Coastal House', slug: 'brittany-coastal-house', region: 'France', type: 'villa' },
  { id: 'villa-040', label: 'Languedoc Wine Estate', slug: 'languedoc-wine-estate', region: 'France', type: 'villa' },

  // Italy - Sample
  { id: 'villa-041', label: 'Tuscan Hillside Villa', slug: 'tuscan-hillside-villa', region: 'Italy', type: 'villa' },
  { id: 'villa-042', label: 'Villa Amalfi Coast', slug: 'villa-amalfi-coast', region: 'Italy', type: 'villa' },
  { id: 'villa-043', label: 'Sicilian Seaside Retreat', slug: 'sicilian-seaside-retreat', region: 'Italy', type: 'villa' },
  { id: 'villa-044', label: 'Lake Como Luxury Villa', slug: 'lake-como-luxury-villa', region: 'Italy', type: 'villa' },
  { id: 'villa-045', label: 'Sardinia Beach House', slug: 'sardinia-beach-house', region: 'Italy', type: 'villa' },
  { id: 'villa-046', label: 'Umbrian Country Estate', slug: 'umbrian-country-estate', region: 'Italy', type: 'villa' },
  { id: 'villa-047', label: 'Puglia Trulli Villa', slug: 'puglia-trulli-villa', region: 'Italy', type: 'villa' },
  { id: 'villa-048', label: 'Florence Vineyard Villa', slug: 'florence-vineyard-villa', region: 'Italy', type: 'villa' },
  { id: 'villa-049', label: 'Positano Cliffside House', slug: 'positano-cliffside-house', region: 'Italy', type: 'villa' },
  { id: 'villa-050', label: 'Sorrento Lemon Grove', slug: 'sorrento-lemon-grove', region: 'Italy', type: 'villa' },

  // Portugal - Sample
  { id: 'villa-051', label: 'Algarve Golf Villa', slug: 'algarve-golf-villa', region: 'Portugal', type: 'villa' },
  { id: 'villa-052', label: 'Lagos Coastal Retreat', slug: 'lagos-coastal-retreat', region: 'Portugal', type: 'villa' },
  { id: 'villa-053', label: 'Comporta Beach House', slug: 'comporta-beach-house', region: 'Portugal', type: 'villa' },
  { id: 'villa-054', label: 'Douro Valley Estate', slug: 'douro-valley-estate', region: 'Portugal', type: 'villa' },
  { id: 'villa-055', label: 'Albufeira Cliffside Villa', slug: 'albufeira-cliffside-villa', region: 'Portugal', type: 'villa' },
  { id: 'villa-056', label: 'Lisbon Coast Modern Home', slug: 'lisbon-coast-modern-home', region: 'Portugal', type: 'villa' },
  { id: 'villa-057', label: 'Alentejo Country Villa', slug: 'alentejo-country-villa', region: 'Portugal', type: 'villa' },
  { id: 'villa-058', label: 'Porto Wine Estate', slug: 'porto-wine-estate', region: 'Portugal', type: 'villa' },
  { id: 'villa-059', label: 'Cascais Luxury Villa', slug: 'cascais-luxury-villa', region: 'Portugal', type: 'villa' },
  { id: 'villa-060', label: 'Tavira Historic House', slug: 'tavira-historic-house', region: 'Portugal', type: 'villa' },

  // Turkey - Sample
  { id: 'villa-061', label: 'Kalkan Sea View Villa', slug: 'kalkan-sea-view-villa', region: 'Turkey', type: 'villa' },
  { id: 'villa-062', label: 'Bodrum Luxury Estate', slug: 'bodrum-luxury-estate', region: 'Turkey', type: 'villa' },
  { id: 'villa-063', label: 'Fethiye Mountain Villa', slug: 'fethiye-mountain-villa', region: 'Turkey', type: 'villa' },
  { id: 'villa-064', label: 'Kas Coastal Retreat', slug: 'kas-coastal-retreat', region: 'Turkey', type: 'villa' },
  { id: 'villa-065', label: 'Turquoise Coast Villa', slug: 'turquoise-coast-villa', region: 'Turkey', type: 'villa' },
  { id: 'villa-066', label: 'Antalya Beach House', slug: 'antalya-beach-house', region: 'Turkey', type: 'villa' },
  { id: 'villa-067', label: 'Marmaris Marina Villa', slug: 'marmaris-marina-villa', region: 'Turkey', type: 'villa' },
  { id: 'villa-068', label: 'Datca Peninsula Estate', slug: 'datca-peninsula-estate', region: 'Turkey', type: 'villa' },
  { id: 'villa-069', label: 'Gocek Bay Villa', slug: 'gocek-bay-villa', region: 'Turkey', type: 'villa' },
  { id: 'villa-070', label: 'Oludeniz Blue Lagoon', slug: 'oludeniz-blue-lagoon', region: 'Turkey', type: 'villa' },

  // Croatia - Sample
  { id: 'villa-071', label: 'Dubrovnik Old Town Villa', slug: 'dubrovnik-old-town-villa', region: 'Croatia', type: 'villa' },
  { id: 'villa-072', label: 'Hvar Island Retreat', slug: 'hvar-island-retreat', region: 'Croatia', type: 'villa' },
  { id: 'villa-073', label: 'Split Coastal Villa', slug: 'split-coastal-villa', region: 'Croatia', type: 'villa' },
  { id: 'villa-074', label: 'Istria Hilltop Estate', slug: 'istria-hilltop-estate', region: 'Croatia', type: 'villa' },
  { id: 'villa-075', label: 'Dalmatian Coast House', slug: 'dalmatian-coast-house', region: 'Croatia', type: 'villa' },
  { id: 'villa-076', label: 'Korcula Island Villa', slug: 'korcula-island-villa', region: 'Croatia', type: 'villa' },
  { id: 'villa-077', label: 'Brac Beachfront Home', slug: 'brac-beachfront-home', region: 'Croatia', type: 'villa' },
  { id: 'villa-078', label: 'Zadar Sunset Villa', slug: 'zadar-sunset-villa', region: 'Croatia', type: 'villa' },
  { id: 'villa-079', label: 'Rovinj Coastal Retreat', slug: 'rovinj-coastal-retreat', region: 'Croatia', type: 'villa' },
  { id: 'villa-080', label: 'Makarska Riviera Villa', slug: 'makarska-riviera-villa', region: 'Croatia', type: 'villa' },
];

/**
 * Combined search data for autosuggest
 */
export const SEARCH_DATA = {
  regions: REGIONS,
  towns: TOWNS,
  villas: VILLAS,
};

/**
 * Fast in-memory search function
 * Filters all categories and returns top 5 matches per category
 *
 * PHASE 14: Implements deduplication to prevent items appearing in multiple categories
 * Priority order: Countries > Regions > Towns > Villas
 */
export function searchStaticData(query: string): {
  countries: StaticRegion[];
  regions: StaticRegion[];
  towns: StaticTown[];
  villas: StaticVilla[];
} {
  if (!query || query.length < 3) {
    return { countries: [], regions: [], towns: [], villas: [] };
  }

  const searchTerm = query.toLowerCase().trim();

  // PHASE 14: Track seen items to prevent duplicates
  const seen = new Set<string>();

  // STEP 1: Filter countries first (type: 'country')
  const matchedCountries = REGIONS.filter(r =>
    r.type === 'country' &&
    (r.label.toLowerCase().includes(searchTerm) || r.slug.includes(searchTerm))
  ).slice(0, 5);

  // Add countries to seen set
  matchedCountries.forEach(c => {
    seen.add(c.label.toLowerCase());
    seen.add(c.slug);
  });

  // STEP 2: Filter regions (type: 'region'), excluding already seen
  const matchedRegions = REGIONS.filter(r =>
    r.type === 'region' &&
    (r.label.toLowerCase().includes(searchTerm) || r.slug.includes(searchTerm)) &&
    !seen.has(r.label.toLowerCase()) &&
    !seen.has(r.slug)
  ).slice(0, 5);

  // Add regions to seen set
  matchedRegions.forEach(r => {
    seen.add(r.label.toLowerCase());
    seen.add(r.slug);
  });

  // STEP 3: Filter towns, excluding already seen
  const matchedTowns = TOWNS.filter(t =>
    (t.label.toLowerCase().includes(searchTerm) || t.slug.includes(searchTerm)) &&
    !seen.has(t.label.toLowerCase()) &&
    !seen.has(t.slug)
  ).slice(0, 5);

  // Add towns to seen set
  matchedTowns.forEach(t => {
    seen.add(t.label.toLowerCase());
    seen.add(t.slug);
  });

  // STEP 4: Filter villas, excluding already seen
  const matchedVillas = VILLAS.filter(v =>
    (v.label.toLowerCase().includes(searchTerm) || v.slug.includes(searchTerm)) &&
    !seen.has(v.label.toLowerCase()) &&
    !seen.has(v.slug)
  ).slice(0, 5);

  return {
    countries: matchedCountries,
    regions: matchedRegions,
    towns: matchedTowns,
    villas: matchedVillas,
  };
}
