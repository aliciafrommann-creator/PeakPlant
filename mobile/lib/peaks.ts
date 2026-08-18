/**
 * Peaks — was ein Space gesammelt hat. Rein und testbar (kein React).
 *
 * ENTSCHEIDUNG (Alicia, 18.08.2026): „vielleicht sollte man Peaks sammeln."
 * Die App zählte bereits drei Dinge — festgehaltene Momente, gesammelte
 * Wochen, gemeinsame Challenges —, sie hatten nur keinen Namen und keine
 * Gestalt. Eine Zahl ist eine Angabe; eine Zahl mit Namen und Form ist eine
 * Sammlung.
 *
 * DIE REGEL, absichtlich eine einzige:
 *
 *   Ein Peak = ein festgehaltener Moment.
 *
 * Warum nicht auch Challenges und Wochen dazuzählen? Weil eine geschaffte
 * Challenge einen festgehaltenen Moment VORAUSSETZT und eine Woche ihn
 * enthält. Beides mitzuzählen würde denselben Abend zwei- oder dreimal werten
 * — eine Zahl, die größer aussieht, als das Erlebte war. Das wäre eine
 * Scheinzahl (MANIFESTO §1). Wochen und Challenges bleiben eigene, eigene
 * benannte Tatsachen daneben.
 *
 * UND DIE GRENZE (MANIFESTO §3): Peaks können nur steigen. Es gibt kein Ziel,
 * keinen Prozentsatz, kein Ablaufen, keinen Verlust. Alicias eigene Formel aus
 * derselben Woche gilt hier weiter: freischalten ja, verlieren nein. Wer je
 * eine Regel hinzufügt, die Peaks abziehen oder verfallen lassen kann, baut
 * genau den Druck ein, den dieses Produkt nicht haben darf.
 */

export interface PeaksResult {
  /** Gesammelte Peaks. Kann nur wachsen. */
  count: number;
  /** Wie viele Zeichen die Reihe zeigt (der Rest steht als „+N" daneben). */
  visible: number;
  /** Wie viele über die sichtbare Reihe hinausgehen. */
  overflow: number;
}

/** Wie viele Zeichen eine Reihe höchstens trägt, bevor sie unruhig wird. */
export const PEAK_ROW_MAX = 12;

export function computePeaks(momentsKept: number, rowMax: number = PEAK_ROW_MAX): PeaksResult {
  // Negative oder gebrochene Eingaben können nur aus einem Fehler kommen —
  // dann lieber null anzeigen als eine erfundene Zahl.
  const count = Number.isFinite(momentsKept) ? Math.max(0, Math.floor(momentsKept)) : 0;
  const visible = Math.min(count, Math.max(0, rowMax));
  return { count, visible, overflow: count - visible };
}
