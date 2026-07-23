'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import KaapiCanvas from '@/components/KaapiCanvas';
import KaapiNav from '@/components/KaapiNav';
import KaapiSections from '@/components/KaapiSections';
import KaapiStickyOrder from '@/components/KaapiStickyOrder';
import { KAAPI_THEMES, FRAMES_PER_CLIP, getTheme } from '@/lib/kaapi-assets';
import { captureClipForTheme, loadFrameBitmap } from '@/lib/kaapi-frame-capture';
import { ensureCacheVersion, getCachedFrame } from '@/lib/kaapi-idb';
import { canRunCinema } from '@/lib/kaapi-device';

const CLIP_IDS = ['deconstruct', 'orbit', 'bridge', 'detail'];

const App = () => {
  const [themeId, setThemeId] = useState('dark');
  const [bitmaps, setBitmaps] = useState(null);
  const [reduced, setReduced] = useState(false);
  const bitmapsCacheRef = useRef({}); // { themeId: { clip: [bitmaps] } }

  const theme = useMemo(() => getTheme(themeId), [themeId]);

  // Persist theme choice
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('kaapi-theme');
    if (saved && KAAPI_THEMES[saved]) setThemeId(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem('kaapi-theme', themeId);
  }, [themeId]);

  // Ensure IDB cache version once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!canRunCinema()) { setReduced(true); return; }
    ensureCacheVersion().catch(() => setReduced(true));
  }, []);

  // Capture + warm frames whenever theme changes (if not already warmed in ref)
  useEffect(() => {
    if (typeof window === 'undefined' || reduced) return;
    let cancelled = false;

    // Warm from memory cache instantly if we've done this theme before
    if (bitmapsCacheRef.current[themeId]) {
      setBitmaps(bitmapsCacheRef.current[themeId]);
      return;
    }
    // Clear canvas draw immediately so the old theme's frames don't linger
    setBitmaps(null);

    (async () => {
      try {
        // Capture per clip
        for (const clipId of CLIP_IDS) {
          if (cancelled) return;
          await captureClipForTheme(themeId, clipId);
        }
        // Load bitmaps
        const store = {};
        for (const clipId of CLIP_IDS) {
          store[clipId] = new Array(FRAMES_PER_CLIP).fill(null);
          for (let f = 0; f < FRAMES_PER_CLIP; f++) {
            if (cancelled) return;
            const blob = await getCachedFrame(themeId, clipId, f);
            if (blob) { try { store[clipId][f] = await loadFrameBitmap(blob); } catch { /* skip */ } }
          }
        }
        if (cancelled) return;
        bitmapsCacheRef.current[themeId] = store;
        setBitmaps(store);
      } catch (err) {
        setReduced(true);
      }
    })();

    return () => { cancelled = true; };
  }, [themeId, reduced]);

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

      {/* Vignette overlay */}
      <div className="pointer-events-none fixed inset-0 z-[6]" style={{
        background: isDark
          ? 'radial-gradient(circle at 50% 50%, rgba(5,5,6,0) 45%, rgba(5,5,6,0.55) 78%, rgba(5,5,6,0.95) 100%)'
          : 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 55%, rgba(255,255,255,0.20) 80%, rgba(255,255,255,0.60) 100%)',
      }} />

      <KaapiNav theme={theme} onToggleTheme={toggleTheme} />

      <div className="relative z-10">
        <KaapiSections theme={theme} />
      </div>

      <KaapiStickyOrder />
    </main>
  );
};

export default App;
