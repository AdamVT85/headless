/**
 * TOP BAR COMPONENT
 * Dark bar with phone number and trust badges
 */

import { Phone, Star } from 'lucide-react';

export function TopBar() {
  return (
    <div className="bg-vintage-green text-white text-xs py-2 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto flex justify-between items-center">
        {/* Left Side - Contact */}
        <div className="flex items-center gap-2">
          <Phone size={14} className="fill-white" />
          <span className="uppercase tracking-wider font-semibold">Speak to us</span>
          <span className="opacity-50">|</span>
          <span className="font-sans text-sm tracking-wide">+44 1954 261 431</span>
        </div>

        {/* Right Side - Trust badges */}
        <div className="hidden md:flex items-center gap-6">
          {/* ABTA Badge */}
          <div className="flex items-center gap-2 text-white/90">
            <span className="text-xs font-semibold tracking-wide">ABTA PROTECTED</span>
          </div>

          {/* Feefo Rating */}
          <div className="flex items-center bg-white text-vintage-green rounded px-2 py-1 gap-2">
            <span className="font-bold italic text-sm">feefo</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-[10px]">3846 reviews</span>
          </div>
        </div>
      </div>
    </div>
  );
}
