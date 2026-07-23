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
const FEATHER = 0.03; // 3% of total scroll — soft blend zone

// Two segments are "visually equivalent" when scrubbing across their boundary
// would show effectively the same source (e.g., orbit/bridge/detail all draw
// the intact-can PNG with different transforms). Blending two visually-equivalent
// segments produces a ghost/double-image, so we skip the crossfade there.
const IMAGE_CLIPS = new Set(['orbit', 'bridge', 'detail']);
const sameVisualSource = (a, b) => IMAGE_CLIPS.has(a) && IMAGE_CLIPS.has(b);

export const resolveFrameBlend = (progress) => {
  const p = Math.min(1, Math.max(0, progress));
  const seg = pickSegment(p);
  const primary = segmentFrame(seg, p);

  const distStart = p - seg.start;
  const distEnd = seg.end - p;

  if (distStart < FEATHER && seg.start > 0) {
    const leftSeg = KAAPI_SEGMENTS[KAAPI_SEGMENTS.indexOf(seg) - 1];
    if (leftSeg && leftSeg.clip !== seg.clip && !sameVisualSource(leftSeg.clip, seg.clip)) {
      const leftFrame = segmentFrame(leftSeg, leftSeg.end);
      const t = distStart / FEATHER;
      // Ease the blend curve for a softer optical transition.
      const eased = 1 - Math.pow(1 - t, 2);
      return { primary, secondary: leftFrame, blend: 1 - eased };
    }
  }
  if (distEnd < FEATHER && seg.end < 1) {
    const rightSeg = KAAPI_SEGMENTS[KAAPI_SEGMENTS.indexOf(seg) + 1];
    if (rightSeg && rightSeg.clip !== seg.clip && !sameVisualSource(rightSeg.clip, seg.clip)) {
      const rightFrame = segmentFrame(rightSeg, rightSeg.start);
      const t = distEnd / FEATHER;
      const eased = 1 - Math.pow(1 - t, 2);
      return { primary, secondary: rightFrame, blend: 1 - eased };
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
