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
    { id: '1', name: 'Catalunya', imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=200&fit=crop&q=80' },
    { id: '2', name: 'Tuscany', imageUrl: 'https://images.unsplash.com/photo-1534445867742-43195f401b6c?w=400&h=200&fit=crop&q=80' },
    { id: '3', name: 'Crete', imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=200&fit=crop&q=80' },
  ],
  countries: [
    {
      id: 'spain',
      name: 'Spain',
      regions: [
        { id: 'costa-blanca', name: 'Costa Blanca' },
        { id: 'galicia', name: 'Galicia' },
        { id: 'catalunya', name: 'Catalunya' },
        { id: 'andalucia', name: 'Andalucia' },
      ]
    },
    {
      id: 'france',
      name: 'France',
      regions: [
        { id: 'provence', name: 'Provence' },
        { id: 'cote-d-azur', name: 'Côte d\'Azur' },
        { id: 'dordogne', name: 'Dordogne' },
        { id: 'corsica', name: 'Corsica' },
      ]
    },
    {
      id: 'italy',
      name: 'Italy',
      regions: [
        { id: 'tuscany', name: 'Tuscany' },
        { id: 'umbria', name: 'Umbria' },
        { id: 'sicily', name: 'Sicily' },
        { id: 'amalfi-coast', name: 'Amalfi Coast' },
      ]
    },
    {
      id: 'greece',
      name: 'Greece',
      regions: [
        { id: 'crete', name: 'Crete' },
        { id: 'corfu', name: 'Corfu' },
        { id: 'rhodes', name: 'Rhodes' },
        { id: 'peloponnese', name: 'Peloponnese' },
      ]
    },
    {
      id: 'portugal',
      name: 'Portugal',
      regions: [
        { id: 'algarve', name: 'Algarve' },
        { id: 'minho', name: 'Minho' },
        { id: 'douro', name: 'Douro Valley' },
      ]
    },
    {
      id: 'turkey',
      name: 'Turkey',
      regions: [
        { id: 'kalkan', name: 'Kalkan' },
        { id: 'islamlar', name: 'Islamlar' },
        { id: 'dalyan', name: 'Dalyan' },
      ]
    },
    {
      id: 'balearics',
      name: 'Balearic Islands',
      regions: [
        { id: 'mallorca', name: 'Mallorca' },
        { id: 'menorca', name: 'Menorca' },
        { id: 'ibiza', name: 'Ibiza' },
      ]
    },
    {
      id: 'croatia',
      name: 'Croatia',
      regions: [
        { id: 'istria', name: 'Istria' },
        { id: 'dalmatia', name: 'Dalmatia' },
        { id: 'dubrovnik', name: 'Dubrovnik' },
      ]
    },
  ],
  villasFor: {
    collections: [
      { id: 'catalunya', title: 'Catalunya', imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=200&fit=crop&q=80' },
      { id: 'tuscany', title: 'Tuscany', imageUrl: 'https://images.unsplash.com/photo-1534445867742-43195f401b6c?w=400&h=200&fit=crop&q=80' },
      { id: 'crete', title: 'Crete', imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=200&fit=crop&q=80' },
    ],
    travellerTypes: [
      { id: 'family', title: 'Family-friendly villas', imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=200&fit=crop&q=80' },
      { id: 'couples', title: 'Villas for couples', imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=200&fit=crop&q=80' },
      { id: 'large', title: 'Large villas', imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=200&fit=crop&q=80' },
    ]
  }
};
