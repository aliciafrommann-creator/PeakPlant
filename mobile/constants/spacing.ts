export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  screen: 24,
} as const;

/** Opacity tokens. One disabled value app-wide so every inert control reads
 *  the same (previously 0.3–0.7 were used interchangeably). */
export const Opacity = {
  disabled: 0.4,
} as const;

/** Corner radii. Rounded but distinctive — not pill-everything. */
export const Radii = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  pill: 999,
} as const;

/**
 * Soft, low-contrast depth. Editorial lift, not material-design drop shadows.
 * Spread as `...Shadows.card` into a style object.
 */
export const Shadows = {
  card: {
    shadowColor: '#1E1C1A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  float: {
    shadowColor: '#1E1C1A',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  subtle: {
    shadowColor: '#1E1C1A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
} as const;
