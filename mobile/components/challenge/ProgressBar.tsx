import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { AnimatedFill } from '../ui/AnimatedFill';
import { useLanguage } from '../../lib/hooks/useLanguage';

interface ProgressBarProps {
  count: number;
  goal: number;
  complete: boolean;
}

export function ProgressBar({ count, goal, complete }: ProgressBarProps) {
  const ratio = goal > 0 ? Math.min(count / goal, 1) : 0;
  const { t } = useLanguage();
  const shown = Math.min(count, goal);
  const countLabel = t(`${shown} of ${goal} moments`, `${shown} von ${goal} Momenten`);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: goal, now: Math.min(count, goal) }}
      accessibilityLabel={countLabel}
    >
      <View style={styles.track}>
        <AnimatedFill ratio={ratio} style={styles.fill} />
      </View>
      <Text style={styles.label}>
        {complete ? t('complete', 'geschafft') : countLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 3,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: 3,
    backgroundColor: Colors.accent,
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 1,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 6,
  },
});
