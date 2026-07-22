// Capability detection and mobile-safe sizing.

export const isBrowser = () => typeof window !== 'undefined';

export const prefersReducedMotion = () => {
  if (!isBrowser()) return false;
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const supportsVideoFrameCallback = () => {
  if (!isBrowser()) return false;
  const v = document.createElement('video');
  return typeof v.requestVideoFrameCallback === 'function';
};

export const supportsIndexedDB = () => {
  if (!isBrowser()) return false;
  return !!window.indexedDB;
};

// Mobile-safe capture width. Floor at 900px on mobile, cap at 1600px on desktop
// so the can is sharp on 4K and stays memory-safe on phones.
export const getCaptureWidth = () => {
  if (!isBrowser()) return 1600;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const vw = window.innerWidth;
  const target = Math.round(vw * dpr);
  const isMobile = vw < 768;
  const floor = isMobile ? 900 : 1280;
  const cap = 1600;
  return Math.max(floor, Math.min(target, cap));
};

export const getCaptureHeight = (w) => Math.round(w * (9 / 16));

export const canRunCinema = () => {
  return isBrowser() && supportsIndexedDB() && !prefersReducedMotion();
};
