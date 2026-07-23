// Maps normalized scroll progress (0..1) to segment + exact frame index.
// Adds `resolveFrameBlend` for cross-fade rendering near segment boundaries.

import { KAAPI_SEGMENTS, FRAMES_PER_CLIP } from './kaapi-assets';

export const getScrollProgress = () => {
  if (typeof window === 'undefined') return 0;
  const doc = document.documentElement;
  const total = (doc.scrollHeight - window.innerHeight) || 1;
  const y = window.scrollY || window.pageYOffset || 0;
  return Math.min(1, Math.max(0, y / total));
};

const pickSegment = (p) => {
  let seg = KAAPI_SEGMENTS[0];
  for (let i = 0; i < KAAPI_SEGMENTS.length; i++) {
    const s = KAAPI_SEGMENTS[i];
    if (p >= s.start && p <= s.end) { seg = s; break; }
    if (i === KAAPI_SEGMENTS.length - 1) seg = s;
  }
  return seg;
};

const segmentFrame = (seg, p) => {
  const localT = (p - seg.start) / Math.max(0.0001, (seg.end - seg.start));
  const clamped = Math.min(1, Math.max(0, localT));
  const forwardIdx = Math.round(clamped * (FRAMES_PER_CLIP - 1));
  const idx = seg.reverse ? (FRAMES_PER_CLIP - 1 - forwardIdx) : forwardIdx;
  return { segment: seg, clipId: seg.clip, index: idx, localT: clamped };
};

export const resolveFrame = (progress) => {
  const p = Math.min(1, Math.max(0, progress));
  const seg = pickSegment(p);
  return { ...segmentFrame(seg, p), progress: p };
};

// Returns { primary, secondary?, blend } where blend is the opacity for secondary (0..1).
// Blend is > 0 only when we are within FEATHER% of a boundary between DIFFERENT clips.
const FEATHER = 0.025; // 2.5% of total scroll
export const resolveFrameBlend = (progress) => {
  const p = Math.min(1, Math.max(0, progress));
  const seg = pickSegment(p);
  const primary = segmentFrame(seg, p);

  // Distance to seg boundaries
  const distStart = p - seg.start;
  const distEnd = seg.end - p;

  // Check left neighbour boundary
  if (distStart < FEATHER && seg.start > 0) {
    const leftSeg = KAAPI_SEGMENTS[KAAPI_SEGMENTS.indexOf(seg) - 1];
    if (leftSeg && leftSeg.clip !== seg.clip) {
      // We're just entering `seg` from `leftSeg`
      const leftFrame = segmentFrame(leftSeg, leftSeg.end);
      const t = distStart / FEATHER; // 0 at boundary, 1 at FEATHER
      // At boundary, primary alpha is small (t), secondary (leftSeg last) is high (1-t)
      return { primary, secondary: leftFrame, blend: 1 - t };
    }
  }
  // Right neighbour boundary
  if (distEnd < FEATHER && seg.end < 1) {
    const rightSeg = KAAPI_SEGMENTS[KAAPI_SEGMENTS.indexOf(seg) + 1];
    if (rightSeg && rightSeg.clip !== seg.clip) {
      const rightFrame = segmentFrame(rightSeg, rightSeg.start);
      const t = distEnd / FEATHER;
      return { primary, secondary: rightFrame, blend: 1 - t };
    }
  }
  return { primary, secondary: null, blend: 0 };
};

export const activeActIndex = (progress) => {
  const { segment } = resolveFrame(progress);
  return segment.act;
};

// Anchor for programmatic snap: mid-point of a given act (1..6).
export const getActAnchor = (actNum) => {
  const seg = KAAPI_SEGMENTS.find((s) => s.act === actNum) || KAAPI_SEGMENTS[0];
  return (seg.start + seg.end) / 2;
};
