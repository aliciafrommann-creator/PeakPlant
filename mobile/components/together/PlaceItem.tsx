import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import type { LocalPlace } from '../../lib/together';

export function PlaceItem({ place }: { place: LocalPlace }) {
  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={`${place.name}, ${place.area}${place.perk ? `, verified perk: ${place.perk}` : ''}`}
    >
      <View style={styles.head}>
        <Text style={styles.name}>{place.name.toLowerCase()}</Text>
        {place.isPartner && <Text style={styles.partner}>PARTNER</Text>}
      </View>
      <Text style={styles.area}>{place.area}</Text>
      {place.perk && <Text style={styles.perk}>🌶️ {place.perk}</Text>}
      {place.liveQuery && <Text style={styles.hint}>live search: {place.liveQuery}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 3,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.text,
    letterSpacing: 0.1,
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
  area: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textFaint,
    letterSpacing: 0.5,
  },
  perk: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.accent,
    marginTop: 2,
  },
  hint: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textFaint,
    marginTop: 2,
  },
});
