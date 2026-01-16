/**
 * PHASE 56: DYNAMIC REGION LANDING PAGES
 *
 * Powers region-specific landing pages:
 * /villas-in-spain/galicia, /villas-in-greece/kefalonia, etc.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getAllVillas } from '@/lib/crm-client';
import { MapPin, Search, ShieldCheck, Star, Phone } from 'lucide-react';
import { TownExplorer } from '@/components/llp/town-explorer';
import { HeroSearch } from '@/components/hero-search';
import { getClimateAverages } from '@/lib/weather';
import { ClimateWidget } from '@/components/villa/climate-widget';
import { RegionVillasSection } from '@/components/region-villas-section';

// ===== REGION CONFIGURATION =====

interface RegionConfig {
  name: string;
  slug: string;
  country: string;
  countrySlug: string;
  heroImage: string;
  introTitle: string;
  introSubtitle: string;
  introText: string[];
}

// Helper to normalize strings for comparison
const normalize = (str: string) => str?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';

// Sub-region mapping: maps sub-regions/towns to their parent regions
// This handles cases where the CRM stores sub-region names instead of parent region names
const SUB_REGION_MAPPING: Record<string, string[]> = {
  // Spain - Catalunya (includes Costa Brava)
  'catalunya': ['costa brava', 'tamariu', 'palafrugell', 'calella de palafrugell', 'begur', 'llafranc', 'palafrugell area', 'aiguablava', 'fornells', 'emporda'],
  // Spain - Galicia
  'galicia': ['cangas', 'cesantes', 'nigran', 'gondomar', 'vigo', 'rias baixas', 'pontevedra', 'sanxenxo', 'sanxenxo and surrounding villages', 'mondariz balneario', 'negreira', 'hio', 'o porriño', 'o porrino'],
  // Spain - Andalucia
  'andalucia': ['el bosque', 'conil de la frontera', 'orgiva', 'ronda', 'grazalema', 'alpujarras', 'costa de la luz', 'vejer', 'tarifa', 'cadiz', 'jerez', 'seville', 'granada', 'malaga', 'marbella', 'nerja', 'frigiliana'],
  // Spain - Costa Blanca
  'costa-blanca': ['javea', 'moraira', 'denia', 'calpe', 'altea', 'benidorm', 'alicante', 'orihuela', 'torrevieja', 'xabia'],
  // France - Provence
  'provence': ['saint remy de provence', 'st remy', 'avignon', 'aix en provence', 'luberon', 'alpilles', 'gordes', 'roussillon', 'bonnieux', 'menerbes', 'lacoste', 'apt', 'pernes les fontaines'],
  // France - Cote d'Azur
  'cote-dazur': ['nice', 'cannes', 'antibes', 'grasse', 'vence', 'saint paul de vence', 'mougins', 'biot', 'eze', 'menton', 'villefranche'],
  // France - South West France
  'south-west-france': ['bergerac', 'dordogne', 'lot', 'sarlat', 'cahors', 'najac', 'rabastens', 'sainte foy la grande', 'bordeaux', 'perigord', 'quercy'],
  // France - Languedoc
  'languedoc': ['carcassonne', 'narbonne', 'montpellier', 'beziers', 'uzes', 'nimes', 'perpignan'],
  // Italy - Tuscany
  'tuscany': ['bagni di lucca', 'lucca', 'florence', 'siena', 'pisa', 'chianti', 'cortona', 'arezzo', 'montepulciano', 'montalcino', 'san gimignano', 'volterra'],
  // Italy - Umbria
  'umbria': ['perugia', 'assisi', 'spoleto', 'orvieto', 'todi', 'gubbio', 'norcia', 'foligno'],
  // Italy - Puglia
  'puglia': ['lecce', 'ostuni', 'alberobello', 'polignano', 'monopoli', 'bari', 'brindisi', 'otranto', 'gallipoli', 'martina franca'],
  // Italy - Lazio
  'lazio': ['rome', 'roma', 'viterbo', 'tivoli', 'bracciano', 'civita di bagnoregio'],
  // Greece - Kefalonia
  'kefalonia': ['fiskardo', 'fiscardo', 'assos', 'agia efimia', 'sami', 'argostoli', 'lixouri', 'skala', 'lourdas', 'spartia'],
  // Greece - Corfu
  'corfu': ['kassiopi', 'sidari', 'paleokastritsa', 'benitses', 'gouvia', 'dassia', 'kontokali', 'agios stefanos', 'acharavi', 'roda'],
  // Greece - Lefkada
  'lefkada': ['nidri', 'vasiliki', 'sivota', 'agios nikitas', 'lefkas'],
  // Greece - Crete
  'crete': ['chania', 'chania area', 'rethymno', 'heraklion', 'agios nikolaos', 'elounda', 'ierapetra', 'sitia'],
  // Greece - Zakynthos
  'zakynthos': ['zante', 'tsilivi', 'laganas', 'kalamaki', 'vasilikos', 'alykes'],
  // Greece - Peloponnese
  'peloponnese': ['messinia', 'navarino bay', 'stoupa', 'kardamyli', 'mani', 'kalamata', 'olympia', 'nafplio', 'monemvasia', 'mystras'],
  // Greece - Parga
  'parga': ['sivota', 'perdika', 'ammoudia'],
  // Greece - Meganisi
  'meganisi': ['vathi', 'spartochori', 'katomeri'],
  // Portugal - Algarve
  'algarve': ['carvoeiro', 'estoi', 'faro', 'albufeira', 'vilamoura', 'lagos', 'portimao', 'tavira', 'olhao', 'loulé', 'silves', 'monchique', 'quinta do lago', 'vale do lobo'],
  // Portugal - Costa Verde & Minho
  'costa-verde-minho': ['povoa de lanhoso', 'braga', 'guimaraes', 'porto', 'viana do castelo', 'ponte de lima'],
  // Croatia - Dubrovnik
  'dubrovnik': ['konavle', 'konavle valley', 'cavtat', 'mlini', 'srebreno', 'zaton'],
  // Croatia - Istria
  'istria': ['rovinj', 'pula', 'porec', 'umag', 'motovun', 'groznjan', 'buzet', 'labin', 'rabac'],
  // Turkey - Lycian Coast
  'lycian-coast': ['kalkan', 'kas', 'fethiye', 'oludeniz', 'kayakoy', 'dalyan', 'gocek', 'bodrum', 'marmaris'],
  // Balearics - Mallorca
  'mallorca': ['pollenca', 'pollensa', 'port de pollenca', 'alcudia', 'port d\'alcudia', 'soller', 'port de soller', 'deia', 'valldemossa', 'andratx', 'cala d\'or', 'santanyi', 'campos', 'felanitx', 'manacor', 'arta', 'capdepera', 'palma', 'calvia', 'santa ponsa', 'cas concos', 'ca\'s concos', 'binissalem', 'cala sa nau', 'portocolom', 'buger'],
  // Balearics - Menorca
  'menorca': ['mahon', 'ciutadella', 'alaior', 'ferreries', 'es mercadal', 'fornells', 'binibeca', 'cala en porter', 'son bou', 'torre soli'],
};

// Helper to check if a villa's region matches the parent region or is a sub-region
const matchesRegion = (villaRegion: string, configName: string, configSlug: string): boolean => {
  const normalizedVillaRegion = normalize(villaRegion);
  const normalizedConfigName = normalize(configName);

  // Direct match (exact)
  if (normalizedVillaRegion === normalizedConfigName) return true;

  // Partial match (villa's region contains the config name)
  if (normalizedVillaRegion.includes(normalizedConfigName)) return true;

  // Check sub-region mapping (exact match against sub-regions)
  const subRegions = SUB_REGION_MAPPING[configSlug] || [];
  return subRegions.some(sub => normalize(sub) === normalizedVillaRegion);
};

// Region configurations - expandable
const REGION_CONFIG: Record<string, Record<string, RegionConfig>> = {
  spain: {
    galicia: {
      name: 'Galicia',
      slug: 'galicia',
      country: 'Spain',
      countrySlug: 'spain',
      heroImage: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our beautiful Galicia villas',
      introSubtitle: 'The Green Corner of Spain',
      introText: [
        'Discover the stunning green landscapes of Galicia, where Celtic heritage meets Atlantic beauty.',
        'From the pilgrimage city of Santiago de Compostela to the wild Rías Baixas coastline, Galicia offers a Spain unlike any other.',
        'Our handpicked villas provide the perfect base to explore this lush, unspoiled region.',
      ],
    },
    'costa-blanca': {
      name: 'Costa Blanca',
      slug: 'costa-blanca',
      country: 'Spain',
      countrySlug: 'spain',
      heroImage: 'https://images.unsplash.com/photo-1512413914633-b5043f4041ea?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Costa Blanca villas',
      introSubtitle: 'The White Coast',
      introText: [
        'The Costa Blanca, or "White Coast," is renowned for its stunning white sandy beaches, year-round sunshine, and charming coastal towns.',
        'Discover the picturesque towns of Jávea, Moraira, and Denia, or explore the dramatic cliffs and hidden coves.',
        'Our villas offer the perfect base to experience the best of this sun-drenched Mediterranean coastline.',
      ],
    },
    andalucia: {
      name: 'Andalucia',
      slug: 'andalucia',
      country: 'Spain',
      countrySlug: 'spain',
      heroImage: 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Andalucia villas',
      introSubtitle: 'The Soul of Spain',
      introText: [
        'Andalucia is the Spain of your dreams - flamenco, tapas, and sun-drenched landscapes.',
        'Visit the Alhambra, explore whitewashed villages, and enjoy the passionate culture of southern Spain.',
        'Our villas range from countryside retreats to coastal escapes.',
      ],
    },
    catalunya: {
      name: 'Catalunya',
      slug: 'catalunya',
      country: 'Spain',
      countrySlug: 'spain',
      heroImage: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Catalunya villas',
      introSubtitle: 'Culture & Coast',
      introText: [
        'Catalunya offers a unique blend of distinct culture, stunning architecture, and diverse landscapes.',
        'From the cosmopolitan energy of Barcelona to the peaceful Pyrenean foothills, there\'s something for everyone.',
        'Our villas capture the authentic Catalan lifestyle.',
      ],
    },
  },
  greece: {
    kefalonia: {
      name: 'Kefalonia',
      slug: 'kefalonia',
      country: 'Greece',
      countrySlug: 'greece',
      heroImage: 'https://images.unsplash.com/photo-1601581875039-e899893d520c?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Kefalonia villas',
      introSubtitle: 'Ionian Paradise',
      introText: [
        'Kefalonia is the largest of the Ionian Islands, featuring dramatic landscapes from Mount Ainos to the famous Myrtos Beach.',
        'Explore underground lakes, swim in turquoise waters, and experience authentic Greek island life.',
        'Our villas offer stunning sea views and easy access to the island\'s best beaches.',
      ],
    },
    corfu: {
      name: 'Corfu',
      slug: 'corfu',
      country: 'Greece',
      countrySlug: 'greece',
      heroImage: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Corfu villas',
      introSubtitle: 'The Emerald Isle',
      introText: [
        'Corfu combines Venetian elegance with Greek charm, creating a unique island atmosphere.',
        'Lush green landscapes, beautiful beaches, and a rich cultural heritage await.',
        'Our villas range from traditional stone houses to modern luxury retreats.',
      ],
    },
    crete: {
      name: 'Crete',
      slug: 'crete',
      country: 'Greece',
      countrySlug: 'greece',
      heroImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Crete villas',
      introSubtitle: 'Birthplace of Civilization',
      introText: [
        'Greece\'s largest island offers incredible diversity - ancient ruins, dramatic gorges, and some of Europe\'s finest beaches.',
        'Discover the Palace of Knossos, hike Samaria Gorge, and sample authentic Cretan cuisine.',
        'Our villas provide the perfect base for island exploration.',
      ],
    },
    lefkada: {
      name: 'Lefkada',
      slug: 'lefkada',
      country: 'Greece',
      countrySlug: 'greece',
      heroImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Lefkada villas',
      introSubtitle: 'World-Class Beaches',
      introText: [
        'Connected to the mainland by a bridge, Lefkada offers easy access to some of Greece\'s most stunning beaches.',
        'Porto Katsiki and Egremni beaches regularly feature in world\'s best beach lists.',
        'Our villas put you close to the action while offering peaceful retreats.',
      ],
    },
    parga: {
      name: 'Parga',
      slug: 'parga',
      country: 'Greece',
      countrySlug: 'greece',
      heroImage: 'https://images.unsplash.com/photo-1504512485720-7d83a16ee930?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Parga villas',
      introSubtitle: 'Venetian Charm',
      introText: [
        'This colorful coastal town on the mainland offers the island atmosphere with mainland accessibility.',
        'Wander through Venetian streets, swim from sandy beaches, and enjoy spectacular sunsets.',
        'Our hillside villas offer stunning views over the bay.',
      ],
    },
    zakynthos: {
      name: 'Zakynthos',
      slug: 'zakynthos',
      country: 'Greece',
      countrySlug: 'greece',
      heroImage: 'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Zakynthos villas',
      introSubtitle: 'Natural Beauty',
      introText: [
        'Home to the iconic Shipwreck Beach, Zakynthos combines stunning natural beauty with vibrant nightlife.',
        'Swim with sea turtles, explore the Blue Caves, or simply relax on golden beaches.',
        'Our villas cater to every taste, from peaceful retreats to lively resorts.',
      ],
    },
    peloponnese: {
      name: 'Peloponnese',
      slug: 'peloponnese',
      country: 'Greece',
      countrySlug: 'greece',
      heroImage: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Peloponnese villas',
      introSubtitle: 'Cradle of Civilization',
      introText: [
        'The Peloponnese peninsula is the cradle of ancient Greek civilization.',
        'Visit ancient Olympia, explore the Byzantine city of Mystras, or relax on the beaches of the Mani peninsula.',
        'Our villas offer a gateway to Greece\'s rich history.',
      ],
    },
    meganisi: {
      name: 'Meganisi',
      slug: 'meganisi',
      country: 'Greece',
      countrySlug: 'greece',
      heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Meganisi villas',
      introSubtitle: 'Ultimate Escape',
      introText: [
        'This tiny island offers the ultimate escape - just three villages, pristine waters, and complete tranquility.',
        'Perfect for those seeking peace and authentic Greek charm away from the tourist crowds.',
        'Our villas offer a genuine off-the-beaten-path experience.',
      ],
    },
  },
  italy: {
    tuscany: {
      name: 'Tuscany',
      slug: 'tuscany',
      country: 'Italy',
      countrySlug: 'italy',
      heroImage: 'https://images.unsplash.com/photo-1534445867742-43195f401b6c?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Tuscan villas',
      introSubtitle: 'Rolling Hills & Renaissance',
      introText: [
        'Tuscany is the quintessential Italian landscape - rolling hills, cypress-lined roads, and world-famous wines.',
        'Visit Florence\'s galleries, explore medieval hill towns, and enjoy the view with a glass of Chianti.',
        'Our villas capture the essence of la dolce vita.',
      ],
    },
    umbria: {
      name: 'Umbria',
      slug: 'umbria',
      country: 'Italy',
      countrySlug: 'italy',
      heroImage: 'https://images.unsplash.com/photo-1600019248002-f4e630104dc9?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Umbria villas',
      introSubtitle: 'The Green Heart of Italy',
      introText: [
        'Umbria offers a more authentic, less touristy alternative to neighboring Tuscany.',
        'Discover Assisi\'s spiritual heritage, sample black truffles, and enjoy the peaceful countryside.',
        'Our secluded villas provide the ultimate Italian escape.',
      ],
    },
    puglia: {
      name: 'Puglia',
      slug: 'puglia',
      country: 'Italy',
      countrySlug: 'italy',
      heroImage: 'https://images.unsplash.com/photo-1596097561109-2eeff92a7a20?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Puglia villas',
      introSubtitle: 'Italy\'s Best-Kept Secret',
      introText: [
        'The heel of Italy\'s boot is home to whitewashed towns, ancient olive groves, and stunning beaches.',
        'Stay in a traditional masseria or modern villa and discover why Puglia is Italy\'s hottest destination.',
        'Our villas offer authentic southern Italian hospitality.',
      ],
    },
    lazio: {
      name: 'Lazio',
      slug: 'lazio',
      country: 'Italy',
      countrySlug: 'italy',
      heroImage: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Lazio villas',
      introSubtitle: 'Gateway to Rome',
      introText: [
        'Home to Rome, Lazio offers the perfect blend of ancient history and stunning countryside.',
        'Explore Roman ruins, relax by volcanic lakes, or venture to the beautiful coast.',
        'Our villas put the Eternal City within easy reach.',
      ],
    },
  },
  france: {
    provence: {
      name: 'Provence',
      slug: 'provence',
      country: 'France',
      countrySlug: 'france',
      heroImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Provence villas',
      introSubtitle: 'Lavender & Light',
      introText: [
        'Lavender fields, hilltop villages, and world-famous light have inspired artists for generations.',
        'Visit local markets, sample excellent wines, and embrace the slow pace of Provencal life.',
        'Our countryside villas offer the authentic French experience.',
      ],
    },
    'cote-dazur': {
      name: "Cote d'Azur",
      slug: 'cote-dazur',
      country: 'France',
      countrySlug: 'france',
      heroImage: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1920&h=1080&fit=crop&q=80',
      introTitle: "Our Cote d'Azur villas",
      introSubtitle: 'French Riviera Glamour',
      introText: [
        'The French Riviera needs no introduction - glamorous beaches, chic towns, and year-round sunshine.',
        'From Nice to Saint-Tropez, experience Riviera elegance from your private retreat.',
        'Our villas combine luxury with the best Mediterranean lifestyle.',
      ],
    },
    languedoc: {
      name: 'Languedoc',
      slug: 'languedoc',
      country: 'France',
      countrySlug: 'france',
      heroImage: 'https://images.unsplash.com/photo-1558618047-f4b0d1b3c19e?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Languedoc villas',
      introSubtitle: 'Undiscovered France',
      introText: [
        'A less discovered region offering Roman heritage, medieval Cathar castles, and unspoiled beaches.',
        'Explore Carcassonne\'s fortress, taste excellent wines, and enjoy the authentic French south.',
        'Our villas offer exceptional value in stunning surroundings.',
      ],
    },
    'south-west-france': {
      name: 'South West France',
      slug: 'south-west-france',
      country: 'France',
      countrySlug: 'france',
      heroImage: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our South West France villas',
      introSubtitle: 'Gastronomy & History',
      introText: [
        'From the Dordogne\'s prehistoric caves to Bordeaux\'s legendary vineyards, this region offers endless discovery.',
        'Explore castles, kayak down rivers, and indulge in duck confit and foie gras.',
        'Our villas provide the perfect base for culinary adventures.',
      ],
    },
  },
  portugal: {
    algarve: {
      name: 'Algarve',
      slug: 'algarve',
      country: 'Portugal',
      countrySlug: 'portugal',
      heroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Algarve villas',
      introSubtitle: 'Sun-Drenched Paradise',
      introText: [
        'Europe\'s sunniest region offers golden beaches, dramatic cliffs, and world-class golf courses.',
        'From family-friendly Albufeira to sophisticated Quinta do Lago, the Algarve caters to every taste.',
        'Our villas range from beachfront retreats to countryside escapes.',
      ],
    },
    'costa-verde-minho': {
      name: 'Costa Verde & Minho',
      slug: 'costa-verde-minho',
      country: 'Portugal',
      countrySlug: 'portugal',
      heroImage: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Costa Verde & Minho villas',
      introSubtitle: 'Green Portugal',
      introText: [
        'Portugal\'s green north offers lush landscapes, historic towns, and the birthplace of the nation.',
        'Explore Guimaraes and Braga, taste Vinho Verde, and discover a Portugal far from the crowds.',
        'Our villas showcase authentic Portuguese hospitality.',
      ],
    },
  },
  croatia: {
    dubrovnik: {
      name: 'Dubrovnik',
      slug: 'dubrovnik',
      country: 'Croatia',
      countrySlug: 'croatia',
      heroImage: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Dubrovnik villas',
      introSubtitle: 'Pearl of the Adriatic',
      introText: [
        'Dubrovnik\'s ancient walls and stunning coastal setting need no introduction.',
        'Explore the UNESCO World Heritage city, island-hop to nearby Elaphiti Islands, or swim in crystal-clear waters.',
        'Our luxury villas offer the perfect base for your Adriatic adventure.',
      ],
    },
    istria: {
      name: 'Istria',
      slug: 'istria',
      country: 'Croatia',
      countrySlug: 'croatia',
      heroImage: 'https://images.unsplash.com/photo-1596097557847-1d49e8e327e6?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Istria villas',
      introSubtitle: 'The New Tuscany',
      introText: [
        'Often called "the new Tuscany," Istria combines Italian influence with Croatian authenticity.',
        'Rolling hills, truffle forests, and charming hilltop towns await.',
        'Our villas offer world-class olive oil, wine, and Mediterranean living.',
      ],
    },
  },
  balearics: {
    mallorca: {
      name: 'Mallorca',
      slug: 'mallorca',
      country: 'Balearics',
      countrySlug: 'balearics',
      heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Mallorca villas',
      introSubtitle: 'Mediterranean Diversity',
      introText: [
        'The largest Balearic island offers incredible diversity - dramatic mountains, pristine beaches, and charming villages.',
        'Explore Palma\'s Gothic cathedral, cycle through almond orchards, or relax by your private pool.',
        'Our villas capture the best of Mallorcan living.',
      ],
    },
    menorca: {
      name: 'Menorca',
      slug: 'menorca',
      country: 'Balearics',
      countrySlug: 'balearics',
      heroImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Menorca villas',
      introSubtitle: 'UNESCO Biosphere Reserve',
      introText: [
        'Menorca is the quieter sister island offering unspoiled beaches, prehistoric monuments, and authentic charm.',
        'A UNESCO Biosphere Reserve, perfect for families and nature lovers.',
        'Our villas provide a peaceful retreat from the modern world.',
      ],
    },
  },
  turkey: {
    'lycian-coast': {
      name: 'Lycian Coast',
      slug: 'lycian-coast',
      country: 'Turkey',
      countrySlug: 'turkey',
      heroImage: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1920&h=1080&fit=crop&q=80',
      introTitle: 'Our Lycian Coast villas',
      introSubtitle: 'Turquoise Paradise',
      introText: [
        'One of the world\'s most beautiful coastlines, dotted with ancient ruins and pine-clad mountains.',
        'Sail on a traditional gulet, explore ancient sites, or paraglide over Oludeniz.',
        'Our villas offer adventure and relaxation in equal measure.',
      ],
    },
  },
};

// ===== METADATA =====

interface PageProps {
  params: Promise<{ country: string; region: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country, region } = await params;
  const countryConfig = REGION_CONFIG[country];
  const config = countryConfig?.[region];

  if (!config) {
    return { title: 'Not Found' };
  }

  return {
    title: `Holiday Villas in ${config.name}, ${config.country} | Vintage Travel`,
    description: `Discover our handpicked collection of luxury holiday villas in ${config.name}, ${config.country}. Personally inspected properties with local support.`,
  };
}

export async function generateStaticParams() {
  const params: { country: string; region: string }[] = [];

  for (const [country, regions] of Object.entries(REGION_CONFIG)) {
    for (const region of Object.keys(regions)) {
      params.push({ country, region });
    }
  }

  return params;
}

// ===== PAGE COMPONENT =====

export default async function RegionLandingPage({ params }: PageProps) {
  const { country, region } = await params;
  const countryConfig = REGION_CONFIG[country];
  const config = countryConfig?.[region];

  if (!config) {
    notFound();
  }

  // Fetch villas and filter by region
  const allVillas = await getAllVillas();

  // Filter villas by region - matches both direct region name and sub-regions
  const regionVillas = allVillas.filter((villa) =>
    matchesRegion(villa.region, config.name, config.slug)
  );

  // Extract unique towns from the villas
  const towns = Array.from(
    new Set(regionVillas.map((v) => v.town).filter((t): t is string => Boolean(t)))
  ).sort();

  // Calculate average coordinates from villas for climate data
  const villasWithCoords = regionVillas.filter((v) => {
    const lat = typeof v.latitude === 'string' ? parseFloat(v.latitude) : v.latitude;
    const lng = typeof v.longitude === 'string' ? parseFloat(v.longitude) : v.longitude;
    return lat && lng && !isNaN(lat) && !isNaN(lng);
  });

  let climateData: Awaited<ReturnType<typeof getClimateAverages>> = [];
  if (villasWithCoords.length > 0) {
    const avgLat = villasWithCoords.reduce((sum, v) => {
      const lat = typeof v.latitude === 'string' ? parseFloat(v.latitude) : v.latitude;
      return sum + (lat || 0);
    }, 0) / villasWithCoords.length;

    const avgLng = villasWithCoords.reduce((sum, v) => {
      const lng = typeof v.longitude === 'string' ? parseFloat(v.longitude) : v.longitude;
      return sum + (lng || 0);
    }, 0) / villasWithCoords.length;

    climateData = await getClimateAverages(avgLat, avgLng);
  }

  return (
    <div className="min-h-screen bg-[#F3F0E9]">
      {/* Hero Section */}
      <HeroSection config={config} />

      {/* Intro Section (includes Quick Facts) */}
      <IntroSection config={config} />

      {/* Town Explorer */}
      {towns.length > 0 && (
        <TownExplorer
          region={config.name}
          towns={towns}
        />
      )}

      {/* Value Props */}
      <ValuePropsSection />

      {/* Climate Widget */}
      {climateData.length > 0 && (
        <section className="bg-[#F9F7F2] py-12 px-6 md:px-20">
          <div className="max-w-6xl mx-auto">
            <ClimateWidget data={climateData} region={config.name} />
          </div>
        </section>
      )}

      {/* All Villas with Map and Filters */}
      <RegionVillasSection villas={regionVillas} regionName={config.name} />

      {/* Categories */}
      <CategoriesSection regionName={config.name} countryName={config.country} />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Newsletter */}
      <NewsletterSection />
    </div>
  );
}

// ===== HERO SECTION =====

function HeroSection({ config }: { config: RegionConfig }) {
  return (
    <div className="relative w-full h-[500px] md:h-[600px]">
      <Image
        src={config.heroImage}
        alt={`${config.name} landscape`}
        fill
        className="object-cover"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Title - Centered between top and search */}
      <div className="absolute inset-x-0 top-[50px] md:top-[80px] text-center px-4">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white tracking-wide drop-shadow-lg">
          Holiday Villas with Private Pools in {config.name}
        </h1>
      </div>

      {/* Interactive Search Bar */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[800px]">
        <HeroSearch
          initialLocation={{
            label: config.name,
            value: config.slug,
            type: 'region',
          }}
        />
      </div>
    </div>
  );
}

// ===== INTRO SECTION =====

function IntroSection({ config }: { config: RegionConfig }) {
  return (
    <section className="bg-[#F9F7F2] pt-16 pb-10 md:pb-16 px-6 md:px-20">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          {' > '}
          <Link href={`/${config.countrySlug}`} className="hover:text-gray-700">
            Villas in {config.country}
          </Link>
          {' > '}
          <span className="text-black">Villas in {config.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
          {/* Text Content */}
          <div className="lg:w-2/3 space-y-6">
            <h2 className="text-3xl md:text-4xl font-serif text-[#3A443C]">{config.introTitle}</h2>
            <p className="font-serif italic text-lg text-gray-600">{config.introSubtitle}</p>

            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              {config.introText.map((text, index) => (
                <p key={index}>{text}</p>
              ))}
            </div>
          </div>

          {/* Stats/Info Box */}
          <div className="lg:w-1/3 bg-white p-8 shadow-sm">
            <h3 className="text-lg font-serif text-[#3A443C] mb-4">Quick Facts</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-[#3A443C]" />
                <span>{config.name}, {config.country}</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#3A443C]" />
                <span>ABTA Protected Holidays</span>
              </li>
              <li className="flex items-center gap-2">
                <Search size={16} className="text-[#3A443C]" />
                <span>All Villas Personally Inspected</span>
              </li>
            </ul>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                href={`/search?region=${encodeURIComponent(config.name)}`}
                className="text-[#3A443C] text-sm font-medium hover:underline"
              >
                View all villas in {config.name} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== VALUE PROPS SECTION =====

function ValuePropsSection() {
  const props = [
    {
      icon: MapPin,
      title: 'Reps in location',
      description: 'Our representatives are based in each destination, ensuring you have local support throughout your stay.',
      linkText: 'Learn More',
      linkUrl: '/about',
    },
    {
      icon: Search,
      title: 'Personally inspected',
      description: 'Every villa has been personally visited and carefully selected by our team of travel specialists.',
      linkText: 'Learn More',
      linkUrl: '/about',
    },
    {
      icon: Star,
      title: 'Expert knowledge',
      description: 'With over 30 years of experience, we provide insider tips and personalized recommendations.',
      linkText: 'Learn More',
      linkUrl: '/about',
    },
    {
      icon: Phone,
      title: 'UK-based support',
      description: 'Our friendly team is available by phone or email to help you plan and book your perfect villa holiday.',
      linkText: 'Contact Us',
      linkUrl: '/contact',
    },
  ];

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-6 md:mb-8">
          <h3 className="text-xl md:text-2xl font-serif text-[#3A443C] italic">Why book with Vintage?</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12">
          {props.map((prop, index) => (
            <div key={index} className="text-center group">
              <div className="mb-3 md:mb-6 flex justify-center transform transition-transform group-hover:scale-110 duration-500">
                <div className="md:hidden">
                  <prop.icon className="w-8 h-8 text-[#3A443C] stroke-[1]" />
                </div>
                <div className="hidden md:block">
                  <prop.icon className="w-10 h-10 text-[#3A443C] stroke-[1]" />
                </div>
              </div>
              <h4 className="text-sm md:text-xl font-serif mb-2 md:mb-4">{prop.title}</h4>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-3 md:mb-6 line-clamp-3 md:line-clamp-none">
                {prop.description}
              </p>
              <Link
                href={prop.linkUrl}
                className="text-[10px] md:text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 hover:border-[#3A443C] transition-colors"
              >
                {prop.linkText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


// ===== CATEGORIES SECTION =====

const CATEGORIES = [
  { id: 1, title: "Villas with children's pools", image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop&q=80', href: "/search?facilities=Children's Pool,Fenced/Gated Pool" },
  { id: 2, title: 'Villas for couples', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop&q=80', href: '/search?maxSleeps=4' },
  { id: 3, title: 'Large villas', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop&q=80', href: '/search?minSleeps=8' },
  { id: 4, title: 'Car not essential', image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&h=400&fit=crop&q=80', href: '/search?facilities=Car NOT Essential' },
  { id: 5, title: 'Villas near beaches', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop&q=80', href: '/search?facilities=Beach - Walk (within 1.5km)' },
  { id: 6, title: 'Secluded villas', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&h=400&fit=crop&q=80', href: '/search?facilities=Grounds offer TOTAL PRIVACY' },
];

function CategoriesSection({ regionName, countryName }: { regionName: string; countryName: string }) {
  return (
    <section className="bg-[#F3F0E9] pt-16 pb-8 px-6 md:px-20">
      <div className="text-center mb-12">
        <h4 className="text-lg font-serif text-gray-600 mb-2">Villas in {regionName}</h4>
        <h2 className="text-3xl md:text-4xl font-serif text-[#3A443C] italic">
          What are you looking for?
        </h2>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-2 gap-3 md:gap-6">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`${cat.href}&region=${encodeURIComponent(regionName)}&country=${encodeURIComponent(countryName)}`}
            className="relative h-48 group cursor-pointer overflow-hidden block"
          >
            <Image
              src={cat.image}
              alt={cat.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center p-4">
              <h3 className="text-white text-xl font-serif text-center drop-shadow-md">{cat.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ===== TESTIMONIALS SECTION =====

const TESTIMONIALS = [
  { id: 1, title: 'Excellent staff', text: 'Excellent knowledgeable patient staff.', author: 'Mrs Karen Reynolds', rating: 5 },
  { id: 2, title: 'Wonderful experience', text: 'The villa exceeded our expectations.', author: 'Mr James Wilson', rating: 5 },
  { id: 3, title: 'Great Service', text: 'Wonderful from start to finish.', author: 'Mr Graham Thomas', rating: 5 },
];

function TestimonialsSection() {
  return (
    <section className="bg-white py-10 border-t border-gray-100">
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="text-gray-500 font-serif">Average Rating:</span>
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} fill="currentColor" />
            ))}
          </div>
          <span className="font-bold text-xl font-serif ml-2">4.9/5</span>
          <span className="font-bold ml-1">feefo</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="p-4 text-center">
              <div className="flex text-yellow-400 justify-center mb-2">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={12} fill="currentColor" />
                ))}
              </div>
              <h4 className="font-bold text-sm mb-1">{t.title}</h4>
              <p className="text-xs text-gray-600 mb-2">{t.text}</p>
              <p className="text-[10px] text-gray-400">{t.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== NEWSLETTER SECTION =====

function NewsletterSection() {
  return (
    <section className="relative h-[350px] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=600&fit=crop&q=80"
          alt="Poolside villa"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-white/80 md:bg-transparent md:bg-gradient-to-r md:from-white/90 md:via-white/70 md:to-transparent"></div>
      </div>

      <div className="relative h-full max-w-6xl mx-auto px-6 md:px-20 flex items-center">
        <div className="w-full md:w-1/2 relative z-10">
          <div className="border-l-4 border-black pl-6 mb-6">
            <h3 className="text-2xl font-serif text-[#3A443C] mb-3">Sign up to our newsletter</h3>
            <p className="text-sm text-gray-600">
              Be the first to hear about our latest villa additions and special offers.
            </p>
          </div>

          <form className="max-w-sm space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="FIRST NAME"
                className="w-1/2 bg-transparent border-b border-gray-400 py-2 text-xs focus:outline-none focus:border-black"
              />
              <input
                type="text"
                placeholder="LAST NAME"
                className="w-1/2 bg-transparent border-b border-gray-400 py-2 text-xs focus:outline-none focus:border-black"
              />
            </div>
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              className="w-full bg-transparent border-b border-gray-400 py-2 text-xs focus:outline-none focus:border-black"
            />
            <div className="pt-3">
              <button
                type="submit"
                className="bg-[#3A443C] text-white px-6 py-2 font-serif uppercase tracking-widest text-[10px] hover:bg-black transition-colors"
              >
                Sign Me Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
