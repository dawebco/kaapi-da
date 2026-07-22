// Image-based frame composer for orbit / bridge / detail / reveal kinds.
// The intact can is drawn at scale 0.85 to give it breathing room ("reduce tin size").

import { drawBackdropVignette, drawGhostWatermark, pickWatermark } from './kaapi-frame-decor';

const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

const _imgCache = {};
export function loadImageUrl(url) {
  if (_imgCache[url]) return _imgCache[url];
  _imgCache[url] = new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = (e) => { delete _imgCache[url]; rej(e); };
    img.src = url;
  });
  return _imgCache[url];
}

function coverFit(imgW, imgH, dstW, dstH, scale = 1) {
  const imgAR = imgW / imgH, outAR = dstW / dstH;
  let dw, dh;
  if (imgAR > outAR) { dh = dstH * scale; dw = dh * imgAR; }
  else { dw = dstW * scale; dh = dw / imgAR; }
  return { dw, dh };
}

// Base scale of 0.82 keeps the tin comfortably framed with generous margin.
const BASE_TIN_SCALE = 0.82;

function drawImageCoverCentered(ctx, img, w, h, offsetX = 0, offsetY = 0, scale = 1) {
  const { dw, dh } = coverFit(img.width, img.height, w, h, scale);
  const dx = (w - dw) / 2 + offsetX;
  const dy = (h - dh) / 2 + offsetY;
  ctx.drawImage(img, dx, dy, dw, dh);
}

export function composeImageFrame(ctx, w, h, clipId, kind, t, img, theme) {
  drawBackdropVignette(ctx, w, h, 'backdrop', theme);
  drawGhostWatermark(ctx, w, h, pickWatermark(clipId), theme);
  if (!img) { drawBackdropVignette(ctx, w, h, 'vignette', theme); return; }

  if (kind === 'reveal') {
    // Static exploded image + mask that retreats bottom-up as t grows.
    const p = easeOut(t);
    const drift = (1 - p) * h * 0.03;
    drawImageCoverCentered(ctx, img, w, h, 0, drift, BASE_TIN_SCALE + (1 - p) * 0.02);
    // Cover top area with theme bg → hides exploded elements at t=0.
    const coverBottomY = h * (0.60 - p * 0.60);
    const grad = ctx.createLinearGradient(0, 0, 0, coverBottomY);
    const bg = theme.colors.canvasBg;
    grad.addColorStop(0.0, bg);
    grad.addColorStop(0.75, bg);
    grad.addColorStop(1.0, hexAlpha(bg, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, coverBottomY);
  } else if (kind === 'orbit') {
    const angle = t * Math.PI * 2;
    const scaleX = 0.90 + Math.abs(Math.cos(angle)) * 0.10;
    const yaw = Math.sin(angle) * 3;
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(scaleX, 1);
    ctx.rotate((yaw * Math.PI) / 180);
    ctx.translate(-w / 2, -h / 2);
    drawImageCoverCentered(ctx, img, w, h, 0, 0, BASE_TIN_SCALE);
    ctx.restore();
  } else if (kind === 'bridge') {
    const p = easeInOut(t);
    const offX = (1 - p) * w * 0.08;
    const tilt = (1 - p) * 4;
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate((tilt * Math.PI) / 180);
    ctx.translate(-w / 2, -h / 2);
    drawImageCoverCentered(ctx, img, w, h, offX, 0, BASE_TIN_SCALE);
    ctx.restore();
  } else if (kind === 'detail') {
    const scale = BASE_TIN_SCALE + easeInOut(t) * 0.42;
    const drift = easeOut(t) * h * 0.03;
    drawImageCoverCentered(ctx, img, w, h, 0, drift, scale);
  }

  drawBackdropVignette(ctx, w, h, 'vignette', theme);
}

function hexAlpha(hex, a) {
  // Convert a solid hex (#RRGGBB) to rgba() with the given alpha.
  const s = hex.replace('#', '');
  const n = parseInt(s.length === 3 ? s.split('').map(c => c + c).join('') : s, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}
