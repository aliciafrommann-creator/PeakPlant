import React from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import type { Space } from '../../lib/types';

interface SpaceSwitcherProps {
  spaces: Space[];
  activeSpaceId?: string;
  onSelect: (id: string) => void;
}

function typeLabel(type: Space['type']): string {
  return type === 'couple' ? 'COUPLE' : 'FRIENDS';
}

export function SpaceSwitcher({ spaces, activeSpaceId, onSelect }: SpaceSwitcherProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {spaces.map((space) => {
        const active = space.id === activeSpaceId;
        return (
          <TouchableOpacity
            key={space.id}
            style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
            onPress={() => onSelect(space.id)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${space.name}, ${typeLabel(space.type).toLowerCase()} space`}
          >
            <Text style={[styles.chipType, active && styles.chipTypeActive]}>
              {typeLabel(space.type)}
            </Text>
            <Text style={[styles.chipName, active && styles.chipNameActive]} numberOfLines={1}>
              {space.name.toLowerCase()}
            </Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={[styles.chip, styles.chipNew]}
        onPress={() => router.push('/space/new')}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Create or join a new space"
      >
        <View style={styles.newInner}>
          <Text style={styles.newPlus}>+</Text>
          <Text style={styles.newText}>new space</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    minWidth: 132,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
    gap: 2,
  },
  chipIdle: {
    backgroundColor: Colors.backgroundWarm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.text,
  },
  chipType: {
    fontSize: 8,
    fontWeight: '500',
    letterSpacing: 2,
    color: Colors.textFaint,
  },
  chipTypeActive: {
    color: Colors.accent,
  },
  chipName: {
    fontSize: 13,
    fontWeight: '300',
    color: Colors.textMuted,
    letterSpacing: 0.1,
  },
  chipNameActive: {
    color: Colors.white,
  },
  chipNew: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    minWidth: 110,
  },
  newInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newPlus: {
    fontSize: 16,
    fontWeight: '300',
    color: Colors.textMuted,
  },
  newText: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
});
