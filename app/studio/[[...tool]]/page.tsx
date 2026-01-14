/**
 * SANITY STUDIO ROUTE
 *
 * This page mounts the Sanity Studio CMS interface
 * Access at: http://localhost:3003/studio
 *
 * Authentication is handled by Sanity's OAuth system
 */

'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '@/sanity.config';

// Make this dynamic since Studio requires client-side rendering
export default function StudioPage() {
  return <NextStudio config={config} />;
}
