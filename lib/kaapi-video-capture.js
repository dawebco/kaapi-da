// Video-based frame extraction — samples the Kaapi Da MP4 at N timestamps.
// Uses HTMLVideoElement 'seeked' event for cross-browser reliability.
// Same-origin source (served from /public) so canvas never taints.

// Video-based frame extraction — samples the Kaapi Da MP4 at N timestamps.
// Uses HTMLVideoElement 'seeked' + rVFC for reliable frame availability.
// The MP4 is fetched as a blob first (avoids streaming abort in headless browsers)
// and the <video> element is attached to the DOM (hidden) so it actually renders.

let _videoPromise = null;
export function loadVideo(url) {
  if (_videoPromise) return _videoPromise;
  _videoPromise = (async () => {
    if (typeof document === 'undefined') throw new Error('no dom');
    // Fetch the MP4 to a blob first — avoids ERR_ABORTED when a detached
    // <video> tries to stream in headless/preview browsers.
    let blobUrl;
    try {
      const resp = await fetch(url, { cache: 'force-cache' });
      if (!resp.ok) throw new Error('mp4 fetch status ' + resp.status);
      const blob = await resp.blob();
      // eslint-disable-next-line no-console
      console.log('[kaapi] mp4 fetched', blob.size, 'bytes,', blob.type);
      blobUrl = URL.createObjectURL(blob);
    } catch (e) {
      _videoPromise = null;
      // eslint-disable-next-line no-console
      console.error('[kaapi] mp4 fetch failed', e && e.message);
      throw e;
    }

    return new Promise((res, rej) => {
      const v = document.createElement('video');
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      v.autoplay = false;
      v.controls = false;
      v.preload = 'auto';
      v.style.cssText = 'position:fixed;left:-99999px;top:-99999px;width:2px;height:2px;opacity:0;pointer-events:none;';
      document.body.appendChild(v);

      let settled = false;
      const finish = () => { if (settled) return; settled = true; res(v); };
      const onEvent = () => {
        // eslint-disable-next-line no-console
        console.log('[kaapi] video ready state=', v.readyState, 'dur=', v.duration, 'w=', v.videoWidth);
        if (v.readyState >= 2 && isFinite(v.duration) && v.duration > 0) finish();
      };
      const onErr = (e) => {
        if (settled) return; settled = true;
        _videoPromise = null;
        // eslint-disable-next-line no-console
        console.error('[kaapi] video element error', v.error && v.error.code, v.error && v.error.message);
        rej(new Error('Video load failed: ' + (v.error ? v.error.message : 'unknown')));
      };
      v.addEventListener('loadedmetadata', onEvent);
      v.addEventListener('canplay', onEvent);
      v.addEventListener('loadeddata', onEvent);
      v.addEventListener('error', onErr);
      v.src = blobUrl;
      v.load();
      // Safety net
      setTimeout(() => {
        if (!settled) {
          // eslint-disable-next-line no-console
          console.warn('[kaapi] video timeout, forcing finish; readyState=', v.readyState, 'dur=', v.duration);
          if (v.readyState >= 1) finish();
          else onErr();
        }
      }, 6000);
    });
  })();
  return _videoPromise;
}

// Seek + wait until a frame is actually available.
// Uses requestVideoFrameCallback when available for tight timing, else falls back
// to `seeked` + small paint delay.
export const seekTo = (video, t) => new Promise((resolve, reject) => {
  let done = false;
  const finish = () => { if (done) return; done = true; resolve(); };
  const rvfc = typeof video.requestVideoFrameCallback === 'function';

  const onSeeked = () => {
    video.removeEventListener('seeked', onSeeked);
    video.removeEventListener('error', onErr);
    if (rvfc) {
      video.requestVideoFrameCallback(() => finish());
      // safety: rvfc may not fire if the same frame; fallback to raf x2
      setTimeout(() => finish(), 120);
    } else {
      // Two RAFs typically ensures the video texture painted.
      requestAnimationFrame(() => requestAnimationFrame(finish));
    }
  };
  const onErr = () => {
    video.removeEventListener('seeked', onSeeked);
    video.removeEventListener('error', onErr);
    reject(new Error('Seek failed at ' + t));
  };
  video.addEventListener('seeked', onSeeked);
  video.addEventListener('error', onErr);
  try { video.currentTime = t; } catch (e) { reject(e); }
});

// Draw a video frame with cinematic backdrop + ghost watermark + vignette so
// the composed frame is drop-in compatible with the image-based pipeline.
import { drawBackdropVignette, drawGhostWatermark } from './kaapi-frame-decor';

export function composeVideoFrame(ctx, w, h, video, watermarkText) {
  drawBackdropVignette(ctx, w, h, 'backdrop');
  drawGhostWatermark(ctx, w, h, watermarkText);
  // Video is 16:9 like our canvas — cover-fit
  const vAR = (video.videoWidth || 16) / (video.videoHeight || 9);
  const outAR = w / h;
  let dw, dh;
  if (vAR > outAR) { dh = h; dw = h * vAR; } else { dw = w; dh = w / vAR; }
  const dx = (w - dw) / 2;
  const dy = (h - dh) / 2;
  ctx.drawImage(video, dx, dy, dw, dh);
  drawBackdropVignette(ctx, w, h, 'vignette');
}
