export interface CountryRegion {
  id: string;
  label: string;
  title: string;
  description1: string;
  description2: string;
  buttonText: string;
}

export interface CountryConfig {
  id: string;
  label: string;
  slug: string;
  regions: CountryRegion[];
}

export const COUNTRY_REGIONS: Record<string, CountryConfig> = {
  spain: {
    id: 'spain',
    label: 'Spain',
    slug: 'spain',
    regions: [
      {
        id: 'galicia',
        label: 'Galicia',
        title: 'Villas in Galicia',
        description1: 'Discover the green corner of Spain. Galicia offers stunning estuaries, fresh seafood, and a unique Celtic heritage distinct from the rest of the country.',
        description2: 'From the pilgrimage city of Santiago de Compostela to the wild Atlantic coast, our villas provide the perfect base to explore this lush region.',
        buttonText: 'View Villas in Galicia'
      },
      {
        id: 'costa-blanca',
        label: 'Costa Blanca',
        title: 'Villas in Costa Blanca',
        description1: 'The "White Coast" is renowned for its stunning white sandy beaches, year-round sunshine, and charming coastal towns.',
        description2: 'Discover the picturesque towns of Jávea, Moraira, and Denia, or explore the dramatic cliffs and hidden coves from your luxury villa.',
        buttonText: 'View Villas in Costa Blanca'
      },
      {
        id: 'andalucia',
        label: 'Andalucia',
        title: 'Villas in Andalucia',
        description1: 'Home of flamenco, tapas, and sun-drenched landscapes. Andalucia captures the passionate soul of southern Spain.',
        description2: 'Visit the Alhambra in Granada, the Mezquita in Cordoba, or simply enjoy the white villages (Pueblos Blancos) scattered across the hills.',
        buttonText: 'View Villas in Andalucia'
      },
      {
        id: 'catalunya',
        label: 'Catalunya',
        title: 'Villas in Catalunya',
        description1: 'A region of distinct culture, stunning architecture, and diverse landscapes ranging from the Pyrenees mountains to the Mediterranean coast.',
        description2: 'Enjoy the cosmopolitan vibe of Barcelona or retreat to the quiet countryside. Our villas in Catalunya offer a taste of the authentic Catalan lifestyle.',
        buttonText: 'View Villas in Catalunya'
      }
    ]
  },
  balearics: {
    id: 'balearics',
    label: 'Balearics',
    slug: 'balearics',
    regions: [
      {
        id: 'mallorca',
        label: 'Mallorca',
        title: 'Villas in Mallorca',
        description1: 'The largest of the Balearic Islands, Mallorca combines stunning beaches, dramatic mountains, and charming villages.',
        description2: 'From the vibrant capital Palma to the tranquil Tramuntana mountains, our luxury villas offer the perfect base for your Mediterranean escape.',
        buttonText: 'View Villas in Mallorca'
      },
      {
        id: 'menorca',
        label: 'Menorca',
        title: 'Villas in Menorca',
        description1: 'A UNESCO Biosphere Reserve, Menorca is the quieter sister of Mallorca, known for its pristine beaches and untouched natural beauty.',
        description2: 'Discover hidden coves, historic towns like Ciutadella, and enjoy the slower pace of island life from your private villa.',
        buttonText: 'View Villas in Menorca'
      }
    ]
  },
  croatia: {
    id: 'croatia',
    label: 'Croatia',
    slug: 'croatia',
    regions: [
      {
        id: 'dubrovnik',
        label: 'Dubrovnik',
        title: 'Villas in Dubrovnik',
        description1: 'The "Pearl of the Adriatic", Dubrovnik is a stunning walled city with a rich history, crystal-clear waters, and dramatic coastal scenery.',
        description2: 'Stay in luxury villas overlooking the Adriatic, explore the Old Town, and island-hop to nearby Korčula and Mljet.',
        buttonText: 'View Villas in Dubrovnik'
      },
      {
        id: 'istria',
        label: 'Istria',
        title: 'Villas in Istria',
        description1: 'Croatia\'s green peninsula, known for its truffle forests, hilltop villages, and Italian-influenced cuisine.',
        description2: 'Discover the charm of Rovinj, Motovun, and Pula, and enjoy authentic Croatian hospitality in our traditional stone villas.',
        buttonText: 'View Villas in Istria'
      }
    ]
  },
  italy: {
    id: 'italy',
    label: 'Italy',
    slug: 'italy',
    regions: [
      {
        id: 'lazio',
        label: 'Lazio',
        title: 'Villas in Lazio',
        description1: 'Home to Rome and the eternal city\'s ancient wonders, Lazio combines history, culture, and stunning countryside.',
        description2: 'Escape to the volcanic lakes, medieval villages, and rolling hills while staying within reach of Rome\'s treasures.',
        buttonText: 'View Villas in Lazio'
      },
      {
        id: 'puglia',
        label: 'Puglia',
        title: 'Villas in Puglia',
        description1: 'The heel of Italy\'s boot, Puglia is famous for its whitewashed towns, trulli houses, and exceptional olive oil and wine.',
        description2: 'From the baroque beauty of Lecce to the seaside charm of Polignano a Mare, experience authentic southern Italian living.',
        buttonText: 'View Villas in Puglia'
      },
      {
        id: 'tuscany',
        label: 'Tuscany',
        title: 'Villas in Tuscany',
        description1: 'The heart of Italian culture, Tuscany offers rolling hills, cypress-lined roads, medieval hill towns, and world-class wine.',
        description2: 'Stay in converted farmhouses and historic estates, explore Florence and Siena, and savor the slow-food lifestyle of rural Tuscany.',
        buttonText: 'View Villas in Tuscany'
      },
      {
        id: 'umbria',
        label: 'Umbria',
        title: 'Villas in Umbria',
        description1: 'Known as the "green heart of Italy", Umbria offers a quieter alternative to Tuscany with equally stunning landscapes and rich history.',
        description2: 'Discover Assisi, Perugia, and Orvieto, and experience the authentic Italian countryside from your private villa retreat.',
        buttonText: 'View Villas in Umbria'
      }
    ]
  },
  greece: {
    id: 'greece',
    label: 'Greece',
    slug: 'greece',
    regions: [
      {
        id: 'corfu',
        label: 'Corfu',
        title: 'Villas in Corfu',
        description1: 'The emerald island of the Ionian Sea, Corfu combines Venetian architecture, lush green landscapes, and stunning beaches.',
        description2: 'Explore the charming Old Town, discover hidden coves, and enjoy the relaxed island lifestyle from your luxury villa.',
        buttonText: 'View Villas in Corfu'
      },
      {
        id: 'crete',
        label: 'Crete',
        title: 'Villas in Crete',
        description1: 'Greece\'s largest island, Crete offers diverse landscapes from mountains to beaches, ancient Minoan sites, and authentic village life.',
        description2: 'Discover the palace of Knossos, hike the Samaria Gorge, and savor Cretan cuisine from your beachfront or hillside villa.',
        buttonText: 'View Villas in Crete'
      },
      {
        id: 'lefkada',
        label: 'Lefkada',
        title: 'Villas in Lefkada',
        description1: 'A hidden gem in the Ionian Sea, Lefkada is known for its stunning white-sand beaches and turquoise waters.',
        description2: 'Visit Porto Katsiki and Egremni beaches, explore traditional mountain villages, and enjoy authentic Greek island hospitality.',
        buttonText: 'View Villas in Lefkada'
      },
      {
        id: 'kefalonia',
        label: 'Kefalonia',
        title: 'Villas in Kefalonia',
        description1: 'The largest Ionian island, Kefalonia features dramatic cliffs, underground caves, and pristine beaches with crystal-clear waters.',
        description2: 'Discover Myrtos Beach, visit Melissani Cave, and explore charming fishing villages from your luxury villa base.',
        buttonText: 'View Villas in Kefalonia'
      },
      {
        id: 'meganisi',
        label: 'Meganisi',
        title: 'Villas in Meganisi',
        description1: 'A tiny, unspoiled island near Lefkada, Meganisi offers peace, tranquility, and authentic Greek island life away from the crowds.',
        description2: 'Enjoy secluded beaches, traditional tavernas, and the simple pleasures of island living in this hidden paradise.',
        buttonText: 'View Villas in Meganisi'
      },
      {
        id: 'parga',
        label: 'Parga',
        title: 'Villas in Parga',
        description1: 'A picturesque coastal town on the mainland, Parga combines colorful houses, Venetian castle ruins, and beautiful beaches.',
        description2: 'Explore nearby ancient sites, take boat trips to Paxos, and enjoy the perfect blend of beach and culture.',
        buttonText: 'View Villas in Parga'
      },
      {
        id: 'peloponnese',
        label: 'Peloponnese',
        title: 'Villas in Peloponnese',
        description1: 'The mythical heartland of Greece, the Peloponnese offers ancient sites, medieval castles, and dramatic coastal scenery.',
        description2: 'Visit Olympia, Mycenae, and Epidaurus, and discover hidden beaches and mountain villages from your luxury villa.',
        buttonText: 'View Villas in Peloponnese'
      },
      {
        id: 'zakynthos',
        label: 'Zakynthos',
        title: 'Villas in Zakynthos',
        description1: 'Home to the famous Navagio Beach (Shipwreck Beach), Zakynthos offers stunning sea caves, turquoise waters, and vibrant nightlife.',
        description2: 'Discover the Blue Caves, spot loggerhead turtles, and enjoy the island\'s natural beauty from your private villa.',
        buttonText: 'View Villas in Zakynthos'
      }
    ]
  },
  france: {
    id: 'france',
    label: 'France',
    slug: 'france',
    regions: [
      {
        id: 'cote-azur',
        label: 'Côte d\'Azur',
        title: 'Villas in Côte d\'Azur',
        description1: 'The French Riviera, glamorous playground of the rich and famous, offers stunning coastline, Belle Époque architecture, and world-class dining.',
        description2: 'From Nice to Monaco, Saint-Tropez to Cannes, experience the Mediterranean lifestyle in ultimate luxury.',
        buttonText: 'View Villas in Côte d\'Azur'
      },
      {
        id: 'languedoc',
        label: 'Languedoc',
        title: 'Villas in Languedoc',
        description1: 'A sun-drenched region of vineyards, medieval fortresses, and Mediterranean beaches, Languedoc offers authentic French living.',
        description2: 'Explore Carcassonne, enjoy local wines, and discover unspoiled coastal villages from your private villa retreat.',
        buttonText: 'View Villas in Languedoc'
      },
      {
        id: 'provence',
        label: 'Provence',
        title: 'Villas in Provence',
        description1: 'Lavender fields, hilltop villages, and Roman ruins define this quintessentially French region of markets, wine, and exceptional cuisine.',
        description2: 'Stay in restored farmhouses, explore Aix-en-Provence and Avignon, and experience the art of living well in southern France.',
        buttonText: 'View Villas in Provence'
      },
      {
        id: 'south-west-france',
        label: 'South West France',
        title: 'Villas in South West France',
        description1: 'From the Dordogne\'s medieval castles to the Basque coast, Southwest France offers diverse landscapes, rich history, and outstanding gastronomy.',
        description2: 'Discover prehistoric caves, historic bastide towns, and the relaxed lifestyle of rural France from your luxury villa.',
        buttonText: 'View Villas in South West France'
      }
    ]
  },
  portugal: {
    id: 'portugal',
    label: 'Portugal',
    slug: 'portugal',
    regions: [
      {
        id: 'costa-verde-minho',
        label: 'Costa Verde & Minho',
        title: 'Villas in Costa Verde & Minho',
        description1: 'Portugal\'s green north, known for its dramatic coastline, Vinho Verde wine, and historic cities like Porto and Braga.',
        description2: 'Discover granite mountains, river valleys, and traditional Portuguese hospitality in this unspoiled corner of the country.',
        buttonText: 'View Villas in Costa Verde & Minho'
      },
      {
        id: 'algarve',
        label: 'Algarve',
        title: 'Villas in Algarve',
        description1: 'Portugal\'s southern coast, famous for golden beaches, dramatic cliff formations, year-round sunshine, and world-class golf.',
        description2: 'From lively resorts to quiet fishing villages, enjoy the perfect blend of relaxation and activities from your luxury villa.',
        buttonText: 'View Villas in Algarve'
      }
    ]
  },
  turkey: {
    id: 'turkey',
    label: 'Turkey',
    slug: 'turkey',
    regions: [
      {
        id: 'lycian-coast',
        label: 'Lycian Coast',
        title: 'Villas in Lycian Coast',
        description1: 'Turkey\'s stunning Turquoise Coast combines ancient ruins, pine-clad mountains, crystal-clear waters, and traditional gulet cruises.',
        description2: 'Explore Kaş, Kalkan, and Fethiye, discover hidden coves and Lycian tombs, and experience Turkish hospitality from your villa.',
        buttonText: 'View Villas in Lycian Coast'
      }
    ]
  }
};

// Helper function to get country config by slug
export function getCountryConfig(slug: string): CountryConfig | undefined {
  return COUNTRY_REGIONS[slug.toLowerCase()];
}

// Get all valid country slugs
export function getAllCountrySlugs(): string[] {
  return Object.keys(COUNTRY_REGIONS);
}
