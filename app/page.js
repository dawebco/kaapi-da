'use client';

import { useEffect, useMemo, useState } from 'react';
import KaapiCanvas from '@/components/KaapiCanvas';
import KaapiLoader from '@/components/KaapiLoader';
import KaapiNav from '@/components/KaapiNav';
import KaapiSections from '@/components/KaapiSections';
import KaapiStickyOrder from '@/components/KaapiStickyOrder';
import KaapiFlavorBadge from '@/components/KaapiFlavorBadge';
import { KAAPI_CLIPS, KAAPI_THEME, FRAMES_PER_CLIP } from '@/lib/kaapi-assets';
import { captureClip, loadFrameBitmap } from '@/lib/kaapi-frame-capture';
import { ensureCacheVersion, getCachedFrame } from '@/lib/kaapi-idb';
import { canRunCinema, prefersReducedMotion } from '@/lib/kaapi-device';
import { activeActIndex, getScrollProgress } from '@/lib/kaapi-scroll-engine';

const App = () => {
  const [phase, setPhase] = useState('checking');
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState('Checking cache');
  const [reduced, setReduced] = useState(false);
  const [bitmaps, setBitmaps] = useState(null);
  const [act, setAct] = useState(1);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (prefersReducedMotion() || !canRunCinema()) {
      setReduced(true);
      setPhase('ready');
      return;
    }

    let cancelled = false;
    const run = async () => {
      try {
        setPhase('checking');
        setLabel('Checking cache');
        await ensureCacheVersion();

        setPhase('capturing');
        const clipEntries = Object.entries(KAAPI_CLIPS);
        const total = clipEntries.length;

        for (let i = 0; i < clipEntries.length; i++) {
          if (cancelled) return;
          const [clipId, url] = clipEntries[i];
          setLabel(`Composing ${clipId}`);
          const perClipBase = (i / total) * 0.85;
          await captureClip(clipId, url, (frac) => {
            const p = perClipBase + (frac / total) * 0.85;
            setProgress(p);
          });
        }
        if (cancelled) return;

        setLabel('Warming frames');
        const store = {};
        const clipIds = Object.keys(KAAPI_CLIPS);
        for (let c = 0; c < clipIds.length; c++) {
          const clipId = clipIds[c];
          store[clipId] = new Array(FRAMES_PER_CLIP).fill(null);
          for (let f = 0; f < FRAMES_PER_CLIP; f++) {
            if (cancelled) return;
            const blob = await getCachedFrame(clipId, f);
            if (blob) {
              try { store[clipId][f] = await loadFrameBitmap(blob); } catch { /* skip */ }
            }
            const done = (c * FRAMES_PER_CLIP + f + 1) / (clipIds.length * FRAMES_PER_CLIP);
            setProgress(0.85 + done * 0.15);
          }
        }
        if (cancelled) return;
        setBitmaps(store);
        setProgress(1);
        setLabel('Ready');
        setTimeout(() => !cancelled && setPhase('ready'), 250);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[kaapi] pipeline failed', err);
        setReduced(true);
        setPhase('ready');
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let raf = 0;
    const tick = () => {
      setAct(activeActIndex(getScrollProgress()));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const stickyVisible = act >= 5;

  const pageStyle = useMemo(() => ({
    background: KAAPI_THEME.colors.bg,
  }), []);

  return (
    <main className="relative min-h-screen w-full text-white" style={pageStyle}>
      <KaapiLoader phase={phase} progress={progress} label={label} />

      {!reduced ? (
        <KaapiCanvas bitmaps={bitmaps} />
      ) : (
        <div
          className="fixed inset-0 z-0"
          style={{
            background: `radial-gradient(ellipse at 50% 55%, ${KAAPI_THEME.colors.accentDeep} 0%, #0B0714 45%, #050506 80%)`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="h-[52vh] w-[26vh] rounded-[18px]"
              style={{
                background: `linear-gradient(180deg, ${KAAPI_THEME.colors.accentSoft} 0%, ${KAAPI_THEME.colors.accent} 40%, ${KAAPI_THEME.colors.accentDeep} 100%)`,
                boxShadow: `0 60px 120px -10px ${KAAPI_THEME.colors.accent}80, inset 0 8px 24px rgba(255,255,255,0.15), inset 0 -20px 40px rgba(0,0,0,0.4)`,
              }}
            />
          </div>
        </div>
      )}

      {/* Lighting overlays (kept minimal now that frames carry their own lighting) */}
      <div
        className="pointer-events-none fixed inset-0 z-[6]"
        style={{ background: KAAPI_THEME.glow.vignette }}
      />

      <KaapiNav />
      <KaapiFlavorBadge />

      <div className="relative z-10">
        <KaapiSections />
      </div>

      <KaapiStickyOrder visible={stickyVisible} />
    </main>
  );
};

export default App;
