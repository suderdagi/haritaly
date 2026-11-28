import { TextStyle } from 'react-native';

/**
 * Haritaly design tokens.
 *
 * A warm neutral foundation (ivory, stone, charcoal) carries every screen. Pastel accents are used
 * sparingly and always with a meaning:
 *   eucalyptus → your own places and positive states
 *   lavender   → friends and everything social
 *   rose       → favorites
 *   champagne  → what to order (a friend's dish or drink pick)
 * The "deep" variants are the ones used for text and icons, because the pastels themselves are too light
 * to read on ivory. Text colors were checked for at least 4.5:1 contrast on the background.
 */

export const palette = {
  ivory: '#F7F5F0',
  paper: '#FDFCF9',
  linen: '#EFEDE7',
  stone: '#EAE8E1',
  stoneDeep: '#DEDBD2',
  hairline: '#E2DFD6',

  sage: '#B1BBA8',
  sageSoft: '#E5E9E0',
  eucalyptus: '#778779',
  eucalyptusDeep: '#4E6A55',

  lavender: '#B9B3C8',
  lavenderSoft: '#ECE9F1',
  lavenderDeep: '#7A7191',

  rose: '#D6BDB6',
  roseSoft: '#F4EAE6',
  roseDeep: '#A86F63',

  champagne: '#C8B795',
  champagneSoft: '#F2ECDF',
  champagneDeep: '#9C8250',

  charcoal: '#292D2B',
  graphite: '#4A4F4C',
  slate: '#666B66',
  mist: '#878B85',

  red: '#B2493B',
  redSoft: '#F6E5E1',
  white: '#FFFFFF',
} as const;

export const colors = {
  // Surfaces
  background: palette.ivory,
  surface: palette.paper,
  fill: palette.linen,
  fillPressed: palette.stoneDeep,
  stone: palette.stone,
  hairline: palette.hairline,
  scrim: 'rgba(41, 45, 43, 0.38)',

  // Text
  text: palette.charcoal,
  textSecondary: palette.slate,
  textTertiary: palette.mist,
  textInverse: palette.paper,

  // Roles
  primary: palette.charcoal,
  accent: palette.eucalyptusDeep,
  accentSoft: palette.sageSoft,
  social: palette.lavenderDeep,
  socialSoft: palette.lavenderSoft,
  favorite: palette.roseDeep,
  favoriteSoft: palette.roseSoft,
  pick: palette.champagneDeep,
  pickSoft: palette.champagneSoft,
  danger: palette.red,
  dangerSoft: palette.redSoft,

  // Map
  markerMine: '#5A7060',
  markerFriend: palette.lavenderDeep,
  markerSelected: palette.charcoal,
  markerRing: '#FBFAF7',
  glass: 'rgba(250, 249, 245, 0.78)',
} as const;

/** 4-point spacing scale. */
export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

/** Horizontal margin of every screen. */
export const screenPadding = space.lg;

/**
 * Corner radii. Small elements get small radii so nested shapes stay concentric:
 * an inner radius is roughly the outer radius minus the padding between them.
 */
export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  sheet: 28,
  pill: 999,
} as const;

/** Layered shadows: a tight contact shadow plus a soft ambient one, tinted with charcoal instead of black. */
export const shadow = {
  card: '0px 1px 2px rgba(41, 45, 43, 0.05), 0px 6px 20px rgba(41, 45, 43, 0.06)',
  raised: '0px 2px 6px rgba(41, 45, 43, 0.08), 0px 12px 32px rgba(41, 45, 43, 0.12)',
  floating: '0px 1px 3px rgba(41, 45, 43, 0.10), 0px 8px 24px rgba(41, 45, 43, 0.14)',
  marker: '0px 1px 2px rgba(41, 45, 43, 0.30), 0px 4px 10px rgba(41, 45, 43, 0.20)',
  sheet: '0px -2px 10px rgba(41, 45, 43, 0.05), 0px -10px 40px rgba(41, 45, 43, 0.10)',
} as const;

/**
 * Type scale. The font is the system font, which is SF Pro on iPhone. Headings are semibold rather than
 * bold, large sizes are tracked slightly tighter, and small labels slightly looser.
 */
export const type = {
  largeTitle: { fontSize: 32, lineHeight: 38, fontWeight: '600', letterSpacing: -0.5 },
  title1: { fontSize: 26, lineHeight: 32, fontWeight: '600', letterSpacing: -0.4 },
  title2: { fontSize: 21, lineHeight: 26, fontWeight: '600', letterSpacing: -0.25 },
  title3: { fontSize: 18, lineHeight: 23, fontWeight: '600', letterSpacing: -0.15 },
  headline: { fontSize: 16, lineHeight: 21, fontWeight: '600', letterSpacing: -0.1 },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '400' },
  bodyMedium: { fontSize: 16, lineHeight: 23, fontWeight: '500' },
  callout: { fontSize: 15, lineHeight: 21, fontWeight: '400' },
  calloutMedium: { fontSize: 15, lineHeight: 21, fontWeight: '500' },
  subhead: { fontSize: 14, lineHeight: 19, fontWeight: '400' },
  subheadMedium: { fontSize: 14, lineHeight: 19, fontWeight: '500' },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '600', letterSpacing: 0.9, textTransform: 'uppercase' },
} satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

/** Icon sizes, matched to the text they sit next to. */
export const iconSize = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
} as const;

/** Motion: short and calm. Springs are used for things the finger moves; timings for everything else. */
export const motion = {
  fast: 140,
  base: 220,
  slow: 320,
  pressScale: 0.97,
  spring: { damping: 18, stiffness: 220, mass: 1 },
} as const;

/** Text that sits in fixed-height chrome (tab bar, chips, map markers) may grow only this much with Dynamic Type. */
export const chromeFontScale = 1.35;
