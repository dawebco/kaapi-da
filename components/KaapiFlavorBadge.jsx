'use client';

import { KAAPI_THEME } from '@/lib/kaapi-assets';

// Floating glass flavor / SKU badge, top-right. Neon violet glow.
// UI slot ready to become a flavor carousel selector (Berry Bolt / next SKU).
export default function KaapiFlavorBadge() {
  return (
    <div className="fixed top-20 right-6 z-30 pointer-events-none">
      <div
        className="pointer-events-auto flex items-center gap-2 rounded-full px-3 py-1.5 border border-white/10 bg-white/[0.04] backdrop-blur-xl"
        style={{
          boxShadow: `0 0 24px ${KAAPI_THEME.colors.accent}55, inset 0 0 1px rgba(255,255,255,0.15)`,
        }}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{
            background: KAAPI_THEME.colors.accentSoft,
            boxShadow: `0 0 10px ${KAAPI_THEME.colors.accentSoft}, 0 0 20px ${KAAPI_THEME.colors.accent}`,
            animation: 'kaapiPulse 2.2s ease-in-out infinite',
          }}
        />
        <span className="font-anton tracking-[0.22em] text-[11px] text-white/90">
          {KAAPI_THEME.flavorBadge.toUpperCase()} · {KAAPI_THEME.volume}
        </span>
      </div>
    </div>
  );
}
