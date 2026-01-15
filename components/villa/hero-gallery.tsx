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
    // Push state so browser back button closes gallery
    window.history.pushState({ gallery: true }, '');
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  }, []);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (lightboxOpen) {
        setLightboxOpen(false);
        document.body.style.overflow = '';
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [lightboxOpen]);

  // Close lightbox and go back in history (for X button)
  const handleClose = useCallback(() => {
    if (lightboxOpen) {
      window.history.back();
    }
  }, [lightboxOpen]);

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
          window.history.back(); // Use history API for consistent behavior
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, goToPrevious, goToNext]);

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
            style={{ touchAction: 'manipulation' }}
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
          className="fixed inset-0 z-50 bg-[#FAF9F6]"
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery"
        >
          {/* MOBILE LAYOUT - Portrait: header + image + thumbs, Landscape: fullscreen image */}
          <div className="md:hidden h-full w-full">
            {/* Portrait Layout */}
            <div
              className="portrait:grid landscape:hidden h-full w-full"
              style={{ gridTemplateRows: '56px 1fr 72px' }}
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between px-4 border-b border-stone-200 bg-[#FAF9F6]">
                <div className="text-stone-600 font-medium text-lg">
                  {currentIndex + 1} / {allImages.length}
                </div>
                <button
                  onClick={handleClose}
                  className="text-stone-500 p-2 rounded-full bg-stone-100"
                  style={{ touchAction: 'manipulation' }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Mobile Image Area */}
              <div
                className="bg-[#FAF9F6] overflow-hidden"
                style={{ position: 'relative' }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {/* Nav buttons */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      style={{
                        position: 'absolute',
                        left: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 30,
                        touchAction: 'manipulation',
                        backgroundColor: 'white',
                        borderRadius: '9999px',
                        padding: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        border: '1px solid #d6d3d1'
                      }}
                    >
                      <ChevronLeft size={32} className="text-stone-700" />
                    </button>
                    <button
                      onClick={goToNext}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 30,
                        touchAction: 'manipulation',
                        backgroundColor: 'white',
                        borderRadius: '9999px',
                        padding: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        border: '1px solid #d6d3d1'
                      }}
                    >
                      <ChevronRight size={32} className="text-stone-700" />
                    </button>
                  </>
                )}

                {/* Main Image */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px'
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={`portrait-${currentIndex}`}
                    src={allImages[currentIndex].url}
                    alt={allImages[currentIndex].alt || `Image ${currentIndex + 1}`}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                </div>
              </div>

              {/* Mobile Thumbnails */}
              <div className="border-t border-stone-200 bg-[#F3F0E9] px-2 overflow-x-auto flex items-center">
                <div className="flex gap-2 h-full items-center">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToIndex(idx)}
                      className={`flex-shrink-0 overflow-hidden rounded ${
                        idx === currentIndex ? 'ring-2 ring-olive' : 'opacity-50'
                      }`}
                      style={{ width: '64px', height: '48px', touchAction: 'manipulation' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={`Thumb ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Landscape Layout - Fullscreen image */}
            <div
              className="portrait:hidden landscape:block h-full w-full bg-black"
              style={{ position: 'relative' }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Floating close button */}
              <button
                onClick={handleClose}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  zIndex: 40,
                  touchAction: 'manipulation',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: '9999px',
                  padding: '8px'
                }}
              >
                <X size={24} className="text-white" />
              </button>

              {/* Image counter */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  zIndex: 40,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: '4px',
                  padding: '4px 12px'
                }}
              >
                <span className="text-white text-sm font-medium">
                  {currentIndex + 1} / {allImages.length}
                </span>
              </div>

              {/* Nav buttons */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 30,
                      touchAction: 'manipulation',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      borderRadius: '9999px',
                      padding: '10px'
                    }}
                  >
                    <ChevronLeft size={28} className="text-white" />
                  </button>
                  <button
                    onClick={goToNext}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 30,
                      touchAction: 'manipulation',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      borderRadius: '9999px',
                      padding: '10px'
                    }}
                  >
                    <ChevronRight size={28} className="text-white" />
                  </button>
                </>
              )}

              {/* Fullscreen Image */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={`landscape-${currentIndex}`}
                  src={allImages[currentIndex].url}
                  alt={allImages[currentIndex].alt || `Image ${currentIndex + 1}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              </div>
            </div>
          </div>

          {/* DESKTOP LAYOUT */}
          <div className="hidden md:flex h-full">
            {/* Left Thumbnail Strip */}
            <div className="flex flex-col w-24 bg-[#F3F0E9] border-r border-stone-200">
              <div className="p-3 border-b border-stone-200 text-center">
                <span className="text-sm font-medium text-stone-600">
                  {currentIndex + 1}/{allImages.length}
                </span>
              </div>
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
                <h2 className="text-stone-600 text-sm font-serif truncate max-w-md">{title}</h2>
                <button
                  onClick={handleClose}
                  className="text-stone-500 hover:text-stone-800 transition p-2 hover:bg-stone-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Image Area */}
              <div className="flex-1 relative min-h-0">
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white"
                    >
                      <ChevronLeft size={28} />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white"
                    >
                      <ChevronRight size={28} />
                    </button>
                  </>
                )}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="relative w-full h-full">
                    <Image
                      src={allImages[currentIndex].url}
                      alt={allImages[currentIndex].alt || `${title} - Image ${currentIndex + 1}`}
                      fill
                      sizes="calc(100vw - 160px)"
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Keyboard hint */}
              <div className="absolute bottom-4 right-4 text-stone-400 text-xs flex items-center gap-4">
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

          {/* Preload */}
          {allImages.length > 1 && (
            <>
              <link rel="preload" as="image" href={allImages[(currentIndex + 1) % allImages.length].url} />
              <link rel="preload" as="image" href={allImages[(currentIndex - 1 + allImages.length) % allImages.length].url} />
            </>
          )}
        </div>
      )}
    </>
  );
}
