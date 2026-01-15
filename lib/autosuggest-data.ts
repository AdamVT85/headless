/**
 * STATIC AUTOSUGGEST DATA
 * Pre-computed location and villa data for instant search suggestions
 *
 * To regenerate villa data from Salesforce, run:
 * npm run generate:autosuggest
 *
 * Note: Countries, regions, and towns are manually curated from the
 * location hierarchy defined in country-regions-config.ts
 */

export interface LocationItem {
  id: string;
  label: string;
  slug: string;
  type: 'country' | 'region' | 'town';
}

export interface VillaItem {
  id: string;
  name: string;
  slug: string;
}

// Countries (8 total)
export const COUNTRIES: LocationItem[] = [
  { id: 'country-spain', label: 'Spain', slug: 'spain', type: 'country' },
  { id: 'country-balearics', label: 'Balearics', slug: 'balearics', type: 'country' },
  { id: 'country-croatia', label: 'Croatia', slug: 'croatia', type: 'country' },
  { id: 'country-italy', label: 'Italy', slug: 'italy', type: 'country' },
  { id: 'country-greece', label: 'Greece', slug: 'greece', type: 'country' },
  { id: 'country-france', label: 'France', slug: 'france', type: 'country' },
  { id: 'country-portugal', label: 'Portugal', slug: 'portugal', type: 'country' },
  { id: 'country-turkey', label: 'Turkey', slug: 'turkey', type: 'country' },
];

// Regions (27 total)
export const REGIONS: LocationItem[] = [
  // Spain
  { id: 'region-galicia', label: 'Galicia', slug: 'galicia', type: 'region' },
  { id: 'region-costa-blanca', label: 'Costa Blanca', slug: 'costa-blanca', type: 'region' },
  { id: 'region-andalucia', label: 'Andalucia', slug: 'andalucia', type: 'region' },
  { id: 'region-catalunya', label: 'Catalunya', slug: 'catalunya', type: 'region' },
  // Balearics
  { id: 'region-mallorca', label: 'Mallorca', slug: 'mallorca', type: 'region' },
  { id: 'region-menorca', label: 'Menorca', slug: 'menorca', type: 'region' },
  // Croatia
  { id: 'region-dubrovnik', label: 'Dubrovnik', slug: 'dubrovnik', type: 'region' },
  { id: 'region-istria', label: 'Istria', slug: 'istria', type: 'region' },
  // Italy
  { id: 'region-lazio', label: 'Lazio', slug: 'lazio', type: 'region' },
  { id: 'region-puglia', label: 'Puglia', slug: 'puglia', type: 'region' },
  { id: 'region-tuscany', label: 'Tuscany', slug: 'tuscany', type: 'region' },
  { id: 'region-umbria', label: 'Umbria', slug: 'umbria', type: 'region' },
  // Greece
  { id: 'region-corfu', label: 'Corfu', slug: 'corfu', type: 'region' },
  { id: 'region-crete', label: 'Crete', slug: 'crete', type: 'region' },
  { id: 'region-lefkada', label: 'Lefkada', slug: 'lefkada', type: 'region' },
  { id: 'region-kefalonia', label: 'Kefalonia', slug: 'kefalonia', type: 'region' },
  { id: 'region-meganisi', label: 'Meganisi', slug: 'meganisi', type: 'region' },
  { id: 'region-parga', label: 'Parga', slug: 'parga', type: 'region' },
  { id: 'region-peloponnese', label: 'Peloponnese', slug: 'peloponnese', type: 'region' },
  { id: 'region-zakynthos', label: 'Zakynthos', slug: 'zakynthos', type: 'region' },
  // France
  { id: 'region-cote-d-azur', label: "Côte d'Azur", slug: 'cote-azur', type: 'region' },
  { id: 'region-languedoc', label: 'Languedoc', slug: 'languedoc', type: 'region' },
  { id: 'region-provence', label: 'Provence', slug: 'provence', type: 'region' },
  { id: 'region-south-west-france', label: 'South West France', slug: 'south-west-france', type: 'region' },
  // Portugal
  { id: 'region-costa-verde-minho', label: 'Costa Verde & Minho', slug: 'costa-verde-minho', type: 'region' },
  { id: 'region-algarve', label: 'Algarve', slug: 'algarve', type: 'region' },
  // Turkey
  { id: 'region-lycian-coast', label: 'Lycian Coast', slug: 'lycian-coast', type: 'region' },
];

// Towns - common towns from each region
export const TOWNS: LocationItem[] = [
  // Greece - Kefalonia
  { id: 'town-fiskardo', label: 'Fiskardo', slug: 'fiskardo', type: 'town' },
  { id: 'town-sami', label: 'Sami', slug: 'sami', type: 'town' },
  { id: 'town-argostoli', label: 'Argostoli', slug: 'argostoli', type: 'town' },
  { id: 'town-skala', label: 'Skala', slug: 'skala', type: 'town' },
  { id: 'town-lourdas', label: 'Lourdas', slug: 'lourdas', type: 'town' },
  { id: 'town-agia-effimia', label: 'Agia Effimia', slug: 'agia-effimia', type: 'town' },
  // Greece - Corfu
  { id: 'town-kassiopi', label: 'Kassiopi', slug: 'kassiopi', type: 'town' },
  { id: 'town-sidari', label: 'Sidari', slug: 'sidari', type: 'town' },
  { id: 'town-paleokastritsa', label: 'Paleokastritsa', slug: 'paleokastritsa', type: 'town' },
  { id: 'town-nissaki', label: 'Nissaki', slug: 'nissaki', type: 'town' },
  // Greece - Crete
  { id: 'town-chania', label: 'Chania', slug: 'chania', type: 'town' },
  { id: 'town-rethymno', label: 'Rethymno', slug: 'rethymno', type: 'town' },
  // Greece - Lefkada
  { id: 'town-nidri', label: 'Nidri', slug: 'nidri', type: 'town' },
  { id: 'town-vassiliki', label: 'Vassiliki', slug: 'vassiliki', type: 'town' },
  // Greece - Zakynthos
  { id: 'town-tsilivi', label: 'Tsilivi', slug: 'tsilivi', type: 'town' },
  { id: 'town-laganas', label: 'Laganas', slug: 'laganas', type: 'town' },
  // Spain - Costa Blanca
  { id: 'town-javea', label: 'Jávea', slug: 'javea', type: 'town' },
  { id: 'town-moraira', label: 'Moraira', slug: 'moraira', type: 'town' },
  { id: 'town-denia', label: 'Denia', slug: 'denia', type: 'town' },
  { id: 'town-calpe', label: 'Calpe', slug: 'calpe', type: 'town' },
  { id: 'town-benitachell', label: 'Benitachell', slug: 'benitachell', type: 'town' },
  // Spain - Catalunya
  { id: 'town-begur', label: 'Begur', slug: 'begur', type: 'town' },
  { id: 'town-palafrugell', label: 'Palafrugell', slug: 'palafrugell', type: 'town' },
  { id: 'town-tamariu', label: 'Tamariu', slug: 'tamariu', type: 'town' },
  // Spain - Andalucia
  { id: 'town-ronda', label: 'Ronda', slug: 'ronda', type: 'town' },
  { id: 'town-marbella', label: 'Marbella', slug: 'marbella', type: 'town' },
  { id: 'town-vejer', label: 'Vejer de la Frontera', slug: 'vejer', type: 'town' },
  // Spain - Galicia
  { id: 'town-cangas', label: 'Cangas', slug: 'cangas', type: 'town' },
  { id: 'town-sanxenxo', label: 'Sanxenxo', slug: 'sanxenxo', type: 'town' },
  // Balearics - Mallorca
  { id: 'town-pollensa', label: 'Pollensa', slug: 'pollensa', type: 'town' },
  { id: 'town-soller', label: 'Sóller', slug: 'soller', type: 'town' },
  { id: 'town-deia', label: 'Deià', slug: 'deia', type: 'town' },
  { id: 'town-alcudia', label: 'Alcúdia', slug: 'alcudia', type: 'town' },
  // Balearics - Menorca
  { id: 'town-ciutadella', label: 'Ciutadella', slug: 'ciutadella', type: 'town' },
  { id: 'town-mahon', label: 'Mahón', slug: 'mahon', type: 'town' },
  // Italy - Tuscany
  { id: 'town-cortona', label: 'Cortona', slug: 'cortona', type: 'town' },
  { id: 'town-lucca', label: 'Lucca', slug: 'lucca', type: 'town' },
  { id: 'town-siena', label: 'Siena', slug: 'siena', type: 'town' },
  { id: 'town-florence', label: 'Florence', slug: 'florence', type: 'town' },
  // Italy - Umbria
  { id: 'town-perugia', label: 'Perugia', slug: 'perugia', type: 'town' },
  { id: 'town-assisi', label: 'Assisi', slug: 'assisi', type: 'town' },
  { id: 'town-todi', label: 'Todi', slug: 'todi', type: 'town' },
  // Italy - Puglia
  { id: 'town-lecce', label: 'Lecce', slug: 'lecce', type: 'town' },
  // France - Provence
  { id: 'town-gordes', label: 'Gordes', slug: 'gordes', type: 'town' },
  { id: 'town-roussillon', label: 'Roussillon', slug: 'roussillon', type: 'town' },
  { id: 'town-saint-remy', label: 'Saint-Rémy-de-Provence', slug: 'saint-remy', type: 'town' },
  // France - Côte d'Azur
  { id: 'town-nice', label: 'Nice', slug: 'nice', type: 'town' },
  { id: 'town-cannes', label: 'Cannes', slug: 'cannes', type: 'town' },
  { id: 'town-saint-tropez', label: 'Saint-Tropez', slug: 'saint-tropez', type: 'town' },
  { id: 'town-grasse', label: 'Grasse', slug: 'grasse', type: 'town' },
  // France - South West
  { id: 'town-bergerac', label: 'Bergerac', slug: 'bergerac', type: 'town' },
  { id: 'town-bordeaux', label: 'Bordeaux', slug: 'bordeaux', type: 'town' },
  // Portugal - Algarve
  { id: 'town-tavira', label: 'Tavira', slug: 'tavira', type: 'town' },
  { id: 'town-carvoeiro', label: 'Carvoeiro', slug: 'carvoeiro', type: 'town' },
  { id: 'town-albufeira', label: 'Albufeira', slug: 'albufeira', type: 'town' },
  // Portugal - Costa Verde
  { id: 'town-ponte-de-lima', label: 'Ponte de Lima', slug: 'ponte-de-lima', type: 'town' },
  // Croatia - Istria
  { id: 'town-rovinj', label: 'Rovinj', slug: 'rovinj', type: 'town' },
  { id: 'town-pula', label: 'Pula', slug: 'pula', type: 'town' },
  { id: 'town-motovun', label: 'Motovun', slug: 'motovun', type: 'town' },
  // Croatia - Dubrovnik
  { id: 'town-cavtat', label: 'Cavtat', slug: 'cavtat', type: 'town' },
  // Turkey - Lycian Coast
  { id: 'town-kas', label: 'Kaş', slug: 'kas', type: 'town' },
  { id: 'town-kalkan', label: 'Kalkan', slug: 'kalkan', type: 'town' },
  { id: 'town-fethiye', label: 'Fethiye', slug: 'fethiye', type: 'town' },
];

// Villas - populated by generate:autosuggest script or manually
// These are loaded from Salesforce data
export const VILLAS: VillaItem[] = [];
