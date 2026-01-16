/**
 * PHASE 50: DYNAMIC COUNTRY LANDING PAGES
 *
 * Powers 8 country-specific landing pages:
 * /villas-in-spain, /villas-in-balearics, /villas-in-croatia, etc.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getAllVillas } from '@/lib/crm-client';
import { MockVilla } from '@/lib/mock-db';
import { MapPin, Search, ShieldCheck, Users, BedDouble, Bath, Star, Phone } from 'lucide-react';
import { RegionExplorer } from '@/components/lp/region-explorer';
import { HeroSearch } from '@/components/hero-search';
import { getClimateAverages } from '@/lib/weather';
import { ClimateWidget } from '@/components/villa/climate-widget';

// ===== COUNTRY CONFIGURATION =====

interface RegionConfig {
  id: string;
  label: string;
  title: string;
  description1: string;
  description2: string;
}

interface CountryConfig {
  name: string;
  slug: string;
  heroImage: string;
  mapImage: string;
  introTitle: string;
  introSubtitle: string;
  introText: string[];
  regions: RegionConfig[];
}

const COUNTRY_CONFIG: Record<string, CountryConfig> = {
  spain: {
    name: 'Spain',
    slug: 'spain',
    heroImage: 'https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=1920&h=1080&fit=crop&q=80',
    mapImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Spain_location_map.svg/1707px-Spain_location_map.svg.png',
    introTitle: 'Our Spanish holiday villas',
    introSubtitle: '35+ Years of Spanish Holiday Rentals',
    introText: [
      'Our villa selection in Spain has been perfected over the past 35 years, so when you book a Spanish Villa with Vintage Travel you can feel secure in the knowledge that every property has been personally inspected.',
      'From the lush green landscapes of Galicia to the sun-drenched beaches of Costa Blanca, our collection offers something for every traveler.',
      'Experience authentic Spanish culture, world-renowned cuisine, and stunning natural beauty from the comfort of your private villa.',
    ],
    regions: [
      { id: 'galicia', label: 'Galicia', title: 'Villas in Galicia', description1: 'Discover the green corner of Spain. Galicia offers stunning estuaries, fresh seafood, and a unique Celtic heritage distinct from the rest of the country.', description2: 'From the pilgrimage city of Santiago de Compostela to the wild Atlantic coast, our villas provide the perfect base to explore this lush region.' },
      { id: 'costa-blanca', label: 'Costa Blanca', title: 'Villas in Costa Blanca', description1: 'The "White Coast" is renowned for its stunning white sandy beaches, year-round sunshine, and charming coastal towns.', description2: 'Discover the picturesque towns of Jávea, Moraira, and Denia, or explore the dramatic cliffs and hidden coves from your luxury villa.' },
      { id: 'andalucia', label: 'Andalucia', title: 'Villas in Andalucia', description1: 'Home of flamenco, tapas, and sun-drenched landscapes. Andalucia captures the passionate soul of southern Spain.', description2: 'Visit the Alhambra in Granada, the Mezquita in Cordoba, or simply enjoy the white villages scattered across the hills.' },
      { id: 'catalunya', label: 'Catalunya', title: 'Villas in Catalunya', description1: 'A region of distinct culture, stunning architecture, and diverse landscapes from the Pyrenees to the Mediterranean coast.', description2: 'Enjoy the cosmopolitan vibe of Barcelona or retreat to the quiet countryside. Our villas offer a taste of the authentic Catalan lifestyle.' },
    ],
  },
  balearics: {
    name: 'Balearics',
    slug: 'balearics',
    heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop&q=80',
    mapImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Balearic_Islands_location_map.svg/800px-Balearic_Islands_location_map.svg.png',
    introTitle: 'Our Balearic Island villas',
    introSubtitle: 'Mediterranean Paradise Awaits',
    introText: [
      'The Balearic Islands offer the perfect blend of stunning beaches, vibrant culture, and peaceful countryside retreats.',
      'Whether you seek the glamour of Ibiza, the tranquility of Menorca, or the diverse beauty of Mallorca, our collection has something special.',
      'Each villa has been carefully selected to provide an authentic island experience with all modern comforts.',
    ],
    regions: [
      { id: 'mallorca', label: 'Mallorca', title: 'Villas in Mallorca', description1: 'The largest Balearic island offers incredible diversity - from the dramatic Serra de Tramuntana mountains to pristine beaches and charming villages.', description2: 'Explore Palma\'s Gothic cathedral, cycle through almond orchards, or simply relax by your private pool overlooking the Mediterranean.' },
      { id: 'menorca', label: 'Menorca', title: 'Villas in Menorca', description1: 'A UNESCO Biosphere Reserve, Menorca is the quieter sister island offering unspoiled beaches, prehistoric monuments, and authentic charm.', description2: 'Perfect for families and nature lovers, our Menorca villas provide a peaceful retreat from the modern world.' },
    ],
  },
  croatia: {
    name: 'Croatia',
    slug: 'croatia',
    heroImage: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=1920&h=1080&fit=crop&q=80',
    mapImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Croatia_location_map.svg/800px-Croatia_location_map.svg.png',
    introTitle: 'Our Croatian holiday villas',
    introSubtitle: 'Adriatic Splendor',
    introText: [
      'Croatia\'s stunning Adriatic coastline, historic cities, and pristine islands make it one of Europe\'s most desirable destinations.',
      'From the ancient walls of Dubrovnik to the rolling hills of Istria, discover a land where history meets natural beauty.',
      'Our Croatian villas offer the perfect base to explore this Mediterranean gem.',
    ],
    regions: [
      { id: 'dubrovnik', label: 'Dubrovnik', title: 'Villas near Dubrovnik', description1: 'The "Pearl of the Adriatic" needs no introduction. This UNESCO World Heritage city offers stunning architecture and a dramatic coastal setting.', description2: 'Stay in a luxury villa near Dubrovnik and explore the city\'s ancient walls, island-hop to nearby Elaphiti Islands, or simply enjoy the crystal-clear waters.' },
      { id: 'istria', label: 'Istria', title: 'Villas in Istria', description1: 'Often called "the new Tuscany," Istria combines Italian influence with Croatian authenticity. Rolling hills, truffle forests, and charming hilltop towns await.', description2: 'Enjoy world-class olive oil and wine, explore Roman ruins in Pula, or swim in the blue waters of the Adriatic from your private villa.' },
    ],
  },
  italy: {
    name: 'Italy',
    slug: 'italy',
    heroImage: 'https://images.unsplash.com/photo-1534445867742-43195f401b6c?w=1920&h=1080&fit=crop&q=80',
    mapImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Italy_location_map.svg/800px-Italy_location_map.svg.png',
    introTitle: 'Our Italian holiday villas',
    introSubtitle: 'La Dolce Vita Awaits',
    introText: [
      'Italy needs no introduction - art, history, food, and breathtaking landscapes combine to create the ultimate holiday destination.',
      'From the rolling hills of Tuscany to the sun-drenched coastlines of Puglia, our villas capture the essence of Italian living.',
      'Experience la dolce vita from your own private retreat.',
    ],
    regions: [
      { id: 'lazio', label: 'Lazio', title: 'Villas in Lazio', description1: 'Home to Rome, Lazio offers the perfect blend of ancient history, stunning countryside, and proximity to the Eternal City.', description2: 'Explore Roman ruins, relax by volcanic lakes, or venture to the beautiful Amalfi Coast - all within easy reach of your villa.' },
      { id: 'puglia', label: 'Puglia', title: 'Villas in Puglia', description1: 'The heel of Italy\'s boot is home to whitewashed towns, ancient olive groves, and some of the country\'s most beautiful beaches.', description2: 'Stay in a traditional masseria or modern villa and discover why Puglia is Italy\'s best-kept secret.' },
      { id: 'tuscany', label: 'Tuscany', title: 'Villas in Tuscany', description1: 'Rolling hills, cypress-lined roads, and world-famous wines - Tuscany is the quintessential Italian landscape.', description2: 'Visit Florence\'s galleries, explore medieval hill towns, or simply enjoy the view with a glass of Chianti from your private terrace.' },
      { id: 'umbria', label: 'Umbria', title: 'Villas in Umbria', description1: 'The "green heart of Italy" offers a more authentic, less touristy alternative to neighboring Tuscany, with equally stunning landscapes.', description2: 'Discover Assisi\'s spiritual heritage, sample black truffles, and enjoy the peaceful countryside from your secluded villa.' },
    ],
  },
  greece: {
    name: 'Greece',
    slug: 'greece',
    heroImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1920&h=1080&fit=crop&q=80',
    mapImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Greece_location_map.svg/800px-Greece_location_map.svg.png',
    introTitle: 'Our Greek holiday villas',
    introSubtitle: 'Ancient Beauty, Modern Comfort',
    introText: [
      'Greece offers an unparalleled combination of ancient history, stunning islands, and warm Mediterranean hospitality.',
      'From the Ionian Islands to the Peloponnese, our collection showcases the best of Greek villa living.',
      'Crystal-clear waters, olive groves, and whitewashed villages await you.',
    ],
    regions: [
      { id: 'corfu', label: 'Corfu', title: 'Villas in Corfu', description1: 'The emerald isle of Greece, Corfu combines Venetian architecture, lush landscapes, and beautiful beaches.', description2: 'Explore Corfu Town\'s elegant streets, swim in hidden coves, or simply relax by your pool overlooking the Ionian Sea.' },
      { id: 'crete', label: 'Crete', title: 'Villas in Crete', description1: 'Greece\'s largest island offers incredible diversity - ancient ruins, dramatic gorges, and some of Europe\'s finest beaches.', description2: 'Discover the Palace of Knossos, hike Samaria Gorge, or sample authentic Cretan cuisine from your villa base.' },
      { id: 'lefkada', label: 'Lefkada', title: 'Villas in Lefkada', description1: 'Connected to the mainland by a bridge, Lefkada offers easy access to some of Greece\'s most stunning beaches.', description2: 'Porto Katsiki and Egremni beaches regularly feature in world\'s best beach lists. Our villas put you close to the action.' },
      { id: 'kefalonia', label: 'Kefalonia', title: 'Villas in Kefalonia', description1: 'The largest Ionian island features dramatic landscapes, from Mount Ainos to the famous Myrtos Beach.', description2: 'Explore underground lakes, swim in turquoise waters, and experience authentic Greek island life from your private villa.' },
      { id: 'meganisi', label: 'Meganisi', title: 'Villas in Meganisi', description1: 'This tiny island offers the ultimate escape - just three villages, pristine waters, and complete tranquility.', description2: 'Perfect for those seeking peace and authentic Greek charm away from the tourist crowds.' },
      { id: 'parga', label: 'Parga', title: 'Villas in Parga', description1: 'This colorful coastal town on the mainland offers the island atmosphere with mainland accessibility.', description2: 'Wander through Venetian streets, swim from sandy beaches, and enjoy spectacular sunsets from your hillside villa.' },
      { id: 'peloponnese', label: 'Peloponnese', title: 'Villas in the Peloponnese', description1: 'The cradle of ancient Greek civilization offers history, beaches, and mountain villages in equal measure.', description2: 'Visit ancient Olympia, explore the Byzantine city of Mystras, or relax on the beaches of the Mani peninsula.' },
      { id: 'zakynthos', label: 'Zakynthos', title: 'Villas in Zakynthos', description1: 'Home to the iconic Shipwreck Beach, Zakynthos combines stunning natural beauty with vibrant nightlife.', description2: 'Swim with sea turtles, explore the Blue Caves, or party in Laganas - Zakynthos offers something for everyone.' },
    ],
  },
  france: {
    name: 'France',
    slug: 'france',
    heroImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1920&h=1080&fit=crop&q=80',
    mapImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/France_location_map-Regions_and_departements-2016.svg/800px-France_location_map-Regions_and_departements-2016.svg.png',
    introTitle: 'Our French holiday villas',
    introSubtitle: 'Joie de Vivre',
    introText: [
      'France offers an irresistible combination of culture, cuisine, and countryside that has captivated travelers for centuries.',
      'From the glamorous Cote d\'Azur to the lavender fields of Provence, our villas provide the perfect base for your French adventure.',
      'Experience French art de vivre from your own private retreat.',
    ],
    regions: [
      { id: 'cote-dazur', label: "Cote d'Azur", title: "Villas on the Cote d'Azur", description1: 'The French Riviera needs no introduction - glamorous beaches, chic towns, and year-round sunshine define this legendary coastline.', description2: 'From Nice to Saint-Tropez, our villas put you in the heart of Riviera glamour while offering peaceful private retreats.' },
      { id: 'languedoc', label: 'Languedoc', title: 'Villas in Languedoc', description1: 'A less discovered region offering Roman heritage, medieval Cathar castles, and unspoiled Mediterranean beaches.', description2: 'Explore Carcassonne\'s fortress, taste excellent wines, and enjoy the authentic French south from your private villa.' },
      { id: 'provence', label: 'Provence', title: 'Villas in Provence', description1: 'Lavender fields, hilltop villages, and world-famous light have inspired artists for generations in this beloved region.', description2: 'Visit markets, sample local wines, and embrace the slow pace of Provencal life from your countryside villa.' },
      { id: 'south-west-france', label: 'South West France', title: 'Villas in South West France', description1: 'From the Dordogne\'s prehistoric caves to Bordeaux\'s legendary vineyards, this diverse region offers endless discovery.', description2: 'Explore castles, kayak down rivers, and indulge in duck confit and foie gras - the best of French cuisine awaits.' },
    ],
  },
  portugal: {
    name: 'Portugal',
    slug: 'portugal',
    heroImage: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&h=1080&fit=crop&q=80',
    mapImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Portugal_location_map.svg/800px-Portugal_location_map.svg.png',
    introTitle: 'Our Portuguese holiday villas',
    introSubtitle: 'Atlantic Beauty',
    introText: [
      'Portugal offers a unique blend of rich history, stunning coastlines, and warm hospitality that makes every visitor feel welcome.',
      'From the green north to the sun-drenched Algarve, our villas showcase the best of Portuguese living.',
      'Discover why Portugal is one of Europe\'s most beloved destinations.',
    ],
    regions: [
      { id: 'costa-verde-minho', label: 'Costa Verde & Minho', title: 'Villas in Costa Verde & Minho', description1: 'Portugal\'s green north offers lush landscapes, historic towns, and the birthplace of the nation.', description2: 'Explore Guimaraes and Braga, taste Vinho Verde, and discover a Portugal far from the tourist crowds.' },
      { id: 'algarve', label: 'Algarve', title: 'Villas in the Algarve', description1: 'Europe\'s sunniest region offers golden beaches, dramatic cliffs, and world-class golf courses.', description2: 'From family-friendly Albufeira to sophisticated Quinta do Lago, our Algarve villas cater to every taste.' },
    ],
  },
  turkey: {
    name: 'Turkey',
    slug: 'turkey',
    heroImage: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1920&h=1080&fit=crop&q=80',
    mapImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Turkey_location_map.svg/800px-Turkey_location_map.svg.png',
    introTitle: 'Our Turkish holiday villas',
    introSubtitle: 'Where East Meets West',
    introText: [
      'Turkey\'s stunning Turquoise Coast offers crystal-clear waters, ancient ruins, and legendary hospitality.',
      'The Lycian Coast combines dramatic scenery with 300 days of sunshine and a rich historical heritage.',
      'Experience the magic of Turkey from your own private villa.',
    ],
    regions: [
      { id: 'lycian-coast', label: 'Lycian Coast', title: 'Villas on the Lycian Coast', description1: 'One of the world\'s most beautiful coastlines, dotted with ancient Lycian ruins and pine-clad mountains plunging into turquoise waters.', description2: 'Sail on a traditional gulet, explore Kayakoy\'s ghost village, or paraglide over Oludeniz - the Lycian Coast offers adventure and relaxation in equal measure.' },
    ],
  },
};

// Valid country slugs for static params
const VALID_COUNTRIES = Object.keys(COUNTRY_CONFIG);

// ===== METADATA =====

interface PageProps {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country } = await params;
  const config = COUNTRY_CONFIG[country];

  if (!config) {
    return { title: 'Not Found' };
  }

  return {
    title: `Holiday Villas in ${config.name} | Vintage Travel`,
    description: `Discover our handpicked collection of luxury holiday villas in ${config.name}. Personally inspected properties with local support.`,
  };
}

export async function generateStaticParams() {
  return VALID_COUNTRIES.map((country) => ({ country }));
}

// ===== PAGE COMPONENT =====

export default async function CountryLandingPage({ params }: PageProps) {
  const { country } = await params;
  const config = COUNTRY_CONFIG[country];

  if (!config) {
    notFound();
  }

  // Fetch villas and filter by country
  const allVillas = await getAllVillas();
  const allCountryVillas = allVillas.filter(
    (villa) => villa.country?.toLowerCase() === config.name.toLowerCase()
  );
  const countryVillas = allCountryVillas.slice(0, 4);

  // Calculate average coordinates from villas for climate data
  const villasWithCoords = allCountryVillas.filter((v) => {
    const lat = typeof v.latitude === 'string' ? parseFloat(v.latitude) : v.latitude;
    const lng = typeof v.longitude === 'string' ? parseFloat(v.longitude) : v.longitude;
    return lat && lng && !isNaN(lat) && !isNaN(lng);
  });

  let climateData: Awaited<ReturnType<typeof getClimateAverages>> = [];
  if (villasWithCoords.length > 0) {
    const avgLat = villasWithCoords.reduce((sum, v) => {
      const lat = typeof v.latitude === 'string' ? parseFloat(v.latitude) : v.latitude;
      return sum + (lat || 0);
    }, 0) / villasWithCoords.length;

    const avgLng = villasWithCoords.reduce((sum, v) => {
      const lng = typeof v.longitude === 'string' ? parseFloat(v.longitude) : v.longitude;
      return sum + (lng || 0);
    }, 0) / villasWithCoords.length;

    climateData = await getClimateAverages(avgLat, avgLng);
  }

  return (
    <div className="min-h-screen bg-[#F3F0E9]">
      {/* Hero Section */}
      <HeroSection config={config} />

      {/* Intro Section */}
      <IntroSection config={config} />

      {/* Region Explorer - Interactive Tab Component */}
      <RegionExplorer
        country={config.name}
        regions={config.regions.map(r => r.label)}
      />

      {/* Value Props */}
      <ValuePropsSection />

      {/* Climate Widget */}
      {climateData.length > 0 && (
        <section className="bg-[#F9F7F2] py-12 px-6 md:px-20">
          <div className="max-w-6xl mx-auto">
            <ClimateWidget data={climateData} region={config.name} />
          </div>
        </section>
      )}

      {/* Featured Villas */}
      <FeaturedVillasSection villas={countryVillas} countryName={config.name} />

      {/* Categories */}
      <CategoriesSection countryName={config.name} countrySlug={country} />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Newsletter */}
      <NewsletterSection />
    </div>
  );
}

// ===== HERO SECTION =====

function HeroSection({ config }: { config: CountryConfig }) {
  return (
    <div className="relative w-full h-[500px] md:h-[600px]">
      {/* Background Image */}
      <Image
        src={config.heroImage}
        alt={`${config.name} landscape`}
        fill
        className="object-cover"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Title - Centered between top and search */}
      <div className="absolute inset-x-0 top-[50px] md:top-[80px] text-center px-4">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white tracking-wide drop-shadow-lg">
          Holiday Villas with Private Pools in {config.name}
        </h1>
      </div>

      {/* Interactive Search Bar */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[800px]">
        <HeroSearch
          initialLocation={{
            label: config.name,
            value: config.slug,
            type: 'country',
          }}
        />
      </div>
    </div>
  );
}

// ===== INTRO SECTION =====

function IntroSection({ config }: { config: CountryConfig }) {
  return (
    <section className="bg-[#F9F7F2] py-16 px-6 md:px-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 items-start">
        {/* Text Content */}
        <div className="flex-1 space-y-6">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            {' > '}
            <span className="text-black">Villas in {config.name}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif text-[#3A443C]">{config.introTitle}</h2>
          <p className="font-serif italic text-lg text-gray-600">{config.introSubtitle}</p>

          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            {config.introText.map((text, index) => (
              <p key={index}>{text}</p>
            ))}
          </div>
        </div>

        {/* Map - Hidden on mobile */}
        <div className="hidden md:flex flex-1 w-full justify-center items-center">
          <div className="relative w-full max-w-md h-[350px]">
            <Image
              src={config.mapImage}
              alt={`Map of ${config.name}`}
              fill
              className="object-contain opacity-80 grayscale"
            />
            {/* Region Labels */}
            {config.regions.slice(0, 4).map((region, index) => {
              const positions = [
                'top-[20%] left-[20%]',
                'top-[30%] right-[15%]',
                'bottom-[30%] left-[25%]',
                'bottom-[20%] right-[20%]',
              ];
              return (
                <div
                  key={region.id}
                  className={`absolute ${positions[index]} text-xs font-bold font-serif bg-white/80 px-2 py-1 rounded`}
                >
                  {region.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== VALUE PROPS SECTION =====

function ValuePropsSection() {
  const props = [
    {
      icon: MapPin,
      title: 'Reps in location',
      description: 'Our representatives are based in each destination, ensuring you have local support throughout your stay.',
      linkText: 'Learn More',
      linkUrl: '/about',
    },
    {
      icon: Search,
      title: 'Personally inspected',
      description: 'Every villa has been personally visited and carefully selected by our team of travel specialists.',
      linkText: 'Learn More',
      linkUrl: '/about',
    },
    {
      icon: Star,
      title: 'Expert knowledge',
      description: 'With over 30 years of experience, we provide insider tips and personalized recommendations.',
      linkText: 'Learn More',
      linkUrl: '/about',
    },
    {
      icon: Phone,
      title: 'UK-based support',
      description: 'Our friendly team is available by phone or email to help you plan and book your perfect villa holiday.',
      linkText: 'Contact Us',
      linkUrl: '/contact',
    },
  ];

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-6 md:mb-8">
          <h3 className="text-xl md:text-2xl font-serif text-[#3A443C] italic">Why book with Vintage?</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12">
          {props.map((prop, index) => (
            <div key={index} className="text-center group">
              <div className="mb-3 md:mb-6 flex justify-center transform transition-transform group-hover:scale-110 duration-500">
                <div className="md:hidden">
                  <prop.icon className="w-8 h-8 text-[#3A443C] stroke-[1]" />
                </div>
                <div className="hidden md:block">
                  <prop.icon className="w-10 h-10 text-[#3A443C] stroke-[1]" />
                </div>
              </div>
              <h4 className="text-sm md:text-xl font-serif mb-2 md:mb-4">{prop.title}</h4>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-3 md:mb-6 line-clamp-3 md:line-clamp-none">
                {prop.description}
              </p>
              <Link
                href={prop.linkUrl}
                className="text-[10px] md:text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 hover:border-[#3A443C] transition-colors"
              >
                {prop.linkText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== FEATURED VILLAS SECTION =====

function FeaturedVillasSection({ villas, countryName }: { villas: MockVilla[]; countryName: string }) {
  if (villas.length === 0) {
    return (
      <section className="bg-[#F3F0E9] pt-16 pb-8 px-6 md:px-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-serif text-[#3A443C] mb-6">Featured Villas in {countryName}</h2>
          <p className="text-gray-600 mb-8">
            We&apos;re currently updating our villa collection for {countryName}. Please check back soon or contact us for personalized recommendations.
          </p>
          <Link
            href="/search"
            className="bg-[#3A443C] text-white px-8 py-3 font-serif uppercase tracking-widest text-xs hover:bg-black transition-colors inline-block"
          >
            Browse All Villas
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#F3F0E9] pt-16 pb-8 px-6 md:px-20">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-serif text-[#3A443C] mb-8 text-center">Featured Villas in {countryName}</h2>

        {villas.map((villa) => (
          <VillaCard key={villa.id} villa={villa} />
        ))}

        <div className="mt-8 text-center">
          <Link
            href={`/search?country=${encodeURIComponent(countryName)}`}
            className="bg-[#3A443C] text-white px-8 py-3 font-serif uppercase tracking-widest text-xs hover:bg-black transition-colors inline-block w-full md:w-auto"
          >
            View All Villas in {countryName}
          </Link>
        </div>
      </div>
    </section>
  );
}

// ===== VILLA CARD COMPONENT =====

function VillaCard({ villa }: { villa: MockVilla }) {
  const tags = villa.amenities?.slice(0, 3) || [];

  return (
    <div className="bg-white shadow-sm flex flex-col md:flex-row mb-8 min-h-[300px]">
      {/* Image Side */}
      <div className="relative w-full md:w-5/12 h-64 md:h-auto overflow-hidden group">
        <Image
          src={villa.heroImageUrl || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=500&fit=crop&q=80'}
          alt={villa.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Content Side */}
      <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col relative">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="border border-gray-400 rounded-full px-3 py-1 text-[10px] uppercase tracking-wide text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-start">
          <div>
            <Link href={`/villas/${villa.slug}`}>
              <h3 className="text-2xl font-serif text-[#3A443C] mb-1 hover:underline">{villa.title}</h3>
            </Link>
            <p className="text-xs text-gray-500 mb-4">
              {villa.town && `${villa.town}, `}{villa.region}, {villa.country}
            </p>
          </div>
          {/* Price - Desktop */}
          <div className="hidden md:block text-right">
            <p className="text-[10px] uppercase tracking-widest text-gray-500">From</p>
            <p className="text-3xl font-serif text-[#3A443C]">
              {villa.pricePerWeek ? `£${villa.pricePerWeek.toLocaleString()}` : 'POA'}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-gray-500">Per Week</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-6 line-clamp-3">
          {villa.description?.replace(/<[^>]*>/g, '').substring(0, 200)}...
        </p>

        <div className="mt-auto">
          <p className="text-xs text-gray-500 mb-2">At a glance:</p>
          <div className="flex gap-6 text-gray-700">
            <div className="flex items-center gap-2">
              <Users size={18} strokeWidth={1.5} />
              <span className="text-xs">Sleeps {villa.maxGuests}</span>
            </div>
            <div className="flex items-center gap-2">
              <BedDouble size={18} strokeWidth={1.5} />
              <span className="text-xs">{villa.bedrooms} Bedrooms</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath size={18} strokeWidth={1.5} />
              <span className="text-xs">{villa.bathrooms} Bathrooms</span>
            </div>
          </div>
        </div>

        {/* Mobile Price & Action */}
        <div className="md:hidden mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-xl font-serif text-[#3A443C]">
              {villa.pricePerWeek ? `£${villa.pricePerWeek.toLocaleString()}` : 'POA'}
            </p>
            <p className="text-[10px] text-gray-500">Per Week</p>
          </div>
          <Link
            href={`/villas/${villa.slug}`}
            className="bg-[#3A443C] text-white px-6 py-3 font-serif uppercase tracking-widest text-[10px] hover:bg-black transition-colors"
          >
            View Villa
          </Link>
        </div>

        {/* Desktop Button */}
        <div className="hidden md:block absolute bottom-8 right-8">
          <Link
            href={`/villas/${villa.slug}`}
            className="bg-[#3A443C] text-white px-8 py-3 font-serif uppercase tracking-widest text-[10px] hover:bg-black transition-colors"
          >
            View Villa
          </Link>
        </div>
      </div>
    </div>
  );
}

// ===== CATEGORIES SECTION =====

const CATEGORIES = [
  { id: 1, title: 'Family-friendly villas', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop&q=80', slug: 'family-friendly-villas' },
  { id: 2, title: 'Villas for couples', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop&q=80', slug: 'villas-for-couples' },
  { id: 3, title: 'Large villas', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop&q=80', slug: 'large-villas' },
  { id: 4, title: 'Car-free villas', image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&h=400&fit=crop&q=80', slug: 'car-free-villas' },
  { id: 5, title: 'Beachside villas', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop&q=80', slug: 'beachside-villas' },
  { id: 6, title: 'Secluded villas', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&h=400&fit=crop&q=80', slug: 'secluded-villas' },
];

function CategoriesSection({ countryName, countrySlug }: { countryName: string; countrySlug: string }) {
  return (
    <section className="bg-[#F3F0E9] py-20 px-6 md:px-20">
      <div className="text-center mb-16">
        <h4 className="text-xl font-serif text-gray-600 mb-2">Villas in {countryName}</h4>
        <h2 className="text-4xl md:text-5xl font-serif text-[#3A443C] italic">
          What are you looking for?
        </h2>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-2 gap-3 md:gap-6">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/${countrySlug}/${cat.slug}`}
            className="relative h-64 group cursor-pointer overflow-hidden block"
          >
            <Image
              src={cat.image}
              alt={cat.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex flex-col justify-center items-center p-6">
              <h3 className="text-white text-2xl font-serif text-center drop-shadow-md">{cat.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ===== TESTIMONIALS SECTION =====

const TESTIMONIALS = [
  { id: 1, title: 'Excellent staff', text: 'Excellent knowledgeable patient staff. Made our booking so easy.', author: 'Mrs Karen Reynolds', date: 'September 2025', rating: 5 },
  { id: 2, title: 'Wonderful experience', text: 'Helpful informative staff. The villa exceeded our expectations.', author: 'Mr James Wilson', date: 'August 2025', rating: 5 },
  { id: 3, title: 'Great Service', text: 'Just wonderful from start to finish. Will definitely book again.', author: 'Mr Graham Thomas', date: 'September 2025', rating: 5 },
  { id: 4, title: 'Would recommend', text: 'Seamless booking process. Professional and friendly service.', author: 'Mrs Sarah Johnson', date: 'July 2025', rating: 5 },
];

function TestimonialsSection() {
  return (
    <section className="bg-white py-12 border-t border-gray-100">
      {/* Summary Header */}
      <div className="flex flex-col items-center justify-center mb-12">
        <div className="flex items-center gap-2 mb-2 flex-wrap justify-center">
          <span className="text-gray-500 font-serif">Average Customer Rating:</span>
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} fill="currentColor" />
            ))}
          </div>
          <span className="font-bold text-2xl font-serif ml-2">4.9/5</span>
          <span className="font-bold text-xl ml-1">feefo</span>
        </div>
        <p className="text-[10px] text-gray-400">
          Independent Service Rating based on 3846 verified reviews.{' '}
          <a href="#" className="underline">Read all reviews</a>
        </p>
      </div>

      {/* Reviews */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="p-4">
              <div className="flex text-yellow-400 mb-3">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <h4 className="font-bold text-sm mb-1">{t.title}</h4>
              <p className="text-xs text-gray-600 mb-4 h-12">{t.text}</p>
              <p className="text-[10px] text-gray-400">{t.author}</p>
              <p className="text-[10px] text-gray-400">{t.date}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end px-6 md:px-20 mt-8">
        <div className="border border-gray-200 p-2 rounded shadow-sm inline-block">
          <div className="text-[10px] text-center font-bold text-gray-600">Platinum Trusted Service Award</div>
          <div className="text-[8px] text-center text-gray-400">2025 feefo</div>
        </div>
      </div>
    </section>
  );
}

// ===== NEWSLETTER SECTION =====

function NewsletterSection() {
  return (
    <section className="relative h-[400px] md:h-[450px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=600&fit=crop&q=80"
          alt="Poolside villa"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-white/80 md:bg-transparent md:bg-gradient-to-r md:from-white/90 md:via-white/70 md:to-transparent"></div>
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-6 md:px-20 flex items-center">
        <div className="w-full md:w-1/2 relative z-10">
          <div className="border-l-4 border-black pl-6 mb-8">
            <h3 className="text-3xl font-serif text-[#3A443C] mb-4">Sign up to our newsletter</h3>
            <p className="text-sm text-gray-600 max-w-sm">
              Be the first to hear about our latest villa additions, special offers, and travel inspiration.
            </p>
          </div>

          <form className="max-w-md space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="FIRST NAME"
                className="w-1/2 bg-transparent border-b border-gray-400 py-2 text-xs focus:outline-none focus:border-black"
              />
              <input
                type="text"
                placeholder="LAST NAME"
                className="w-1/2 bg-transparent border-b border-gray-400 py-2 text-xs focus:outline-none focus:border-black"
              />
            </div>
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              className="w-full bg-transparent border-b border-gray-400 py-2 text-xs focus:outline-none focus:border-black"
            />

            <div className="pt-4">
              <button
                type="submit"
                className="bg-[#3A443C] text-white px-8 py-3 font-serif uppercase tracking-widest text-[10px] hover:bg-black transition-colors"
              >
                Sign Me Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
