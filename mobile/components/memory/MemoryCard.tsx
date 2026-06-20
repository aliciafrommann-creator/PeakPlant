import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import type { Memory, MomentCard } from '../../lib/types';

interface MemoryCardProps {
  memory: Memory;
  card?: MomentCard;
  onPress?: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toLowerCase();
}

export function MemoryCard({ memory, card, onPress }: MemoryCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
      {memory.photoUri && (
        <Image source={{ uri: memory.photoUri }} style={styles.photo} />
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
        <Text style={styles.date}>{formatDate(memory.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundWarm,
    marginBottom: Spacing.md,
  },
  photo: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.border,
  },
  body: {
    padding: Spacing.lg,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2.5,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  prompt: {
    fontSize: 16,
    fontWeight: '300',
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  note: {
    fontSize: 15,
    fontWeight: '300',
    color: Colors.text,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  date: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 1.5,
    color: Colors.textFaint,
    textTransform: 'uppercase',
  },
});
