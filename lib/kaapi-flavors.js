// SKU carousel roster. Each entry maps to a live theme id or is a "coming-soon"
// placeholder. Modular: adding a new SKU is just adding a theme + one row here.

import { KAAPI_THEMES } from './kaapi-assets';

export const KAAPI_FLAVORS = [
  {
    id: 'berry-bolt',
    themeId: 'dark',
    name: 'Berry Bolt',
    tagline: 'Blueberry · Cold Filter',
    swatch: KAAPI_THEMES.dark.colors.accent,
    swatchDeep: KAAPI_THEMES.dark.colors.accentDeep,
    live: true,
  },
  {
    id: 'cream-cold',
    themeId: 'light',
    name: 'Cream Cold',
    tagline: 'Creamy · Cold Coffee',
    swatch: '#C9A98A',
    swatchDeep: '#8A5A3C',
    live: true,
  },
  {
    id: 'berry-trails',
    themeId: null,
    name: 'Berry Trails',
    tagline: 'Coming soon',
    swatch: '#FF6B6B',
    swatchDeep: '#8A1D1D',
    live: false,
  },
];

export const flavorForTheme = (themeId) =>
  KAAPI_FLAVORS.find((f) => f.themeId === themeId) || KAAPI_FLAVORS[0];
