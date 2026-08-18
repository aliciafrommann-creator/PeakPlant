import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { computePeaks } from '../../lib/peaks';

interface PeakRowProps {
  /** Festgehaltene Momente — ein Peak je Moment (siehe lib/peaks.ts). */
  momentsKept: number;
  /** Das Sammelzeichen des Space, von den beiden selbst gewählt. */
  emoji: string;
  label: string;
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
 */
export function PeakRow({ momentsKept, emoji, label }: PeakRowProps) {
  const { count, visible, overflow } = computePeaks(momentsKept);
  if (count === 0) return null;

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`${count} ${label}`}
    >
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
      <Text style={styles.caption}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.screen,
    marginTop: Spacing.lg,
    gap: 4,
  },
  marks: {
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 2,
  },
  caption: {
    ...Typography.micro,
    color: Colors.textMuted,
  },
});
