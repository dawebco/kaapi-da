'use client';

import { useEffect, useState } from 'react';
import { KAAPI_SEGMENTS } from '@/lib/kaapi-assets';
import { activeActIndex, getScrollProgress, getActAnchor } from '@/lib/kaapi-scroll-engine';

// Vertical dot navigation on the left. One dot per act (1..6).
// Clicking scrolls smoothly to that act's mid-point.
export default function KaapiActNav({ theme }) {
  const [act, setAct] = useState(1);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setAct(activeActIndex(getScrollProgress()));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const scrollToAct = (n) => {
    if (typeof window === 'undefined') return;
    const anchor = getActAnchor(n);
    const total = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: total * anchor, behavior: 'smooth' });
  };

  const isDark = theme.id === 'dark';
  const activeColor = theme.colors.accent;
  const dimColor = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(27,23,16,0.24)';
  const labelColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(27,23,16,0.6)';

  return (
    <div
      aria-label="Act navigation"
      className="fixed z-30 left-4 md:left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 pointer-events-none"
    >
      {KAAPI_SEGMENTS.map((seg) => {
        const isActive = act === seg.act;
        return (
          <button
            key={seg.id}
            onClick={() => scrollToAct(seg.act)}
            aria-label={`Jump to Act ${seg.act} — ${seg.label}`}
            className="pointer-events-auto group relative flex items-center gap-3 py-1"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span
              className="block rounded-full transition-all duration-300"
              style={{
                width: isActive ? 22 : 6,
                height: 6,
                background: isActive ? activeColor : dimColor,
                boxShadow: isActive ? `0 0 14px ${activeColor}80` : 'none',
              }}
            />
            <span
              className="text-[10px] uppercase tracking-[0.3em] whitespace-nowrap opacity-0 group-hover:opacity-100 transition"
              style={{ color: labelColor }}
            >
              {seg.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
