// Canvas draw helpers — object-fit: cover semantics + centered can composition.

export const fitCover = (srcW, srcH, dstW, dstH) => {
  const srcRatio = srcW / srcH;
  const dstRatio = dstW / dstH;
  let w, h, x, y;
  if (srcRatio > dstRatio) {
    // src is wider — fit by height
    h = dstH; w = h * srcRatio;
    x = (dstW - w) / 2; y = 0;
  } else {
    w = dstW; h = w / srcRatio;
    x = 0; y = (dstH - h) / 2;
  }
  return { x, y, w, h };
};

export const drawFrame = (ctx, bitmap, dstW, dstH) => {
  if (!bitmap) return;
  const sw = bitmap.width || bitmap.videoWidth || dstW;
  const sh = bitmap.height || bitmap.videoHeight || dstH;
  const { x, y, w, h } = fitCover(sw, sh, dstW, dstH);
  ctx.clearRect(0, 0, dstW, dstH);
  ctx.drawImage(bitmap, x, y, w, h);
};

export const resizeCanvasToDisplay = (canvas) => {
  if (!canvas) return { changed: false };
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.floor(window.innerWidth * dpr);
  const h = Math.floor(window.innerHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    return { changed: true, w, h, dpr };
  }
  return { changed: false, w, h, dpr };
};
