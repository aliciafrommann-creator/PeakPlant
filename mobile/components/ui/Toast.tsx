import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { useReducedMotion } from '../../lib/hooks/useReducedMotion';

/**
 * A small, warm celebration toast — drops in from the top, then fades. Used for
 * "you kept a moment ♥" moments, not errors. Self-dismisses after `duration`
 * and calls onHide so the parent can clear its state. Respects reduce-motion.
 */
export function Toast({
  message,
  onHide,
  duration = 2400,
}: {
  message: string;
  onHide: () => void;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const enter = reduced
      ? Animated.timing(anim, { toValue: 1, duration: 0, useNativeDriver: true })
      : Animated.timing(anim, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        });
    enter.start();
    const timer = setTimeout(() => {
      Animated.timing(anim, {
        toValue: 0,
        duration: reduced ? 0 : 240,
        useNativeDriver: true,
      }).start(() => onHide());
    }, duration);
    return () => clearTimeout(timer);
  }, [anim, duration, onHide, reduced]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] });

  return (
    <SafeAreaView edges={['top']} pointerEvents="none" style={styles.safe}>
      <Animated.View style={[styles.toast, { opacity: anim, transform: [{ translateY }] }]}>
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    marginTop: Spacing.sm,
    maxWidth: '90%',
    backgroundColor: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.pill,
    ...Shadows.float,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
    color: Colors.white,
    textAlign: 'center',
  },
});
