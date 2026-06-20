import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import type { Edition } from '../../lib/types';

interface EditionHeaderProps {
  edition: Edition;
  activatedCount: number;
}

export function EditionHeader({ edition, activatedCount }: EditionHeaderProps) {
  const total = edition.cards.length;

  return (
    <View style={styles.container}>
      <Text style={styles.editionLabel}>{edition.subtitle.toUpperCase()}</Text>
      <Text style={styles.title}>{edition.name.toLowerCase()}</Text>
      <Text style={styles.description}>{edition.description}</Text>
      <View style={styles.statsRow}>
        <Text style={styles.stat}>{activatedCount} of {total} discovered</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.backgroundDark,
  },
  editionLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 36,
    fontWeight: '200',
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.textFaint,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
  },
  stat: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 1.5,
    color: Colors.textSubtle,
    textTransform: 'uppercase',
  },
});
