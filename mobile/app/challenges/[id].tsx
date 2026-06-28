import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { BackButton } from '../../components/ui/BackButton';
import { Colors, Sections } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { ProgressBar } from '../../components/challenge/ProgressBar';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useMemories } from '../../lib/hooks/useMemories';
import { useChallenges } from '../../lib/hooks/useChallenges';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { challengeById, progressFor } from '../../lib/challenges';
import { confirmSuccess, acknowledgeSelection } from '../../lib/haptics';

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeSpace } = useSpaces();
  const { memories } = useMemories(activeSpace?.id);
  const { enrollmentFor, join, leave } = useChallenges(activeSpace?.id);
  const { t } = useLanguage();

  const handleJoin = async (challengeId: string) => {
    await join(challengeId);
    void confirmSuccess();
  };
  const handleLeave = async (challengeId: string) => {
    await leave(challengeId);
    void acknowledgeSelection();
  };

  const challenge = challengeById(id);

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>{t('challenge not found.', 'Herausforderung nicht gefunden.')}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('Go back', 'Zurück')}
          >
            <Text style={styles.backLink}>{t('go back', 'zurück')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const enrollment = enrollmentFor(challenge.id);
  const progress = enrollment
    ? progressFor(challenge, enrollment.joinedAt, memories.map((m) => m.createdAt))
    : undefined;
  // The couple's own collectible (set in space/edit) stamps a finished challenge.
  const collectible = activeSpace?.collectibleEmoji ?? challenge.badge;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton label={t('BACK', 'ZURÜCK')} />
        <Text style={styles.headerLabel}>{t('CHALLENGE', 'HERAUSFORDERUNG')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.badge}>{progress?.complete ? collectible : ''}</Text>
        <Text style={styles.duration}>{challenge.durationLabel.toUpperCase()}</Text>
        <Text style={styles.title}>{challenge.title}</Text>
        <Text style={styles.subtitle}>{challenge.subtitle}</Text>

        {enrollment && progress && (
          <View style={styles.progressCard}>
            <ProgressBar count={progress.count} goal={progress.goal} complete={progress.complete} />
            {progress.complete && (
              <Text style={styles.done}>{collectible} {t('earned. lovely work, together.', 'verdient. wunderbare Arbeit, gemeinsam.')}</Text>
            )}
          </View>
        )}

        {!enrollment ? (
          <TouchableOpacity
            style={styles.primary}
            onPress={() => handleJoin(challenge.id)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('Take on this challenge', 'Diese Herausforderung annehmen')}
          >
            <Text style={styles.primaryText}>{t('TAKE IT ON', 'ANNEHMEN')}</Text>
          </TouchableOpacity>
        ) : (
          <>
            {!progress?.complete && (
              <TouchableOpacity
                style={styles.primary}
                onPress={() =>
                  router.push({
                    pathname: '/memory/create',
                    params: {
                      prefillNote: t(
                        `weekly challenge: ${challenge.title}`,
                        `Wochen-Challenge: ${challenge.title}`,
                      ),
                    },
                  })
                }
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={t(
                  'Add photo or note for this challenge',
                  'Foto oder Notiz für diese Challenge hinzufügen',
                )}
              >
                <Text style={styles.primaryText}>{t('ADD PHOTO / NOTE', 'FOTO / NOTIZ HINZUFÜGEN')}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.secondary}
              onPress={() => handleLeave(challenge.id)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={t('Leave this challenge', 'Herausforderung verlassen')}
            >
              <Text style={styles.secondaryText}>{t('LEAVE QUIETLY', 'RUHIG VERLASSEN')}</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.note}>
          {t(
            'progress counts moments you preserve after joining. use photo/note when you actually did it together. leaving keeps every moment — only the challenge goes away.',
            'Fortschritt zählt Momente, die ihr nach dem Beitritt bewahrt. Nutzt Foto/Notiz, wenn ihr es wirklich zusammen gemacht habt. Verlassen behält jeden Moment — nur die Challenge verschwindet.',
          )}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backText: { fontSize: 10, fontWeight: '400', letterSpacing: 1.5, color: Colors.textMuted, width: 60 },
  headerLabel: { fontSize: 10, fontWeight: '500', letterSpacing: 3, color: Colors.text },
  content: { padding: Spacing.screen, gap: Spacing.sm, paddingBottom: Spacing.xxxl },
  badge: { fontSize: 40, minHeight: 28 },
  duration: { fontSize: 9, fontWeight: '500', letterSpacing: 2.5, color: Sections.grow, marginTop: Spacing.sm },
  title: { ...Typography.editorial, fontSize: 32, lineHeight: 38 },
  subtitle: { fontSize: 16, fontWeight: '300', color: Colors.textMuted, lineHeight: 24, marginTop: 4 },
  progressCard: {
    backgroundColor: Colors.backgroundCream,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
    borderRadius: Radii.md,
    ...Shadows.subtle,
  },
  done: { fontSize: 13, fontWeight: '300', color: Colors.text, fontStyle: 'italic' },
  primary: {
    height: 56,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    borderRadius: Radii.pill,
  },
  primaryText: { fontSize: 11, fontWeight: '500', letterSpacing: 3, color: Colors.white },
  secondary: {
    height: 52,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    borderRadius: Radii.pill,
  },
  secondaryText: { fontSize: 11, fontWeight: '500', letterSpacing: 2.5, color: Colors.textMuted },
  note: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textFaint,
    lineHeight: 17,
    fontStyle: 'italic',
    marginTop: Spacing.lg,
  },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  notFoundText: { fontSize: 16, fontWeight: '200', color: Colors.textMuted },
  backLink: { fontSize: 12, fontWeight: '300', color: Colors.textSubtle, letterSpacing: 0.5 },
});
