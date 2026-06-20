import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', disabled, loading, style }: ButtonProps) {
  const containerStyle = [styles.base, styles[variant], disabled && styles.disabled, style];
  const textStyle = [styles.text, styles[`${variant}Text` as keyof typeof styles]];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.white : Colors.text} size="small" />
      ) : (
        <Text style={textStyle}>{label.toUpperCase()}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
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
  disabled: {
    opacity: 0.4,
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
