/**
 * VINTAGE TRAVEL - FOOTER
 * Site footer with links and brand information
 */

import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-olive text-white mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <Image
                src="/logos/Vintage Travel logo landscape white.png"
                alt="Vintage Travel"
                width={200}
                height={50}
                className="h-12 w-auto"
              />
            </div>
            <p className="text-white/80 text-sm leading-relaxed max-w-md">
              The art of the Mediterranean. Discover authentic luxury villas in stunning
              locations across Greece, Italy, France, Spain, and beyond.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-medium mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-white/80 hover:text-terracotta transition-colors">
                  Villas
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="text-white/80 hover:text-terracotta transition-colors">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-white/80 hover:text-terracotta transition-colors">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-serif text-lg font-medium mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-white/80 hover:text-terracotta transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/essential-info" className="text-white/80 hover:text-terracotta transition-colors">
                  Essential Information
                </Link>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-terracotta transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
          <p>&copy; {currentYear} Vintage Travel. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-terracotta transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-terracotta transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
