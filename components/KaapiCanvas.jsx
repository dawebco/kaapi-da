'use client';

import { useEffect, useRef } from 'react';
import { FRAMES_PER_CLIP } from '@/lib/kaapi-assets';
import { resolveFrameBlend, getScrollProgress } from '@/lib/kaapi-scroll-engine';
import { drawFrame, resizeCanvasToDisplay } from '@/lib/kaapi-renderer';

// Fixed full-screen background canvas driven by scroll.
// - Cinema color grade via ctx.filter
// - Velocity-based motion blur during fast scrolls
// - Subtle 3D mouse-parallax tilt on wrapper
// - Feathered crossfade near inter-clip segment boundaries
export default function KaapiCanvas({ bitmaps, themeBg }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const lastKeyRef = useRef('');
  const lastScrollRef = useRef(0);
  const velRef = useRef(0);
  const tiltRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const onMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      tiltRef.current.tx = Math.max(-1, Math.min(1, (e.clientX - cx) / cx));
      tiltRef.current.ty = Math.max(-1, Math.min(1, (e.clientY - cy) / cy));
    };
    const onLeave = () => { tiltRef.current.tx = 0; tiltRef.current.ty = 0; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  useEffect(() => {
    if (!bitmaps) return;
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    resizeCanvasToDisplay(canvas);
    lastKeyRef.current = '';

    const onResize = () => { resizeCanvasToDisplay(canvas); lastKeyRef.current = ''; };
    window.addEventListener('resize', onResize);
    lastScrollRef.current = window.scrollY || 0;

    const pickBitmap = (clipId, index) => {
      if (!bitmaps[clipId]) return null;
      let b = bitmaps[clipId][index];
      if (b) return b;
      // walk to nearest available frame
      for (let d = 1; d < FRAMES_PER_CLIP; d++) {
        const a = bitmaps[clipId][index - d];
        const bb = bitmaps[clipId][index + d];
        if (a) return a;
        if (bb) return bb;
      }
      return null;
    };

    const render = () => {
      if (cancelled) return;
      const y = window.scrollY || 0;
      const dy = Math.abs(y - lastScrollRef.current);
      lastScrollRef.current = y;
      velRef.current = velRef.current * 0.75 + dy * 0.25;
      const blur = Math.min(3.5, velRef.current * 0.08);

      tiltRef.current.x += (tiltRef.current.tx - tiltRef.current.x) * 0.08;
      tiltRef.current.y += (tiltRef.current.ty - tiltRef.current.y) * 0.08;
      const rotY = tiltRef.current.x * 6;
      const rotX = -tiltRef.current.y * 4;
      if (wrapperRef.current) {
        wrapperRef.current.style.transform =
          `perspective(1400px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.04)`;
      }

      const p = getScrollProgress();
      const { primary, secondary, blend } = resolveFrameBlend(p);
      const A = pickBitmap(primary.clipId, primary.index);
      const B = secondary ? pickBitmap(secondary.clipId, secondary.index) : null;
      // Include blend + secondary key so we redraw during feathered transitions.
      const key = `${primary.clipId}:${primary.index}:${blur.toFixed(2)}:${blend.toFixed(2)}:${secondary ? secondary.clipId + ':' + secondary.index : '-'}`;

      if (A && key !== lastKeyRef.current) {
        ctx.save();
        try { ctx.filter = `brightness(1.06) contrast(1.10) saturate(1.15) blur(${blur.toFixed(2)}px)`; } catch { /* ok */ }
        // Draw primary at (1 - blend)
        ctx.globalAlpha = 1 - blend;
        drawFrame(ctx, A, canvas.width, canvas.height);
        if (B && blend > 0) {
          ctx.globalAlpha = blend;
          // drawFrame includes clearRect internally — use manual drawImage to avoid clearing primary.
          const sw = B.width || B.videoWidth || canvas.width;
          const sh = B.height || B.videoHeight || canvas.height;
          const bAR = sw / sh, outAR = canvas.width / canvas.height;
          let dw, dh;
          if (bAR > outAR) { dh = canvas.height; dw = dh * bAR; }
          else { dw = canvas.width; dh = dw / bAR; }
          const dx = (canvas.width - dw) / 2, dy = (canvas.height - dh) / 2;
          ctx.drawImage(B, dx, dy, dw, dh);
        }
        ctx.restore();
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
    <div ref={wrapperRef} className="fixed inset-0 z-0 will-change-transform"
      style={{ transformStyle: 'preserve-3d', transformOrigin: '50% 50%' }}>
      <canvas ref={canvasRef} className="w-screen h-screen block" style={{ background: themeBg || '#050506' }} aria-hidden="true" />
    </div>
  );
}
