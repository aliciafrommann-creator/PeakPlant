import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { acknowledgeSelection } from '../../lib/haptics';
import { useReducedMotion } from '../../lib/hooks/useReducedMotion';
import { Opacity } from '../../constants/spacing';

interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  onLongPress?: (e: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  /** How far the element shrinks while pressed. */
  scaleTo?: number;
  /** Fire a light selection haptic on press. Default true. */
  haptic?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'image' | 'none';
}

/**
 * A tactile press wrapper: soft spring scale + opacity feedback and an optional
 * light haptic. Respects reduce-motion (falls back to opacity only). This is the
 * default way to make cards and controls feel physical across PeakPlant.
 */
export function PressableScale({
  children,
  onPress,
  onLongPress,
  style,
  scaleTo = 0.97,
  haptic = true,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressOpacity = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();

  // Scale spring + a subtle dim while pressed. Under reduce-motion the spring
  // is skipped but the dim still applies instantly, so a press never feels dead.
  const animate = (pressed: boolean) => {
    if (reduced) {
      pressOpacity.setValue(pressed ? 0.82 : 1);
      return;
    }
    Animated.spring(scale, {
      toValue: pressed ? scaleTo : 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
    Animated.timing(pressOpacity, {
      toValue: pressed ? 0.88 : 1,
      duration: 90,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={() => animate(true)}
      onPressOut={() => animate(false)}
      onPress={(e) => {
        if (haptic) void acknowledgeSelection();
        onPress?.(e);
      }}
      onLongPress={onLongPress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
    >
      <Animated.View
        style={[
          style,
          { transform: [{ scale }], opacity: disabled ? Opacity.disabled : pressOpacity },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
