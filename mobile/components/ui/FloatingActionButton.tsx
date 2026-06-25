import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { PressableScale } from './PressableScale';

interface FloatingActionButtonProps {
  onPress: () => void;
  /** Ionicons name. Default: add. */
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Optional short label rendered beside the icon (extended FAB). */
  label?: string;
  color?: string;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The persistent "add / upload" affordance. Floats above content (bottom-right),
 * tactile press feedback + haptic via PressableScale. Lets a user capture an
 * experience from anywhere — the entry point that was previously missing.
 */
export function FloatingActionButton({
  onPress,
  icon = 'add',
  label,
  color = Colors.accent,
  accessibilityLabel,
  style,
}: FloatingActionButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.92}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.fab,
        label ? styles.extended : styles.round,
        { backgroundColor: color },
        Shadows.float,
        style,
      ]}
    >
      <View style={styles.inner}>
        <Ionicons name={icon} size={24} color={Colors.white} />
        {label ? <Text style={styles.label}>{label}</Text> : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  round: {
    width: 60,
    height: 60,
    borderRadius: Radii.pill,
  },
  extended: {
    height: 56,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.pill,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: Colors.white,
  },
});
