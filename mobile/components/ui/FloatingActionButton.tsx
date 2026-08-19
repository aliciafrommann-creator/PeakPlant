import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { PressableScale } from './PressableScale';
import { HOUSE_DYE } from '../../constants/dyes';
import { editionInk } from '../../lib/editionInk';

interface FloatingActionButtonProps {
  onPress: () => void;
  /** Ionicons name. Default: add. */
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Optional short label rendered beside the icon (extended FAB). */
  label?: string;
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
  accessibilityLabel,
  style,
}: FloatingActionButtonProps) {
  /**
   * Der Knopf trägt den GRUNDTON des Hauses als flache Fläche — bewusst KEINE
   * Färbung. Der Startbildschirm hatte sonst zwei gefärbte Flächen (Vorschlag
   * des Tages und dieser Knopf), und K7b lässt eine zu. Alicias Richtung hieß
   * „Batik leise … nur auf dem Vorschlag des Tages und dem Space-Punkt" — der
   * Vorschlag behält sie, dieser Knopf gibt sie ab.
   *
   * Die Beschriftung ist NICHT fest weiß: Auf dem hellen Grundton wäre sie
   * 2,41:1. Sie wird gerechnet (`editionInk`) — dieselbe Falle, in die dieser
   * Knopf am 18.08. schon einmal gelaufen ist.
   */
  const grund = HOUSE_DYE.ground;
  const tinte = editionInk(grund);

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.92}
      accessibilityLabel={accessibilityLabel}
      // Die Positionierung gehört ans ÄUSSERE Element. Vorher lag
      // `position: absolute` auf der inneren, skalierenden Fläche — die hat
      // sich dann relativ zu einem äußeren Kasten der Größe null ausgerichtet
      // und landete irgendwo. Dass es niemandem auffiel, lag nur daran, dass
      // dieser Knopf bisher nirgends benutzt wurde.
      containerStyle={[styles.fab, style]}
      style={[label ? styles.extended : styles.round, Shadows.float]}
    >
      <View style={[styles.flaeche, { backgroundColor: grund }]}>
        <Ionicons name={icon} size={24} color={tinte} />
        {label ? <Text style={[styles.label, { color: tinte }]}>{label}</Text> : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
  },
  round: {
    width: 60,
    height: 60,
    borderRadius: Radii.pill,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  extended: {
    height: 56,
    borderRadius: Radii.pill,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flaeche: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    width: '100%',
    height: '100%',
    paddingHorizontal: Spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
