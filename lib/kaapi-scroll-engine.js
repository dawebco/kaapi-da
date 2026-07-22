// Maps normalized scroll progress (0..1) to segment + exact frame index.

import { KAAPI_SEGMENTS, FRAMES_PER_CLIP } from './kaapi-assets';

export const getScrollProgress = () => {
  if (typeof window === 'undefined') return 0;
  const doc = document.documentElement;
  const total = (doc.scrollHeight - window.innerHeight) || 1;
  const y = window.scrollY || window.pageYOffset || 0;
  return Math.min(1, Math.max(0, y / total));
};

export const resolveFrame = (progress) => {
  const p = Math.min(1, Math.max(0, progress));
  let seg = KAAPI_SEGMENTS[0];
  for (let i = 0; i < KAAPI_SEGMENTS.length; i++) {
    const s = KAAPI_SEGMENTS[i];
    if (p >= s.start && p <= s.end) { seg = s; break; }
    if (i === KAAPI_SEGMENTS.length - 1) seg = s;
  }
  const localT = (p - seg.start) / Math.max(0.0001, (seg.end - seg.start));
  const clamped = Math.min(1, Math.max(0, localT));
  const forwardIdx = Math.round(clamped * (FRAMES_PER_CLIP - 1));
  const idx = seg.reverse ? (FRAMES_PER_CLIP - 1 - forwardIdx) : forwardIdx;
  return { segment: seg, clipId: seg.clip, index: idx, localT: clamped, progress: p };
};

export const activeActIndex = (progress) => {
  const { segment } = resolveFrame(progress);
  return segment.act; // 1..6
};
