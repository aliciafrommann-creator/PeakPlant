import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { computePeaks } from '../../lib/peaks';
import { DyeField, dyeOf } from '../ui/DyeField';
import { worldFor } from '../../constants/dyes';
import { editionInk } from '../../lib/editionInk';

interface PeakRowProps {
  /** Festgehaltene Momente — ein Peak je Moment (siehe lib/peaks.ts). */
  momentsKept: number;
  /** Das Sammelzeichen des Space, von den beiden selbst gewählt. */
  emoji: string;
  label: string;
  /**
   * Woraus die Färbung dieser Reihe kommt — die id des Space. Fest, damit ein
   * Space immer dieselbe Farbe hat; sie unterscheidet sich dadurch von der
   * Haus-Färbung des Vorschlags darüber, statt sie zu verdoppeln.
   */
  spaceId: string;
}

/**
 * Die Peaks eines Space als wachsende Reihe.
 *
 * Bewusst KEIN Fortschrittsbalken, kein „N von M", kein Ziel: eine Reihe hat
 * kein Ende, an dem man scheitern könnte. Sie wird nur länger. Das ist die
 * Form, die MANIFESTO §3 ausdrücklich erlaubt — „Sammlung ist eine neutrale,
 * warme Tatsache" — und die Alicia selbst als Grenze gezogen hat:
 * freischalten ja, verlieren nein.
 *
 * Bei null Peaks rendert die Komponente nichts. Eine leere Reihe wäre ein
 * stiller Vorwurf, und ein Leerzustand steht auf diesem Bildschirm bereits.
 *
 * WARUM EINE REIHE UND KEINE KURVE (Alicia, 19.08.2026, zum Namen): „weil wir
 * peaken und dann nicht abfallen, sondern da pflanzen und wieder peaken." Ein
 * Peak ist ein FEUERWERK, kein Gipfel — ein Gipfel hat einen Abstieg, ein
 * Feuerwerk nicht. Jede Darstellung, die hier je einen Abstieg zeichnen
 * könnte, widerspricht dem Namen des Produkts (MANIFESTO, „Warum der Name").
 */
export function PeakRow({ momentsKept, emoji, label, spaceId }: PeakRowProps) {
  const { count, visible, overflow } = computePeaks(momentsKept);
  const welt = worldFor(spaceId);
  const tinte = editionInk(dyeOf(welt).ground);
  if (count === 0) return null;

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`${count} ${label}`}
    >
      <DyeField editionId={welt} style={styles.band}>
        <Text
          style={styles.marks}
          numberOfLines={2}
          // Die Zeichenreihe ist Dekoration der Zahl — Screenreader lesen das
          // Label oben, nicht zwölf Emoji hintereinander.
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {emoji.repeat(visible)}
          {overflow > 0 ? `  +${overflow}` : ''}
        </Text>
        <Text style={[styles.caption, { color: tinte }]}>{label}</Text>
      </DyeField>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.screen,
    marginTop: Spacing.lg,
  },
  band: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    gap: 4,
  },
  marks: {
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 2,
  },
  caption: {
    // KEINE Farbe hier: Sie wird gerechnet (`tinte`), weil die Reihe auf einer
    // Färbung sitzt. Ein statischer Wert, der nie zum Tragen kommt, liest sich
    // wie eine Entscheidung und ist keine.
    ...Typography.micro,
  },
});
