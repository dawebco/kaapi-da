// Procedural blueberry-purple can renderer.
// Generates the 4 base clips (deconstruct, orbit, bridge, detail) frame-by-frame
// as WebP blobs so the same IndexedDB / scroll-engine pipeline can consume them.
// When real MP4 renders arrive in Phase 7, swap kaapi-frame-capture.js back
// to video-seek mode; components + engine stay the same.

import { KAAPI_THEME } from './kaapi-assets';

const C = KAAPI_THEME.colors;

// ----- easings -----
const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
// (easeIn removed - unused)

// ----- shared drawing primitives -----

function paintBackdrop(ctx, w, h) {
  // Deep near-black base
  ctx.fillStyle = '#070708';
  ctx.fillRect(0, 0, w, h);

  // Center glow
  const cx = w / 2, cy = h * 0.55;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.55);
  g.addColorStop(0.00, 'rgba(124,77,255,0.55)');
  g.addColorStop(0.25, 'rgba(75,30,184,0.28)');
  g.addColorStop(0.65, 'rgba(20,10,40,0.10)');
  g.addColorStop(1.00, 'rgba(7,7,8,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Floor glow (ellipse near bottom)
  const fg = ctx.createRadialGradient(cx, h * 0.88, 10, cx, h * 0.88, w * 0.45);
  fg.addColorStop(0.0, 'rgba(183,156,255,0.35)');
  fg.addColorStop(0.4, 'rgba(124,77,255,0.15)');
  fg.addColorStop(1.0, 'rgba(7,7,8,0)');
  ctx.fillStyle = fg;
  ctx.fillRect(0, 0, w, h);
}

function paintVignette(ctx, w, h) {
  const cx = w / 2, cy = h / 2;
  const v = ctx.createRadialGradient(cx, cy, w * 0.25, cx, cy, w * 0.65);
  v.addColorStop(0.0, 'rgba(0,0,0,0)');
  v.addColorStop(0.75, 'rgba(0,0,0,0.35)');
  v.addColorStop(1.0, 'rgba(0,0,0,0.85)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
}

// Draw a stylized coffee can centered at (cx, cy) with can-space width canW, height canH.
// opts: { rotationY (-1..1 fake horizontal turn), highlightShift (0..1), condensation (0..1),
//         labelOpacity (0..1), scale, tiltDeg }
function drawCan(ctx, cx, cy, canW, canH, opts = {}) {
  const {
    rotationY = 0,
    highlightShift = 0.5,
    condensation = 0.35,
    labelOpacity = 1,
    scale = 1,
    tiltDeg = 0,
  } = opts;

  const w = canW * scale;
  const h = canH * scale;
  const left = cx - w / 2;
  const top = cy - h / 2;
  const radius = w * 0.10;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((tiltDeg * Math.PI) / 180);
  ctx.translate(-cx, -cy);

  // Ground shadow
  ctx.save();
  const shG = ctx.createRadialGradient(cx, top + h + h * 0.05, 5, cx, top + h + h * 0.05, w * 0.9);
  shG.addColorStop(0, 'rgba(0,0,0,0.75)');
  shG.addColorStop(0.6, 'rgba(0,0,0,0.15)');
  shG.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shG;
  ctx.beginPath();
  ctx.ellipse(cx, top + h + h * 0.06, w * 0.65, h * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Can body — rounded rect with side-shaded gradient
  const bodyG = ctx.createLinearGradient(left, 0, left + w, 0);
  // rotationY shifts highlight/shadow horizontally
  const shift = (rotationY + 1) / 2; // 0..1
  const hl = Math.min(1, Math.max(0, shift * 0.6 + 0.2));
  bodyG.addColorStop(0.00, shadeMix(C.accentDeep, C.accent, 1 - hl));
  bodyG.addColorStop(hl, C.accentSoft);
  bodyG.addColorStop(Math.min(1, hl + 0.15), C.accent);
  bodyG.addColorStop(1.00, C.accentDeep);

  ctx.fillStyle = bodyG;
  roundRect(ctx, left, top, w, h, radius);
  ctx.fill();

  // Top vertical sheen
  const sheen = ctx.createLinearGradient(0, top, 0, top + h);
  sheen.addColorStop(0.0, 'rgba(255,255,255,0.30)');
  sheen.addColorStop(0.15, 'rgba(255,255,255,0.05)');
  sheen.addColorStop(0.85, 'rgba(0,0,0,0.10)');
  sheen.addColorStop(1.0, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = sheen;
  roundRect(ctx, left, top, w, h, radius);
  ctx.fill();

  // Left highlight streak (moves with rotationY)
  const hlX = left + w * (0.10 + highlightShift * 0.55);
  const streak = ctx.createLinearGradient(hlX - w * 0.05, 0, hlX + w * 0.05, 0);
  streak.addColorStop(0, 'rgba(255,255,255,0)');
  streak.addColorStop(0.5, 'rgba(255,255,255,0.28)');
  streak.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = streak;
  roundRect(ctx, left, top + h * 0.05, w, h * 0.9, radius);
  ctx.fill();

  // Can top rim — metallic silver ellipse
  const rimH = h * 0.06;
  const rimG = ctx.createLinearGradient(0, top - rimH * 0.6, 0, top + rimH * 0.6);
  rimG.addColorStop(0.0, '#c9c7d0');
  rimG.addColorStop(0.5, '#f4f2f9');
  rimG.addColorStop(1.0, '#7d7a86');
  ctx.fillStyle = rimG;
  ctx.beginPath();
  ctx.ellipse(cx, top, w / 2, rimH * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pull tab hint
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx + w * 0.08, top - rimH * 0.05, w * 0.08, rimH * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Label — KAAPI DA + Berry Bolt
  if (labelOpacity > 0.01) {
    ctx.save();
    ctx.globalAlpha = labelOpacity;
    // dark label plate slight inset
    ctx.fillStyle = 'rgba(15,8,35,0.35)';
    roundRect(ctx, left + w * 0.10, top + h * 0.32, w * 0.80, h * 0.36, w * 0.03);
    ctx.fill();

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${Math.round(w * 0.14)}px "Impact", "Oswald", system-ui, sans-serif`;
    ctx.fillText('KAAPI DA', cx, top + h * 0.46);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = Math.max(1, w * 0.005);
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.22, top + h * 0.54);
    ctx.lineTo(cx + w * 0.22, top + h * 0.54);
    ctx.stroke();

    // Flavor
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.font = `500 ${Math.round(w * 0.055)}px system-ui, sans-serif`;
    ctx.fillText('BERRY BOLT', cx, top + h * 0.60);

    // Volume
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `500 ${Math.round(w * 0.04)}px system-ui, sans-serif`;
    ctx.fillText('COLD FILTER · 250ml', cx, top + h * 0.66);

    ctx.restore();
  }

  // Condensation drops
  if (condensation > 0.02) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, condensation);
    const seed = 42;
    const drops = Math.floor(24 + condensation * 40);
    for (let i = 0; i < drops; i++) {
      const r1 = pseudoRand(seed + i * 3.11);
      const r2 = pseudoRand(seed + i * 7.77);
      const r3 = pseudoRand(seed + i * 11.31);
      const dx = left + w * (0.08 + r1 * 0.84);
      const dy = top + h * (0.10 + r2 * 0.82);
      const dr = Math.max(1.2, w * (0.004 + r3 * 0.012));
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.arc(dx, dy, dr, 0, Math.PI * 2);
      ctx.fill();
      // subtle drip shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.arc(dx + dr * 0.3, dy + dr * 0.3, dr * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Bottom rim shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  roundRect(ctx, left, top + h - h * 0.04, w, h * 0.04, radius);
  ctx.fill();

  ctx.restore();
}

// ----- helpers -----

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function shadeMix(a, b, t) {
  // Mix two hex colors
  const pa = hexToRgb(a), pb = hexToRgb(b);
  const r = Math.round(pa.r + (pb.r - pa.r) * t);
  const g = Math.round(pa.g + (pb.g - pa.g) * t);
  const bl = Math.round(pa.b + (pb.b - pa.b) * t);
  return `rgb(${r},${g},${bl})`;
}
function hexToRgb(hex) {
  const s = hex.replace('#', '');
  const n = parseInt(s.length === 3 ? s.split('').map(c => c + c).join('') : s, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// Deterministic pseudo-random for stable frames
function pseudoRand(x) {
  const s = Math.sin(x * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

// Floating berry
function drawBerry(ctx, x, y, r) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, '#B79CFF');
  g.addColorStop(0.4, '#7C4DFF');
  g.addColorStop(1, '#2A1266');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  // highlight
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y - r * 0.4, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
}

// Coffee droplet
function drawDroplet(ctx, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.4, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#8b5a3c');
  g.addColorStop(0.5, '#4a2a1c');
  g.addColorStop(1, '#20120a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.4);
  ctx.bezierCurveTo(r, -r * 0.6, r, r * 0.7, 0, r);
  ctx.bezierCurveTo(-r, r * 0.7, -r, -r * 0.6, 0, -r * 1.4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.arc(-r * 0.3, -r * 0.5, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ----- per-clip renderers, t in [0,1] -----

export function drawClipFrame(ctx, w, h, clipId, t) {
  paintBackdrop(ctx, w, h);

  const cx = w / 2;
  const cy = h * 0.55;
  const baseCanW = Math.min(w * 0.22, h * 0.55);
  const baseCanH = baseCanW * 2.1;

  if (clipId === 'deconstruct') {
    // Can splits into 4 vertical slices flying outward, orbiting berries + droplets emerge
    const spread = easeOut(t) * baseCanW * 1.4;
    const rotation = t * 4;
    const slices = 4;
    for (let i = 0; i < slices; i++) {
      const localX = (i - (slices - 1) / 2) * (baseCanW / slices);
      const outward = (i - (slices - 1) / 2) * spread * 0.6;
      const rot = ((i % 2 === 0) ? 1 : -1) * rotation * 4;
      ctx.save();
      // Clip a vertical stripe of the can drawn at (cx + outward, cy)
      const stripeX = cx + outward + localX * 0.15;
      const stripeW = baseCanW / slices + 1;
      // Draw entire can then clip to stripe. Simpler: draw stripe as a rectangle chunk of the same gradient.
      // We'll approximate by drawing a slim can-slice-shape
      ctx.translate(stripeX, cy);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.translate(-stripeX, -cy);
      drawCan(ctx, stripeX, cy, stripeW * 4, baseCanH, {
        rotationY: (i - 1.5) / 2,
        highlightShift: 0.5,
        condensation: 0.15,
        labelOpacity: Math.max(0, 1 - t * 1.6),
        scale: 1,
      });
      // mask stripe area by drawing a black column outside
      ctx.restore();
    }
    // Floating berries
    const berries = 9;
    for (let i = 0; i < berries; i++) {
      const angle = (i / berries) * Math.PI * 2 + t * Math.PI;
      const r = baseCanW * (0.6 + easeOut(t) * 1.2);
      const bx = cx + Math.cos(angle) * r;
      const by = cy + Math.sin(angle) * r * 0.55;
      drawBerry(ctx, bx, by, baseCanW * 0.055 * (0.7 + 0.5 * pseudoRand(i)));
    }
    // Coffee droplets
    const drops = 12;
    for (let i = 0; i < drops; i++) {
      const angle = (i / drops) * Math.PI * 2 - t * Math.PI * 0.7;
      const r = baseCanW * (0.35 + easeOut(t) * 1.5);
      const dx = cx + Math.cos(angle) * r * 1.15;
      const dy = cy + Math.sin(angle) * r * 0.4;
      drawDroplet(ctx, dx, dy, baseCanW * 0.03);
    }
  }

  else if (clipId === 'orbit') {
    // Can rotates 360° (fake) — rotationY sweeps -1..1..-1, scaleX slight breathing
    const angle = t * Math.PI * 2;
    const rotY = Math.sin(angle);
    const scaleX = 0.86 + Math.abs(Math.cos(angle)) * 0.14;
    // draw slim ambient ring
    ctx.save();
    ctx.strokeStyle = 'rgba(124,77,255,0.20)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy + baseCanH * 0.55, baseCanW * 1.4, baseCanW * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scaleX, 1);
    ctx.translate(-cx, -cy);
    drawCan(ctx, cx, cy, baseCanW, baseCanH, {
      rotationY: rotY,
      highlightShift: (rotY + 1) / 2,
      condensation: 0.30,
      // Label fades when back of can shows
      labelOpacity: Math.max(0, Math.cos(angle)),
      scale: 1,
      tiltDeg: 0,
    });
    ctx.restore();

    // secondary orbiting berries
    for (let i = 0; i < 5; i++) {
      const a = angle + (i / 5) * Math.PI * 2;
      const r = baseCanW * 1.7;
      const bx = cx + Math.cos(a) * r;
      const by = cy + Math.sin(a) * r * 0.28;
      drawBerry(ctx, bx, by, baseCanW * 0.05);
    }
  }

  else if (clipId === 'bridge') {
    // Camera pans back from orbit angle to center, subtle location watermark
    const rotY = (1 - easeInOut(t)) * -0.7;
    const tilt = (1 - easeInOut(t)) * -6;
    const offX = (1 - easeInOut(t)) * baseCanW * 0.35;

    // Watermark PANJIM
    ctx.save();
    ctx.globalAlpha = easeOut(t) * 0.10;
    ctx.fillStyle = C.accentSoft;
    ctx.textAlign = 'center';
    ctx.font = `700 ${Math.round(w * 0.14)}px "Impact", "Oswald", system-ui, sans-serif`;
    ctx.fillText('PANJIM', cx, cy);
    ctx.restore();

    drawCan(ctx, cx + offX, cy, baseCanW, baseCanH, {
      rotationY: rotY,
      highlightShift: (rotY + 1) / 2,
      condensation: 0.32,
      labelOpacity: Math.min(1, 0.3 + easeInOut(t) * 0.9),
      scale: 1,
      tiltDeg: tilt,
    });
  }

  else if (clipId === 'detail') {
    // Macro push-in: scale grows, condensation increases, embossed text sharpens
    const scale = 1 + easeInOut(t) * 0.9;
    const cond = 0.3 + easeOut(t) * 0.7;
    // Slight vertical drift to feel like camera push
    const drift = (t - 0.5) * baseCanH * 0.05;
    drawCan(ctx, cx, cy + drift, baseCanW, baseCanH, {
      rotationY: 0.05,
      highlightShift: 0.55,
      condensation: cond,
      labelOpacity: 1,
      scale,
      tiltDeg: 0,
    });
  }

  paintVignette(ctx, w, h);
}
