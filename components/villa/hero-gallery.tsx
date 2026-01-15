'use client';

/**
 * VILLA PAGE - HERO GALLERY
 * Full-width hero image with modern fullscreen gallery viewer
 * Features: Keyboard navigation, touch swipe, smooth animations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  // Combine hero and gallery images
  const allImages: GalleryImage[] = [
    ...(heroImage ? [{ url: heroImage, alt: title }] : []),
    ...galleryImages,
  ];

  const hero = heroImage || '/placeholder-villa.svg';

  // Minimum swipe distance for gesture recognition
  const minSwipeDistance = 50;

  const openLightbox = useCallback((index: number = 0) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  }, []);

  const goToPrevious = useCallback(() => {
    if (isAnimating || allImages.length <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 300);
  }, [allImages.length, isAnimating]);

  const goToNext = useCallback(() => {
    if (isAnimating || allImages.length <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 300);
  }, [allImages.length, isAnimating]);

  const goToIndex = useCallback((index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 300);
  }, [currentIndex, isAnimating]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'Escape':
          e.preventDefault();
          closeLightbox();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, goToPrevious, goToNext, closeLightbox]);

  // Scroll thumbnail into view when current index changes
  useEffect(() => {
    if (thumbnailContainerRef.current && lightboxOpen) {
      const container = thumbnailContainerRef.current;
      const thumbnail = container.children[currentIndex] as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [currentIndex, lightboxOpen]);

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
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

      {/* Fullscreen Gallery Lightbox */}
      {lightboxOpen && allImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm z-20">
            {/* Counter */}
            <div className="text-white font-medium">
              <span className="text-lg">{currentIndex + 1}</span>
              <span className="text-white/50 mx-1">/</span>
              <span className="text-white/50">{allImages.length}</span>
            </div>

            {/* Title */}
            <h2 className="hidden md:block text-white/70 text-sm font-serif truncate max-w-md">
              {title}
            </h2>

            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="text-white/70 hover:text-white transition p-2 hover:bg-white/10 rounded-full"
              aria-label="Close gallery (Esc)"
            >
              <X size={24} />
            </button>
          </div>

          {/* Main Image Area */}
          <div
            className="flex-1 relative flex items-center justify-center overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Previous button - Desktop */}
            {allImages.length > 1 && (
              <button
                onClick={goToPrevious}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10 transition p-3 rounded-full z-10"
                aria-label="Previous image (Left arrow)"
              >
                <ChevronLeft size={40} strokeWidth={1.5} />
              </button>
            )}

            {/* Image Container */}
            <div className="relative w-full h-full flex items-center justify-center px-4 md:px-20">
              <div
                className={`relative w-full h-full max-w-5xl transition-opacity duration-300 ${
                  isAnimating ? 'opacity-50' : 'opacity-100'
                }`}
              >
                <Image
                  src={allImages[currentIndex].url}
                  alt={allImages[currentIndex].alt || `${title} - Image ${currentIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 80vw"
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Next button - Desktop */}
            {allImages.length > 1 && (
              <button
                onClick={goToNext}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10 transition p-3 rounded-full z-10"
                aria-label="Next image (Right arrow)"
              >
                <ChevronRight size={40} strokeWidth={1.5} />
              </button>
            )}

            {/* Mobile Navigation Arrows */}
            {allImages.length > 1 && (
              <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-8 z-10">
                <button
                  onClick={goToPrevious}
                  className="text-white/70 hover:text-white p-3 bg-black/50 rounded-full backdrop-blur-sm"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={goToNext}
                  className="text-white/70 hover:text-white p-3 bg-black/50 rounded-full backdrop-blur-sm"
                  aria-label="Next image"
                >
                  <ChevronRight size={28} />
                </button>
              </div>
            )}

            {/* Swipe hint for mobile */}
            <div className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 text-white/40 text-xs">
              Swipe to navigate
            </div>
          </div>

          {/* Thumbnail Strip - Desktop */}
          {allImages.length > 1 && (
            <div className="hidden md:block bg-black/80 backdrop-blur-sm py-4 px-4">
              <div
                ref={thumbnailContainerRef}
                className="flex gap-2 overflow-x-auto max-w-5xl mx-auto scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToIndex(idx)}
                    className={`relative w-20 h-14 flex-shrink-0 overflow-hidden rounded transition-all duration-200 ${
                      idx === currentIndex
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-105'
                        : 'opacity-40 hover:opacity-70'
                    }`}
                    aria-label={`View image ${idx + 1}`}
                    aria-current={idx === currentIndex ? 'true' : 'false'}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || `Thumbnail ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Keyboard hint - Desktop */}
          <div className="hidden md:flex absolute bottom-24 left-4 text-white/30 text-xs items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white/10 rounded text-[10px]">←</kbd>
              <kbd className="px-2 py-1 bg-white/10 rounded text-[10px]">→</kbd>
              <span className="ml-1">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white/10 rounded text-[10px]">Esc</kbd>
              <span className="ml-1">Close</span>
            </span>
          </div>
        </div>
      )}
    </>
  );
}
