/**
 * WCAG-Kontrast, gerechnet statt geschätzt. Rein und testbar.
 *
 * WARUM ES DAS GIBT: Am 18.08.2026 stand in `constants/colors.ts` eine Liste
 * von Hand gerechneter Verhältnisse — sie stimmten alle. Trotzdem ging ein
 * Durchgang schief, weil an zwei Stellen der falsche UNTERGRUND angenommen
 * wurde: ein Zeichen sitzt auf `Colors.border`, nicht auf dem Papierton, und
 * ein Editions-Kopf sitzt auf zwölf verschiedenen Farben statt auf einer.
 *
 * Zahlen von Hand zu prüfen skaliert nicht auf zwölf Untergründe. Das hier
 * schon — und ein Test kann es benutzen (siehe lib/contrast.test.ts und den
 * Editions-Wächter in lib/klarheit.test.ts).
 */

/** Schwellen aus WCAG 2.1, Erfolgskriterium 1.4.3 / 1.4.11. */
export const AA_SMALL_TEXT = 4.5;
/** Ab 24 pt normal oder 18,66 pt fett. NICHT ab 18. */
export const AA_LARGE_TEXT = 3;
/** Bedienelemente und grafische Objekte (1.4.11). */
export const AA_NON_TEXT = 3;

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** `#RGB` oder `#RRGGBB`. Wirft bei allem anderen — lieber laut als geraten. */
export function parseHex(hex: string): Rgb {
  const h = hex.trim().replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) throw new Error(`Kein Hex-Farbwert: ${hex}`);
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Relative Leuchtdichte nach WCAG. */
export function luminance(color: Rgb | string): number {
  const { r, g, b } = typeof color === 'string' ? parseHex(color) : color;
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Kontrastverhältnis zweier Farben. Reihenfolge egal. */
export function contrastRatio(a: Rgb | string, b: Rgb | string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hell, dunkel] = la >= lb ? [la, lb] : [lb, la];
  return (hell + 0.05) / (dunkel + 0.05);
}

/**
 * Legt eine teiltransparente Farbe über einen Untergrund.
 *
 * Genau hier ging der erste Durchgang schief: `rgba(26,26,26,0.5)` auf einer
 * Editionsfarbe ist NICHT dieselbe Farbe wie `#1A1A1A` — sie ist deutlich
 * schwächer, und der Kontrast bricht ein, ohne dass ein Farbname sich ändert.
 */
export function composite(fg: Rgb | string, alpha: number, bg: Rgb | string): Rgb {
  const f = typeof fg === 'string' ? parseHex(fg) : fg;
  const b = typeof bg === 'string' ? parseHex(bg) : bg;
  const a = Math.min(1, Math.max(0, alpha));
  return {
    r: Math.round(f.r * a + b.r * (1 - a)),
    g: Math.round(f.g * a + b.g * (1 - a)),
    b: Math.round(f.b * a + b.b * (1 - a)),
  };
}

/**
 * Welche von zwei Tinten auf diesem Grund besser liest.
 *
 * Für Flächen, deren Farbe erst zur Laufzeit feststeht — Editionsköpfe etwa.
 * Ein von Hand gesetztes `ink: 'dark' | 'light'` ist eine Schätzung, die bei
 * einer neuen Farbe still falsch wird; das hier ist es nie.
 */
export function bestInk(background: Rgb | string, dark: string, light: string): string {
  return contrastRatio(background, dark) >= contrastRatio(background, light) ? dark : light;
}
