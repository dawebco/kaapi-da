// Image-based frame composer for the calmer acts (orbit, bridge, detail).
// Uses the pristine intact-can PNG with per-clip transforms.

import { KAAPI_IMAGES } from './kaapi-assets';
import { drawBackdropVignette, drawGhostWatermark, pickWatermark } from './kaapi-frame-decor';

const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

const _imgCache = {};
export function loadImage(id) {
  if (_imgCache[id]) return _imgCache[id];
  const url = KAAPI_IMAGES[id];
  if (!url) return Promise.reject(new Error('Unknown image id: ' + id));
  _imgCache[id] = new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = (e) => { delete _imgCache[id]; rej(e); };
    img.src = url;
  });
  return _imgCache[id];
}

function coverFit(imgW, imgH, dstW, dstH, scale = 1) {
  const imgAR = imgW / imgH, outAR = dstW / dstH;
  let dw, dh;
  if (imgAR > outAR) {
    dh = dstH * scale;
    dw = dh * imgAR;
  } else {
    dw = dstW * scale;
    dh = dw / imgAR;
  }
  return { dw, dh };
}

function drawImageCoverCentered(ctx, img, w, h, offsetX = 0, offsetY = 0, scale = 1) {
  const { dw, dh } = coverFit(img.width, img.height, w, h, scale);
  const dx = (w - dw) / 2 + offsetX;
  const dy = (h - dh) / 2 + offsetY;
  ctx.drawImage(img, dx, dy, dw, dh);
}

export function composeImageFrame(ctx, w, h, clipId, kind, t, img) {
  drawBackdropVignette(ctx, w, h, 'backdrop');
  drawGhostWatermark(ctx, w, h, pickWatermark(clipId));

  if (!img) { drawBackdropVignette(ctx, w, h, 'vignette'); return; }

  if (kind === 'orbit') {
    const angle = t * Math.PI * 2;
    const scaleX = 0.88 + Math.abs(Math.cos(angle)) * 0.12;
    const yaw = Math.sin(angle) * 3;
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(scaleX, 1);
    ctx.rotate((yaw * Math.PI) / 180);
    ctx.translate(-w / 2, -h / 2);
    drawImageCoverCentered(ctx, img, w, h, 0, 0, 1);
    ctx.restore();
  } else if (kind === 'bridge') {
    const p = easeInOut(t);
    const offX = (1 - p) * w * 0.08;
    const tilt = (1 - p) * 4;
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate((tilt * Math.PI) / 180);
    ctx.translate(-w / 2, -h / 2);
    drawImageCoverCentered(ctx, img, w, h, offX, 0, 1);
    ctx.restore();
  } else if (kind === 'detail') {
    const scale = 1 + easeInOut(t) * 0.55;
    const drift = easeOut(t) * h * 0.03;
    drawImageCoverCentered(ctx, img, w, h, 0, drift, scale);
    // Extra specular condensation motes at close range
    if (t > 0.1) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 50; i++) {
        const seed = i * 2.71;
        const rx = ((Math.sin(seed * 1.9) + 1) / 2);
        const ry = ((Math.cos(seed * 4.11) + 1) / 2);
        const x = w * (0.32 + rx * 0.36);
        const y = h * (0.20 + ry * 0.70);
        const r = Math.max(0.7, w * 0.0016 * (0.6 + rx));
        ctx.fillStyle = `rgba(255,255,255,${0.28 * t})`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  }

  drawBackdropVignette(ctx, w, h, 'vignette');
}
