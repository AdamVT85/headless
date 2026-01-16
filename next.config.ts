import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rewrites for friendly landing page URLs
  // Maps /spain to /country/spain, /spain/galicia to /country/spain/galicia
  async rewrites() {
    const countries = ['spain', 'france', 'italy', 'greece', 'portugal', 'croatia', 'turkey', 'balearics'];

    return [
      // Clean URLs: /spain/galicia -> /country/spain/galicia
      ...countries.map(country => ({
        source: `/${country}/:region`,
        destination: `/country/${country}/:region`,
      })),
      // Clean URLs: /spain -> /country/spain
      ...countries.map(country => ({
        source: `/${country}`,
        destination: `/country/${country}`,
      })),
      // Legacy support: /villas-in-spain/galicia -> /country/spain/galicia
      {
        source: '/villas-in-:country/:region',
        destination: '/country/:country/:region',
      },
      // Legacy support: /villas-in-spain -> /country/spain
      {
        source: '/villas-in-:country',
        destination: '/country/:country',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      // PHASE 28: Salesforce image domains
      {
        protocol: 'https',
        hostname: '**.force.com', // Salesforce community/site images
      },
      {
        protocol: 'https',
        hostname: '**.salesforce.com', // Salesforce content delivery
      },
      {
        protocol: 'https',
        hostname: '**.documentforce.com', // Salesforce document storage
      },
      // PHASE 50: Wikipedia for country map images
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
};

export default nextConfig;
