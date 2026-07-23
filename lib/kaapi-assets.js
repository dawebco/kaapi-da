// Kaapi Da — assets + dual-theme (dark/light) config.

export const KAAPI_CACHE = {
  db: 'kaapi-scroll',
  store: 'frames',
  version: 'v1.7.0-kaapi-light-mp4',
};

export const KAAPI_LINKS = {
  swiggy: 'https://www.swiggy.com/city/central-goa/kaapi-da-panaji-rest1365857',
  instagramMain: 'https://instagram.com/kaapi_da',
  instagramSister: 'https://instagram.com/dosa_and_podi',
  utm: '?utm_source=kaapi-landing&utm_medium=scroll-cinema',
};

export const KAAPI_LOGO = '/kaapi/logo.jpg';

// Dark = blueberry-purple SKU with the real MP4-derived frames.
// Light = cream/coffee SKU using static PNG hero art with masked reveal.
export const KAAPI_THEMES = {
  dark: {
    id: 'dark',
    label: 'Dark · Blueberry',
    productTitle: 'Kaapi Da! Bean to Heart',
    colors: {
      bg: '#050506',
      ink: '#FDFCFF',
      inkMuted: '#B7B4C4',
      accent: '#8B5CFF',
      accentDeep: '#3D179B',
      accentSoft: '#C7ADFF',
      surface: 'rgba(255,255,255,0.04)',
      border: 'rgba(255,255,255,0.10)',
      watermarkColor: 'rgba(199,173,255,0.09)',
      canvasBg: '#050506',
      backdropRadial: ['rgba(139,92,255,0.28)', 'rgba(139,92,255,0.06)', 'rgba(5,5,6,0)'],
      vignette: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.40)', 'rgba(0,0,0,0.85)'],
    },
    images: { intact: '/kaapi/exploded.png' },
    clips: {
      deconstruct: { source: 'frames', frameSet: 'deconstructDark', kind: 'frames' },
      orbit:       { source: 'image',  image: 'intact', kind: 'orbit'  },
      bridge:      { source: 'image',  image: 'intact', kind: 'bridge' },
      detail:      { source: 'image',  image: 'intact', kind: 'detail' },
    },
    frames: {
      deconstructDark: { baseUrl: '/kaapi/frames/decon_', count: 32, padDigits: 2, startIndex: 1 },
    },
  },
  light: {
    id: 'light',
    label: 'Light · Cream',
    productTitle: 'Kaapi Da! Bean to Heart',
    colors: {
      bg: '#FFFFFF',
      ink: '#1B1710',
      inkMuted: '#5C4F3F',
      accent: '#8A5A3C',
      accentDeep: '#4A2A15',
      accentSoft: '#C9A98A',
      surface: 'rgba(74,42,21,0.04)',
      border: 'rgba(74,42,21,0.12)',
      watermarkColor: 'rgba(74,42,21,0.08)',
      canvasBg: '#FFFFFF',
      backdropRadial: ['rgba(201,169,138,0.14)', 'rgba(138,90,60,0.04)', 'rgba(255,255,255,0)'],
      vignette: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.55)'],
    },
    images: { intact: '/kaapi/cream-intact.png', exploded: '/kaapi/cream-exploded.png' },
    clips: {
      deconstruct: { source: 'frames', frameSet: 'deconstructLight', kind: 'frames' },
      orbit:       { source: 'image',  image: 'intact', kind: 'orbit'  },
      bridge:      { source: 'image',  image: 'intact', kind: 'bridge' },
      detail:      { source: 'image',  image: 'intact', kind: 'detail' },
    },
    frames: {
      deconstructLight: { baseUrl: '/kaapi/frames/decon_light_', count: 32, padDigits: 2, startIndex: 1 },
    },
  },
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
    cards: [
      { title: 'Filter Coffee', body: 'Slow-brewed South-Indian filter decoction — earthy, deep, unmistakable.' },
      { title: 'Cold-Pressed Berries', body: 'Wild blueberries cold-pressed for a bright, tart top-note.' },
      { title: 'Crushed Ice', body: 'Micro-crushed to keep dilution slow and body thick.' },
    ],
  },
  brew: {
    eyebrow: 'THE BREW', headline: 'Craft. Chill. Build.', sub: 'Three moves. That is the whole show.',
    cols: [
      { k: '01', title: 'Craft', body: 'A double-strength filter decoction, rested overnight.' },
      { k: '02', title: 'Chill', body: 'Snap-chilled to lock aroma before the berry press arrives.' },
      { k: '03', title: 'Build', body: 'Layered in the can — coffee, berry, condensation, seal.' },
    ],
  },
  drop: { eyebrow: 'THE DROP', headline: 'Find us in Panjim.', sub: 'Opposite Cafe Bhosle. Walk in, or tap the order button.', address: 'Opposite Cafe Bhosle, Panjim, Goa' },
  order: { eyebrow: 'THE ORDER', headline: 'One tap.', headlineB: 'On Swiggy.', sub: 'Chilled, sealed, and on its way. Delivered across central Goa.' },
  outro: { eyebrow: 'THE REVEAL', headline: 'Bean to Heart.', sub: 'That is the whole thing. See you on the next flavor.' },
};

export const getTheme = (id) => KAAPI_THEMES[id] || KAAPI_THEMES.dark;

export default {
  KAAPI_CACHE, KAAPI_THEMES, KAAPI_SEGMENTS, KAAPI_LINKS, KAAPI_COPY, KAAPI_LOGO, FRAMES_PER_CLIP,
};
