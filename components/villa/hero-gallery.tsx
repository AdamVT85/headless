'use client';

/**
 * VILLA PAGE - HERO GALLERY
 * Full-width hero image with lightbox gallery viewer
 */

import { useState } from 'react';
import Image from 'next/image';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryImage {
  url: string;
  alt: string;
}

interface HeroGalleryProps {
  heroImage?: string | null;
  galleryImages?: GalleryImage[];
  title: string;
}

export function HeroGallery({ heroImage, galleryImages = [], title }: HeroGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Combine hero and gallery images
  const allImages: GalleryImage[] = [
    ...(heroImage ? [{ url: heroImage, alt: title }] : []),
    ...galleryImages,
  ];

  const hero = heroImage || '/placeholder-villa.svg';

  const openLightbox = (index: number = 0) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {/* Hero Image */}
      <div className="w-full h-[60vh] md:h-[70vh] relative overflow-hidden group">
        <Image
          src={hero}
          alt={title}
          fill
          sizes="100vw"
          className="object-cover transition-transform duration-1000 ease-in-out group-hover:scale-105"
          priority
        />

        {/* Dark gradient overlay at bottom for button visibility */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {/* View All Photos Button */}
        {allImages.length > 0 && (
          <button
            onClick={() => openLightbox(0)}
            className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-sm px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-vintage-gold hover:text-white transition z-10 flex items-center gap-3 rounded-sm"
          >
            <Camera size={16} />
            View All Photos ({allImages.length})
          </button>
        )}

        {/* Mobile Title Overlay */}
        <div className="absolute top-1/2 left-0 w-full text-center pointer-events-none md:hidden text-white drop-shadow-2xl z-20 transform -translate-y-1/2 px-4">
          <h1 className="font-serif text-4xl font-bold tracking-wide drop-shadow-lg">{title}</h1>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && allImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition z-50"
            aria-label="Close gallery"
          >
            <X size={32} />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 text-white/70 text-sm">
            {currentIndex + 1} / {allImages.length}
          </div>

          {/* Previous button */}
          {allImages.length > 1 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition p-2"
              aria-label="Previous image"
            >
              <ChevronLeft size={48} />
            </button>
          )}

          {/* Image */}
          <div className="relative w-full h-full max-w-6xl max-h-[80vh] mx-16">
            <Image
              src={allImages[currentIndex].url}
              alt={allImages[currentIndex].alt || `${title} - Image ${currentIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {/* Next button */}
          {allImages.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition p-2"
              aria-label="Next image"
            >
              <ChevronRight size={48} />
            </button>
          )}

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] p-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-16 h-12 flex-shrink-0 overflow-hidden rounded transition ${
                    idx === currentIndex ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt || `Thumbnail ${idx + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
