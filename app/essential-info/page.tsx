/**
 * ESSENTIAL INFORMATION PAGE
 * Clean, readable text layout with accordion sections
 * Matches Adobe XD Screen 6
 */

import { Metadata } from 'next';
import Image from 'next/image';
import { client } from '@/lib/sanity.client';
import { PortableText } from '@portabletext/react';
import { Accordion, AccordionItem } from '@/components/ui/accordion';

export const metadata: Metadata = {
  title: 'Essential Information | Vintage Travel',
  description: 'Everything you need to know about booking a luxury villa with Vintage Travel',
};

interface InfoSection {
  sectionTitle: string;
  content: any; // PortableText
}

interface EssentialInfoPage {
  title: string;
  heroImage?: {
    asset: {
      url: string;
    };
    alt: string;
  };
  introText?: string;
  infoSections?: InfoSection[];
}

async function getEssentialInfoPage(): Promise<EssentialInfoPage | null> {
  const query = `*[_type == "essentialInfoPage" && _id == "essentialInfoPage"][0] {
    title,
    "heroImage": {
      "asset": heroImage.asset->,
      "alt": heroImage.alt
    },
    introText,
    infoSections[] {
      sectionTitle,
      content
    }
  }`;

  try {
    const page = await client.fetch<EssentialInfoPage | null>(query);
    return page;
  } catch (error) {
    console.error('[Essential Info] Failed to fetch page:', error);
    return null;
  }
}

export default async function EssentialInfoPage() {
  const page = await getEssentialInfoPage();

  // Fallback content if CMS not configured
  if (!page) {
    return (
      <main className="min-h-screen bg-clay">
        <section className="container mx-auto px-6 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-serif font-light text-5xl md:text-6xl text-olive mb-6">
              Essential Information
            </h1>
            <p className="text-lg text-stone-600 mb-4">
              Configure your Sanity CMS to add essential information content.
            </p>
            <p className="text-sm text-stone-500">
              Create an "Essential Information Page" document in Sanity Studio.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const heroImageUrl = page.heroImage?.asset?.url || '/placeholder-villa.svg';

  return (
    <main className="min-h-screen bg-clay">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px]">
        <Image
          src={heroImageUrl}
          alt={page.heroImage?.alt || 'Essential Information'}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-olive-900/70 via-olive-900/50 to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-6 text-center text-white">
            <h1 className="font-serif font-light text-5xl md:text-6xl lg:text-7xl">
              {page.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Intro Text */}
      {page.introText && (
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg md:text-xl text-stone-700 leading-relaxed">
              {page.introText}
            </p>
          </div>
        </section>
      )}

      {/* Information Sections (Accordion) */}
      {page.infoSections && page.infoSections.length > 0 && (
        <section className="container mx-auto px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <Accordion>
              {page.infoSections.map((section, index) => (
                <AccordionItem
                  key={index}
                  title={section.sectionTitle}
                  defaultOpen={index === 0}
                >
                  <PortableText
                    value={section.content}
                    components={{
                      block: {
                        h3: ({ children }) => (
                          <h3 className="font-serif text-xl font-medium text-olive mt-4 mb-2">
                            {children}
                          </h3>
                        ),
                        h4: ({ children }) => (
                          <h4 className="font-serif text-lg font-medium text-olive mt-3 mb-2">
                            {children}
                          </h4>
                        ),
                        normal: ({ children }) => (
                          <p className="text-stone-700 leading-relaxed mb-4">
                            {children}
                          </p>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-terracotta pl-4 my-4 italic text-stone-600">
                            {children}
                          </blockquote>
                        ),
                      },
                      list: {
                        bullet: ({ children }) => (
                          <ul className="list-disc list-inside space-y-2 mb-4 text-stone-700">
                            {children}
                          </ul>
                        ),
                        number: ({ children }) => (
                          <ol className="list-decimal list-inside space-y-2 mb-4 text-stone-700">
                            {children}
                          </ol>
                        ),
                      },
                      marks: {
                        strong: ({ children }) => (
                          <strong className="font-semibold text-olive">{children}</strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic text-stone-600">{children}</em>
                        ),
                        link: ({ value, children }: any) => (
                          <a
                            href={value.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-terracotta hover:text-olive underline transition-colors"
                          >
                            {children}
                          </a>
                        ),
                      },
                    }}
                  />
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto text-center bg-white rounded-sm border border-stone-200 p-8">
          <h2 className="font-serif text-2xl font-medium text-olive mb-3">
            Have more questions?
          </h2>
          <p className="text-stone-600 mb-6">
            Our team is here to help you plan your perfect villa holiday.
          </p>
          <button className="bg-terracotta text-white px-6 py-3 rounded-sm font-semibold hover:bg-olive transition-colors">
            Contact Us
          </button>
        </div>
      </section>
    </main>
  );
}
