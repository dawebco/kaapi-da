// Frame extraction pipeline.
// Phase 1–6 (this MVP): frames are generated procedurally from a canvas renderer
// (see kaapi-procedural-can.js) so we don't depend on external MP4 CDN availability.
// Phase 7: swap `captureClip` back to a video-seek pipeline that uses
// `requestVideoFrameCallback`/`seeked` to sample real MP4 clips — the rest of the
// engine (IndexedDB store, scroll engine, canvas renderer) is unchanged.

import { getCaptureWidth, getCaptureHeight } from './kaapi-device';
import { getCachedFrame, putCachedFrame } from './kaapi-idb';
import { FRAMES_PER_CLIP } from './kaapi-assets';
import { drawClipFrame } from './kaapi-procedural-can';

const WEBP_QUALITY = 0.82;

const canvasToWebPBlob = (canvas) => new Promise((resolve) => {
  if (canvas.convertToBlob) {
    canvas.convertToBlob({ type: 'image/webp', quality: WEBP_QUALITY }).then(resolve).catch(() => resolve(null));
    return;
  }
  if (canvas.toBlob) {
    canvas.toBlob((b) => resolve(b), 'image/webp', WEBP_QUALITY);
    return;
  }
  try {
    const dataURL = canvas.toDataURL('image/webp', WEBP_QUALITY);
    const bytes = atob(dataURL.split(',')[1]);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    resolve(new Blob([arr], { type: 'image/webp' }));
  } catch { resolve(null); }
});

// Generate + cache frames for a single clip.
// Signature preserved so the calling code doesn't change when MP4s arrive.
export const captureClip = async (clipId, _url, onProgress) => {
  // Fast path: all frames already cached?
  let missingCount = 0;
  for (let i = 0; i < FRAMES_PER_CLIP; i++) {
    const cached = await getCachedFrame(clipId, i);
    if (!cached) missingCount++;
  }
  if (missingCount === 0) {
    onProgress && onProgress(1, FRAMES_PER_CLIP, FRAMES_PER_CLIP);
    return { cached: true };
  }

  const w = getCaptureWidth();
  const h = getCaptureHeight(w);
  const canvas = (typeof OffscreenCanvas !== 'undefined')
    ? new OffscreenCanvas(w, h)
    : Object.assign(document.createElement('canvas'), { width: w, height: h });
  if ('width' in canvas) canvas.width = w;
  if ('height' in canvas) canvas.height = h;
  const ctx = canvas.getContext('2d');

  for (let i = 0; i < FRAMES_PER_CLIP; i++) {
    const existing = await getCachedFrame(clipId, i);
    if (!existing) {
      const t = i / (FRAMES_PER_CLIP - 1);
      try {
        drawClipFrame(ctx, w, h, clipId, t);
        const blob = await canvasToWebPBlob(canvas);
        if (blob) await putCachedFrame(clipId, i, blob);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[kaapi] frame gen skip', clipId, i, err && err.message);
      }
    }
    onProgress && onProgress((i + 1) / FRAMES_PER_CLIP, i + 1, FRAMES_PER_CLIP);
    // Yield to the main thread so the loader UI can breathe
    if (i % 6 === 5) await new Promise((r) => setTimeout(r, 0));
  }

  return { cached: false };
};

// Load a cached WebP blob into a fast-drawable image source.
export const loadFrameBitmap = async (blob) => {
  if (!blob) return null;
  try {
    if (typeof createImageBitmap === 'function') {
      return await createImageBitmap(blob);
    }
  } catch { /* fall through */ }
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = (e) => { URL.revokeObjectURL(url); rej(e); };
    img.src = url;
  });
};
