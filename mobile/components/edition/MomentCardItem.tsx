import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import type { MomentCard } from '../../lib/types';

interface MomentCardItemProps {
  card: MomentCard;
  onPress?: (card: MomentCard) => void;
}

export function MomentCardItem({ card, onPress }: MomentCardItemProps) {
  const isSealed = card.status === 'sealed';

  return (
    <TouchableOpacity
      style={[styles.container, isSealed ? styles.sealed : styles.activated]}
      onPress={() => onPress?.(card)}
      activeOpacity={0.8}
    >
      <Text style={[styles.number, isSealed ? styles.numberSealed : styles.numberActivated]}>
        {String(card.number).padStart(2, '0')}
      </Text>
      {!isSealed && (
        <Text style={styles.prompt} numberOfLines={2}>
          {card.prompt}
        </Text>
      )}
      {isSealed && (
        <View style={styles.sealedLine} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 0.7,
    padding: 16,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  sealed: {
    backgroundColor: Colors.backgroundCream,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activated: {
    backgroundColor: Colors.text,
  },
  number: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 2,
  },
  numberSealed: {
    color: Colors.textFaint,
  },
  numberActivated: {
    color: Colors.accent,
  },
  prompt: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.backgroundWarm,
    lineHeight: 17,
    letterSpacing: 0.1,
  },
  sealedLine: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 'auto',
  },
});
