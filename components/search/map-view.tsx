'use client';

/**
 * MAP VIEW COMPONENT
 * Google Maps integration for villa search results
 * Features: Custom styling, villa markers, hover interactions
 */

import { useCallback, useState, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import Image from 'next/image';
import Link from 'next/link';
import { X, Bed, Users } from 'lucide-react';
import { MockVilla } from '@/lib/mock-db';

// Brand-adapted Google Maps style
const mapStyles = [
  {
    featureType: 'all',
    elementType: 'all',
    stylers: [
      { hue: '#5F6B4E' }, // Olive hue
      { saturation: '-33' },
      { lightness: '10' },
    ],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#2D3E35' }], // Vintage green
  },
  {
    featureType: 'landscape.natural.terrain',
    elementType: 'geometry',
    stylers: [{ visibility: 'simplified' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry.fill',
    stylers: [{ color: '#F5F5F0' }], // Vintage cream
  },
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.attraction',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.business',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.government',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.place_of_worship',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      { visibility: 'simplified' },
      { color: '#E8E4DD' }, // Clay
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [
      { visibility: 'simplified' },
      { color: '#E8E4DD' }, // Clay
    ],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'transit.line',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [
      { saturation: '-23' },
      { gamma: '2.01' },
      { color: '#C5D5D8' }, // Soft blue-grey water
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry.stroke',
    stylers: [{ saturation: '-14' }],
  },
];

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Default center (Mediterranean)
const defaultCenter = {
  lat: 39.5,
  lng: 2.5,
};

interface MapViewProps {
  villas: MockVilla[];
  hoveredVillaId: string | null;
  selectedVillaId?: string | null;
  onMarkerHover: (villaId: string | null) => void;
  onMarkerClick: (villaId: string) => void;
  isMobile?: boolean;
}

export function MapView({
  villas,
  hoveredVillaId,
  selectedVillaId,
  onMarkerHover,
  onMarkerClick,
  isMobile = false,
}: MapViewProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBlsMrKAXCt7cRcORzUl3_dpRyl8BMTLHI',
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedVilla, setSelectedVilla] = useState<MockVilla | null>(null);

  // Filter villas that have coordinates (handle both number and string types)
  const villasWithCoords = villas.filter((v) => {
    const lat = typeof v.latitude === 'string' ? parseFloat(v.latitude) : v.latitude;
    const lng = typeof v.longitude === 'string' ? parseFloat(v.longitude) : v.longitude;
    return lat && lng && !isNaN(lat) && !isNaN(lng);
  }).map((v) => ({
    ...v,
    latitude: typeof v.latitude === 'string' ? parseFloat(v.latitude) : v.latitude,
    longitude: typeof v.longitude === 'string' ? parseFloat(v.longitude) : v.longitude,
  }));

  // Debug logging
  useEffect(() => {
    console.log('[MapView] Total villas received:', villas.length);
    console.log('[MapView] Villas with valid coordinates:', villasWithCoords.length);
    if (villas.length > 0) {
      console.log('[MapView] Sample villa coords:', {
        title: villas[0].title,
        latitude: villas[0].latitude,
        longitude: villas[0].longitude,
        latType: typeof villas[0].latitude,
        lngType: typeof villas[0].longitude,
      });
    }
  }, [villas, villasWithCoords.length]);

  // Calculate bounds to fit all markers
  const onLoad = useCallback(
    (map: google.maps.Map) => {
      if (villasWithCoords.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        villasWithCoords.forEach((villa) => {
          if (villa.latitude && villa.longitude) {
            bounds.extend({ lat: villa.latitude, lng: villa.longitude });
          }
        });
        map.fitBounds(bounds, 50);
      }
      setMap(map);
    },
    [villasWithCoords]
  );

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle marker click
  const handleMarkerClick = (villa: MockVilla) => {
    if (isMobile) {
      setSelectedVilla(villa);
    } else {
      onMarkerClick(villa.id);
    }
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-clay-100">
        <div className="text-olive animate-pulse">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={villasWithCoords.length > 0 ? undefined : defaultCenter}
        zoom={villasWithCoords.length > 0 ? undefined : 6}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: mapStyles,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {villasWithCoords.map((villa) => (
          <VillaMarker
            key={villa.id}
            villa={villa}
            isHovered={hoveredVillaId === villa.id || selectedVillaId === villa.id}
            onHover={onMarkerHover}
            onClick={handleMarkerClick}
          />
        ))}
      </GoogleMap>

      {/* Mobile Villa Card Popup */}
      {isMobile && selectedVilla && (
        <MobileVillaCard
          villa={selectedVilla}
          onClose={() => setSelectedVilla(null)}
        />
      )}

      {/* No coordinates message */}
      {villasWithCoords.length === 0 && villas.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="bg-white p-6 rounded-sm shadow-lg text-center max-w-sm mx-4">
            <p className="text-olive font-serif text-lg mb-2">No map data available</p>
            <p className="text-stone-600 text-sm">
              Location coordinates are not available for these villas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Villa Marker Component
 * Custom styled marker with hover states
 */
interface VillaMarkerProps {
  villa: MockVilla;
  isHovered: boolean;
  onHover: (villaId: string | null) => void;
  onClick: (villa: MockVilla) => void;
}

function VillaMarker({ villa, isHovered, onHover, onClick }: VillaMarkerProps) {
  // Convert to numbers (coordinates may come as strings from API)
  const lat = typeof villa.latitude === 'string' ? parseFloat(villa.latitude) : villa.latitude;
  const lng = typeof villa.longitude === 'string' ? parseFloat(villa.longitude) : villa.longitude;

  // Skip rendering if coordinates are invalid
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

  // Custom marker icon - changes color on hover
  const markerIcon = {
    path: 'M12 0C7.31 0 3.5 3.81 3.5 8.5C3.5 14.88 12 24 12 24S20.5 14.88 20.5 8.5C20.5 3.81 16.69 0 12 0ZM12 11.5C10.34 11.5 9 10.16 9 8.5S10.34 5.5 12 5.5 15 6.84 15 8.5 13.66 11.5 12 11.5Z',
    fillColor: isHovered ? '#C06C54' : '#5F6B4E', // Terracotta when hovered, Olive default
    fillOpacity: 1,
    strokeColor: '#FFFFFF',
    strokeWeight: 2,
    scale: isHovered ? 1.5 : 1.2,
    anchor: new google.maps.Point(12, 24),
  };

  return (
    <Marker
      position={{ lat, lng }}
      icon={markerIcon}
      onMouseOver={() => onHover(villa.id)}
      onMouseOut={() => onHover(null)}
      onClick={() => onClick(villa)}
      zIndex={isHovered ? 1000 : 1}
      animation={isHovered ? google.maps.Animation.BOUNCE : undefined}
    />
  );
}

/**
 * Mobile Villa Card
 * Full-screen card shown when tapping a marker on mobile
 */
interface MobileVillaCardProps {
  villa: MockVilla;
  onClose: () => void;
}

function MobileVillaCard({ villa, onClose }: MobileVillaCardProps) {
  // Prevent body scroll when card is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const priceDisplay = villa.pricePerWeek
    ? `£${villa.pricePerWeek.toLocaleString()}`
    : 'Price on request';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-t-2xl shadow-2xl animate-slide-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 rounded-full p-2 shadow-md"
        >
          <X size={20} className="text-olive" />
        </button>

        {/* Villa Image */}
        <div className="relative h-56 w-full">
          <Image
            src={villa.heroImageUrl || '/placeholder-villa.svg'}
            alt={villa.title}
            fill
            className="object-cover rounded-t-2xl"
          />
          {/* Location badge */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/90 px-3 py-1 rounded-sm text-xs font-semibold text-olive backdrop-blur-sm">
              {villa.town || villa.region}
            </span>
          </div>
        </div>

        {/* Villa Details */}
        <div className="p-5">
          <h3 className="font-serif text-2xl text-olive mb-2">{villa.title}</h3>

          {/* Capacity info */}
          <div className="flex items-center gap-4 text-sm text-stone-600 mb-4">
            {villa.maxGuests && (
              <span className="flex items-center gap-1">
                <Users size={16} />
                {villa.maxGuests} guests
              </span>
            )}
            {villa.bedrooms && (
              <span className="flex items-center gap-1">
                <Bed size={16} />
                {villa.bedrooms} bedrooms
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mb-5">
            <p className="text-xs text-stone-500 uppercase tracking-wide">From</p>
            <p className="text-2xl font-serif text-terracotta">
              {priceDisplay}
              {villa.pricePerWeek && (
                <span className="text-sm font-normal text-stone-500"> / week</span>
              )}
            </p>
          </div>

          {/* View Villa Button */}
          <Link
            href={`/villas/${villa.slug}`}
            className="block w-full bg-olive text-white text-center py-4 rounded-sm text-sm uppercase tracking-widest font-semibold hover:bg-olive-600 transition-colors"
          >
            View Villa
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MapView;
