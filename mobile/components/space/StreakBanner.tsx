import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { spaceTheme } from '../../lib/spaceTheme';
import type { SpaceType } from '../../lib/types';

interface SharedWeeksBannerProps {
  spaceType: SpaceType;
  /** Wie viele verschiedene Wochen bisher einen Moment tragen. Kann nur steigen. */
  count: number;
  active: boolean;
}

const MAX_DOTS = 8;

/**
 * Gesammelte Wochen — eine warme Tatsache, keine Serie.
 *
 * Vorher stand hier ein Streak: „N Wochen in Folge" plus ein Zustand, der
 * warnte, wenn die laufende Woche noch leer war. Damit war es etwas, das man
 * verlieren kann — MANIFESTO §3 verbietet genau das („Keine Streaks als
 * Druck"), und §3 nennt im selben Atemzug die erlaubte Form: eine neutrale,
 * warme Sammel-Tatsache.
 *
 * Deshalb: kein „in Folge", keine Warnung, kein Zustand, der kippen kann.
 * Wer eine Woche auslässt, verliert nichts; sie wird bloß nicht mitgezählt.
 * (Entscheidung Alicia, 17.08.2026 — „freischalten ja, verlieren nein".)
 */
export function StreakBanner({ spaceType, count, active }: SharedWeeksBannerProps) {
  const theme = spaceTheme(spaceType);

  if (!active) {
    return (
      <View style={styles.container} accessibilityRole="summary">
        <Text style={styles.label}>WEEKS TOGETHER</Text>
        <Text style={styles.invite}>
          {theme.emoji} keep a moment in any week and it joins your collection — skipped
          weeks cost nothing.
        </Text>
      </View>
    );
  }

  const dots = theme.emoji.repeat(Math.min(count, MAX_DOTS));

  return (
    <View
      style={styles.container}
      accessibilityRole="summary"
      accessibilityLabel={`${count} ${count === 1 ? 'week' : 'weeks'} with a shared moment, collected`}
    >
      <Text style={styles.label}>WEEKS TOGETHER</Text>
      <Text style={styles.count}>
        {count} {count === 1 ? 'week' : 'weeks'} collected
      </Text>
      <Text style={styles.dots} numberOfLines={2}>
        {dots}
        {count > MAX_DOTS ? `  +${count - MAX_DOTS}` : ''}
      </Text>
      <Text style={styles.note}>
        {count === 1
          ? 'your first one. it stays.'
          : `${count} different weeks hold something you kept.`}
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
