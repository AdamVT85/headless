/**
 * VINTAGE TRAVEL - HOMEPAGE
 * Connected to Sanity CMS for full content editing
 */

import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Search as SearchIcon,
  Star,
  Phone,
  CheckCircle,
  Users,
  Shield,
  Heart,
  Home,
  Award,
} from 'lucide-react';
import { HeroSearch } from '@/components/hero-search';
import { DestinationTabsClient } from '@/components/destination-tabs-client';
import {
  getHomepageData,
  getImageUrl,
  getDestinationCountries,
  type HomePageData,
  type USP,
  type Collection,
  type VillaCategory,
  type Testimonial,
  type FeaturedVilla,
  type DestinationCountry,
  type AwardBadge,
} from '@/lib/queries/homepage';
import { getVillaById } from '@/lib/crm-client';

// Icon mapping for USPs
const iconMap: Record<string, React.ReactNode> = {
  'map-pin': <MapPin className="w-10 h-10 text-vintage-green stroke-[1]" />,
  'search': <SearchIcon className="w-10 h-10 text-vintage-green stroke-[1]" />,
  'star': <Star className="w-10 h-10 text-vintage-green stroke-[1]" />,
  'check-circle': <CheckCircle className="w-10 h-10 text-vintage-green stroke-[1]" />,
  'users': <Users className="w-10 h-10 text-vintage-green stroke-[1]" />,
  'shield': <Shield className="w-10 h-10 text-vintage-green stroke-[1]" />,
  'phone': <Phone className="w-10 h-10 text-vintage-green stroke-[1]" />,
  'heart': <Heart className="w-10 h-10 text-vintage-green stroke-[1]" />,
  'home': <Home className="w-10 h-10 text-vintage-green stroke-[1]" />,
  'award': <Award className="w-10 h-10 text-vintage-green stroke-[1]" />,
};

// Default/fallback data for when CMS content is not yet populated
const defaultData: HomePageData = {
  heroTitle: 'The art of the Mediterranean',
  heroSubtitle: 'Carefully chosen villas in beautiful locations.',
  heroLocationLabel: 'Villa Bacic, Dubrovnik',
  heroCtaText: 'Explore Villas',
  heroCtaLink: '/search',
  uspSectionTitle: 'Why book with Vintage?',
  usps: [
    {
      _key: '1',
      icon: 'map-pin',
      title: 'Reps in location',
      description: 'Our representatives are based in each destination, ensuring you have local support throughout your stay.',
      linkText: 'Learn More',
      linkUrl: '/about',
    },
    {
      _key: '2',
      icon: 'search',
      title: 'Personally inspected',
      description: 'Every villa has been personally visited and carefully selected by our team of travel specialists.',
      linkText: 'Learn More',
      linkUrl: '/about',
    },
    {
      _key: '3',
      icon: 'star',
      title: 'Expert knowledge',
      description: 'With over 30 years of experience, we provide insider tips and personalized recommendations.',
      linkText: 'Learn More',
      linkUrl: '/about',
    },
    {
      _key: '4',
      icon: 'phone',
      title: 'UK-based support',
      description: 'Our friendly team is available by phone or email to help you plan and book your perfect villa holiday.',
      linkText: 'Contact Us',
      linkUrl: '/contact',
    },
  ],
  collectionsSectionTitle: 'Our hottest collections',
  collectionsCtaText: 'Search All Villas',
  collectionsCtaLink: '/search',
  ctaTitle: 'Book online or call... 01954 261 431',
  ctaDescription: 'Our UK-based team of specialists have visited all of our villas and can answer any questions you have or simply help you to book your villa, car hire and flights.',
  ctaPhoneNumber: '+441954261431',
  ctaPrimaryButtonText: 'Call Us',
  ctaSecondaryButtonText: 'Email Us',
  ctaSecondaryButtonLink: '/contact',
  categoriesSectionSubtitle: 'Villas for X',
  categoriesSectionTitle: 'What are you looking for?',
  testimonialsTitle: 'What our customers say',
  testimonialsAverageRating: 4.9,
  testimonialsReviewCount: 3845,
  testimonialsRatingSource: 'feefo',
  testimonials: [
    { _key: '1', author: 'Mrs Karen Reynolds', date: '14 September 2025', rating: 5, tagline: 'Excellent staff', quote: 'Excellent knowledgeable patient staff.' },
    { _key: '2', author: 'Mrs Karen Reynolds', date: '15 September 2025', rating: 5, tagline: 'Excellent and patient staff', quote: 'Excellent, helpful informative staff' },
    { _key: '3', author: 'Mr Graham Thomas', date: '10 September 2025', rating: 5, tagline: 'Excellent', quote: 'Excellent service from start to finish.' },
    { _key: '4', author: 'Mr John Walker', date: '10 September 2025', rating: 5, tagline: 'Excellent', quote: 'Faultless booking experience.' },
  ],
  newsletterTitle: 'Sign up to our newsletter',
  newsletterDescription: 'Get exclusive offers, travel inspiration, and insider tips delivered straight to your inbox.',
  newsletterButtonText: 'Sign Me Up',
};

// Fallback images (used when no CMS image is set)
const fallbackImages = {
  hero: 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?q=80&w=2000',
  cta: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&h=600&fit=crop',
  newsletter: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&h=800&fit=crop',
  collections: [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=500&fit=crop',
  ],
  categories: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&h=400&fit=crop',
  ],
};

const defaultCollections: Collection[] = [
  { _key: '1', title: 'Villas with a view', linkUrl: '/search' },
  { _key: '2', title: 'Villas by the sea', linkUrl: '/search' },
  { _key: '3', title: 'Villas in Tuscany', linkUrl: '/search' },
  { _key: '4', title: 'Family-friendly villas', linkUrl: '/search' },
];

const defaultCategories: VillaCategory[] = [
  { _key: '1', title: "Villas with children's pools", linkUrl: "/search?facilities=Children's Pool,Fenced/Gated Pool" },
  { _key: '2', title: 'Villas for couples', linkUrl: '/search?maxSleeps=4' },
  { _key: '3', title: 'Large villas', linkUrl: '/search?minSleeps=8' },
  { _key: '4', title: 'Car not essential', linkUrl: '/search?facilities=Car NOT Essential' },
  { _key: '5', title: 'Villas near beaches', linkUrl: '/search?facilities=Beach - Walk (within 1.5km)' },
  { _key: '6', title: 'Secluded villas', linkUrl: '/search?facilities=Grounds offer TOTAL PRIVACY' },
];

export default async function HomePage() {
  // Fetch CMS data and destination countries in parallel
  const [cmsData, destinationCountries] = await Promise.all([
    getHomepageData(),
    getDestinationCountries(),
  ]);

  // Merge CMS data with defaults (CMS takes precedence)
  const data: HomePageData = {
    ...defaultData,
    ...cmsData,
  };

  // Transform destination countries into the format expected by DestinationTabsClient
  const destinationsMap: Record<string, { title: string; slug: string; imageUrl?: string; introduction?: string }> = {};
  for (const country of destinationCountries) {
    destinationsMap[country.title] = {
      title: country.title,
      slug: country.slug,
      imageUrl: getImageUrl(country.heroImage, 800) || undefined,
      introduction: country.introduction,
    };
  }

  return (
    <div className="min-h-screen bg-white">
      <Hero data={data} />
      <USPSection data={data} />
      <DestinationTabs data={data} destinations={destinationsMap} />
      <HottestCollections data={data} />
      <CallToAction data={data} />
      <FeaturedVillasSection data={data} />
      <VillasForXGrid data={data} />
      <Testimonials data={data} />
      <SignupBanner data={data} />
    </div>
  );
}

/**
 * Hero Section - Full-screen hero with integrated search
 */
function Hero({ data }: { data: HomePageData }) {
  const heroImageUrl = getImageUrl(data.heroImage, 2000) || fallbackImages.hero;

  // Split title by newline for line break support
  const titleParts = data.heroTitle?.split('\n') || ['The art of the', 'Mediterranean'];

  return (
    <section className="relative h-[650px] w-full flex items-center justify-center text-white overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 hover:scale-105"
        style={{ backgroundImage: `url('${heroImageUrl}')` }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="mb-4 inline-block">
          <div className="w-12 h-12 border border-white/40 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin size={24} className="text-white/80" />
          </div>
        </div>
        <h2 className="text-4xl md:text-7xl font-serif mb-4 leading-tight">
          {titleParts.map((part, i) => (
            <span key={i}>
              {part}
              {i < titleParts.length - 1 && <br />}
            </span>
          ))}
        </h2>
        {data.heroSubtitle && (
          <p className="text-lg md:text-xl font-light mb-8 opacity-90">
            {data.heroSubtitle}
          </p>
        )}
        {data.heroLocationLabel && (
          <div className="flex items-center justify-center space-x-2 text-sm opacity-70 mb-12">
            <MapPin size={14} />
            <span>{data.heroLocationLabel}</span>
          </div>
        )}

        {/* Integrated Search Bar */}
        <HeroSearch />
      </div>

      {/* Award Badges */}
      {data.heroAwardBadges && data.heroAwardBadges.length > 0 && (
        <div className="absolute bottom-8 left-8 hidden lg:flex space-x-6">
          {data.heroAwardBadges.map((badge) => {
            const badgeImageUrl = getImageUrl(badge.image, 400);
            if (!badgeImageUrl) return null;

            const badgeContent = (
              <Image
                src={badgeImageUrl}
                alt={badge.alt}
                width={180}
                height={90}
                className="h-[90px] w-auto object-contain"
              />
            );

            return badge.link ? (
              <Link key={badge._key} href={badge.link} target="_blank" rel="noopener noreferrer">
                {badgeContent}
              </Link>
            ) : (
              <div key={badge._key}>{badgeContent}</div>
            );
          })}
        </div>
      )}

      <div className="absolute bottom-8 right-8 hidden lg:block">
        <div className="bg-white/90 p-4 rounded flex items-center space-x-4">
          <div className="text-vintage-green font-bold text-xl">{data.testimonialsRatingSource || 'feefo'}</div>
          <div className="text-xs">
            <div className="flex text-yellow-500">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <div className="text-gray-600 mt-1">Service Rating <b>{data.testimonialsReviewCount || 3845} reviews</b></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * USP Section - Why book with Vintage
 */
function USPSection({ data }: { data: HomePageData }) {
  const usps = data.usps || defaultData.usps || [];

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-6 md:mb-8">
          <h3 className="text-xl md:text-2xl font-serif text-vintage-green italic">
            {data.uspSectionTitle || 'Why book with Vintage?'}
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12">
          {usps.map((usp) => (
            <div key={usp._key} className="text-center group">
              <div className="mb-3 md:mb-6 flex justify-center transform transition-transform group-hover:scale-110 duration-500">
                <div className="md:hidden">
                  {iconMap[usp.icon || 'star'] ? (
                    <div className="[&>svg]:w-8 [&>svg]:h-8">
                      {iconMap[usp.icon || 'star']}
                    </div>
                  ) : (
                    iconMap['star']
                  )}
                </div>
                <div className="hidden md:block">
                  {iconMap[usp.icon || 'star'] || iconMap['star']}
                </div>
              </div>
              <h4 className="text-sm md:text-xl font-serif mb-2 md:mb-4">{usp.title}</h4>
              {usp.description && (
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-3 md:mb-6 line-clamp-3 md:line-clamp-none">
                  {usp.description}
                </p>
              )}
              {usp.linkUrl && (
                <Link
                  href={usp.linkUrl}
                  className="text-[10px] md:text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 hover:border-vintage-green transition-colors"
                >
                  {usp.linkText || 'Learn More'}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Hottest Collections - Featured villa categories
 */
function HottestCollections({ data }: { data: HomePageData }) {
  const collections = data.collections && data.collections.length > 0
    ? data.collections
    : defaultCollections;

  return (
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-center font-serif text-2xl mb-6 italic">
          {data.collectionsSectionTitle || 'Our hottest collections'}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {collections.map((item, i) => {
            const imageUrl = getImageUrl(item.image, 500) || fallbackImages.collections[i % fallbackImages.collections.length];

            return (
              <Link
                key={item._key}
                href={item.linkUrl || '/search'}
                className="relative group cursor-pointer overflow-hidden h-[200px] sm:h-[350px] lg:h-[450px] block"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 sm:bottom-10 left-0 w-full text-center px-2 sm:px-4">
                  <h4 className="text-white font-serif text-base sm:text-2xl mb-2 sm:mb-4">{item.title}</h4>
                  <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-white text-[10px] uppercase tracking-[0.2em] border border-white/40 px-4 py-2 hover:bg-white hover:text-black transition-colors inline-block">
                      View All Villas
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Link
            href={data.collectionsCtaLink || '/search'}
            className="border border-vintage-green text-vintage-green px-12 py-3 text-xs uppercase tracking-widest hover:bg-vintage-green hover:text-white transition-all inline-block"
          >
            {data.collectionsCtaText || 'SEARCH ALL VILLAS'}
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Destination Tabs - Where do you want to go?
 */
function DestinationTabs({
  data,
  destinations
}: {
  data: HomePageData;
  destinations: Record<string, { title: string; slug: string; imageUrl?: string; introduction?: string }>;
}) {
  return (
    <DestinationTabsClient
      destinations={destinations}
      sectionTitle={data.destinationsTitle}
    />
  );
}

/**
 * Call to Action - Phone booking CTA
 */
function CallToAction({ data }: { data: HomePageData }) {
  const bgImageUrl = getImageUrl(data.ctaBackgroundImage, 1920) || fallbackImages.cta;
  const phoneNumber = data.ctaPhoneNumber || '+441954261431';

  return (
    <section className="relative h-[360px] md:h-[400px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-fixed bg-center"
        style={{ backgroundImage: `url('${bgImageUrl}')` }}
      >
        <div className="absolute inset-0 bg-vintage-green/80"></div>
      </div>

      <div className="relative z-10 text-white text-center max-w-4xl px-6 scale-90 md:scale-100">
        <div className="mb-4 md:mb-6 flex justify-center opacity-40">
          <Phone size={60} className="md:hidden transform -rotate-12" />
          <Phone size={80} className="hidden md:block transform -rotate-12" />
        </div>
        <h2 className="text-2xl md:text-5xl font-serif mb-4 md:mb-6">
          {data.ctaTitle || 'Book online or call... 01954 261 431'}
        </h2>
        {data.ctaDescription && (
          <p className="text-xs md:text-base font-light mb-6 md:mb-10 opacity-80 max-w-2xl mx-auto">
            {data.ctaDescription}
          </p>
        )}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-4">
          <a
            href={`tel:${phoneNumber}`}
            className="bg-white text-vintage-green px-10 md:px-12 py-2.5 md:py-3 text-xs font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-all w-full sm:w-auto"
          >
            {data.ctaPrimaryButtonText || 'CALL US'}
          </a>
          <Link
            href={data.ctaSecondaryButtonLink || '/contact'}
            className="border border-white text-white px-10 md:px-12 py-2.5 md:py-3 text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-vintage-green transition-all w-full sm:w-auto"
          >
            {data.ctaSecondaryButtonText || 'EMAIL US'}
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Featured Villas Section - Hand-picked villas from CMS
 */
function FeaturedVillasSection({ data }: { data: HomePageData }) {
  const featuredVillas = data.featuredVillas;

  // Don't render if no featured villas selected
  if (!featuredVillas || featuredVillas.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-serif text-vintage-green">
            {data.featuredVillasTitle || 'Featured Villas'}
          </h2>
          <p className="text-gray-500 mt-4">Hand-picked properties for an unforgettable stay</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredVillas.slice(0, 8).map((villa, i) => {
            // Get image from Sanity (heroImage or first gallery image)
            const imageUrl = getImageUrl(villa.heroImage, 500)
              || (villa.gallery && villa.gallery.length > 0 ? getImageUrl(villa.gallery[0], 500) : null)
              || fallbackImages.collections[i % fallbackImages.collections.length];

            // Build the villa link using slug or salesforceId
            const villaHref = villa.slug?.current
              ? `/villas/${villa.slug.current}`
              : `/villas/${villa.salesforceId}`;

            return (
              <Link
                key={villa._id}
                href={villaHref}
                className="group block"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm mb-4">
                  <Image
                    src={imageUrl}
                    alt={villa.title || 'Featured Villa'}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="font-serif text-lg text-vintage-green group-hover:underline">
                  {villa.title || 'Luxury Villa'}
                </h3>
                {villa.introduction && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {villa.introduction}
                  </p>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/search"
            className="border border-vintage-green text-vintage-green px-12 py-3 text-xs uppercase tracking-widest hover:bg-vintage-green hover:text-white transition-all inline-block"
          >
            VIEW ALL VILLAS
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Villas For X Grid - Category showcase
 */
function VillasForXGrid({ data }: { data: HomePageData }) {
  const categories = data.villaCategories && data.villaCategories.length > 0
    ? data.villaCategories
    : defaultCategories;

  return (
    <section className="py-12 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-8">
          <span className="text-lg font-serif italic text-gray-500 block mb-2">
            {data.categoriesSectionSubtitle || 'Villas for X'}
          </span>
          <h2 className="text-5xl md:text-7xl font-serif font-light text-vintage-green">
            {data.categoriesSectionTitle || 'What are you looking for?'}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-8">
          {categories.map((card, i) => {
            const imageUrl = getImageUrl(card.image, 600) || fallbackImages.categories[i % fallbackImages.categories.length];
            const description = card.description || `Discover our selection of ${card.title.toLowerCase()} perfect for your Mediterranean escape.`;

            return (
              <Link
                key={card._key}
                href={card.linkUrl || '/search'}
                className="relative group cursor-pointer overflow-hidden rounded-sm h-[380px] block"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={imageUrl}
                    alt={card.title}
                    fill
                    className="object-cover grayscale-[0.2] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  />
                </div>
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-500 flex flex-col items-center justify-center p-8 text-center">
                  <h4 className="text-white text-3xl font-serif mb-6 transform group-hover:-translate-y-2 transition-transform duration-500">
                    {card.title}
                  </h4>
                  <div className="w-12 h-px bg-white/60 mb-6"></div>
                  <p className="text-white/80 text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-3">
                    {description}
                  </p>
                  <div className="mt-8">
                    <span className="text-white text-[10px] font-bold uppercase tracking-[0.3em] border-b border-white/50 pb-1 group-hover:border-white transition-colors">
                      FIND OUT MORE
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * Testimonials - Customer reviews
 */
function Testimonials({ data }: { data: HomePageData }) {
  const reviews = data.testimonials || defaultData.testimonials || [];
  const avgRating = data.testimonialsAverageRating || 4.9;
  const reviewCount = data.testimonialsReviewCount || 3845;
  const ratingSource = data.testimonialsRatingSource || 'feefo';

  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-center font-serif text-2xl italic mb-6">
          {data.testimonialsTitle || 'What our customers say'}
        </h3>

        <div className="bg-white shadow-sm border border-gray-100 p-8 relative">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 mb-8 pb-6 border-b border-gray-100">
            <div className="text-xl font-medium text-gray-700">Average Customer Rating:</div>
            <div className="flex items-center space-x-2">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={24} fill="currentColor" />)}
              </div>
              <div className="text-3xl font-serif font-bold text-vintage-green">{avgRating}/5</div>
              <div className="text-xl font-bold text-vintage-green">{ratingSource}</div>
            </div>
            <div className="text-xs text-gray-400">Independent Service Rating based on {reviewCount} verified reviews.</div>
          </div>

          <div className="relative overflow-hidden">
            <div className="grid md:grid-cols-4 gap-8">
              {reviews.slice(0, 4).map((rev) => (
                <div key={rev._key} className="text-center md:text-left space-y-4">
                  <div className="flex justify-center md:justify-start text-yellow-500">
                    {[...Array(rev.rating || 5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <h5 className="font-bold text-sm">{rev.tagline}</h5>
                  <p className="text-gray-500 text-sm italic">"{rev.quote}"</p>
                  <div className="text-[10px] text-gray-400">
                    <span className="block">{rev.author} - {rev.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Signup Banner - Newsletter subscription
 */
function SignupBanner({ data }: { data: HomePageData }) {
  const bgImageUrl = getImageUrl(data.newsletterBackgroundImage, 1920) || fallbackImages.newsletter;

  return (
    <section className="relative h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${bgImageUrl}')` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl px-6">
        <div className="bg-white/95 backdrop-blur-md p-6 md:p-12 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-serif text-vintage-green mb-4">
              {data.newsletterTitle || 'Sign up to our newsletter'}
            </h2>
            {data.newsletterDescription && (
              <p className="text-gray-500 mb-8 max-w-lg">
                {data.newsletterDescription}
              </p>
            )}

            <form className="grid md:grid-cols-2 gap-6 mb-6">
              <input
                type="text"
                placeholder="FIRST NAME"
                className="border-b border-gray-300 py-3 text-sm focus:border-vintage-green outline-none bg-transparent"
                required
              />
              <input
                type="text"
                placeholder="LAST NAME"
                className="border-b border-gray-300 py-3 text-sm focus:border-vintage-green outline-none bg-transparent"
                required
              />
              <div className="md:col-span-2 flex flex-col md:flex-row gap-6">
                <input
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  className="flex-1 border-b border-gray-300 py-3 text-sm focus:border-vintage-green outline-none bg-transparent"
                  required
                />
                <button
                  type="submit"
                  className="bg-vintage-green text-white px-12 py-3 text-xs tracking-widest uppercase font-bold hover:bg-black transition-colors"
                >
                  {data.newsletterButtonText || 'SIGN ME UP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
