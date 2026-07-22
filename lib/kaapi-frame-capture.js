// Frame extraction pipeline.
// This MVP: frames composited from two photorealistic Kaapi Da product renders
// via kaapi-image-frames.js. When real cinematic MP4 clips arrive in Phase 7,
// swap back to video-seek mode (`requestVideoFrameCallback`/`seeked`) — the
// rest of the engine (IDB, scroll engine, canvas render) is unchanged.

import { getCaptureWidth, getCaptureHeight } from './kaapi-device';
import { getCachedFrame, putCachedFrame } from './kaapi-idb';
import { FRAMES_PER_CLIP } from './kaapi-assets';
import { drawClipFrame, loadAllImages } from './kaapi-image-frames';

const WEBP_QUALITY = 0.86;

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

let _imgsPromise = null;
async function ensureImages() {
  if (!_imgsPromise) _imgsPromise = loadAllImages();
  return _imgsPromise;
}

export const captureClip = async (clipId, _url, onProgress) => {
  // Fast path
  let missingCount = 0;
  for (let i = 0; i < FRAMES_PER_CLIP; i++) {
    const cached = await getCachedFrame(clipId, i);
    if (!cached) missingCount++;
  }
  if (missingCount === 0) {
    onProgress && onProgress(1, FRAMES_PER_CLIP, FRAMES_PER_CLIP);
    return { cached: true };
  }

  const images = await ensureImages();

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
        drawClipFrame(ctx, w, h, clipId, t, images);
        const blob = await canvasToWebPBlob(canvas);
        if (blob) await putCachedFrame(clipId, i, blob);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[kaapi] frame gen skip', clipId, i, err && err.message);
      }
    }
    onProgress && onProgress((i + 1) / FRAMES_PER_CLIP, i + 1, FRAMES_PER_CLIP);
    if (i % 6 === 5) await new Promise((r) => setTimeout(r, 0));
  }

  return { cached: false };
};

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
