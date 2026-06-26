import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { PressableScale } from './PressableScale';

interface BackButtonProps {
  /** 'back' = chevron (pushed screens); 'close' = ✕ (modals). Default 'back'. */
  variant?: 'back' | 'close';
  /** Optional caps label beside the icon (e.g. "BACK"). */
  label?: string;
  /** Defaults to router.back(). */
  onPress?: () => void;
  /** Fixed min width so a centered header title stays centered. */
  width?: number;
}

/**
 * One canonical nav control. Pushed screens use the chevron ('back'); modals use
 * the ✕ ('close'). Replaces the app's mixed bag of ASCII "<-", a lone "←", and
 * word labels — every screen now dismisses the same way, with a real vector icon
 * and a generous touch target.
 */
export function BackButton({ variant = 'back', label, onPress, width = 60 }: BackButtonProps) {
  const icon = variant === 'close' ? 'close' : 'chevron-back';
  return (
    <PressableScale
      onPress={onPress ?? (() => router.back())}
      scaleTo={0.9}
      haptic={false}
      accessibilityRole="button"
      accessibilityLabel={label ?? (variant === 'close' ? 'Close' : 'Back')}
      style={[styles.btn, { minWidth: width }]}
    >
      <View style={styles.inner}>
        <Ionicons name={icon} size={variant === 'close' ? 22 : 20} color={Colors.text} />
        {label ? <Text style={styles.label}>{label}</Text> : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.sm,
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: Colors.text,
  },
});
