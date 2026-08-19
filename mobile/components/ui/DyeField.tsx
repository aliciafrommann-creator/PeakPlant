import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { DYES, HOUSE_DYE, type Dye } from '../../constants/dyes';

/**
 * Die gefärbte Fläche — Alicias Batik, in der App.
 *
 * WARUM EIN BILD UND KEIN VERLAUF: Die Färbung entsteht aus überlagerten
 * Farbfeldern plus einer Störung. React Native kann von sich aus keines von
 * beidem; der Weg über Pakete wären drei zusätzliche Abhängigkeiten plus
 * Rechenzeit auf jedem Bild. Also einmal drucken statt tausendmal rechnen:
 * `scripts/renderDyes.mjs` rendert aus demselben Rezept, das in
 * `constants/dyes.ts` steht, dreizehn kleine PNG (zusammen unter 200 KB).
 *
 * WICHTIG FÜR DEN NÄCHSTEN, DER HIER BAUT: Unter dem Bild liegt IMMER der
 * Grundton als Füllung. Das ist kein Gürtel-und-Hosenträger, sondern der
 * ehrliche Zustand: Solange das Bild lädt — und wenn es je fehlt —, steht der
 * Text trotzdem auf einer Fläche, für die `editionInk()` die Tinte gerechnet
 * hat. Ohne diese Füllung säße Schrift für einen Moment auf Weiß.
 */

/** Die gedruckten Färbungen. Namen müssen zu den Rezepten passen. */
const BILDER: Record<string, ReturnType<typeof require>> = {
  'edition-01': require('../../assets/dyes/edition-01.png'),
  'edition-02': require('../../assets/dyes/edition-02.png'),
  'edition-03': require('../../assets/dyes/edition-03.png'),
  'edition-04': require('../../assets/dyes/edition-04.png'),
  'edition-05': require('../../assets/dyes/edition-05.png'),
  'edition-06': require('../../assets/dyes/edition-06.png'),
  'edition-07': require('../../assets/dyes/edition-07.png'),
  'edition-08': require('../../assets/dyes/edition-08.png'),
  'edition-09': require('../../assets/dyes/edition-09.png'),
  'edition-10': require('../../assets/dyes/edition-10.png'),
  'edition-11': require('../../assets/dyes/edition-11.png'),
  'edition-12': require('../../assets/dyes/edition-12.png'),
  house: require('../../assets/dyes/house.png'),
};

interface DyeFieldProps {
  /** Editions-id, oder nichts für die Haus-Färbung. */
  editionId?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/** Das Rezept zu einer Editions-id — oder das Haus-Rezept. */
export function dyeOf(editionId?: string): Dye {
  return (editionId && DYES[editionId]) || HOUSE_DYE;
}

/** Der Bildschlüssel dazu. Eine unbekannte Edition bekommt das Haus. */
export function dyeImageKey(editionId?: string): string {
  return editionId && BILDER[editionId] ? editionId : 'house';
}

export function DyeField({ editionId, style, children }: DyeFieldProps) {
  const dye = dyeOf(editionId);
  return (
    // Der Grundton steht ABSICHTLICH hinter `style`. Stünde er davor, könnte
    // ein Aufrufer ihn mit einem eigenen `backgroundColor` still ausschalten —
    // genau das war auf dem Editions-Kopf passiert: darunter lag `backgroundDark`,
    // und solange das Bild lud, stand die gerechnete Tinte bei 1,02:1.
    <View style={[styles.feld, style, { backgroundColor: dye.ground }]}>
      <Image
        source={BILDER[dyeImageKey(editionId)]}
        // BREITE UND HÖHE STEHEN AUSDRÜCKLICH DA — und das ist der ganze Fix.
        //
        // Vorher stand hier nur `StyleSheet.absoluteFill`. Das setzt top,
        // left, right und bottom auf 0, aber KEINE Größe. Bei einem `View`
        // reicht das; ein `Image` bringt jedoch seine eigene Größe aus der
        // Datei mit (200 × 140), und die gewinnt. Ergebnis auf dem Gerät:
        // Die Färbung saß als Kasten oben links, der Rest der Fläche blieb
        // flacher Grundton — mit einer harten Kante mittendrin.
        //
        // Alicia hat es am 19.08.2026 auf ihrem iPhone gesehen und richtig
        // benannt: „die Hintergründe reichen immer nur ein wenig". Kein
        // Geschmack, ein Fehler — und einer, den kein Test dieser Datei
        // finden konnte, weil er erst beim Zeichnen entsteht.
        style={styles.bild}
        resizeMode="cover"
        // Rein dekorativ: Die Bedeutung steht in der Schrift darauf, nicht in
        // der Färbung. Ein Screenreader soll sie überspringen.
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  feld: { overflow: 'hidden' },
  bild: {
    ...StyleSheet.absoluteFillObject,
    // Ohne diese zwei Zeilen zeichnet sich das Bild in seiner Dateigröße.
    width: '100%',
    height: '100%',
  },
});
