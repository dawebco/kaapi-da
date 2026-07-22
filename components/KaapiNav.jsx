'use client';

import { KAAPI_LINKS, KAAPI_THEME } from '@/lib/kaapi-assets';

export default function KaapiNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
      <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: KAAPI_THEME.colors.accent, boxShadow: `0 0 12px ${KAAPI_THEME.colors.accent}` }}
          />
          <span className="font-anton tracking-[0.35em] text-sm text-white/90">KAAPI DA</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-[0.3em] text-white/60">
          <a href="#brew" className="hover:text-white transition">Brew</a>
          <a href="#drop" className="hover:text-white transition">Panjim</a>
          <a href="#order" className="hover:text-white transition">Order</a>
        </div>
        <a
          href={KAAPI_LINKS.swiggy + KAAPI_LINKS.utm}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] uppercase tracking-[0.3em] px-3 py-2 rounded-full border border-white/15 text-white/90 hover:bg-white/10 transition"
        >
          Order · Swiggy
        </a>
      </div>
    </nav>
  );
}
