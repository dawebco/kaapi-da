'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import KaapiCanvas from '@/components/KaapiCanvas';
import KaapiNav from '@/components/KaapiNav';
import KaapiSections from '@/components/KaapiSections';
import KaapiStickyOrder from '@/components/KaapiStickyOrder';
import KaapiFlavorCarousel from '@/components/KaapiFlavorCarousel';
import KaapiLoader from '@/components/KaapiLoader';
import { KAAPI_THEMES, FRAMES_PER_CLIP, getTheme } from '@/lib/kaapi-assets';
import { captureClipForTheme, loadFrameBitmap } from '@/lib/kaapi-frame-capture';
import { ensureCacheVersion, getCachedFrame } from '@/lib/kaapi-idb';
import { canRunCinema } from '@/lib/kaapi-device';
import { getActAnchor, activeActIndex, getScrollProgress } from '@/lib/kaapi-scroll-engine';

const CLIP_IDS = ['deconstruct', 'orbit', 'bridge', 'detail'];
const TOTAL_STEPS = CLIP_IDS.length * FRAMES_PER_CLIP; // 4 × 32 = 128

async function warmTheme(themeId, cancelRef, onStep) {
  let stepsDone = 0;
  for (const clipId of CLIP_IDS) {
    if (cancelRef && cancelRef.cancelled) return null;
    await captureClipForTheme(themeId, clipId, (p) => {
      // p is 0..1 per clip — map to global steps
      onStep && onStep(stepsDone + Math.round(p * FRAMES_PER_CLIP));
    });
    stepsDone += FRAMES_PER_CLIP;
  }
  const store = {};
  for (const clipId of CLIP_IDS) {
    store[clipId] = new Array(FRAMES_PER_CLIP).fill(null);
    for (let f = 0; f < FRAMES_PER_CLIP; f++) {
      if (cancelRef && cancelRef.cancelled) return null;
      const blob = await getCachedFrame(themeId, clipId, f);
      if (blob) { try { store[clipId][f] = await loadFrameBitmap(blob); } catch { /* skip */ } }
    }
  }
  return store;
}

const App = () => {
  // Default to LIGHT theme — no FOUC
  const [themeId, setThemeId] = useState('light');
  const [bitmaps, setBitmaps] = useState(null);
  const [reduced, setReduced] = useState(false);
  // Loader state: 0..1 progress float
  const [loadProgress, setLoadProgress] = useState(0);
  const [loaderDone, setLoaderDone] = useState(false);
  const bitmapsCacheRef = useRef({});
  const prefetchInFlightRef = useRef({});
  const failsafeRef = useRef(null);

  const theme = useMemo(() => getTheme(themeId), [themeId]);

  // Persisted theme — only override if user previously set a preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('kaapi-theme');
    if (saved && KAAPI_THEMES[saved]) setThemeId(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem('kaapi-theme', themeId);
  }, [themeId]);

  // Detect reduced motion / IndexedDB support
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!canRunCinema()) { setReduced(true); return; }
    ensureCacheVersion().catch(() => setReduced(true));
  }, []);

  // Hard failsafe: dismiss loader after 4 seconds no matter what
  const dismissLoader = () => {
    setLoadProgress(1);
    if (failsafeRef.current) clearTimeout(failsafeRef.current);
    setTimeout(() => setLoaderDone(true), 500); // match fade-out transition
  };

  // Warm current theme + drive progress
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // If reduced motion, dismiss loader after short delay
    if (reduced) {
      setLoadProgress(1);
      setTimeout(() => setLoaderDone(true), 500);
      return;
    }

    if (bitmapsCacheRef.current[themeId]) {
      setBitmaps(bitmapsCacheRef.current[themeId]);
      dismissLoader();
      return;
    }

    setBitmaps(null);
    setLoadProgress(0);
    setLoaderDone(false);

    // 4-second hard failsafe
    failsafeRef.current = setTimeout(dismissLoader, 4000);

    const cancelRef = { cancelled: false };
    (async () => {
      const store = await warmTheme(themeId, cancelRef, (steps) => {
        const p = Math.min(0.9, steps / TOTAL_STEPS); // cap at 90% until fully done
        setLoadProgress(p);
      });
      if (cancelRef.cancelled || !store) return;
      bitmapsCacheRef.current[themeId] = store;
      setBitmaps(store);
      dismissLoader();

      // Prefetch the OTHER theme once current is warm and browser idle
      const otherId = themeId === 'dark' ? 'light' : 'dark';
      if (!bitmapsCacheRef.current[otherId] && !prefetchInFlightRef.current[otherId]) {
        prefetchInFlightRef.current[otherId] = true;
        const kickoff = () => {
          (async () => {
            const other = await warmTheme(otherId, { cancelled: false }, () => {});
            if (other) bitmapsCacheRef.current[otherId] = other;
            prefetchInFlightRef.current[otherId] = false;
          })();
        };
        if (typeof window.requestIdleCallback === 'function') {
          window.requestIdleCallback(kickoff, { timeout: 4000 });
        } else {
          setTimeout(kickoff, 1500);
        }
      }
    })().catch(() => { setReduced(true); dismissLoader(); });

    return () => {
      cancelRef.cancelled = true;
      if (failsafeRef.current) clearTimeout(failsafeRef.current);
    };
  }, [themeId, reduced]);

  // Keyboard navigation: ↑↓, PgUp/PgDn, Home/End jump between acts.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const scrollToAct = (n) => {
      const clamped = Math.max(1, Math.min(6, n));
      const anchor = getActAnchor(clamped);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: total * anchor, behavior: 'smooth' });
    };
    const onKey = (e) => {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const currentAct = activeActIndex(getScrollProgress());
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        scrollToAct(currentAct + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        scrollToAct(currentAct - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'End') {
        e.preventDefault();
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      } else if (/^[1-6]$/.test(e.key)) {
        e.preventDefault();
        scrollToAct(parseInt(e.key, 10));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleTheme = () => setThemeId((t) => (t === 'dark' ? 'light' : 'dark'));

  const isDark = theme.id === 'dark';
  const pageStyle = { background: theme.colors.bg, color: theme.colors.ink };

  return (
    <main className="relative min-h-screen w-full transition-colors duration-500" style={pageStyle}>
      {/* Full-screen entry loader — z-[100] sits above everything */}
      {!loaderDone && <KaapiLoader progress={loadProgress} theme={theme} />}

      {!reduced ? (
        <KaapiCanvas bitmaps={bitmaps} themeBg={theme.colors.canvasBg} />
      ) : (
        <div className="fixed inset-0 z-0" style={{
          background: isDark
            ? `radial-gradient(ellipse at 50% 55%, ${theme.colors.accentDeep} 0%, #0B0714 45%, ${theme.colors.canvasBg} 80%)`
            : `radial-gradient(ellipse at 50% 55%, ${theme.colors.accentSoft} 0%, #EFE3D0 45%, ${theme.colors.canvasBg} 80%)`,
        }} />
      )}

      <div className="pointer-events-none fixed inset-0 z-[6]" style={{
        background: isDark
          ? 'radial-gradient(circle at 50% 50%, rgba(5,5,6,0) 45%, rgba(5,5,6,0.55) 78%, rgba(5,5,6,0.95) 100%)'
          : 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 55%, rgba(255,255,255,0.20) 80%, rgba(255,255,255,0.60) 100%)',
      }} />

      <KaapiNav theme={theme} onToggleTheme={toggleTheme} />
      {/* KaapiActNav removed — left-side dots cleaned up */}
      <KaapiFlavorCarousel theme={theme} onSelectTheme={(id) => setThemeId(id)} />

      <div className="relative z-10">
        <KaapiSections theme={theme} />
      </div>

      <KaapiStickyOrder theme={theme} />
    </main>
  );
};

export default App;
