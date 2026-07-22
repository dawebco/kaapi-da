'use client';

import { KAAPI_LINKS, KAAPI_THEME } from '@/lib/kaapi-assets';

export default function KaapiNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between pointer-events-auto">
        {/* Left — logo */}
        <div className="flex items-center gap-3 rounded-full pl-1 pr-4 py-1 border border-white/10 bg-white/[0.04] backdrop-blur-md">
          <span
            className="h-6 w-6 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${KAAPI_THEME.colors.accentSoft}, ${KAAPI_THEME.colors.accent} 60%, ${KAAPI_THEME.colors.accentDeep})`,
              boxShadow: `0 0 12px ${KAAPI_THEME.colors.accent}90`,
            }}
          />
          <span className="font-anton tracking-[0.32em] text-xs text-white/90">KAAPI DA</span>
        </div>

        {/* Center — pill nav */}
        <div className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md px-1.5 py-1.5">
          {['Brew', 'Panjim', 'Order'].map((label) => (
            <a
              key={label}
              href={'#' + label.toLowerCase().replace('panjim', 'drop').replace('brew', 'brew').replace('order', 'order')}
              className="text-[11px] uppercase tracking-[0.28em] text-white/60 hover:text-white transition px-3 py-1.5 rounded-full hover:bg-white/[0.06]"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right — Swiggy CTA */}
        <a
          href={KAAPI_LINKS.swiggy + KAAPI_LINKS.utm}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] uppercase tracking-[0.28em] px-4 py-2 rounded-full border border-white/15 bg-white/[0.03] backdrop-blur-md text-white/90 hover:bg-white/[0.08] hover:border-[rgba(139,92,255,0.4)] transition"
        >
          Order · Swiggy
        </a>
      </div>
    </nav>
  );
}
