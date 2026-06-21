import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { ProgressBar } from './ProgressBar';
import type { Challenge, ChallengeProgress } from '../../lib/challenges';

interface ChallengeCardProps {
  challenge: Challenge;
  joined?: boolean;
  progress?: ChallengeProgress;
  onPress?: () => void;
}

export function ChallengeCard({ challenge, joined, progress, onPress }: ChallengeCardProps) {
  const complete = progress?.complete ?? false;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${challenge.title}. ${challenge.subtitle}`}
    >
      <View style={styles.head}>
        <Text style={styles.badge}>{complete ? challenge.badge : ''}</Text>
        <Text style={styles.duration}>{challenge.durationLabel.toUpperCase()}</Text>
      </View>
      <Text style={styles.title}>{challenge.title}</Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        {challenge.subtitle}
      </Text>
      {joined && progress ? (
        <View style={styles.progress}>
          <ProgressBar count={progress.count} goal={progress.goal} complete={progress.complete} />
        </View>
      ) : (
        <Text style={styles.goalHint}>{challenge.goalCount} moments</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundWarm,
    padding: Spacing.lg,
    gap: 6,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: { fontSize: 18 },
  duration: { fontSize: 8, fontWeight: '500', letterSpacing: 2, color: Colors.textFaint },
  title: { fontSize: 19, fontWeight: '200', color: Colors.text, letterSpacing: -0.2 },
  subtitle: { fontSize: 14, fontWeight: '300', color: Colors.textMuted, lineHeight: 20 },
  progress: { marginTop: Spacing.sm },
  goalHint: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 1.5,
    color: Colors.textFaint,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});
