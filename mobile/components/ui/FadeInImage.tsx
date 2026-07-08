import React, { useRef } from 'react';
import { Animated, StyleSheet, View, type ImageProps, type StyleProp, type ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { useReducedMotion } from '../../lib/hooks/useReducedMotion';

/**
 * An Image that fades in when its bytes arrive instead of hard-popping —
 * the single biggest "feels premium" cue on photo surfaces. Shows a soft
 * neutral fill while loading (never a white hole). Pure RN Animated, no
 * extra dependency. Respects reduce-motion (instant show).
 */
export function FadeInImage({
  style,
  ...rest
}: Omit<ImageProps, 'style'> & { style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const opacity = useRef(new Animated.Value(0)).current;

  const onLoad = () => {
    if (reduced) {
      opacity.setValue(1);
      return;
    }
    Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  };

  return (
    // The holder carries the caller's sizing/radius; the image fills it
    // absolutely, so margins/size are never applied twice.
    <View style={[styles.holder, style]}>
      <Animated.Image
        {...rest}
        style={[StyleSheet.absoluteFillObject, { opacity }]}
        onLoad={onLoad}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // The quiet fill visible until the photo fades in — never a white hole.
  holder: { backgroundColor: Colors.border, overflow: 'hidden' },
});
