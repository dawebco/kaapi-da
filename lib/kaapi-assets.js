// Kaapi Da — Blueberry-Purple SKU theme + segment/asset configuration.

export const KAAPI_CACHE = {
  db: 'kaapi-scroll',
  store: 'frames',
  version: 'v1.5.0-kaapi-preextracted',
};

export const KAAPI_THEME = {
  sku: 'blueberry-purple',
  label: 'Blueberry-Purple',
  flavorBadge: 'Berry Bolt',
  volume: '250ML',
  productTitle: 'Kaapi Da! Bean to Heart',
  colors: {
    bg: '#050506',
    accent: '#8B5CFF',
    accentDeep: '#3D179B',
    accentSoft: '#C7ADFF',
    ink: '#FDFCFF',
    inkMuted: '#B7B4C4',
  },
  glow: {
    floor: 'radial-gradient(ellipse at 50% 90%, rgba(139,92,255,0.28) 0%, rgba(139,92,255,0.06) 25%, rgba(5,5,6,0) 60%)',
    vignette: 'radial-gradient(circle at 50% 50%, rgba(5,5,6,0) 45%, rgba(5,5,6,0.55) 78%, rgba(5,5,6,0.95) 100%)',
  },
};

// Pre-extracted WebP frames from the cinematic Kaapi Da MP4 render.
// Extracted server-side with ffmpeg (fps=32/10, scale=1600w, quality=85).
// Chromium codec issues (H.264 missing in preview builds) are bypassed entirely.
export const KAAPI_FRAMES = {
  deconstruct: {
    baseUrl: '/kaapi/frames/decon_',   // decon_01.webp .. decon_32.webp
    count: 32,
    padDigits: 2,
    startIndex: 1,
  },
};

// Pristine can PNG for the calmer acts.
export const KAAPI_IMAGES = {
  intact: '/kaapi/exploded.png',
};

// Clip config — declares source + kind.
export const KAAPI_CLIPS = {
  deconstruct: { source: 'frames', frameSet: 'deconstruct', kind: 'frames' },
  orbit:       { source: 'image',  image: 'intact', kind: 'orbit'  },
  bridge:      { source: 'image',  image: 'intact', kind: 'bridge' },
  detail:      { source: 'image',  image: 'intact', kind: 'detail' },
};

export const FRAMES_PER_CLIP = 32;

export const KAAPI_SEGMENTS = [
  { id: 'deconstruct', act: 1, start: 0.00, end: 0.17, clip: 'deconstruct', reverse: false, label: 'Deconstruct' },
  { id: 'reassemble', act: 2, start: 0.17, end: 0.34, clip: 'deconstruct', reverse: true,  label: 'Reassemble' },
  { id: 'orbit',      act: 3, start: 0.34, end: 0.51, clip: 'orbit',       reverse: false, label: 'Orbit' },
  { id: 'bridge',     act: 4, start: 0.51, end: 0.66, clip: 'bridge',      reverse: false, label: 'Bridge' },
  { id: 'detail',     act: 5, start: 0.66, end: 0.83, clip: 'detail',      reverse: false, label: 'Detail' },
  { id: 'reveal',     act: 6, start: 0.83, end: 1.00, clip: 'detail',      reverse: true,  label: 'Reveal' },
];

export const KAAPI_LINKS = {
  swiggy: 'https://www.swiggy.com/city/central-goa/kaapi-da-panaji-rest1365857',
  instagramMain: 'https://instagram.com/kaapi_da',
  instagramSister: 'https://instagram.com/dosa_and_podi',
  utm: '?utm_source=kaapi-landing&utm_medium=scroll-cinema&utm_campaign=berry-bolt',
};

export const KAAPI_COPY = {
  hero: {
    eyebrow: 'BERRY BOLT · GOA',
    headline: 'Kaapi Da!',
    headlineB: 'Bean to Heart',
    sub: 'A bold cold-filter coffee, reimagined in blueberry-purple. Pressed, chilled, poured with intention.',
  },
  ingredients: {
    eyebrow: 'INGREDIENTS',
    headline: 'Filter. Ice. Berry.',
    sub: 'South-Indian filter coffee notes meet cold-pressed blueberries. Nothing artificial, no shortcuts.',
    watermark: 'BERRY',
    cards: [
      { title: 'Filter Coffee', body: 'Slow-brewed South-Indian filter decoction — earthy, deep, unmistakable.' },
      { title: 'Cold-Pressed Berries', body: 'Wild blueberries cold-pressed for a bright, tart top-note.' },
      { title: 'Crushed Ice', body: 'Micro-crushed to keep dilution slow and body thick.' },
    ],
  },
  brew: {
    eyebrow: 'THE BREW',
    headline: 'Craft. Chill. Build.',
    sub: 'Three moves. That is the whole show.',
    watermark: 'BREW',
    cols: [
      { k: '01', title: 'Craft', body: 'A double-strength filter decoction, rested overnight.' },
      { k: '02', title: 'Chill', body: 'Snap-chilled to lock aroma before the berry press arrives.' },
      { k: '03', title: 'Build', body: 'Layered in the can — coffee, berry, condensation, seal.' },
    ],
  },
  drop: {
    eyebrow: 'THE DROP',
    headline: 'Find us in Panjim.',
    sub: 'Opposite Cafe Bhosle. Walk in, or tap the order button.',
    address: 'Opposite Cafe Bhosle, Panjim, Goa',
    watermark: 'PANJIM',
  },
  order: {
    eyebrow: 'THE ORDER',
    headline: 'One tap.',
    headlineB: 'On Swiggy.',
    sub: 'Chilled, sealed, and on its way. Delivered across central Goa.',
    cta: 'Order on Swiggy',
    watermark: 'ORDER',
  },
  outro: {
    eyebrow: 'THE REVEAL',
    headline: 'Bean to Heart.',
    sub: 'That is the whole thing. See you on the next flavor.',
    watermark: 'KAAPI',
  },
};

export default {
  KAAPI_CACHE,
  KAAPI_THEME,
  KAAPI_FRAMES,
  KAAPI_IMAGES,
  KAAPI_CLIPS,
  KAAPI_SEGMENTS,
  KAAPI_LINKS,
  KAAPI_COPY,
  FRAMES_PER_CLIP,
};
