'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { KAAPI_LOGO } from '@/lib/kaapi-assets';

/**
 * KaapiLoader — Full-screen entry overlay.
 *
 * Props:
 *   progress  0..1  float driven by asset-warming steps
 *   theme     kaapi theme object (used for accent color)
 *
 * Lifecycle:
 *   - Visible while progress < 1 (or before loaderDone state in page.js)
 *   - Fades out with 500ms opacity transition once progress reaches 1
 *   - Hard failsafe in page.js forces progress=1 after 4 seconds
 */
export default function KaapiLoader({ progress = 0, theme }) {
  const [visible, setVisible] = useState(true);

  // When progress hits 1, start fade-out
  useEffect(() => {
    if (progress >= 1) {
      // Slight delay so the ring completes visually before fading
      const t = setTimeout(() => setVisible(false), 120);
      return () => clearTimeout(t);
    }
  }, [progress]);

  const pct = Math.round(Math.min(progress, 1) * 100);

  // SVG circular progress ring
  const SIZE = 160;
  const STROKE = 5;
  const RADIUS = (SIZE - STROKE * 2) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE * (1 - Math.min(progress, 1));

  const accentColor = theme?.colors?.accent || '#8A5A3C';
  const isLight = theme?.id !== 'dark';
  const bgColor = isLight ? '#FAFAFA' : '#050506';
  const headlineColor = isLight ? '#1A1A1A' : '#FDFCFF';
  const mutedColor = isLight ? '#6B5C4E' : '#B7B4C4';

  return (
    <div
      aria-label="Loading Kaapi Da"
      role="status"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-500"
      style={{
        background: bgColor,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* Circular SVG Progress Ring wrapping the logo */}
      <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
        {/* Background track ring */}
        <svg
          width={SIZE}
          height={SIZE}
          className="absolute inset-0 -rotate-90"
          style={{ transform: 'rotate(-90deg)' }}
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            stroke={isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}
          />
          {/* Progress arc */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            stroke={accentColor}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 300ms ease-out' }}
          />
        </svg>

        {/* Centered logo */}
        <div
          className="relative rounded-full overflow-hidden flex items-center justify-center"
          style={{
            width: SIZE - STROKE * 6,
            height: SIZE - STROKE * 6,
            background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
            animation: 'kaapi-pulse 2s ease-in-out infinite',
          }}
        >
          <Image
            src={KAAPI_LOGO}
            alt="Kaapi Da"
            width={88}
            height={88}
            className="object-cover rounded-full"
            priority
          />
        </div>
      </div>

      {/* Status copy block */}
      <div className="mt-8 text-center px-6 max-w-xs">
        <div
          className="font-anton tracking-[0.28em] text-xl"
          style={{ color: headlineColor }}
        >
          Brewing your Kaapi...
        </div>
        <div
          className="mt-2 text-[11px] uppercase tracking-[0.35em] leading-relaxed"
          style={{ color: mutedColor }}
        >
          Chilling the decoction &amp; setting up the canvas...
        </div>
        {/* Progress counter */}
        <div
          className="mt-4 font-anton text-3xl tabular-nums"
          style={{
            color: accentColor,
            transition: 'color 300ms',
          }}
        >
          {pct}%
        </div>
      </div>

      <style>{`
        @keyframes kaapi-pulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50%       { opacity: 1;    transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}
