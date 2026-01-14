/**
 * ABOUT US PAGE
 * Company information with hero, story, and team members
 * Matches Adobe XD Screen 5
 */

import { Metadata } from 'next';
import Image from 'next/image';
import { client } from '@/lib/sanity.client';
import { PortableText } from '@portabletext/react';

export const metadata: Metadata = {
  title: 'About Us | Vintage Travel',
  description: 'Discover the story behind Vintage Travel and our passion for luxury Mediterranean villas',
};

interface TeamMember {
  name: string;
  role: string;
  photo?: {
    asset: {
      url: string;
    };
    alt?: string;
  };
  bio?: string;
}

interface AboutPage {
  title: string;
  heroImage?: {
    asset: {
      url: string;
    };
    alt: string;
  };
  introText?: string;
  ourStory?: any; // PortableText
  teamMembers?: TeamMember[];
}

async function getAboutPage(): Promise<AboutPage | null> {
  const query = `*[_type == "aboutPage" && _id == "aboutPage"][0] {
    title,
    "heroImage": {
      "asset": heroImage.asset->,
      "alt": heroImage.alt
    },
    introText,
    ourStory,
    teamMembers[] {
      name,
      role,
      "photo": {
        "asset": photo.asset->,
        "alt": photo.alt
      },
      bio
    }
  }`;

  try {
    const aboutPage = await client.fetch<AboutPage | null>(query);
    return aboutPage;
  } catch (error) {
    console.error('[About] Failed to fetch about page:', error);
    return null;
  }
}

export default async function AboutPage() {
  const aboutPage = await getAboutPage();

  // Fallback content if CMS not configured
  if (!aboutPage) {
    return (
      <main className="min-h-screen bg-clay">
        <section className="container mx-auto px-6 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-serif font-light text-5xl md:text-6xl text-olive mb-6">
              About Vintage Travel
            </h1>
            <p className="text-lg text-stone-600 mb-4">
              Configure your Sanity CMS to add about page content.
            </p>
            <p className="text-sm text-stone-500">
              Create an "About Page" document in Sanity Studio.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const heroImageUrl = aboutPage.heroImage?.asset?.url || '/placeholder-villa.svg';

  return (
    <main className="min-h-screen bg-clay">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px]">
        <Image
          src={heroImageUrl}
          alt={aboutPage.heroImage?.alt || 'About Vintage Travel'}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-olive-900/70 via-olive-900/50 to-olive-900/30" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-6 text-center text-white">
            <h1 className="font-serif font-light text-5xl md:text-6xl lg:text-7xl">
              {aboutPage.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Intro Text */}
      {aboutPage.introText && (
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl md:text-2xl text-stone-700 leading-relaxed font-light">
              {aboutPage.introText}
            </p>
          </div>
        </section>
      )}

      {/* Our Story */}
      {aboutPage.ourStory && (
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg prose-stone max-w-none">
              <PortableText
                value={aboutPage.ourStory}
                components={{
                  block: {
                    h2: ({ children }) => (
                      <h2 className="font-serif text-4xl font-light text-olive mt-12 mb-6">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="font-serif text-3xl font-light text-olive mt-8 mb-4">
                        {children}
                      </h3>
                    ),
                    normal: ({ children }) => (
                      <p className="text-stone-700 text-lg leading-relaxed mb-6">
                        {children}
                      </p>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-terracotta pl-6 my-8 italic text-xl text-olive">
                        {children}
                      </blockquote>
                    ),
                  },
                  types: {
                    image: ({ value }: any) => (
                      <div className="my-12">
                        <Image
                          src={value.asset.url}
                          alt={value.alt || ''}
                          width={1200}
                          height={800}
                          className="rounded-sm w-full h-auto"
                        />
                        {value.caption && (
                          <p className="text-center text-sm text-stone-500 mt-3">
                            {value.caption}
                          </p>
                        )}
                      </div>
                    ),
                  },
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Team Members */}
      {aboutPage.teamMembers && aboutPage.teamMembers.length > 0 && (
        <section className="container mx-auto px-6 py-16">
          <h2 className="font-serif text-4xl font-light text-olive text-center mb-12">
            Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {aboutPage.teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-sm border border-stone-200 overflow-hidden"
              >
                {member.photo?.asset?.url && (
                  <div className="relative aspect-square">
                    <Image
                      src={member.photo.asset.url}
                      alt={member.photo.alt || member.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-serif text-2xl font-light text-olive mb-1">
                    {member.name}
                  </h3>
                  <p className="text-terracotta font-semibold mb-3">{member.role}</p>
                  {member.bio && (
                    <p className="text-stone-600 text-sm leading-relaxed">
                      {member.bio}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto text-center bg-terracotta text-white rounded-sm p-12">
          <h2 className="font-serif text-3xl font-light mb-4">
            Ready to plan your perfect villa holiday?
          </h2>
          <p className="text-lg text-white/90 mb-6">
            Contact our team to discuss your ideal Mediterranean escape.
          </p>
          <button className="bg-white text-terracotta px-8 py-4 rounded-sm font-semibold hover:bg-clay transition-colors">
            Get in Touch
          </button>
        </div>
      </section>
    </main>
  );
}
