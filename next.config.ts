import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PHASE 50 & 56: Rewrites for friendly landing page URLs
  // Maps /villas-in-spain to /country/spain
  // Maps /villas-in-spain/galicia to /country/spain/galicia
  async rewrites() {
    return [
      // Region pages (must come before country pages for proper matching)
      {
        source: '/villas-in-:country/:region',
        destination: '/country/:country/:region',
      },
      // Country pages
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
