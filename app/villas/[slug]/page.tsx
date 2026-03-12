/**
 * VINTAGE TRAVEL - VILLA DETAILS PAGE (PHASE 58 REDESIGN)
 * New design based on ./vp folder with full-width hero, two-column layout
 * Preserves CalendarWidget and all dynamic data connections
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Users, Bed, Bath, Check, MapPin, Utensils, History, Waves, Mountain } from 'lucide-react';
import { getVillaBySlug, getAllVillaSlugs } from '@/lib/villa-data-source';
import { getVillaAvailability } from '@/lib/crm-client';
import { getClimateAverages } from '@/lib/weather';
import { AvailabilityCalendar } from '@/components/ui/availability-calendar';
import { HeroGallery } from '@/components/villa/hero-gallery';
import { AccordionItem } from '@/components/villa/info-accordion';
import { ClimateWidget } from '@/components/villa/climate-widget';
import { FavouriteButton } from '@/components/ui/favourite-button';

interface VillaPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    adults?: string;
    children?: string;
    infants?: string;
  }>;
}

// ===== STATIC GENERATION =====

export async function generateStaticParams() {
  try {
    const slugs = await getAllVillaSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error('[Villa Page] Failed to generate static params:', error);
    return [];
  }
}

// ===== METADATA (SEO) =====

export async function generateMetadata({ params }: VillaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const villa = await getVillaBySlug(slug);

  if (!villa) {
    return {
      title: 'Villa Not Found | Vintage Travel',
    };
  }

  return {
    title: `${villa.title} | Vintage Travel`,
    description: villa.description?.replace(/<[^>]*>/g, '').slice(0, 160) || `Luxury villa in ${villa.region}`,
    openGraph: {
      title: villa.title,
      description: villa.description?.replace(/<[^>]*>/g, '').slice(0, 200) || `Luxury villa in ${villa.region}`,
      images: villa.heroImageUrl ? [villa.heroImageUrl] : [],
    },
  };
}

// ===== PAGE COMPONENT =====

export default async function VillaPage({ params, searchParams }: VillaPageProps) {
  const { slug } = await params;
  const search = await searchParams;
  const villa = await getVillaBySlug(slug);

  if (!villa) {
    notFound();
  }

  // Fetch real-time availability
  let availability: Awaited<ReturnType<typeof getVillaAvailability>> = [];
  try {
    availability = await getVillaAvailability(villa.id);
  } catch (error) {
    console.error('[Villa Page] Error fetching availability:', error);
    availability = [];
  }

  // Fetch climate data if coordinates are available
  const lat = typeof villa.latitude === 'string' ? parseFloat(villa.latitude) : villa.latitude;
  const lng = typeof villa.longitude === 'string' ? parseFloat(villa.longitude) : villa.longitude;
  const climateData = (lat && lng && !isNaN(lat) && !isNaN(lng))
    ? await getClimateAverages(lat, lng)
    : [];

  // Extract short description (first paragraph or first 200 chars)
  const shortDescription = villa.description
    ? villa.description.replace(/<[^>]*>/g, '').slice(0, 250) + (villa.description.length > 250 ? '...' : '')
    : `Beautiful villa accommodation in ${villa.region}.`;

  return (
    <main className="min-h-screen flex flex-col font-sans text-gray-800 bg-vintage-cream">
      {/* Full-Width Hero Gallery */}
      <HeroGallery
        heroImage={villa.heroImageUrl}
        galleryImages={villa.galleryImages}
        title={villa.title}
      />

      {/* Breadcrumb & Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 w-full">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 uppercase tracking-wider">
          <Link href="/" className="hover:text-vintage-green transition">Home</Link>
          {' > '}
          <Link href={`/search?location=${encodeURIComponent(villa.country || '')}`} className="hover:text-vintage-green transition">
            Villas in {villa.country || 'Mediterranean'}
          </Link>
          {' > '}
          <Link href={`/search?location=${encodeURIComponent(villa.region || '')}`} className="hover:text-vintage-green transition">
            Villas in {villa.region}
          </Link>
          {villa.town && (
            <>
              {' > '}
              <Link href={`/search?location=${encodeURIComponent(villa.town)}`} className="hover:text-vintage-green transition">
                Villas in {villa.town}
              </Link>
            </>
          )}
          {' > '}
          <span className="text-vintage-green font-bold">{villa.title}</span>
        </nav>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Content Column (8/12) */}
          <div className="lg:col-span-8">
            {/* Title & Location */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="font-serif text-4xl md:text-5xl text-vintage-green">{villa.title}</h1>
              <FavouriteButton villaId={villa.id} size="lg" />
            </div>
            <p className="text-lg text-gray-500 mb-6 font-serif italic flex items-center gap-2">
              <MapPin size={18} className="text-vintage-gold" />
              {villa.town ? `${villa.town}, ` : ''}{villa.region}{villa.country ? `, ${villa.country}` : ''}
            </p>

            {/* Stats Bar */}
            <div className="flex gap-6 border-y border-gray-200 py-4 mb-8 text-sm text-gray-600">
              {villa.maxGuests && villa.maxGuests > 0 && (
                <span className="flex items-center gap-2">
                  <Users size={18} className="text-vintage-gold" />
                  Sleeps {villa.maxGuests}
                </span>
              )}
              {villa.bedrooms && villa.bedrooms > 0 && (
                <span className="flex items-center gap-2">
                  <Bed size={18} className="text-vintage-gold" />
                  {villa.bedrooms} bedroom{villa.bedrooms !== 1 ? 's' : ''}
                </span>
              )}
              {villa.bathrooms && villa.bathrooms > 0 && (
                <span className="flex items-center gap-2">
                  <Bath size={18} className="text-vintage-gold" />
                  {villa.bathrooms} bathroom{villa.bathrooms !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="font-serif text-xl leading-relaxed text-vintage-green mb-8">
              {shortDescription}
            </p>

            {/* Expert Quote */}
            <div className="bg-[#f0e8dc] p-6 rounded-lg mb-8 flex gap-4 items-start">
              <div className="p-2 border-2 border-vintage-green rounded-full min-w-[50px] min-h-[50px] flex items-center justify-center flex-shrink-0">
                <span className="font-serif font-bold text-xl text-vintage-green">V</span>
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-widest mb-2 text-gray-500">
                  What our Destination Expert thinks...
                </h4>
                <p className="font-serif italic text-vintage-green">
                  "This villa has been personally inspected by our team. The property perfectly captures the essence of {villa.region} living and offers an authentic holiday experience."
                </p>
              </div>
            </div>

            {/* Full Description */}
            {villa.description && (
              <div
                className="text-gray-600 leading-relaxed space-y-4 mb-12 text-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: villa.description }}
              />
            )}

            {/* Property Highlights / Features */}
            {villa.amenities && villa.amenities.length > 0 && (
              <div className="mb-16">
                <h3 className="font-serif text-2xl text-vintage-green mb-6">Property highlights:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {villa.amenities.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-100"
                    >
                      <div className="bg-white p-1 rounded border border-gray-200">
                        <Check size={14} className="text-vintage-green" />
                      </div>
                      <span className="text-xs font-semibold text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facility Summary */}
            {villa.facilitySummary && (
              <div className="mb-16">
                <h3 className="font-serif text-2xl text-vintage-green mb-6">Facilities</h3>
                <div
                  className="text-gray-600 leading-relaxed text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: villa.facilitySummary }}
                />
              </div>
            )}

            {/* Follow-on Text */}
            {villa.followOnText && (
              <div className="mb-16">
                <div
                  className="text-gray-600 leading-relaxed text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: villa.followOnText }}
                />
              </div>
            )}

            {/* Climate & Weather Widget */}
            {climateData.length > 0 && (
              <ClimateWidget data={climateData} region={villa.region} />
            )}

            {/* Explore Local Area */}
            <div className="mb-16">
              <h3 className="font-serif text-3xl text-vintage-green mb-6">Explore the local area</h3>
              <p className="text-gray-600 mb-8 italic">
                Discover what makes {villa.region} a perfect holiday destination.
              </p>

              <div className="space-y-6">
                {[
                  { icon: MapPin, title: 'Things to do', text: `Explore the beautiful surroundings of ${villa.town || villa.region} with its local attractions and activities.` },
                  { icon: Utensils, title: 'Food & Drink', text: 'Sample the local cuisine at nearby restaurants and bars, featuring authentic regional specialties.' },
                  { icon: Waves, title: 'Beaches', text: 'Discover stunning beaches and coastline within easy reach of the property.' },
                  { icon: Mountain, title: 'Nature', text: 'Beautiful landscapes and outdoor activities await in the surrounding area.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0">
                    <div className="mt-1">
                      <item.icon className="text-vintage-gold" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-vintage-green font-serif">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar (4/12) */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-8 space-y-6">
              {/* Booking Card */}
              <div className="bg-white p-6 shadow-xl border border-gray-100">
                {/* Availability Calendar */}
                <div className="mb-6">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Check Availability
                  </label>
                  <AvailabilityCalendar
                    availability={availability}
                    villaId={villa.id}
                    initialStartDate={search.startDate}
                    country={villa.country || ''}
                    maxGuests={villa.maxGuests || 10}
                  />
                </div>

              </div>

              {/* Contact CTA */}
              <div className="bg-vintage-green text-white p-6">
                <h3 className="font-serif text-xl font-light mb-2">
                  Need help booking?
                </h3>
                <p className="text-sm text-white/80 mb-4">
                  Our team is here to help you find the perfect villa and answer any questions.
                </p>
                <button className="w-full bg-white text-vintage-green px-4 py-3 font-semibold hover:bg-vintage-cream transition text-sm">
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Essential Information Section */}
      <section className="bg-[#EFEFE9] py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl text-vintage-green mb-4">Essential information</h2>
            <div className="flex justify-center gap-2 mb-4">
              <span className="h-px w-8 bg-gray-400 mt-3"></span>
              <span className="text-gray-400">✦</span>
              <span className="h-px w-8 bg-gray-400 mt-3"></span>
            </div>
            <p className="text-sm text-gray-500">Everything you need to know before you go.</p>
          </div>

          <div className="bg-white/50 backdrop-blur-sm p-1 rounded-lg">
            <AccordionItem
              title="Entry/Exit System (EES)"
              content="Important information regarding travel documentation and border requirements for your destination."
            />
            <AccordionItem
              title="We have you covered"
              content="Your booking includes comprehensive support from our team throughout your stay."
            />
            <AccordionItem
              title="Travel Insurance"
              content="We recommend comprehensive travel insurance for all guests. Ask us about our partner providers."
            />
            <AccordionItem
              title="Car Hire"
              content="Explore the region at your own pace. We can help arrange car hire from local providers."
            />
            <AccordionItem
              title="Essential holiday information"
              content="Details about what to pack, local customs, electricity standards, and other practical information for your trip."
            />
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <div className="relative h-96 w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-vintage-green/10" />
        <div className="relative z-10 max-w-2xl w-full mx-4 border border-gray-400 p-2">
          <div className="border border-gray-400 p-8 text-center bg-white/95">
            <h3 className="font-serif text-2xl text-vintage-green mb-2">Sign up to our newsletter</h3>
            <p className="text-sm text-gray-500 mb-6">Be the first to hear about new villas and exclusive offers.</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="FIRST NAME"
                className="border-b border-gray-300 py-2 bg-transparent text-xs outline-none focus:border-vintage-green"
              />
              <input
                type="text"
                placeholder="LAST NAME"
                className="border-b border-gray-300 py-2 bg-transparent text-xs outline-none focus:border-vintage-green"
              />
            </div>
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              className="w-full border-b border-gray-300 py-2 bg-transparent text-xs outline-none focus:border-vintage-green mb-6"
            />
            <button className="bg-vintage-green text-white px-8 py-3 text-xs font-bold uppercase tracking-wider hover:bg-black transition">
              Sign Me Up
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
