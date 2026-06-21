import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { ProgressBar } from '../../components/challenge/ProgressBar';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useMemories } from '../../lib/hooks/useMemories';
import { useChallenges } from '../../lib/hooks/useChallenges';
import { challengeById, progressFor } from '../../lib/challenges';

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeSpace } = useSpaces();
  const { memories } = useMemories(activeSpace?.id);
  const { enrollmentFor, join, leave } = useChallenges(activeSpace?.id);

  const challenge = challengeById(id);

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>challenge not found.</Text>
          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
            <Text style={styles.backLink}>go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const enrollment = enrollmentFor(challenge.id);
  const progress = enrollment
    ? progressFor(challenge, enrollment.joinedAt, memories.map((m) => m.createdAt))
    : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>CHALLENGE</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.badge}>{progress?.complete ? challenge.badge : ''}</Text>
        <Text style={styles.duration}>{challenge.durationLabel.toUpperCase()}</Text>
        <Text style={styles.title}>{challenge.title}</Text>
        <Text style={styles.subtitle}>{challenge.subtitle}</Text>

        {enrollment && progress && (
          <View style={styles.progressCard}>
            <ProgressBar count={progress.count} goal={progress.goal} complete={progress.complete} />
            {progress.complete && (
              <Text style={styles.done}>{challenge.badge} earned. lovely work, together.</Text>
            )}
          </View>
        )}

        {!enrollment ? (
          <TouchableOpacity
            style={styles.primary}
            onPress={() => join(challenge.id)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Take on this challenge"
          >
            <Text style={styles.primaryText}>TAKE IT ON</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.secondary}
            onPress={() => leave(challenge.id)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Leave this challenge"
          >
            <Text style={styles.secondaryText}>LEAVE QUIETLY</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.note}>
          progress counts moments you preserve after joining. leaving keeps every moment —
          only the challenge goes away.
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
  duration: { fontSize: 9, fontWeight: '500', letterSpacing: 2.5, color: Colors.accent, marginTop: Spacing.sm },
  title: { fontSize: 30, fontWeight: '200', color: Colors.text, letterSpacing: -0.4, lineHeight: 36 },
  subtitle: { fontSize: 16, fontWeight: '300', color: Colors.textMuted, lineHeight: 24, marginTop: 4 },
  progressCard: {
    backgroundColor: Colors.backgroundCream,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  done: { fontSize: 13, fontWeight: '300', color: Colors.text, fontStyle: 'italic' },
  primary: {
    height: 56,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  primaryText: { fontSize: 11, fontWeight: '500', letterSpacing: 3, color: Colors.white },
  secondary: {
    height: 52,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
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
  backLink: { fontSize: 12, fontWeight: '300', color: Colors.accent, letterSpacing: 0.5 },
});
