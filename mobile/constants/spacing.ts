/**
 * Abstände. Anders als die Schriftleiter hat DIESE Datei tatsächlich gesteuert:
 * 671 Token-Verwendungen gegen rund 108 handgesetzte Zahlen. Deshalb wirkt hier
 * jede Änderung sofort in der ganzen App — und deshalb ist sie der stärkste
 * Hebel gegen „alles etwas riesig".
 *
 * Der größte einzelne Posten war nämlich gar nicht die Schrift, sondern der
 * Rahmen um jeden Abschnitt: Abstand oben + Etikett + Abstand unten kosteten
 * rund 68 pt, bevor überhaupt Inhalt kam — mal sechs Abschnitte auf dem alten
 * Startbildschirm etwa ein Dreiviertel-Bildschirm reine Zwischenluft.
 * (Aus dem Quelltext gerechnet, nicht auf einem Gerät gemessen.)
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  /** Die fehlende Sprosse: 12 wurde bisher von Hand gesetzt, weil zwischen
   *  8 und 16 nichts stand. */
  ms: 12,
  md: 16, // unverändert (158 Stellen) — das Arbeitspferd, war schon richtig
  lg: 20, // 24 → 20 (99 Stellen): Abschnitts- und Karten-Innenabstand
  xl: 28, // 32 → 28 (52 Stellen)
  xxl: 40, // 48 → 40 (8 Stellen)
  xxxl: 48, // 64 → 48 (24 Stellen) — als Listen-Fußabstand war 64 toter Scroll
  /** Seitenrand. Bleibt großzügig: 16 läse sich wie eine Einstellungs-App,
   *  20 hält den redaktionellen Rand. */
  screen: 20, // 24 → 20 (110 Stellen)
} as const;

/**
 * Größen für alles Antippbare. Existiert, damit die 19 Bedienelemente, die
 * heute unter 44 pt liegen, nicht noch mehr werden: iOS verlangt mindestens
 * 44 pt, Material 48 dp. Eine kleinere Fläche ist kein Stil, sondern ein
 * Element, das manche Menschen nicht treffen.
 */
export const Layout = {
  /** Absolute Untergrenze für alles Antippbare. Nie darunter. */
  tapMin: 44,
  /** Standard-Bedienelement: Chips, sekundäre Knöpfe, Eingabefelder. */
  control: 48,
  /** Primärer Handlungsknopf. War uneinheitlich 52, 54 und 56. */
  cta: 52,
} as const;

/** Opacity tokens. One disabled value app-wide so every inert control reads
 *  the same (previously 0.3–0.7 were used interchangeably). */
export const Opacity = {
  disabled: 0.4,
} as const;

/** Corner radii. Rounded but distinctive — not pill-everything.
 *  Mit den kleineren Karten leicht nachgezogen, damit das Verhältnis von
 *  Radius zu Fläche gleich bleibt: eine unveränderte Rundung an einer
 *  kleineren Karte wirkt sonst plump. */
export const Radii = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 18, // 22 → 18
  xl: 24, // 30 → 24
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
