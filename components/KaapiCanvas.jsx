'use client';

import { useEffect, useRef } from 'react';
import { FRAMES_PER_CLIP } from '@/lib/kaapi-assets';
import { resolveFrame, getScrollProgress } from '@/lib/kaapi-scroll-engine';
import { drawFrame, resizeCanvasToDisplay } from '@/lib/kaapi-renderer';

// Fixed full-screen background canvas.
// - Cinema color grade via ctx.filter
// - Velocity-based motion blur during fast scrolls
// - Subtle 3D mouse-parallax tilt on wrapper
export default function KaapiCanvas({ bitmaps }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const lastKeyRef = useRef('');
  const lastScrollRef = useRef(0);
  const velRef = useRef(0);
  const tiltRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  // Mouse tilt — update targets; RAF smooths and applies
  useEffect(() => {
    const onMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const nx = (e.clientX - cx) / cx; // -1..1
      const ny = (e.clientY - cy) / cy;
      tiltRef.current.tx = Math.max(-1, Math.min(1, nx));
      tiltRef.current.ty = Math.max(-1, Math.min(1, ny));
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

    const onResize = () => {
      resizeCanvasToDisplay(canvas);
      lastKeyRef.current = '';
    };
    window.addEventListener('resize', onResize);

    lastScrollRef.current = window.scrollY || 0;

    const render = () => {
      if (cancelled) return;

      // Scroll velocity for motion blur
      const y = window.scrollY || 0;
      const dy = Math.abs(y - lastScrollRef.current);
      lastScrollRef.current = y;
      // Smooth velocity toward dy (attack fast, decay smooth)
      velRef.current = velRef.current * 0.75 + dy * 0.25;
      const blur = Math.min(3.5, velRef.current * 0.08);

      // Smooth tilt (lerp actual toward target)
      tiltRef.current.x += (tiltRef.current.tx - tiltRef.current.x) * 0.08;
      tiltRef.current.y += (tiltRef.current.ty - tiltRef.current.y) * 0.08;
      const rotY = tiltRef.current.x * 6;    // deg
      const rotX = -tiltRef.current.y * 4;   // deg
      if (wrapperRef.current) {
        wrapperRef.current.style.transform =
          `perspective(1400px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.04)`;
      }

      // Scroll -> frame
      const p = getScrollProgress();
      const { clipId, index } = resolveFrame(p);
      const key = `${clipId}:${index}:${blur.toFixed(2)}`;
      let chosen = bitmaps[clipId] && bitmaps[clipId][index];
      if (!chosen && bitmaps[clipId]) {
        for (let d = 1; d < FRAMES_PER_CLIP; d++) {
          const a = bitmaps[clipId][index - d];
          const b = bitmaps[clipId][index + d];
          if (a) { chosen = a; break; }
          if (b) { chosen = b; break; }
        }
      }
      if (chosen && key !== lastKeyRef.current) {
        ctx.save();
        try {
          ctx.filter = `brightness(1.08) contrast(1.12) saturate(1.20) blur(${blur.toFixed(2)}px)`;
        } catch { /* older browsers */ }
        drawFrame(ctx, chosen, canvas.width, canvas.height);
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
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-0 will-change-transform"
      style={{ transformStyle: 'preserve-3d', transformOrigin: '50% 50%' }}
    >
      <canvas
        ref={canvasRef}
        className="w-screen h-screen block"
        style={{ background: '#050506' }}
        aria-hidden="true"
      />
    </div>
  );
}
