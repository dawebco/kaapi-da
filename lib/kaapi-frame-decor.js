// Theme-aware decor helpers.

export function drawBackdropVignette(ctx, w, h, phase, theme) {
  if (phase === 'backdrop') {
    ctx.fillStyle = theme.colors.canvasBg;
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2;
    const [c0, c1, c2] = theme.colors.backdropRadial;
    const fg = ctx.createRadialGradient(cx, h * 0.95, 0, cx, h * 0.95, w * 0.6);
    fg.addColorStop(0.0, c0);
    fg.addColorStop(0.5, c1);
    fg.addColorStop(1.0, c2);
    ctx.fillStyle = fg;
    ctx.fillRect(0, 0, w, h);
  } else if (phase === 'vignette') {
    const cx = w / 2, cy = h / 2;
    const [v0, v1, v2] = theme.colors.vignette;
    const v = ctx.createRadialGradient(cx, cy, w * 0.35, cx, cy, w * 0.72);
    v.addColorStop(0.0, v0);
    v.addColorStop(0.75, v1);
    v.addColorStop(1.0, v2);
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  }
}

export function drawGhostWatermark(ctx, w, h, text, theme) {
  if (!text) return;
  ctx.save();
  ctx.globalCompositeOperation = theme.id === 'dark' ? 'screen' : 'multiply';
  ctx.fillStyle = theme.colors.watermarkColor;
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
