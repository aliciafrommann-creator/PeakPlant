import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle, StyleProp, DimensionValue } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { useReducedMotion } from '../../lib/hooks/useReducedMotion';

/**
 * A calm shimmer placeholder. Used while real content loads so the feed reads as
 * "about to appear" rather than blank-then-pop. Respects reduce-motion: settles
 * to a static tint instead of pulsing.
 */
export function Skeleton({
  width = '100%',
  height = 16,
  radius = 8,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) {
      pulse.setValue(0.5);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduced]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.9] });

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: Colors.border, opacity }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

/** A feed placeholder shaped like a MemoryCard (photo block + two text lines). */
export function MemoryCardSkeleton() {
  return (
    <View style={styles.card} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Skeleton height={180} radius={0} style={styles.photo} />
      <View style={styles.body}>
        <Skeleton width={72} height={9} radius={4} />
        <Skeleton width="85%" height={18} radius={6} style={styles.gapTop} />
        <Skeleton width="55%" height={18} radius={6} style={styles.gapSm} />
        <Skeleton width={64} height={9} radius={4} style={styles.gapTop} />
      </View>
    </View>
  );
}

/** A few stacked memory skeletons — the first-paint feed state. */
export function MemoryFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <MemoryCardSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.screen,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    ...Shadows.subtle,
  },
  photo: { width: '100%' },
  body: { padding: Spacing.lg },
  gapTop: { marginTop: Spacing.md },
  gapSm: { marginTop: Spacing.sm },
});
