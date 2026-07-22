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

export const supportsWebP = () => {
  if (!isBrowser()) return true;
  const c = document.createElement('canvas');
  c.width = 1; c.height = 1;
  return c.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

export const supportsIndexedDB = () => {
  if (!isBrowser()) return false;
  return !!window.indexedDB;
};

// Mobile-safe capture width. Floor at 900px so the can never looks pixelated.
export const getCaptureWidth = () => {
  if (!isBrowser()) return 1200;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const vw = window.innerWidth;
  const target = Math.round(vw * dpr);
  const isMobile = vw < 768;
  // Mobile floor: 900px. Desktop cap: 1280px (procedural gen speed vs. sharpness).
  const floor = isMobile ? 900 : 1100;
  const cap = 1280;
  return Math.max(floor, Math.min(target, cap));
};

export const getCaptureHeight = (w) => Math.round(w * (9 / 16));

export const canRunCinema = () => {
  return isBrowser() && supportsIndexedDB() && !prefersReducedMotion();
};
