// Unified frame capture with per-theme keys and per-theme composition.

import { getCaptureWidth, getCaptureHeight } from './kaapi-device';
import { getCachedFrame, putCachedFrame } from './kaapi-idb';
import { FRAMES_PER_CLIP, getTheme } from './kaapi-assets';
import { loadImageUrl, composeImageFrame } from './kaapi-image-frames';
import { drawBackdropVignette, drawGhostWatermark, pickWatermark } from './kaapi-frame-decor';

const WEBP_QUALITY = 0.92;

const canvasToWebPBlob = (canvas) => new Promise((resolve) => {
  if (canvas.convertToBlob) { canvas.convertToBlob({ type: 'image/webp', quality: WEBP_QUALITY }).then(resolve).catch(() => resolve(null)); return; }
  if (canvas.toBlob) { canvas.toBlob((b) => resolve(b), 'image/webp', WEBP_QUALITY); return; }
  resolve(null);
});

function pad(n, digits) { const s = String(n); return s.length >= digits ? s : '0'.repeat(digits - s.length) + s; }

function makeCanvas(w, h) {
  const canvas = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h });
  if ('width' in canvas) canvas.width = w;
  if ('height' in canvas) canvas.height = h;
  return canvas;
}

// Compose a pre-extracted static frame with backdrop + watermark + vignette.
function composeFrameSetFrame(ctx, w, h, sourceImg, watermarkText, theme) {
  drawBackdropVignette(ctx, w, h, 'backdrop', theme);
  drawGhostWatermark(ctx, w, h, watermarkText, theme);
  const sAR = sourceImg.width / sourceImg.height;
  const outAR = w / h;
  let dw, dh;
  // Tin size reduction: scale=0.85
  const scale = 0.88;
  if (sAR > outAR) { dh = h * scale; dw = h * sAR * scale; }
  else { dw = w * scale; dh = w / sAR * scale; }
  const dx = (w - dw) / 2, dy = (h - dh) / 2;
  ctx.drawImage(sourceImg, dx, dy, dw, dh);
  drawBackdropVignette(ctx, w, h, 'vignette', theme);
}

export const captureClipForTheme = async (themeId, clipId, onProgress) => {
  const theme = getTheme(themeId);
  const clip = theme.clips[clipId];
  if (!clip) return { cached: true };

  let missingCount = 0;
  for (let i = 0; i < FRAMES_PER_CLIP; i++) {
    const cached = await getCachedFrame(themeId, clipId, i);
    if (!cached) missingCount++;
  }
  if (missingCount === 0) { onProgress && onProgress(1); return { cached: true }; }

  const w = getCaptureWidth();
  const h = getCaptureHeight(w);
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext('2d');

  if (clip.source === 'frames') {
    const set = theme.frames && theme.frames[clip.frameSet];
    if (!set) return { cached: false };
    const wm = pickWatermark(clipId);
    for (let i = 0; i < FRAMES_PER_CLIP; i++) {
      const existing = await getCachedFrame(themeId, clipId, i);
      if (!existing) {
        const idx = set.startIndex + i;
        const url = `${set.baseUrl}${pad(idx, set.padDigits)}.webp`;
        try {
          const img = await loadImageUrl(url);
          composeFrameSetFrame(ctx, w, h, img, wm, theme);
          const blob = await canvasToWebPBlob(canvas);
          if (blob) await putCachedFrame(themeId, clipId, i, blob);
        } catch (err) { /* skip */ }
      }
      onProgress && onProgress((i + 1) / FRAMES_PER_CLIP);
      if (i % 6 === 5) await new Promise((r) => setTimeout(r, 0));
    }
    return { cached: false };
  }

  // Image-based (orbit/bridge/detail/reveal)
  const imgUrl = theme.images[clip.image];
  let img = null;
  try { img = await loadImageUrl(imgUrl); } catch { /* leave null */ }
  for (let i = 0; i < FRAMES_PER_CLIP; i++) {
    const existing = await getCachedFrame(themeId, clipId, i);
    if (!existing) {
      const t = i / (FRAMES_PER_CLIP - 1);
      try {
        composeImageFrame(ctx, w, h, clipId, clip.kind, t, img, theme);
        const blob = await canvasToWebPBlob(canvas);
        if (blob) await putCachedFrame(themeId, clipId, i, blob);
      } catch (err) { /* skip */ }
    }
    onProgress && onProgress((i + 1) / FRAMES_PER_CLIP);
    if (i % 6 === 5) await new Promise((r) => setTimeout(r, 0));
  }
  return { cached: false };
};

export const loadFrameBitmap = async (blob) => {
  if (!blob) return null;
  try { if (typeof createImageBitmap === 'function') return await createImageBitmap(blob); } catch { /* fall through */ }
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = (e) => { URL.revokeObjectURL(url); rej(e); };
    img.src = url;
  });
};
