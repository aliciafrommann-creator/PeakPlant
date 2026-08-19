import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { dyeOf, DyeField } from '../ui/DyeField';
import { worldFor } from '../../constants/dyes';
import { editionInk } from '../../lib/editionInk';
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

  // Jede Challenge hat ihre EIGENE Welt, fest an ihrer id (`worldFor`).
  // Der erste Anlauf gab allen dasselbe Haus-Rezept, und zehn Karten
  // untereinander wurden zur Farbwand; daraus hatte ich den falschen Schluss
  // gezogen und die Farbe ganz ausgebaut. Der richtige: nicht Farbe in einer
  // Liste ist das Problem, sondern DIESELBE Farbe. (Alicia, 19.08.2026)
  const welt = worldFor(challenge.id);
  const kopfTinte = editionInk(dyeOf(welt).ground);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${l(challenge.title)}. ${l(challenge.subtitle)}`}
    >
      <DyeField editionId={welt} style={styles.head}>
        <Text style={styles.badge}>{complete ? challenge.badge : dyeOf(welt).emoji}</Text>
        <Text style={[styles.duration, { color: kopfTinte }]}>
          {l(challenge.durationLabel).toUpperCase()}
        </Text>
      </DyeField>
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
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    borderRadius: Radii.sm,
    marginBottom: 2,
  },
  badge: { fontSize: 18 },
  duration: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  title: { ...Typography.editorial, fontSize: 20, lineHeight: 26 },
  subtitle: { fontSize: 14, fontWeight: '300', color: Colors.textMuted, lineHeight: 20 },
  progress: { marginTop: Spacing.sm },
  goalHint: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 1.5,
    color: Colors.textSubtle,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});
