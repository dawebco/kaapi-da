// Unified frame capture pipeline.
// - `frames` clips (deconstruct): load pre-extracted WebP frames from /public
// - `image`  clips (orbit/bridge/detail): compose from intact PNG with transforms
// Both paths cache composed frames in IDB so the RAF renderer is unified.

import { getCaptureWidth, getCaptureHeight } from './kaapi-device';
import { getCachedFrame, putCachedFrame } from './kaapi-idb';
import { FRAMES_PER_CLIP, KAAPI_CLIPS, KAAPI_FRAMES } from './kaapi-assets';
import { loadImage, composeImageFrame } from './kaapi-image-frames';
import { drawBackdropVignette, drawGhostWatermark, pickWatermark } from './kaapi-frame-decor';

const WEBP_QUALITY = 0.92;

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

// Simple url -> HTMLImageElement loader
function loadImageUrl(url) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = (e) => rej(e);
    img.src = url;
  });
}

function pad(n, digits) {
  const s = String(n);
  return s.length >= digits ? s : '0'.repeat(digits - s.length) + s;
}

let _sharedIntact = null;
async function ensureIntact() {
  if (_sharedIntact) return _sharedIntact;
  try { _sharedIntact = await loadImage('intact'); return _sharedIntact; }
  catch (e) { console.warn('[kaapi] intact image load failed', e && e.message); return null; }
}

function makeCanvas(w, h) {
  const canvas = (typeof OffscreenCanvas !== 'undefined')
    ? new OffscreenCanvas(w, h)
    : Object.assign(document.createElement('canvas'), { width: w, height: h });
  if ('width' in canvas) canvas.width = w;
  if ('height' in canvas) canvas.height = h;
  return canvas;
}

function composeFrameOntoCanvas(ctx, w, h, sourceImg, watermarkText) {
  drawBackdropVignette(ctx, w, h, 'backdrop');
  drawGhostWatermark(ctx, w, h, watermarkText);
  // Cover-fit source image
  const sAR = sourceImg.width / sourceImg.height;
  const outAR = w / h;
  let dw, dh;
  if (sAR > outAR) { dh = h; dw = h * sAR; } else { dw = w; dh = w / sAR; }
  const dx = (w - dw) / 2, dy = (h - dh) / 2;
  ctx.drawImage(sourceImg, dx, dy, dw, dh);
  drawBackdropVignette(ctx, w, h, 'vignette');
}

export const captureClip = async (clipId, _url, onProgress) => {
  const clip = KAAPI_CLIPS[clipId];
  if (!clip) return { cached: true };

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

  const w = getCaptureWidth();
  const h = getCaptureHeight(w);
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext('2d');

  if (clip.source === 'frames') {
    const set = KAAPI_FRAMES[clip.frameSet];
    if (!set) return { cached: false };
    const wmText = pickWatermark(clipId);
    for (let i = 0; i < FRAMES_PER_CLIP; i++) {
      const existing = await getCachedFrame(clipId, i);
      if (!existing) {
        const idx = set.startIndex + i;
        const url = `${set.baseUrl}${pad(idx, set.padDigits)}.webp`;
        try {
          const img = await loadImageUrl(url);
          composeFrameOntoCanvas(ctx, w, h, img, wmText);
          const blob = await canvasToWebPBlob(canvas);
          if (blob) await putCachedFrame(clipId, i, blob);
        } catch (err) {
          console.warn('[kaapi] frame load skip', clipId, i, err && err.message);
        }
      }
      onProgress && onProgress((i + 1) / FRAMES_PER_CLIP, i + 1, FRAMES_PER_CLIP);
      if (i % 6 === 5) await new Promise((r) => setTimeout(r, 0));
    }
    return { cached: false };
  }

  // Image-based clip (orbit/bridge/detail)
  const img = await ensureIntact();
  for (let i = 0; i < FRAMES_PER_CLIP; i++) {
    const existing = await getCachedFrame(clipId, i);
    if (!existing) {
      const t = i / (FRAMES_PER_CLIP - 1);
      try {
        composeImageFrame(ctx, w, h, clipId, clip.kind, t, img);
        const blob = await canvasToWebPBlob(canvas);
        if (blob) await putCachedFrame(clipId, i, blob);
      } catch (err) {
        console.warn('[kaapi] image frame skip', clipId, i, err && err.message);
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
