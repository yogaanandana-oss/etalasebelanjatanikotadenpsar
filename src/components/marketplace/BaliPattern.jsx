import React from 'react';

/**
 * Decorative repeating Balinese "patra" (floral scroll) carving strip.
 * Uses currentColor so it can be tinted via text-* classes.
 */
export default function BaliPattern({ className = '', height = 28 }) {
  return (
    <div className={`w-full overflow-hidden ${className}`} aria-hidden="true">
      <svg width="100%" height={height} xmlns="http://www.w3.org/2000/svg" className="block">
        <defs>
          <pattern id="bali-patra" width="72" height="28" patternUnits="userSpaceOnUse">
            {/* central vine */}
            <path d="M0 14 Q9 6 18 14 T36 14 T54 14 T72 14" fill="none" stroke="currentColor" strokeWidth="1.3" />
            {/* central lotus bud */}
            <path d="M36 14 C 33 8 33 4 36 1 C 39 4 39 8 36 14 Z" fill="currentColor" />
            <path d="M36 14 C 33 20 33 24 36 27 C 39 24 39 20 36 14 Z" fill="currentColor" opacity="0.6" />
            {/* side leaves */}
            <path d="M18 14 C 13 11 11 7 13 3 C 17 5 19 9 18 14 Z" fill="currentColor" opacity="0.85" />
            <path d="M54 14 C 59 17 61 21 59 25 C 55 23 53 19 54 14 Z" fill="currentColor" opacity="0.85" />
            {/* small buds */}
            <circle cx="6" cy="14" r="2" fill="currentColor" opacity="0.7" />
            <circle cx="66" cy="14" r="2" fill="currentColor" opacity="0.7" />
            {/* cecek dots */}
            <circle cx="27" cy="9" r="1" fill="currentColor" opacity="0.6" />
            <circle cx="45" cy="19" r="1" fill="currentColor" opacity="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height={height} fill="url(#bali-patra)" />
      </svg>
    </div>
  );
}