import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { placeById } from '../../lib/together';
import type { TogetherMoment } from '../../lib/together';

interface TogetherCardProps {
  moment: TogetherMoment;
  onPress?: () => void;
  showPlace?: boolean;
}

export function TogetherCard({ moment, onPress, showPlace = true }: TogetherCardProps) {
  const place = showPlace ? placeById(moment.placeId) : undefined;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${moment.title}. ${moment.idea}`}
    >
      <Text style={styles.category}>{moment.category.toUpperCase()}</Text>
      <Text style={styles.title}>{moment.title}</Text>
      <Text style={styles.idea} numberOfLines={3}>
        {moment.idea}
      </Text>
      {place && (
        <View style={styles.placeRow}>
          <Text style={styles.placeText}>{place.name.toLowerCase()}</Text>
          {place.isPartner && <Text style={styles.partner}>PARTNER</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundWarm,
    padding: Spacing.lg,
    gap: 6,
  },
  category: {
    fontSize: 8,
    fontWeight: '500',
    letterSpacing: 2.5,
    color: Colors.accent,
  },
  title: {
    fontSize: 19,
    fontWeight: '200',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  idea: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 20,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  placeText: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.5,
    color: Colors.textSubtle,
  },
  partner: {
    fontSize: 7,
    fontWeight: '500',
    letterSpacing: 2,
    color: Colors.accent,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
});
