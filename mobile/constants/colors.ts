/**
 * PeakPlant colour system — editorial, warm, lightly desaturated.
 *
 * Direction: a weathered warm-stone paper base (not beige, not clinical white)
 * with a small set of sun-faded accents used semantically — one dominant accent
 * per screen/section, never a rainbow. The legacy keys are kept so existing
 * screens keep working; their values are retuned toward the new direction.
 */
export const Colors = {
  // --- Surfaces ---
  /** Page base: soft warm-stone paper. Cards read as lighter on top of this. */
  background: '#F3F1EC',
  /** Elevated card surface — reads slightly lighter/whiter than the page. */
  backgroundWarm: '#FBFAF7',
  /** Warmer card surface for intimate/editorial blocks. */
  backgroundCream: '#F7F2E8',
  /** Editorial dark surface — warm graphite, never pure black. */
  backgroundDark: '#1E1C1A',
  /** Pure elevated surface where maximum lift is needed (sheets, hero cards). */
  surface: '#FFFFFF',

  // --- Text ---
  text: '#1E1C1A',
  textMuted: '#5A554E',
  textSubtle: '#857F76',
  textFaint: '#A29C92',

  // --- Primary accent (legacy `accent` retuned: gold → sun-faded chili) ---
  accent: '#CF4B2C',
  accentLight: '#F0CDBF',

  // --- Lines ---
  border: '#E4DFD7',
  borderDark: '#33302C',

  white: '#FFFFFF',
  black: '#000000',
} as const;

/**
 * The PeakPlant accent family. Sun-faded, slightly desaturated — drawn from
 * markets, summer light, denim, evening cities. Use one dominant accent per
 * section; reach for the others only for status or edition identity.
 */
export const Accents = {
  chili: '#CF4B2C', // sun-faded tomato — primary actions, energy
  apricot: '#E08A4F', // burnt orange — warmth, intimacy
  sunflower: '#E3B23C', // pale butter/sun yellow — the card bloom, highlights
  ember: '#E2683C', // bold warm orange — a pop drawn from the edition art
  blossom: '#D9477E', // hot raspberry pink — the boldest edition-art pop
  terracotta: '#B5532E', // deep clay — grounded warmth
  sage: '#7C8A66', // washed olive/botanical — growth (the one earthy nod)
  cream: '#EFE6D4', // sun-bleached cream — soft fills
  // Cool tones retired from prominent UI — kept for any legacy reference.
  evening: '#5A6B89',
  lilac: '#9385AE',
  cobalt: '#3C5A93',
} as const;

/**
 * Emotional identity per section. This is the ambient/header colour; actions
 * stay on the primary chili accent unless a section overrides it. Kept
 * deliberately un-green-dominant — sage appears only where growth is the point.
 */
export const Sections = {
  discover: Accents.sunflower, // sunlit gold — the card bloom, optimistic
  saved: Accents.ember, // warm orange — organised but alive
  together: Accents.apricot, // warm, lived-in
  moments: Accents.apricot, // golden-hour, filmic
  grow: Accents.sage, // botanical, collectible (the one earthy nod)
  rituals: Accents.sage, // calm, grounded
  scan: Colors.backgroundDark, // focused, camera-native
  community: Accents.blossom, // social — the bold raspberry pop
} as const;

/** Semantic status colours. Green stays reserved for success only. */
export const Status = {
  success: Accents.sage,
  warning: Accents.apricot,
  danger: Accents.chili,
  info: Accents.evening,
} as const;

export type SectionKey = keyof typeof Sections;
