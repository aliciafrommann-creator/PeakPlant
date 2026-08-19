import React from 'react';
import { View, ImageBackground, StyleSheet, StyleProp, ViewStyle } from 'react-native';
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
      <ImageBackground
        source={BILDER[dyeImageKey(editionId)]}
        // ZWEITE FASSUNG DES FIX — die erste war unvollständig.
        //
        // Anlauf 1 war `StyleSheet.absoluteFill` allein: Das setzt Kanten,
        // aber keine Größe, und ein `Image` bringt seine eigene aus der Datei
        // mit (200 × 140). Die Färbung saß als Kasten oben links.
        //
        // Anlauf 2 setzte `width: '100%'` dazu. Besser, aber immer noch
        // falsch: Eine Prozentbreite misst sich am INHALTSBEREICH des Eltern-
        // elements (ohne Polsterung), `left/right: 0` dagegen am RAHMEN. Jedes
        // Band mit `paddingHorizontal` behielt dadurch rechts einen flachen
        // Streifen — genau so breit wie zweimal seine Polsterung. Alicia sah
        // es beim zweiten Durchgang wieder: „immer noch die Banner, in den
        // Farben leider nicht alle covered".
        //
        // `ImageBackground` ist für genau diesen Fall gebaut: Es legt das Bild
        // hinter den Inhalt und sizt es am Rahmen, unabhängig von Polsterung.
        // Kein Prozentwert, keine zwei Bezugssysteme, nichts zu verrechnen.
        style={StyleSheet.absoluteFill}
        imageStyle={styles.bild}
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
  /**
   * Der Zuschnitt des Bildes INNERHALB der Fläche. Die Größe kommt von
   * `ImageBackground` selbst — hier steht nur noch, dass die Ecken mitgehen,
   * damit an einem runden Knopf keine eckige Färbung übersteht.
   */
  bild: {
    width: '100%',
    height: '100%',
    borderRadius: undefined,
  },
});
