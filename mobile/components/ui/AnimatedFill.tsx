import React, { useEffect, useRef } from 'react';
import { Animated, Easing, type StyleProp, type ViewStyle } from 'react-native';
import { useReducedMotion } from '../../lib/hooks/useReducedMotion';

/**
 * A progress-bar fill that eases to its new width instead of jumping — the
 * small "the app noticed" moment when a couple's progress grows. Width % can't
 * ride the native driver, but these are 2-3px bars, so JS-driven timing is
 * cheap. Respects reduce-motion (snaps).
 */
export function AnimatedFill({
  ratio,
  style,
}: {
  /** 0..1 — how full the bar is. */
  ratio: number;
  /** The fill's visual style (height, color, radius). Width is managed here. */
  style?: StyleProp<ViewStyle>;
}) {
  const clamped = Math.min(Math.max(ratio, 0), 1);
  const anim = useRef(new Animated.Value(clamped)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      anim.setValue(clamped);
      return;
    }
    Animated.timing(anim, {
      toValue: clamped,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width interpolation
    }).start();
  }, [anim, clamped, reduced]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return <Animated.View style={[style, { width }]} />;
}
