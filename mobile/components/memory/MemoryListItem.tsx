import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import type { Memory, MomentCard } from '../../lib/types';

interface MemoryListItemProps {
  memory: Memory;
  card?: MomentCard;
  onPress?: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase();
}

export function MemoryListItem({ memory, card, onPress }: MemoryListItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.accent} />
      <View style={styles.content}>
        {card && <Text style={styles.cardNum}>#{String(card.number).padStart(2, '0')}</Text>}
        <Text style={styles.note} numberOfLines={2}>{memory.note}</Text>
        <Text style={styles.date}>{formatDate(memory.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  accent: {
    width: 2,
    backgroundColor: Colors.accent,
    marginRight: Spacing.md,
    borderRadius: 1,
  },
  content: {
    flex: 1,
  },
  cardNum: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2,
    color: Colors.accent,
    marginBottom: 4,
  },
  note: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  date: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 1,
    color: Colors.textFaint,
    textTransform: 'uppercase',
  },
});
