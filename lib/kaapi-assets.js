// Kaapi Da — Blueberry-Purple SKU theme + segment/asset configuration.
// Structured so future flavor launches can swap this file only, not engine code.

export const KAAPI_CACHE = {
  db: 'kaapi-scroll',
  store: 'frames',
  version: 'v1.0.0-blueberry',
};

export const KAAPI_THEME = {
  sku: 'blueberry-purple',
  label: 'Blueberry-Purple',
  flavorBadge: 'Berry Bolt',
  productTitle: 'Kaapi Da! Bean to Heart',
  colors: {
    bg: '#070708',
    accent: '#7C4DFF',        // sampled blueberry-purple
    accentDeep: '#4B1EB8',
    accentSoft: '#B79CFF',
    ink: '#FDFCFF',
    inkMuted: '#B7B4C4',
  },
  glow: {
    center: 'radial-gradient(circle at 50% 55%, rgba(124,77,255,0.45) 0%, rgba(75,30,184,0.20) 30%, rgba(7,7,8,0.0) 70%)',
    floor: 'radial-gradient(ellipse at 50% 88%, rgba(124,77,255,0.55) 0%, rgba(124,77,255,0.15) 25%, rgba(7,7,8,0) 60%)',
    vignette: 'radial-gradient(circle at 50% 50%, rgba(7,7,8,0) 40%, rgba(7,7,8,0.55) 75%, rgba(7,7,8,0.95) 100%)',
  },
};

// Placeholder public CDN MP4s (CORS-enabled Google sample bucket).
// These will be swapped in Phase 7 for the final rendered cinematic clips.
export const KAAPI_CLIPS = {
  deconstruct: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  orbit:       'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  bridge:      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  detail:      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
};

// Frames captured per clip (32 keeps first-load capture < ~6s while feeling smooth).
export const FRAMES_PER_CLIP = 32;

// Six timeline segments. Acts 2 and 6 REUSE frames from acts 1 and 5 in reverse.
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
    headline: 'Kaapi Da! Bean to Heart',
    sub: 'A bold cold-filter coffee, reimagined in blueberry-purple. Pressed, chilled, and poured with intention.',
  },
  ingredients: {
    eyebrow: 'INGREDIENTS',
    headline: 'Filter. Ice. Berry.',
    sub: 'South-Indian filter coffee notes meet cold-pressed blueberries. Nothing artificial, no shortcuts.',
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
  },
  order: {
    eyebrow: 'THE ORDER',
    headline: 'One tap on Swiggy.',
    sub: 'Chilled, sealed, and on its way. Delivered across central Goa.',
    cta: 'Order on Swiggy',
  },
  outro: {
    eyebrow: 'THE REVEAL',
    headline: 'Bean to Heart.',
    sub: 'That is the whole thing. See you on the next flavor.',
  },
};

export default {
  KAAPI_CACHE,
  KAAPI_THEME,
  KAAPI_CLIPS,
  KAAPI_SEGMENTS,
  KAAPI_LINKS,
  KAAPI_COPY,
  FRAMES_PER_CLIP,
};
