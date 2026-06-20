import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

type SurfaceVariant = 'default' | 'warm' | 'cream' | 'dark' | 'outlined';

interface SurfaceProps {
  variant?: SurfaceVariant;
  padding?: keyof typeof Spacing;
  style?: ViewStyle;
  children: React.ReactNode;
}

export function Surface({ variant = 'default', padding = 'lg', style, children }: SurfaceProps) {
  return (
    <View style={[styles.base, styles[variant], { padding: Spacing[padding] }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {},
  default: {
    backgroundColor: Colors.background,
  },
  warm: {
    backgroundColor: Colors.backgroundWarm,
  },
  cream: {
    backgroundColor: Colors.backgroundCream,
  },
  dark: {
    backgroundColor: Colors.backgroundDark,
  },
  outlined: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
