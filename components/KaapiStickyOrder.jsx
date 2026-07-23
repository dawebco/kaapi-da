'use client';

import { ShoppingBag } from 'lucide-react';
import { KAAPI_LINKS } from '@/lib/kaapi-assets';

/**
 * Floating "Order on Swiggy" CTA.
 *
 * — On mobile (< md): full-width bar at bottom
 * — On desktop (md+): fixed bottom-right pill that completely covers
 *   the Gemini sparkle watermark sitting behind it in the canvas layer.
 * — Colors match the current theme's accent colors.
 */
export default function KaapiStickyOrder({ theme }) {
  return (
    <a
      href={KAAPI_LINKS.swiggy + KAAPI_LINKS.utm}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        // Mobile: full-width bottom bar
        'fixed bottom-4 left-4 right-4',
        // Desktop: bottom-right pill (covers Gemini watermark)
        'md:bottom-20 md:right-6 md:left-auto md:w-auto',
        // Stacking & interaction
        'z-[60] pointer-events-auto',
        // Layout
        'flex items-center justify-center gap-3',
        // Sizing — min-h 44px for touch; extra px/py so the container is
        // physically large enough to fully obscure the watermark behind it
        'px-6 py-3.5 min-h-[52px]',
        // Shape & colour
        'rounded-full text-white font-medium tracking-wide',
        // Shadow depth to lift button visually above canvas watermark
        'shadow-2xl',
      ].join(' ')}
      style={{
        background: `linear-gradient(135deg, ${theme?.colors?.accent || '#8B5CFF'}, ${theme?.colors?.accentDeep || '#3D179B'})`,
        boxShadow: [
          `0 20px 45px -12px ${theme?.colors?.accent ? theme.colors.accent + 'cc' : 'rgba(75,30,184,0.75)'}`,
          'inset 0 1px 0 rgba(255,255,255,0.15)',
          // Extra spread to bleed over the watermark area
          `0 0 0 8px ${theme?.id === 'dark' ? 'rgba(10,5,30,0.65)' : 'rgba(240,235,225,0.65)'}`,
        ].join(', '),
      }}
    >
      <span className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
        <ShoppingBag size={16} />
      </span>
      <span className="text-sm whitespace-nowrap">Order on Swiggy</span>
    </a>
  );
}
