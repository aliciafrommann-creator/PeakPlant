import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { spaceTheme } from '../../lib/spaceTheme';
import type { SpaceType } from '../../lib/types';

interface StreakBannerProps {
  spaceType: SpaceType;
  count: number;
  atRisk: boolean;
  active: boolean;
}

const MAX_DOTS = 8;

export function StreakBanner({ spaceType, count, atRisk, active }: StreakBannerProps) {
  const theme = spaceTheme(spaceType);

  if (!active) {
    return (
      <View style={styles.container} accessibilityRole="summary">
        <Text style={styles.label}>SHARED RHYTHM</Text>
        <Text style={styles.invite}>
          {theme.emoji} share a moment this week to start collecting {theme.units} together.
        </Text>
      </View>
    );
  }

  const dots = theme.emoji.repeat(Math.min(count, MAX_DOTS));

  return (
    <View
      style={styles.container}
      accessibilityRole="summary"
      accessibilityLabel={`${count} ${count === 1 ? 'week' : 'weeks'} of shared moments`}
    >
      <Text style={styles.label}>SHARED RHYTHM</Text>
      <Text style={styles.count}>
        {count} {count === 1 ? 'week' : 'weeks'} together
      </Text>
      <Text style={styles.dots} numberOfLines={2}>
        {dots}
        {count > MAX_DOTS ? `  +${count - MAX_DOTS}` : ''}
      </Text>
      <Text style={styles.note}>
        {atRisk
          ? `a moment this week keeps your rhythm going — no rush.`
          : `lovely. you've shared moments ${count} ${count === 1 ? 'week' : 'weeks'} in a row.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundCream,
    padding: Spacing.lg,
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.xl,
    gap: 6,
  },
  label: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2.5,
    color: Colors.accent,
  },
  count: {
    fontSize: 22,
    fontWeight: '200',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  dots: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 2,
  },
  invite: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 21,
  },
  note: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
});
