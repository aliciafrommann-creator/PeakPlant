import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, StyleProp, ViewStyle, Easing } from 'react-native';
import { Accents } from '../../constants/colors';
import { useReducedMotion } from '../../lib/hooks/useReducedMotion';

interface PeakBloomProps {
  size?: 'sm' | 'md' | 'lg';
  /** Play the bloom-open entrance once on mount. Default true. */
  animate?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** The PeakPlant brand mark: gold ∧ peak above a ✿ bloom.
 *  On mount the bloom gently opens (scale + fade + tiny rise) — a small,
 *  alive moment. Respects reduce-motion. Use in empty states, headers, heroes. */
export function PeakBloom({ size = 'md', animate = true, style }: PeakBloomProps) {
  const bloomSize = size === 'sm' ? 24 : size === 'lg' ? 52 : 36;
  const peakSize = bloomSize * 0.5;
  const reduced = useReducedMotion();

  const progress = useRef(new Animated.Value(animate && !reduced ? 0 : 1)).current;

  useEffect(() => {
    if (!animate || reduced) return;
    Animated.timing(progress, {
      toValue: 1,
      duration: 620,
      easing: Easing.out(Easing.back(1.6)),
      useNativeDriver: true,
    }).start();
  }, [animate, reduced, progress]);

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [6, 0] });

  return (
    <Animated.View
      style={[styles.container, style, { opacity: progress, transform: [{ scale }, { translateY }] }]}
    >
      <Text style={[styles.peak, { fontSize: peakSize }]}>∧</Text>
      <Text style={[styles.bloom, { fontSize: bloomSize }]}>✿</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  peak: {
    fontWeight: '700',
    color: Accents.sunflower,
    letterSpacing: -2,
  },
  bloom: {
    color: Accents.sunflower,
  },
});
