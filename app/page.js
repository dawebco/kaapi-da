'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import KaapiCanvas from '@/components/KaapiCanvas';
import KaapiNav from '@/components/KaapiNav';
import KaapiSections from '@/components/KaapiSections';
import KaapiStickyOrder from '@/components/KaapiStickyOrder';
import KaapiActNav from '@/components/KaapiActNav';
import { KAAPI_THEMES, FRAMES_PER_CLIP, KAAPI_SEGMENTS, getTheme } from '@/lib/kaapi-assets';
import { captureClipForTheme, loadFrameBitmap } from '@/lib/kaapi-frame-capture';
import { ensureCacheVersion, getCachedFrame } from '@/lib/kaapi-idb';
import { canRunCinema } from '@/lib/kaapi-device';
import { getActAnchor, activeActIndex, getScrollProgress } from '@/lib/kaapi-scroll-engine';

const CLIP_IDS = ['deconstruct', 'orbit', 'bridge', 'detail'];

async function warmTheme(themeId, cancelRef) {
  for (const clipId of CLIP_IDS) {
    if (cancelRef && cancelRef.cancelled) return null;
    await captureClipForTheme(themeId, clipId);
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
  const [themeId, setThemeId] = useState('dark');
  const [bitmaps, setBitmaps] = useState(null);
  const [reduced, setReduced] = useState(false);
  const bitmapsCacheRef = useRef({}); // { themeId: bitmaps }
  const prefetchInFlightRef = useRef({});

  const theme = useMemo(() => getTheme(themeId), [themeId]);

  // Persisted theme
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('kaapi-theme');
    if (saved && KAAPI_THEMES[saved]) setThemeId(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem('kaapi-theme', themeId);
  }, [themeId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!canRunCinema()) { setReduced(true); return; }
    ensureCacheVersion().catch(() => setReduced(true));
  }, []);

  // Warm current theme
  useEffect(() => {
    if (typeof window === 'undefined' || reduced) return;
    if (bitmapsCacheRef.current[themeId]) { setBitmaps(bitmapsCacheRef.current[themeId]); return; }
    setBitmaps(null);
    const cancelRef = { cancelled: false };
    (async () => {
      const store = await warmTheme(themeId, cancelRef);
      if (cancelRef.cancelled || !store) return;
      bitmapsCacheRef.current[themeId] = store;
      setBitmaps(store);
      // Prefetch the OTHER theme once current is warm and browser idle.
      const otherId = themeId === 'dark' ? 'light' : 'dark';
      if (!bitmapsCacheRef.current[otherId] && !prefetchInFlightRef.current[otherId]) {
        prefetchInFlightRef.current[otherId] = true;
        const kickoff = () => {
          (async () => {
            const other = await warmTheme(otherId, { cancelled: false });
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
    })().catch(() => setReduced(true));
    return () => { cancelRef.cancelled = true; };
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
      <KaapiActNav theme={theme} />

      <div className="relative z-10">
        <KaapiSections theme={theme} />
      </div>

      <KaapiStickyOrder />
    </main>
  );
};

export default App;
