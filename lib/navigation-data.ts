/**
 * Navigation Menu Data
 * Defines the structure for mega menus and dropdowns
 */

export interface Region {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
  regions: Region[];
}

export interface Destination {
  id: string;
  name: string;
  imageUrl: string;
  countryId: string;
}

export interface Collection {
  id: string;
  title: string;
  imageUrl: string;
}

export interface NavigationData {
  popularDestinations: Destination[];
  countries: Country[];
  villasFor: {
    collections: Collection[];
    travellerTypes: Collection[];
  };
}

export const MENU_DATA: NavigationData = {
  popularDestinations: [
    { id: 'mallorca', name: 'Mallorca', countryId: 'balearics', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop&q=80' },
    { id: 'corfu', name: 'Corfu', countryId: 'greece', imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&h=200&fit=crop&q=80' },
    { id: 'andalucia', name: 'Andalucia', countryId: 'spain', imageUrl: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=400&h=200&fit=crop&q=80' },
  ],
  countries: [
    {
      id: 'spain',
      name: 'Spain',
      regions: [
        { id: 'andalucia', name: 'Andalucia' },
        { id: 'catalunya', name: 'Catalunya' },
        { id: 'costa-blanca', name: 'Costa Blanca' },
        { id: 'galicia', name: 'Galicia' },
      ]
    },
    {
      id: 'france',
      name: 'France',
      regions: [
        { id: 'south-west-france', name: 'South West France' },
        { id: 'cote-dazur', name: 'Côte d\'Azur' },
        { id: 'languedoc', name: 'Languedoc' },
        { id: 'provence', name: 'Provence' },
      ]
    },
    {
      id: 'italy',
      name: 'Italy',
      regions: [
        { id: 'tuscany', name: 'Tuscany' },
        { id: 'puglia', name: 'Puglia' },
        { id: 'umbria', name: 'Umbria' },
        { id: 'lazio', name: 'Lazio' },
      ]
    },
    {
      id: 'greece',
      name: 'Greece',
      regions: [
        { id: 'corfu', name: 'Corfu' },
        { id: 'kefalonia', name: 'Kefalonia' },
        { id: 'lefkada', name: 'Lefkada' },
        { id: 'crete', name: 'Crete' },
        { id: 'zakynthos', name: 'Zakynthos' },
        { id: 'messinia', name: 'Messinia' },
        { id: 'parga', name: 'Parga' },
        { id: 'meganisi', name: 'Meganisi' },
      ]
    },
    {
      id: 'portugal',
      name: 'Portugal',
      regions: [
        { id: 'algarve', name: 'Algarve' },
        { id: 'costa-verde-minho', name: 'Costa Verde & Minho' },
      ]
    },
    {
      id: 'turkey',
      name: 'Turkey',
      regions: [
        { id: 'lycian-coast', name: 'Lycian Coast' },
        { id: 'kalkan', name: 'Kalkan' },
        { id: 'kas', name: 'Kas' },
      ]
    },
    {
      id: 'balearics',
      name: 'Balearic Islands',
      regions: [
        { id: 'mallorca', name: 'Mallorca' },
        { id: 'menorca', name: 'Menorca' },
      ]
    },
    {
      id: 'croatia',
      name: 'Croatia',
      regions: [
        { id: 'istria', name: 'Istria' },
        { id: 'konavle-valley', name: 'Konavle Valley' },
      ]
    },
  ],
  villasFor: {
    collections: [
      { id: 'mallorca', title: 'Mallorca', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop&q=80' },
      { id: 'corfu', title: 'Corfu', imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&h=200&fit=crop&q=80' },
      { id: 'algarve', title: 'Algarve', imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=200&fit=crop&q=80' },
    ],
    travellerTypes: [
      { id: 'family', title: 'Family-friendly villas', imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=200&fit=crop&q=80' },
      { id: 'couples', title: 'Villas for couples', imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=200&fit=crop&q=80' },
      { id: 'large', title: 'Large villas', imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=200&fit=crop&q=80' },
    ]
  }
};
