'use client';

import { ShoppingBag } from 'lucide-react';
import { KAAPI_LINKS } from '@/lib/kaapi-assets';

// Single Order-on-Swiggy CTA, fixed to bottom-right, dark violet, always visible.
export default function KaapiStickyOrder() {
  return (
    <a
      href={KAAPI_LINKS.swiggy + KAAPI_LINKS.utm}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-auto z-50 flex items-center justify-center gap-3 px-6 py-3.5 min-h-[44px] rounded-full text-white font-medium tracking-wide"
      style={{
        background: 'linear-gradient(135deg, #4B1EB8, #2A0F6B)',
        boxShadow: '0 20px 45px -12px rgba(75,30,184,0.75), inset 0 1px 0 rgba(255,255,255,0.15)',
      }}
    >
      <span className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center">
        <ShoppingBag size={16} />
      </span>
      <span className="text-sm">Order on Swiggy</span>
    </a>
  );
}
