import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { AnimatedFill } from '../ui/AnimatedFill';

interface ProgressBarProps {
  count: number;
  goal: number;
  complete: boolean;
}

export function ProgressBar({ count, goal, complete }: ProgressBarProps) {
  const ratio = goal > 0 ? Math.min(count / goal, 1) : 0;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: goal, now: Math.min(count, goal) }}
      accessibilityLabel={`${Math.min(count, goal)} of ${goal} moments`}
    >
      <View style={styles.track}>
        <AnimatedFill ratio={ratio} style={styles.fill} />
      </View>
      <Text style={styles.label}>
        {complete ? 'complete' : `${Math.min(count, goal)} of ${goal} moments`}
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
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 1,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 6,
  },
});
