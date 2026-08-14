import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { PressableScale } from './PressableScale';
import { PeakBloom } from './PeakBloom';

interface EmptyStateProps {
  /** A glyph/emoji mark, or 'bloom' for the brand mark. Omit for no mark. */
  mark?: string | 'bloom';
  title: string;
  hint?: string;
  /** Optional call to action. */
  ctaLabel?: string;
  onCta?: () => void;
  /**
   * Optional quiet second way out, rendered as a text link under the pill —
   * never a second pill, so the primary action stays the only loud one
   * (MANIFESTO §5: one clear action per state).
   */
  secondaryLabel?: string;
  onSecondary?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * One canonical empty/error state: optional mark, editorial title, hint, and an
 * optional pill CTA. Used for empty feeds AND load-error states (pass a "retry"
 * CTA) so a failure never looks identical to "you have nothing".
 */
export function EmptyState({
  mark,
  title,
  hint,
  ctaLabel,
  onCta,
  secondaryLabel,
  onSecondary,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {mark === 'bloom' ? (
        <PeakBloom size="lg" style={styles.bloom} />
      ) : mark ? (
        <Text style={styles.mark}>{mark}</Text>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {ctaLabel && onCta ? (
        <PressableScale style={styles.cta} onPress={onCta} accessibilityLabel={ctaLabel}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </PressableScale>
      ) : null}
      {secondaryLabel && onSecondary ? (
        <PressableScale
          style={styles.secondary}
          onPress={onSecondary}
          scaleTo={0.985}
          accessibilityLabel={secondaryLabel}
        >
          <Text style={styles.secondaryText}>{secondaryLabel}</Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xxl,
    gap: Spacing.sm,
  },
  bloom: { marginBottom: Spacing.md },
  mark: { fontSize: 34, color: Colors.accent, marginBottom: Spacing.sm },
  title: {
    ...Typography.editorial,
    fontSize: 22,
    color: Colors.text,
    textAlign: 'center',
  },
  hint: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textSubtle,
    textAlign: 'center',
    lineHeight: 20,
  },
  cta: {
    height: 48,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    borderRadius: Radii.pill,
  },
  ctaText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2.5,
    color: Colors.white,
  },
  secondary: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm, // keeps the tap target at 44pt
    paddingHorizontal: Spacing.md,
  },
  secondaryText: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textSubtle,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
