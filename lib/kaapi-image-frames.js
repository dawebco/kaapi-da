// Photorealistic frame composer using two brand product renders:
//   exploded.png (16:9) — drives deconstruct + reassemble
//   intact.png   (1:1)  — drives orbit, bridge, detail, reveal
// Each clip is a scroll-scrubbed motion arc rendered from its source image.

import { KAAPI_IMAGES, KAAPI_CLIPS } from './kaapi-assets';

const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

// ---- image loading ----
const _imgCache = {}; // id -> Promise<HTMLImageElement>
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

export async function loadAllImages() {
  const ids = Object.keys(KAAPI_IMAGES);
  const results = {};
  for (const id of ids) {
    try { results[id] = await loadImage(id); }
    catch (e) { results[id] = null; /* eslint-disable-next-line no-console */ console.warn('[kaapi] image failed', id, e && e.message); }
  }
  return results;
}

// ---- helpers ----

// Compute cover-fit destination rect (fills, may crop).
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

function paintBackdrop(ctx, w, h) {
  // The source images already carry their own black + purple lighting.
  // Keep backdrop minimal so we don't double-tint or wash them out.
  ctx.fillStyle = '#050506';
  ctx.fillRect(0, 0, w, h);

  // Very subtle floor accent to bleed into the images' reflections
  const cx = w / 2;
  const fg = ctx.createRadialGradient(cx, h * 0.95, 0, cx, h * 0.95, w * 0.6);
  fg.addColorStop(0.0, 'rgba(139,92,255,0.18)');
  fg.addColorStop(0.5, 'rgba(139,92,255,0.05)');
  fg.addColorStop(1.0, 'rgba(5,5,6,0)');
  ctx.fillStyle = fg;
  ctx.fillRect(0, 0, w, h);
}

function paintVignette(ctx, w, h) {
  const cx = w / 2, cy = h / 2;
  const v = ctx.createRadialGradient(cx, cy, w * 0.35, cx, cy, w * 0.72);
  v.addColorStop(0.0, 'rgba(0,0,0,0)');
  v.addColorStop(0.75, 'rgba(0,0,0,0.4)');
  v.addColorStop(1.0, 'rgba(0,0,0,0.85)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
}

// Ghost act-watermark drawn using 'screen' blend so it only shows in black margins,
// never lighting up the product itself.
function drawWatermark(ctx, w, h, text) {
  if (!text) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(199,173,255,0.09)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${Math.round(w * 0.22)}px "Impact", "Oswald", system-ui, sans-serif`;
  ctx.fillText(text, w / 2, h * 0.5);
  ctx.restore();
}

// Base cover draw (no transforms).
function drawImageCoverCentered(ctx, img, w, h, offsetX = 0, offsetY = 0, scale = 1) {
  const { dw, dh } = coverFit(img.width, img.height, w, h, scale);
  const dx = (w - dw) / 2 + offsetX;
  const dy = (h - dh) / 2 + offsetY;
  ctx.drawImage(img, dx, dy, dw, dh);
}

// ---- per-clip renderers, t in [0,1] ----

export function drawClipFrame(ctx, w, h, clipId, t, images) {
  const clip = KAAPI_CLIPS[clipId];
  if (!clip) return;
  const img = images && images[clip.image];

  paintBackdrop(ctx, w, h);

  // Watermark BEFORE image so it sits in the deep bg, but rendered via 'screen'
  // AFTER image would light the product. Instead we render it now on backdrop only,
  // and then the image (with black bg) will cover most of it — the watermark
  // remains visible in narrow margins around the can. Trade-off is acceptable
  // since the image itself becomes the hero.
  let wmText = '';
  if (clipId === 'deconstruct') wmText = 'BERRY';
  else if (clipId === 'orbit') wmText = 'BREW';
  else if (clipId === 'bridge') wmText = 'PANJIM';
  else if (clipId === 'detail') wmText = 'ORDER';
  drawWatermark(ctx, w, h, wmText);

  if (!img) {
    paintVignette(ctx, w, h);
    return;
  }

  if (clip.kind === 'reveal') {
    // DECONSTRUCT: exploded image with a top-fade gradient that retreats as t→1.
    // At t=0 the top exploded elements are covered by black — only the sealed
    // can shows. As t→1 the top uncovers, revealing lid pop / ice / berries.
    // Slight upward drift on image adds parallax.
    const p = easeOut(t);
    const drift = (1 - p) * h * 0.03;
    drawImageCoverCentered(ctx, img, w, h, 0, drift, 1 + (1 - p) * 0.02);

    // Cover retreats upward. coverBottomY = image can-top area at t=0, then 0.
    const coverBottomY = h * (0.62 - p * 0.62);
    const grad = ctx.createLinearGradient(0, 0, 0, coverBottomY);
    grad.addColorStop(0.0, 'rgba(5,5,6,1)');
    grad.addColorStop(0.75, 'rgba(5,5,6,0.92)');
    grad.addColorStop(1.0, 'rgba(5,5,6,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, coverBottomY);

    // Sparkle motes appearing on top of reveal
    if (p > 0.15) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const motes = 40;
      for (let i = 0; i < motes; i++) {
        const seed = i * 1.37;
        const rx = ((Math.sin(seed * 2.13) + 1) / 2);
        const ry = ((Math.cos(seed * 3.71) + 1) / 2);
        const x = w * (0.15 + rx * 0.70);
        const y = h * (0.05 + ry * (0.55 - (1 - p) * 0.35));
        const r = Math.max(0.6, w * 0.001 * (0.5 + rx));
        ctx.fillStyle = `rgba(199,173,255,${0.25 * p})`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  }

  else if (clip.kind === 'orbit') {
    // Subtle horizontal squeeze to fake a slow product-turntable rotation.
    const angle = t * Math.PI * 2;
    const scaleX = 0.88 + Math.abs(Math.cos(angle)) * 0.12;
    const yaw = Math.sin(angle) * 3; // tiny sway degrees

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(scaleX, 1);
    ctx.rotate((yaw * Math.PI) / 180);
    ctx.translate(-w / 2, -h / 2);
    drawImageCoverCentered(ctx, img, w, h, 0, 0, 1);
    ctx.restore();
  }

  else if (clip.kind === 'bridge') {
    // Ease from off-center + tilt to centered flat — the "camera settles".
    const p = easeInOut(t);
    const offX = (1 - p) * w * 0.08;
    const tilt = (1 - p) * 4;

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate((tilt * Math.PI) / 180);
    ctx.translate(-w / 2, -h / 2);
    drawImageCoverCentered(ctx, img, w, h, offX, 0, 1);
    ctx.restore();
  }

  else if (clip.kind === 'detail') {
    // Macro push-in from 1x to 1.55x with a hair of downward drift.
    const scale = 1 + easeInOut(t) * 0.55;
    const drift = easeOut(t) * h * 0.03;
    drawImageCoverCentered(ctx, img, w, h, 0, drift, scale);

    // Extra specular condensation motes at close range
    if (t > 0.1) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const drops = 50;
      for (let i = 0; i < drops; i++) {
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

  paintVignette(ctx, w, h);
}
