import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface LogoProps {
  light?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ light = false, size = 'md' }: LogoProps) {
  const color = light ? Colors.white : Colors.text;
  const accentColor = Colors.accent;

  const sizes = {
    sm: { main: 16, dot: 4, gap: 2 },
    md: { main: 22, dot: 5, gap: 3 },
    lg: { main: 32, dot: 7, gap: 4 },
  };

  const s = sizes[size];

  return (
    <View style={styles.container}>
      <Text style={[styles.wordmark, { color, fontSize: s.main }]}>PEAKPLANT</Text>
      <View style={[styles.dot, { width: s.dot, height: s.dot, borderRadius: s.dot / 2, marginLeft: s.gap, backgroundColor: accentColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordmark: {
    fontWeight: '300',
    letterSpacing: 4,
  },
  dot: {},
});
