import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Accents } from '../../constants/colors';

interface PeakBloomProps {
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

/** The PeakPlant brand mark: gold ∧ peak above a ✿ bloom.
 *  Use in empty states, onboarding, and hero moments. */
export function PeakBloom({ size = 'md', style }: PeakBloomProps) {
  const bloomSize = size === 'sm' ? 24 : size === 'lg' ? 52 : 36;
  const peakSize = bloomSize * 0.5;
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.peak, { fontSize: peakSize }]}>∧</Text>
      <Text style={[styles.bloom, { fontSize: bloomSize }]}>✿</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 0,
  },
  peak: {
    fontWeight: '700',
    color: Accents.sunflower,
    letterSpacing: -2,
    lineHeight: undefined,
  },
  bloom: {
    color: Accents.sunflower,
    lineHeight: undefined,
  },
});
