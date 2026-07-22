'use client';

import { KAAPI_THEME } from '@/lib/kaapi-assets';

// phase: 'checking' | 'capturing' | 'ready'
export default function KaapiLoader({ phase, progress, label }) {
  const pct = Math.round((progress || 0) * 100);
  const visible = phase !== 'ready';
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{
        background: 'radial-gradient(circle at 50% 50%, #10091E 0%, #070708 70%)',
      }}
    >
      <div className="text-center px-6">
        <div
          className="mx-auto mb-8 h-24 w-24 rounded-full"
          style={{
            background: `conic-gradient(${KAAPI_THEME.colors.accent} ${pct * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
            filter: `drop-shadow(0 0 24px ${KAAPI_THEME.colors.accent}80)`,
            transition: 'background 300ms linear',
          }}
        >
          <div className="h-full w-full flex items-center justify-center">
            <div
              className="h-16 w-16 rounded-full"
              style={{ background: '#070708', boxShadow: `inset 0 0 12px ${KAAPI_THEME.colors.accent}40` }}
            />
          </div>
        </div>
        <div className="font-anton tracking-[0.35em] text-white/90 text-xl">KAAPI DA</div>
        <div className="mt-2 text-[11px] uppercase tracking-[0.4em] text-white/50">
          {label || (phase === 'checking' ? 'Checking cache' : phase === 'capturing' ? `Capturing ${pct}%` : 'Ready')}
        </div>
      </div>
    </div>
  );
}
