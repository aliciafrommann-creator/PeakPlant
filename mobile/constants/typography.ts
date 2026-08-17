import { Platform } from 'react-native';
import { Colors } from './colors';

/**
 * Die Schriftleiter der App — EINE Leiter, jede Stufe wird benutzt.
 *
 * BEFUND (17.08.2026, nachgezählt): Diese Datei steuerte nichts. Von neun
 * Stufen hatten SECHS null Verwendungen; `components/ui/Text.tsx`, ihr
 * einziger Abnehmer, war selbst nirgends eingebunden. Und alle 40 Stellen,
 * die eine Stufe einbanden, überschrieben die Größe unmittelbar daneben
 * wieder. Man hätte hier jede Zahl ändern können, ohne dass sich auf dem
 * Gerät ein Pixel bewegt.
 *
 * Genau daher kam Alicias „vlt ist auch alles etwas riesig im Vergleich zu
 * Strava": nicht weil eine Zahl zu hoch war, sondern weil es keine Leiter
 * gab, an der sich ein neuer Bildschirm festhalten konnte. 532 einzeln
 * gesetzte Schriftgrößen ergaben eine zweigipflige Verteilung — 67 % bei
 * 13 pt und darunter, 14 % ab 19 pt, und fast nichts dazwischen. Die
 * riesigen Titel setzen den gefühlten Maßstab, die winzigen Etiketten sitzen
 * am unteren Ende einer sehr hohen Leiter.
 *
 * Die Korrektur ist deshalb keine Verkleinerung, sondern eine STAUCHUNG VON
 * BEIDEN SEITEN: die Titel runter, die Etiketten hoch. Instagram und Strava
 * setzen ihre kleinste Schrift bei 11–12 pt; diese App hatte 107 Stellen bei
 * 10 pt und 60 bei 9 pt — unter dem, was verbreitete Apps überhaupt zeigen.
 *
 * REGEL: Wer eine Größe braucht, die hier nicht steht, hat einen Fehler in
 * der Leiter gefunden — keinen Freibrief für ein eigenes `fontSize`. Ein
 * `...Typography.x` mit einem `fontSize` daneben macht diese Datei wieder zu
 * Dekoration.
 *
 * Editorial voice = die leichte Helvetica der Website: luftig, eng gesetzt,
 * kleingeschrieben. Helvetica Neue liegt auf iOS bei; Android fällt auf die
 * System-Sans zurück (Roboto Light über fontWeight) — kein Schrift-Asset.
 * ACHTUNG: Auf Android schlägt jede Verkleinerung deshalb härter durch.
 */
const editorialSans = Platform.select({ ios: 'Helvetica Neue', android: undefined, default: undefined });

export const Typography = {
  /** Das Größte der App: die eine Aussage auf Willkommen/Onboarding. War 40/44. */
  display: {
    fontFamily: editorialSans,
    fontSize: 32,
    fontWeight: '300' as const,
    letterSpacing: -0.6,
    color: Colors.text,
    lineHeight: 38,
  },
  /**
   * Der Titel, mit dem ein Bildschirm öffnet. Bewusst UNVERÄNDERT bei 26/32 —
   * die 15 Bildschirme, die heute mit 28–36 pt öffnen, tun das, indem sie
   * genau diese Stufe nach oben überschreiben. Diese Überschreibungen zu
   * löschen IST die Korrektur. (iOS Title1 ist 28, schrumpft aber beim
   * Scrollen auf 17; unsere Titel tun das nicht, also eine Stufe darunter.)
   */
  editorial: {
    fontFamily: editorialSans,
    fontSize: 26,
    fontWeight: '300' as const,
    letterSpacing: -0.4,
    color: Colors.text,
    lineHeight: 32,
  },
  /** Titel einer großen Karte oder Detailseite. Ersetzt handgesetzte 30–32. */
  title: {
    fontFamily: editorialSans,
    fontSize: 22,
    fontWeight: '300' as const,
    letterSpacing: -0.3,
    color: Colors.text,
    lineHeight: 28,
  },
  /** Zwischenüberschrift, Sheet-Titel, Notizfeld. Ersetzt handgesetzte 20–24. */
  subtitle: {
    fontFamily: editorialSans,
    fontSize: 19,
    fontWeight: '300' as const,
    letterSpacing: -0.2,
    color: Colors.text,
    lineHeight: 25,
  },
  /** Titel einer Karte in einer Liste. Ersetzt handgesetzte 17–19. */
  cardTitle: {
    fontFamily: editorialSans,
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: -0.1,
    color: Colors.text,
    lineHeight: 23,
  },
  /** Lesetext. UNVERÄNDERT — war schon auf Höhe verbreiteter Apps. */
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: 0,
    color: Colors.text,
    lineHeight: 22,
  },
  /** Sekundärer Lesetext — die vielen handgesetzten 14/20. */
  callout: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  /** Erklärzeile unter einem Titel. Größe wie bisher, Farbe jetzt AA-fest. */
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  /**
   * Meta und Zähler. Diese Stufe geht HOCH, nicht runter: sie ersetzt 107
   * handgesetzte 10-pt- und 60 9-pt-Stellen, die unter dem lagen, was
   * Instagram und Strava als kleinste Schrift überhaupt verwenden.
   */
  micro: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    color: Colors.textSubtle,
    lineHeight: 16,
  },
  /**
   * Etikett in Großbuchstaben und Knopfbeschriftung. Die Größe hält bei 11;
   * die SPERRUNG kommt von 2 auf 1.2 — 190 Stellen standen bei 2 oder mehr,
   * und das ist der Grund, warum „SCAN CARD" und „ADD A MOMENT" aneinander
   * klebten und die Reiter-Labels abgeschnitten wurden. `lineHeight` ist neu
   * gesetzt: er fehlte, und iOS und Android waren sich über die Zeilenhöhe
   * uneinig.
   */
  label: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 1.2,
    color: Colors.textSubtle,
    lineHeight: 14,
    textTransform: 'uppercase' as const,
  },
  mono: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 1,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
};
