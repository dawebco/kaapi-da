'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { KAAPI_FLAVORS } from '@/lib/kaapi-flavors';

// Horizontal SKU / flavor picker. Bottom-center floating pill.
// Live flavors switch the app theme; non-live ones show a "Coming soon" state.
export default function KaapiFlavorCarousel({ theme, onSelectTheme }) {
  const isDark = theme.id === 'dark';
  const shellBg = isDark ? 'rgba(20,15,35,0.6)' : 'rgba(255,255,255,0.7)';
  const shellBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(27,23,16,0.10)';
  const inkStrong = isDark ? '#FFFFFF' : '#1B1710';
  const inkSoft = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(27,23,16,0.55)';

  const step = (dir) => {
    const liveList = KAAPI_FLAVORS.filter((f) => f.live);
    const currentIdx = liveList.findIndex((f) => f.themeId === theme.id);
    if (currentIdx < 0) return;
    const nextIdx = (currentIdx + dir + liveList.length) % liveList.length;
    onSelectTheme(liveList[nextIdx].themeId);
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <div
        className="pointer-events-auto flex items-center gap-1.5 rounded-full pl-1.5 pr-1.5 py-1.5 border backdrop-blur-xl"
        style={{
          background: shellBg,
          borderColor: shellBorder,
          boxShadow: `0 20px 60px -20px rgba(0,0,0,0.35)`,
        }}
      >
        <button
          onClick={() => step(-1)}
          aria-label="Previous flavor"
          className="h-8 w-8 rounded-full flex items-center justify-center transition hover:scale-110"
          style={{ color: inkSoft }}
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1">
          {KAAPI_FLAVORS.map((f) => {
            const isActive = f.live && f.themeId === theme.id;
            const isDisabled = !f.live;
            return (
              <motion.button
                key={f.id}
                onClick={() => f.live && onSelectTheme(f.themeId)}
                disabled={isDisabled}
                aria-label={`Select flavor ${f.name}`}
                initial={false}
                animate={{ width: isActive ? 'auto' : 40 }}
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                className={`relative flex items-center gap-2 rounded-full pl-1 pr-3 py-1 overflow-hidden ${isDisabled ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${f.swatch}, ${f.swatchDeep})`
                    : 'transparent',
                  boxShadow: isActive ? `0 0 22px ${f.swatch}66` : 'none',
                }}
              >
                <span
                  className="h-6 w-6 shrink-0 rounded-full border"
                  style={{
                    background: `linear-gradient(135deg, ${f.swatch}, ${f.swatchDeep})`,
                    borderColor: isActive ? 'rgba(255,255,255,0.35)' : shellBorder,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.25)`,
                  }}
                />
                {isActive && (
                  <span className="flex flex-col leading-none pr-1 whitespace-nowrap">
                    <span className="text-[10px] uppercase tracking-[0.24em] font-medium" style={{ color: '#fff' }}>
                      {f.name}
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.20em]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                      {f.tagline}
                    </span>
                  </span>
                )}
                {!isActive && !isDisabled && (
                  <span className="sr-only">{f.name}</span>
                )}
                {isDisabled && (
                  <span className="text-[9px] uppercase tracking-[0.20em] whitespace-nowrap" style={{ color: inkSoft }}>
                    Soon
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        <button
          onClick={() => step(1)}
          aria-label="Next flavor"
          className="h-8 w-8 rounded-full flex items-center justify-center transition hover:scale-110"
          style={{ color: inkSoft }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
