'use client';

/**
 * VILLA PAGE - HERO GALLERY
 * Full-width hero image with modern fullscreen gallery viewer
 * Features: Preloading, keyboard navigation, touch swipe, left thumbnail strip
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));

  // Combine hero and gallery images
  const allImages: GalleryImage[] = [
    ...(heroImage ? [{ url: heroImage, alt: title }] : []),
    ...galleryImages,
  ];

  const hero = heroImage || '/placeholder-villa.svg';
  const minSwipeDistance = 50;

  // Preload adjacent images for instant loading
  useEffect(() => {
    if (!lightboxOpen || allImages.length === 0) return;

    const toPreload = new Set<number>();
    toPreload.add(currentIndex);

    // Preload next 2 and previous 2 images
    for (let i = 1; i <= 2; i++) {
      const nextIdx = (currentIndex + i) % allImages.length;
      const prevIdx = (currentIndex - i + allImages.length) % allImages.length;
      toPreload.add(nextIdx);
      toPreload.add(prevIdx);
    }

    toPreload.forEach(idx => {
      if (!loadedImages.has(idx)) {
        const img = new window.Image();
        img.src = allImages[idx].url;
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, idx]));
        };
      }
    });
  }, [currentIndex, lightboxOpen, allImages, loadedImages]);

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
    if (allImages.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  }, [allImages.length]);

  const goToNext = useCallback(() => {
    if (allImages.length <= 1) return;
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  }, [allImages.length]);

  const goToIndex = useCallback((index: number) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
  }, [currentIndex]);

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

  // Scroll thumbnail into view
  useEffect(() => {
    if (thumbnailContainerRef.current && lightboxOpen) {
      const container = thumbnailContainerRef.current;
      const thumbnail = container.children[currentIndex] as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
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
    if (distance > minSwipeDistance) goToNext();
    else if (distance < -minSwipeDistance) goToPrevious();
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
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        {allImages.length > 0 && (
          <button
            onClick={() => openLightbox(0)}
            className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-sm px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-vintage-gold hover:text-white transition z-10 flex items-center gap-3 rounded-sm"
          >
            <Camera size={16} />
            View All Photos ({allImages.length})
          </button>
        )}
        <div className="absolute top-1/2 left-0 w-full text-center pointer-events-none md:hidden text-white drop-shadow-2xl z-20 transform -translate-y-1/2 px-4">
          <h1 className="font-serif text-4xl font-bold tracking-wide drop-shadow-lg">{title}</h1>
        </div>
      </div>

      {/* Fullscreen Gallery Lightbox */}
      {lightboxOpen && allImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-[#FAF9F6] flex"
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery"
        >
          {/* Left Thumbnail Strip - Desktop */}
          <div className="hidden md:flex flex-col w-24 bg-[#F3F0E9] border-r border-stone-200">
            {/* Header */}
            <div className="p-3 border-b border-stone-200 text-center">
              <span className="text-sm font-medium text-stone-600">
                {currentIndex + 1}/{allImages.length}
              </span>
            </div>

            {/* Thumbnails */}
            <div
              ref={thumbnailContainerRef}
              className="flex-1 overflow-y-auto p-2 space-y-2"
              style={{ scrollbarWidth: 'thin' }}
            >
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => goToIndex(idx)}
                  className={`relative w-full aspect-[4/3] overflow-hidden rounded transition-all duration-200 ${
                    idx === currentIndex
                      ? 'ring-2 ring-vintage-green ring-offset-2'
                      : 'opacity-50 hover:opacity-80'
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

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Header Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
              {/* Mobile Counter */}
              <div className="md:hidden text-stone-600 font-medium">
                <span>{currentIndex + 1}</span>
                <span className="text-stone-400 mx-1">/</span>
                <span className="text-stone-400">{allImages.length}</span>
              </div>

              {/* Title */}
              <h2 className="hidden md:block text-stone-600 text-sm font-serif truncate max-w-md">
                {title}
              </h2>

              {/* Desktop spacer */}
              <div className="hidden md:block" />

              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="text-stone-500 hover:text-stone-800 transition p-2 hover:bg-stone-100 rounded-full"
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
              {/* Previous button */}
              {allImages.length > 1 && (
                <button
                  onClick={goToPrevious}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/80 transition p-2 md:p-3 rounded-full z-10 bg-white/80 backdrop-blur-sm shadow-sm"
                  aria-label="Previous image (Left arrow)"
                >
                  <ChevronLeft size={28} strokeWidth={1.5} />
                </button>
              )}

              {/* Image Container - Full Height */}
              <div className="relative w-full h-full flex items-center justify-center px-16 md:px-24 py-4">
                <div className="relative w-full h-full">
                  <Image
                    src={allImages[currentIndex].url}
                    alt={allImages[currentIndex].alt || `${title} - Image ${currentIndex + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, calc(100vw - 96px)"
                    className="object-contain"
                    priority
                  />
                </div>

                {/* Preload next and previous images (hidden) */}
                {allImages.length > 1 && (
                  <>
                    <link
                      rel="preload"
                      as="image"
                      href={allImages[(currentIndex + 1) % allImages.length].url}
                    />
                    <link
                      rel="preload"
                      as="image"
                      href={allImages[(currentIndex - 1 + allImages.length) % allImages.length].url}
                    />
                  </>
                )}
              </div>

              {/* Next button */}
              {allImages.length > 1 && (
                <button
                  onClick={goToNext}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/80 transition p-2 md:p-3 rounded-full z-10 bg-white/80 backdrop-blur-sm shadow-sm"
                  aria-label="Next image (Right arrow)"
                >
                  <ChevronRight size={28} strokeWidth={1.5} />
                </button>
              )}

              {/* Mobile swipe hint */}
              <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 text-stone-400 text-xs bg-white/80 px-3 py-1 rounded-full">
                Swipe to navigate
              </div>
            </div>

            {/* Mobile Thumbnail Strip - Bottom */}
            {allImages.length > 1 && (
              <div className="md:hidden border-t border-stone-200 bg-[#F3F0E9] p-2">
                <div className="flex gap-2 overflow-x-auto">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToIndex(idx)}
                      className={`relative w-16 h-12 flex-shrink-0 overflow-hidden rounded transition-all ${
                        idx === currentIndex
                          ? 'ring-2 ring-vintage-green'
                          : 'opacity-50'
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Keyboard hint - Desktop */}
            <div className="hidden md:flex absolute bottom-4 right-4 text-stone-400 text-xs items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-stone-200 rounded text-[10px]">←</kbd>
                <kbd className="px-2 py-1 bg-stone-200 rounded text-[10px]">→</kbd>
                <span className="ml-1">Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-stone-200 rounded text-[10px]">Esc</kbd>
                <span className="ml-1">Close</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
