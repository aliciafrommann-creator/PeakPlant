import React from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Colors, Accents } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import type { Space } from '../../lib/types';

interface SpaceSwitcherProps {
  spaces: Space[];
  activeSpaceId?: string;
  onSelect: (id: string) => void;
}

function typeLabel(type: Space['type']): string {
  return type === 'couple' ? 'COUPLE' : 'FRIENDS';
}

/** Each space gets its own warm identity colour, stable by position. */
const SPACE_COLORS = [
  Accents.apricot,
  Accents.cobalt,
  Accents.sage,
  Accents.lilac,
  Accents.evening,
  Accents.chili,
  Accents.sunflower,
] as const;

function colorForSpace(index: number): string {
  return SPACE_COLORS[index % SPACE_COLORS.length];
}

/** Couple/friends get a small glyph so each card reads as a place, not a tab. */
function glyphFor(type: Space['type']): string {
  return type === 'couple' ? '♥' : '✦';
}

export function SpaceSwitcher({ spaces, activeSpaceId, onSelect }: SpaceSwitcherProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {spaces.map((space, index) => {
        const active = space.id === activeSpaceId;
        const color = colorForSpace(index);
        return (
          <TouchableOpacity
            key={space.id}
            style={[
              styles.chip,
              active
                ? [styles.chipActive, { backgroundColor: color }]
                : styles.chipIdle,
            ]}
            onPress={() => onSelect(space.id)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${space.name}, ${typeLabel(space.type).toLowerCase()} space`}
          >
            <View style={styles.chipTop}>
              <Text style={[styles.glyph, { color: active ? Colors.white : color }]}>
                {glyphFor(space.type)}
              </Text>
              <Text style={[styles.chipType, active ? styles.chipTypeActive : { color }]}>
                {typeLabel(space.type)}
              </Text>
            </View>
            <Text
              style={[styles.chipName, active && styles.chipNameActive]}
              numberOfLines={1}
            >
              {space.name.toLowerCase()}
            </Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={[styles.chip, styles.chipNew]}
        onPress={() => router.push('/space/new')}
        activeOpacity={0.85}
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
    minWidth: 144,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    justifyContent: 'center',
    gap: 6,
    borderRadius: Radii.md,
  },
  chipIdle: {
    backgroundColor: Colors.backgroundWarm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.subtle,
  },
  chipActive: {
    ...Shadows.card,
  },
  chipTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  glyph: {
    fontSize: 12,
  },
  chipType: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 2,
  },
  chipTypeActive: {
    color: 'rgba(255,255,255,0.85)',
  },
  chipName: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    letterSpacing: 0.1,
  },
  chipNameActive: {
    color: Colors.white,
  },
  chipNew: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    minWidth: 118,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newPlus: {
    fontSize: 18,
    fontWeight: '300',
    color: Colors.accent,
  },
  newText: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
});
