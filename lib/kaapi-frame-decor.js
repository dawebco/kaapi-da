// Shared decor helpers for both video-based and image-based frame composers.

export function drawBackdropVignette(ctx, w, h, phase) {
  if (phase === 'backdrop') {
    ctx.fillStyle = '#050506';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const fg = ctx.createRadialGradient(cx, h * 0.95, 0, cx, h * 0.95, w * 0.6);
    fg.addColorStop(0.0, 'rgba(139,92,255,0.18)');
    fg.addColorStop(0.5, 'rgba(139,92,255,0.05)');
    fg.addColorStop(1.0, 'rgba(5,5,6,0)');
    ctx.fillStyle = fg;
    ctx.fillRect(0, 0, w, h);
  } else if (phase === 'vignette') {
    const cx = w / 2, cy = h / 2;
    const v = ctx.createRadialGradient(cx, cy, w * 0.35, cx, cy, w * 0.72);
    v.addColorStop(0.0, 'rgba(0,0,0,0)');
    v.addColorStop(0.75, 'rgba(0,0,0,0.4)');
    v.addColorStop(1.0, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  }
}

export function drawGhostWatermark(ctx, w, h, text) {
  if (!text) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = 'rgba(199,173,255,0.09)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${Math.round(w * 0.22)}px "Impact", "Oswald", system-ui, sans-serif`;
  ctx.fillText(text, w / 2, h * 0.5);
  ctx.restore();
}

export function pickWatermark(clipId) {
  if (clipId === 'deconstruct') return 'BERRY';
  if (clipId === 'orbit')       return 'BREW';
  if (clipId === 'bridge')      return 'PANJIM';
  if (clipId === 'detail')      return 'ORDER';
  return '';
}
