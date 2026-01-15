'use client';

/**
 * PHASE 51: INTERACTIVE REGION EXPLORER
 *
 * A client-side component that provides tabbed navigation for exploring
 * different regions within a country. Clicking a region tab updates the
 * spotlight content instantly without page reload.
 * Supports swipe gestures on touch devices.
 */

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Helper to convert name to URL slug (e.g., "Costa Brava" -> "costa-brava")
const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

// ===== REGION DATA DICTIONARY =====
// Maps region names to specific descriptions and images
// This can be expanded as we add more custom content

const REGION_DATA: Record<string, { desc: string; img: string }> = {
  // Spain
  'Galicia': {
    desc: 'Discover the green corner of Spain. Galicia offers stunning estuaries, fresh seafood, and a unique Celtic heritage distinct from the rest of the country. From the pilgrimage city of Santiago de Compostela to the wild Atlantic coast, our villas provide the perfect base to explore this lush region.',
    img: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80'
  },
  'Costa Brava': {
    desc: 'The "Wild Coast" is famous for its rugged beauty, hidden coves, and crystal-clear waters. A perfect blend of nature and culture. Explore medieval towns like Pals and Peratallada, or relax on the beaches of Begur and Palafrugell from the comfort of your private villa.',
    img: 'https://images.unsplash.com/photo-1512413914633-b5043f4041ea?auto=format&fit=crop&w=1200&q=80'
  },
  'Andalucia': {
    desc: 'Home of flamenco, tapas, and sun-drenched landscapes. Andalucia captures the passionate soul of southern Spain. Visit the Alhambra in Granada, the Mezquita in Cordoba, or simply enjoy the white villages scattered across the hills.',
    img: 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?auto=format&fit=crop&w=1200&q=80'
  },
  'Catalunya': {
    desc: 'A region of distinct culture, stunning architecture, and diverse landscapes from the Pyrenees to the Mediterranean coast. Enjoy the cosmopolitan vibe of Barcelona or retreat to the quiet countryside for a taste of authentic Catalan lifestyle.',
    img: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80'
  },

  // Balearics
  'Mallorca': {
    desc: 'The largest Balearic island offers incredible diversity - from the dramatic Serra de Tramuntana mountains to pristine beaches and charming villages. Explore Palma\'s Gothic cathedral, cycle through almond orchards, or simply relax by your private pool overlooking the Mediterranean.',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80'
  },
  'Menorca': {
    desc: 'A UNESCO Biosphere Reserve, Menorca is the quieter sister island offering unspoiled beaches, prehistoric monuments, and authentic charm. Perfect for families and nature lovers, our Menorca villas provide a peaceful retreat from the modern world.',
    img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80'
  },

  // Croatia
  'Dubrovnik': {
    desc: 'The "Pearl of the Adriatic" needs no introduction. This UNESCO World Heritage city offers stunning architecture and a dramatic coastal setting. Stay in a luxury villa near Dubrovnik and explore the city\'s ancient walls, island-hop to nearby Elaphiti Islands, or simply enjoy the crystal-clear waters.',
    img: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=1200&q=80'
  },
  'Istria': {
    desc: 'Often called "the new Tuscany," Istria combines Italian influence with Croatian authenticity. Rolling hills, truffle forests, and charming hilltop towns await. Enjoy world-class olive oil and wine, explore Roman ruins in Pula, or swim in the blue waters of the Adriatic.',
    img: 'https://images.unsplash.com/photo-1596097557847-1d49e8e327e6?auto=format&fit=crop&w=1200&q=80'
  },

  // Italy
  'Lazio': {
    desc: 'Home to Rome, Lazio offers the perfect blend of ancient history, stunning countryside, and proximity to the Eternal City. Explore Roman ruins, relax by volcanic lakes, or venture to the beautiful coastline - all within easy reach of your villa.',
    img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80'
  },
  'Puglia': {
    desc: 'The heel of Italy\'s boot is home to whitewashed towns, ancient olive groves, and some of the country\'s most beautiful beaches. Stay in a traditional masseria or modern villa and discover why Puglia is Italy\'s best-kept secret.',
    img: 'https://images.unsplash.com/photo-1596097561109-2eeff92a7a20?auto=format&fit=crop&w=1200&q=80'
  },
  'Tuscany': {
    desc: 'Rolling hills, cypress-lined roads, and world-famous wines - Tuscany is the quintessential Italian landscape. Visit Florence\'s galleries, explore medieval hill towns, or simply enjoy the view with a glass of Chianti from your private terrace.',
    img: 'https://images.unsplash.com/photo-1534445867742-43195f401b6c?auto=format&fit=crop&w=1200&q=80'
  },
  'Umbria': {
    desc: 'The "green heart of Italy" offers a more authentic, less touristy alternative to neighboring Tuscany, with equally stunning landscapes. Discover Assisi\'s spiritual heritage, sample black truffles, and enjoy the peaceful countryside from your secluded villa.',
    img: 'https://images.unsplash.com/photo-1600019248002-f4e630104dc9?auto=format&fit=crop&w=1200&q=80'
  },

  // Greece
  'Corfu': {
    desc: 'The emerald isle of Greece, Corfu combines Venetian architecture, lush landscapes, and beautiful beaches. Explore Corfu Town\'s elegant streets, swim in hidden coves, or simply relax by your pool overlooking the Ionian Sea.',
    img: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80'
  },
  'Crete': {
    desc: 'Greece\'s largest island offers incredible diversity - ancient ruins, dramatic gorges, and some of Europe\'s finest beaches. Discover the Palace of Knossos, hike Samaria Gorge, or sample authentic Cretan cuisine from your villa base.',
    img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80'
  },
  'Lefkada': {
    desc: 'Connected to the mainland by a bridge, Lefkada offers easy access to some of Greece\'s most stunning beaches. Porto Katsiki and Egremni beaches regularly feature in world\'s best beach lists. Our villas put you close to the action.',
    img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80'
  },
  'Kefalonia': {
    desc: 'The largest Ionian island features dramatic landscapes, from Mount Ainos to the famous Myrtos Beach. Explore underground lakes, swim in turquoise waters, and experience authentic Greek island life from your private villa.',
    img: 'https://images.unsplash.com/photo-1601581875039-e899893d520c?auto=format&fit=crop&w=1200&q=80'
  },
  'Meganisi': {
    desc: 'This tiny island offers the ultimate escape - just three villages, pristine waters, and complete tranquility. Perfect for those seeking peace and authentic Greek charm away from the tourist crowds.',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
  },
  'Parga': {
    desc: 'This colorful coastal town on the mainland offers the island atmosphere with mainland accessibility. Wander through Venetian streets, swim from sandy beaches, and enjoy spectacular sunsets from your hillside villa.',
    img: 'https://images.unsplash.com/photo-1504512485720-7d83a16ee930?auto=format&fit=crop&w=1200&q=80'
  },
  'Peloponnese': {
    desc: 'The cradle of ancient Greek civilization offers history, beaches, and mountain villages in equal measure. Visit ancient Olympia, explore the Byzantine city of Mystras, or relax on the beaches of the Mani peninsula.',
    img: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80'
  },
  'Zakynthos': {
    desc: 'Home to the iconic Shipwreck Beach, Zakynthos combines stunning natural beauty with vibrant nightlife. Swim with sea turtles, explore the Blue Caves, or party in Laganas - Zakynthos offers something for everyone.',
    img: 'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?auto=format&fit=crop&w=1200&q=80'
  },

  // France
  "Cote d'Azur": {
    desc: 'The French Riviera needs no introduction - glamorous beaches, chic towns, and year-round sunshine define this legendary coastline. From Nice to Saint-Tropez, our villas put you in the heart of Riviera glamour while offering peaceful private retreats.',
    img: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=1200&q=80'
  },
  'Languedoc': {
    desc: 'A less discovered region offering Roman heritage, medieval Cathar castles, and unspoiled Mediterranean beaches. Explore Carcassonne\'s fortress, taste excellent wines, and enjoy the authentic French south from your private villa.',
    img: 'https://images.unsplash.com/photo-1558618047-f4b0d1b3c19e?auto=format&fit=crop&w=1200&q=80'
  },
  'Provence': {
    desc: 'Lavender fields, hilltop villages, and world-famous light have inspired artists for generations in this beloved region. Visit markets, sample local wines, and embrace the slow pace of Provencal life from your countryside villa.',
    img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80'
  },
  'South West France': {
    desc: 'From the Dordogne\'s prehistoric caves to Bordeaux\'s legendary vineyards, this diverse region offers endless discovery. Explore castles, kayak down rivers, and indulge in duck confit and foie gras - the best of French cuisine awaits.',
    img: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?auto=format&fit=crop&w=1200&q=80'
  },

  // Portugal
  'Costa Verde & Minho': {
    desc: 'Portugal\'s green north offers lush landscapes, historic towns, and the birthplace of the nation. Explore Guimaraes and Braga, taste Vinho Verde, and discover a Portugal far from the tourist crowds.',
    img: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80'
  },
  'Algarve': {
    desc: 'Europe\'s sunniest region offers golden beaches, dramatic cliffs, and world-class golf courses. From family-friendly Albufeira to sophisticated Quinta do Lago, our Algarve villas cater to every taste.',
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
  },

  // Turkey
  'Lycian Coast': {
    desc: 'One of the world\'s most beautiful coastlines, dotted with ancient Lycian ruins and pine-clad mountains plunging into turquoise waters. Sail on a traditional gulet, explore Kayakoy\'s ghost village, or paraglide over Oludeniz - the Lycian Coast offers adventure and relaxation in equal measure.',
    img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80'
  },
};

// Generic fallback images for regions without specific content
const GENERIC_IMAGES = [
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80',
];

// ===== COMPONENT PROPS =====

interface RegionExplorerProps {
  country: string;
  regions: string[];
}

// ===== MAIN COMPONENT =====

export function RegionExplorer({ country, regions }: RegionExplorerProps) {
  const [activeRegion, setActiveRegion] = useState(regions[0] || 'Unknown');
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Minimum swipe distance to trigger navigation (in pixels)
  const minSwipeDistance = 50;

  // Scroll the tab into view when activeRegion changes
  useEffect(() => {
    const activeButton = tabRefs.current[activeRegion];
    const container = tabContainerRef.current;

    if (activeButton && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      // Calculate if button is outside visible area
      const isLeftOfView = buttonRect.left < containerRect.left;
      const isRightOfView = buttonRect.right > containerRect.right;

      if (isLeftOfView || isRightOfView) {
        // Scroll to center the button in the container
        const scrollLeft = activeButton.offsetLeft - (container.offsetWidth / 2) + (activeButton.offsetWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [activeRegion]);

  // Navigate to next/previous region
  const navigateRegion = (direction: 'next' | 'prev') => {
    const currentIndex = regions.indexOf(activeRegion);
    let newIndex: number;

    if (direction === 'next') {
      newIndex = currentIndex < regions.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : regions.length - 1;
    }

    setActiveRegion(regions[newIndex]);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      navigateRegion('next');
    } else if (isRightSwipe) {
      navigateRegion('prev');
    }

    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Helper to get content safely with fallback
  const getContent = (regionName: string) => {
    const specific = REGION_DATA[regionName];
    if (specific) return specific;

    // Generate deterministic fallback based on region name
    const fallbackIndex = regionName.length % GENERIC_IMAGES.length;
    return {
      desc: `Explore our beautiful selection of luxury villas in ${regionName}, ${country}. Each property has been personally inspected to ensure the highest standards. The perfect location for your next holiday escape.`,
      img: GENERIC_IMAGES[fallbackIndex],
    };
  };

  const content = getContent(activeRegion);

  return (
    <section className="bg-[#F3F0E9]">
      {/* Tab Navigation */}
      <div className="flex justify-center border-b border-gray-300">
        <div
          ref={tabContainerRef}
          className="flex space-x-4 md:space-x-12 px-4 pt-8 pb-4 overflow-x-auto scroll-smooth"
        >
          {regions.map((region) => (
            <button
              key={region}
              ref={(el) => { tabRefs.current[region] = el; }}
              onClick={() => setActiveRegion(region)}
              className={`text-sm font-serif uppercase tracking-widest pb-4 transition-all whitespace-nowrap ${
                activeRegion === region
                  ? 'border-b-2 border-gray-800 font-semibold text-black -mb-[1px]'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Spotlight Content - Swipeable */}
      <div
        className="flex flex-col md:flex-row h-auto md:h-[500px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Image Side */}
        <div className="w-full md:w-1/2 h-[300px] md:h-full relative bg-gray-200 overflow-hidden">
          <Image
            key={activeRegion} // Force re-render for transition
            src={content.img}
            alt={`${activeRegion} landscape`}
            fill
            className="object-cover transition-opacity duration-500 animate-fadeIn"
          />
        </div>

        {/* Text Side */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-[#F3F0E9]">
          <div key={activeRegion} className="animate-fadeIn">
            <h3 className="text-3xl font-serif text-[#3A443C] mb-6">
              Villas in {activeRegion}
            </h3>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
              {content.desc}
            </p>
            <div>
              <Link
                href={`/villas-in-${toSlug(country)}/${toSlug(activeRegion)}`}
                className="bg-[#3A443C] text-white px-6 py-3 font-serif uppercase tracking-widest text-xs hover:bg-black transition-colors inline-block"
              >
                View Villas in {activeRegion}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="bg-white py-4 text-center">
        <Link
          href={`/villas-in-${toSlug(country)}`}
          className="text-xs uppercase tracking-widest text-gray-500 cursor-pointer hover:underline"
        >
          View All Villas in {country}
        </Link>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </section>
  );
}
