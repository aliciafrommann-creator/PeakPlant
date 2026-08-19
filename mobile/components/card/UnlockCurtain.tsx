import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';
import { Colors, Accents } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useReducedMotion } from '../../lib/hooks/useReducedMotion';

interface UnlockCurtainProps {
  /** Big line: "you made this moment." */
  title: string;
  /** Quiet line under it — the card's own title. */
  subtitle: string;
  /** Fires once the curtain has lifted. */
  onDone: () => void;
}

/**
 * QR magic (design north star, screen 2): after scanning a physical card the
 * app doesn't just flash a toast — it takes a breath. A warm curtain rises,
 * a bloom opens behind the words, then it lifts to reveal the card.
 *
 * Deliberately NOT confetti: one bloom, one line, ~2.2s, then out of the way.
 * Reduce-motion collapses it to a still frame with the same timing.
 */
export function UnlockCurtain({ title, subtitle, onDone }: UnlockCurtainProps) {
  const reduced = useReducedMotion();
  const curtain = useRef(new Animated.Value(0)).current; // 0 → 1 → out
  const bloom = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) {
      curtain.setValue(1);
      bloom.setValue(1);
      const timer = setTimeout(onDone, 1400);
      return () => clearTimeout(timer);
    }
    Animated.sequence([
      Animated.parallel([
        Animated.timing(curtain, {
          toValue: 1,
          duration: 340,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // The bloom opens like a flower: slow out-back, no bounce-party.
        Animated.timing(bloom, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(900),
      Animated.timing(lift, {
        toValue: 1,
        duration: 520,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onDone();
    });
  }, [reduced, curtain, bloom, lift, onDone]);

  const bloomScale = bloom.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const textRise = bloom.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const curtainOut = lift.interpolate({ inputRange: [0, 1], outputRange: [0, -60] });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        styles.curtain,
        { opacity: Animated.subtract(curtain, lift), transform: [{ translateY: curtainOut }] },
      ]}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${title} ${subtitle}`}
    >
      <Animated.View
        style={[styles.bloom, { opacity: bloom, transform: [{ scale: bloomScale }] }]}
      />
      <Animated.View style={{ opacity: bloom, transform: [{ translateY: textRise }] }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  curtain: {
    backgroundColor: Colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    zIndex: 20,
  },
  bloom: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Accents.sunflower,
    opacity: 0.22,
  },
  title: {
    ...Typography.display,
    fontSize: 28,
    lineHeight: 38,
    color: '#FAF7F0',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: Spacing.sm,
    fontSize: 14,
    fontWeight: '300',
    color: 'rgba(250,247,240,0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
