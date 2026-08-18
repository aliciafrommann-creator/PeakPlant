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
  //
  // Die Werte sind gegen den Papierton #F3F1EC gerechnet (WCAG-Kontrast, nicht
  // geschätzt). AA verlangt 4,5:1 für kleinen Text und 3:1 für großen.
  // Vorher fielen zwei Stufen durch — auf dem Gerät bei Tageslicht war das
  // sichtbar, und die App setzt 67 % ihrer Schrift bei 13 pt und darunter:
  //   textSubtle #857F76 = 3,51:1   → 25 Stellen kombinierten das mit ≤ 11 pt
  //   textFaint  #A29C92 = 2,41:1   → 29 Stellen ebenso
  // Das ist ein eigener Fehler, unabhängig von „alles zu groß" (MANIFESTO §1:
  // eine App, deren Text man nicht lesen kann, hält ihr Versprechen nicht).
  text: '#1E1C1A', //      15,05:1 — Fließtext, Titel
  textMuted: '#5A554E', //  6,54:1 — sekundärer Fließtext
  textSubtle: '#726D65', // 4,55:1 — kleine Etiketten, Meta. Besteht AA.
  /**
   * Die leiseste Stufe: **3,03:1 auf dem Papierton**. Damit besteht sie AA
   * genau in vier Fällen — und sonst nie:
   *
   *   1. Großer Text: ab 24 pt normal oder 18,66 pt fett (dort genügen 3:1).
   *   2. Nicht-Text: Trennlinien, Rahmen, Dekoration.
   *   3. Deaktivierte Bedienelemente (WCAG 1.4.3 nimmt inaktive Elemente aus).
   *   4. **Auf dunklem Grund** — gegen `Colors.text` (#1E1C1A) sind es 4,97:1,
   *      also besteht sie dort auch für kleine Schrift. Das betrifft die
   *      ausgewählten Karten in Sprache, Onboarding und Space-Anlegen.
   *
   * Für kleine Schrift auf hellem Grund gehört `textSubtle` her (4,55:1).
   *
   * Diese Liste ist nicht theoretisch: bei der Durchsicht am 18.08.2026 waren
   * neun Stellen betroffen, sechs davon fielen unter 1–4 und waren richtig.
   * Genau drei waren echte Fehler (chipNumSealed 13 pt, bulletDot 15 pt,
   * failedMark 18 pt — alle auf Papier) und wurden korrigiert. Wer hier prüft,
   * prüft den UNTERGRUND und die GRÖSSE mit, nicht nur den Farbnamen.
   */
  textFaint: '#908A81',

  // --- Primary accent (legacy `accent` retuned: gold → sun-faded chili) ---
  /** Flächen, Ränder, Symbole. Als FÜLLUNG richtig, als kleine Schrift nicht. */
  accent: '#CF4B2C',
  /**
   * Derselbe Chili, nur so weit abgedunkelt, dass er als kleine Schrift auf
   * dem Papierton AA besteht: 4,51:1 statt 3,96:1. Optisch kaum zu
   * unterscheiden — für Etiketten in Akzentfarbe (z. B. 9–11 pt) die richtige
   * Wahl. `accent` bleibt die Füllfarbe.
   */
  accentInk: '#C04528',
  accentLight: '#F0CDBF',

  // --- Lines ---
  border: '#E4DFD7',
  borderDark: '#33302C',

  // --- Semantic ---
  /** Error/destructive text & borders. One canonical danger red app-wide
   *  (replaces the ad-hoc '#b42318' that was hardcoded across many screens). */
  danger: '#B42318',

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
