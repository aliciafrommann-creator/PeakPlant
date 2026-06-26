import React from 'react';
import { Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { PressableScale } from './PressableScale';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  /** Fire a light selection haptic on press. Default true. */
  haptic?: boolean;
  style?: ViewStyle;
}

/**
 * The canonical button. Built on PressableScale so every CTA in the app gets
 * the same spring-press + haptic feedback (the design-system guarantee). Pill
 * shape, four warm variants, loading + disabled states handled here.
 */
export function Button({ label, onPress, variant = 'primary', disabled, loading, haptic = true, style }: ButtonProps) {
  const containerStyle = [styles.base, styles[variant], style];
  const textStyle = [styles.text, styles[`${variant}Text` as keyof typeof styles]];

  return (
    <PressableScale
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      haptic={haptic}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'gold' ? Colors.white : Colors.text} size="small" />
      ) : (
        <Text style={textStyle}>{label.toUpperCase()}</Text>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.pill,
  },
  primary: {
    backgroundColor: Colors.text,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.text,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  gold: {
    backgroundColor: Colors.accent,
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 2.5,
  },
  primaryText: {
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.text,
  },
  ghostText: {
    color: Colors.textMuted,
  },
  goldText: {
    color: Colors.white,
  },
});
