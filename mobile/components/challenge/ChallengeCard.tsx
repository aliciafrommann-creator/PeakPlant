import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Sections } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { ProgressBar } from './ProgressBar';
import { useLanguage } from '../../lib/hooks/useLanguage';
import type { Challenge, ChallengeProgress } from '../../lib/challenges';

interface ChallengeCardProps {
  challenge: Challenge;
  joined?: boolean;
  progress?: ChallengeProgress;
  onPress?: () => void;
}

export function ChallengeCard({ challenge, joined, progress, onPress }: ChallengeCardProps) {
  const complete = progress?.complete ?? false;
  const { t, l } = useLanguage();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${l(challenge.title)}. ${l(challenge.subtitle)}`}
    >
      <View style={styles.head}>
        <Text style={styles.badge}>{complete ? challenge.badge : ''}</Text>
        <Text style={styles.duration}>{l(challenge.durationLabel).toUpperCase()}</Text>
      </View>
      <Text style={styles.title}>{l(challenge.title)}</Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        {l(challenge.subtitle)}
      </Text>
      {joined && progress ? (
        <View style={styles.progress}>
          <ProgressBar count={progress.count} goal={progress.goal} complete={progress.complete} />
        </View>
      ) : (
        <Text style={styles.goalHint}>
          {challenge.goalCount === 1
            ? t('1 moment', '1 Moment')
            : t(`${challenge.goalCount} moments`, `${challenge.goalCount} Momente`)}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundWarm,
    padding: Spacing.lg,
    gap: 6,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.subtle,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: { fontSize: 18 },
  duration: { fontSize: 8, fontWeight: '500', letterSpacing: 2, color: Sections.grow },
  title: { ...Typography.editorial, fontSize: 20, lineHeight: 26 },
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
