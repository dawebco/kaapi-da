'use client';

import { useEffect, useRef } from 'react';
import { FRAMES_PER_CLIP } from '@/lib/kaapi-assets';
import { resolveFrame, getScrollProgress } from '@/lib/kaapi-scroll-engine';
import { drawFrame, resizeCanvasToDisplay } from '@/lib/kaapi-renderer';

// Fixed full-screen background canvas driven by scroll.
// Bitmaps are provided by the parent (loaded once capture completes).
export default function KaapiCanvas({ bitmaps }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const lastKeyRef = useRef('');

  useEffect(() => {
    if (!bitmaps) return;
    let cancelled = false;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    resizeCanvasToDisplay(canvas);

    const onResize = () => {
      resizeCanvasToDisplay(canvas);
      lastKeyRef.current = ''; // force redraw at new size
    };
    window.addEventListener('resize', onResize);

    const render = () => {
      if (cancelled) return;
      const p = getScrollProgress();
      const { clipId, index } = resolveFrame(p);
      const key = `${clipId}:${index}`;
      let chosen = bitmaps[clipId] && bitmaps[clipId][index];
      if (!chosen && bitmaps[clipId]) {
        // Fallback: nearest available frame
        for (let d = 1; d < FRAMES_PER_CLIP; d++) {
          const a = bitmaps[clipId][index - d];
          const b = bitmaps[clipId][index + d];
          if (a) { chosen = a; break; }
          if (b) { chosen = b; break; }
        }
      }
      if (chosen && key !== lastKeyRef.current) {
        drawFrame(ctx, chosen, canvas.width, canvas.height);
        lastKeyRef.current = key;
      }
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [bitmaps]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen z-0"
      style={{ background: '#070708' }}
      aria-hidden="true"
    />
  );
}
