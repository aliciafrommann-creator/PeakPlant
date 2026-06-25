import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import type { LocalPlace } from '../../lib/together';

export function PlaceItem({ place }: { place: LocalPlace }) {
  const openMaps = () => {
    const q = encodeURIComponent(`${place.name} ${place.area}`);
    const url = place.lat && place.lng
      ? `geo:${place.lat},${place.lng}?q=${q}`
      : `https://maps.google.com/?q=${q}`;
    void Linking.openURL(url);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={openMaps}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${place.name}, ${place.area}${place.perk ? `, partner perk: ${place.perk}` : ''}. Tap to open in Maps.`}
    >
      <View style={styles.head}>
        <Text style={styles.name}>{place.name.toLowerCase()}</Text>
        {place.isPartner && <Text style={styles.partner}>PARTNER</Text>}
        <Text style={styles.mapIcon}>↗</Text>
      </View>
      <Text style={styles.area}>{place.area}</Text>
      {place.perk && <Text style={styles.perk}>🌶️ {place.perk}</Text>}
    </TouchableOpacity>
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
  mapIcon: {
    fontSize: 12,
    color: Colors.textFaint,
    marginLeft: 'auto',
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
});
