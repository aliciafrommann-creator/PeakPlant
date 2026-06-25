import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, Accents } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { PressableScale } from '../ui/PressableScale';
import { useLanguage } from '../../lib/hooks/useLanguage';
import type { Memory, MomentCard } from '../../lib/types';

interface MemoryCardProps {
  memory: Memory;
  card?: MomentCard;
  onPress?: () => void;
}

function formatDate(iso: string, locale: string): string {
  const d = new Date(iso);
  const loc = locale === 'de' ? 'de-DE' : 'en-US';
  return d.toLocaleDateString(loc, { month: 'long', day: 'numeric', year: 'numeric' }).toLowerCase();
}

export function MemoryCard({ memory, card, onPress }: MemoryCardProps) {
  const { language } = useLanguage();
  const hasPhoto = !!memory.photoUri;
  return (
    <PressableScale
      style={styles.container}
      onPress={onPress}
      scaleTo={0.985}
      accessibilityLabel={`Moment${card ? ` for card ${card.number}` : ''}, ${formatDate(memory.createdAt, language)}`}
      accessibilityHint="Opens this moment"
    >
      {hasPhoto && (
        <Image source={{ uri: memory.photoUri }} style={styles.photo} accessibilityLabel="Moment photo" />
      )}
      {/* No photo: a branded typographic block instead of a thumbnail gap. */}
      {!hasPhoto && (
        <View style={styles.noPhoto}>
          <Text style={styles.noPhotoMark}>✦</Text>
        </View>
      )}
      <View style={styles.body}>
        {card && (
          <Text style={styles.cardLabel}>CARD {String(card.number).padStart(2, '0')}</Text>
        )}
        {card && (
          <Text style={styles.prompt} numberOfLines={2}>
            {card.prompt}
          </Text>
        )}
        <Text style={styles.note} numberOfLines={3}>
          {memory.note}
        </Text>
        <Text style={styles.date}>{formatDate(memory.createdAt, language)}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.screen,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  photo: {
    width: '100%',
    height: 220,
    backgroundColor: Colors.border,
  },
  noPhoto: {
    height: 84,
    backgroundColor: Accents.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPhotoMark: {
    fontSize: 26,
    color: Accents.apricot,
  },
  body: {
    padding: Spacing.lg,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2.5,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  prompt: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.textSubtle,
    marginBottom: Spacing.sm,
    lineHeight: 21,
    fontStyle: 'italic',
  },
  note: {
    ...Typography.editorial,
    fontSize: 18,
    lineHeight: 25,
    marginBottom: Spacing.md,
  },
  date: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.5,
    color: Colors.textSubtle,
    textTransform: 'uppercase',
  },
});
