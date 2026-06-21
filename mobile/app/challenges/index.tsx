import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { ChallengeCard } from '../../components/challenge/ChallengeCard';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useMemories } from '../../lib/hooks/useMemories';
import { useChallenges } from '../../lib/hooks/useChallenges';
import { challengesForSpaceType, progressFor } from '../../lib/challenges';

export default function ChallengesScreen() {
  const { activeSpace } = useSpaces();
  const { memories } = useMemories(activeSpace?.id);
  const { enrollmentFor } = useChallenges(activeSpace?.id);

  const candidates = activeSpace ? challengesForSpaceType(activeSpace.type) : [];
  const memoryDates = memories.map((m) => m.createdAt);

  const joined = candidates.filter((c) => enrollmentFor(c.id));
  const available = candidates.filter((c) => !enrollmentFor(c.id));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>CHALLENGES</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          gentle, finite goals you can take on together. complete one, keep the badge.
          no scores, no rush.
        </Text>

        {joined.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>YOU'RE IN</Text>
            <View style={styles.list}>
              {joined.map((c) => {
                const enr = enrollmentFor(c.id)!;
                const progress = progressFor(c, enr.joinedAt, memoryDates);
                return (
                  <ChallengeCard
                    key={c.id}
                    challenge={c}
                    joined
                    progress={progress}
                    onPress={() => router.push(`/challenges/${c.id}`)}
                  />
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{joined.length > 0 ? 'MORE TO TRY' : 'AVAILABLE'}</Text>
          <View style={styles.list}>
            {available.map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                onPress={() => router.push(`/challenges/${c.id}`)}
              />
            ))}
          </View>
        </View>
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
  content: { padding: Spacing.screen, gap: Spacing.xl, paddingBottom: Spacing.xxxl },
  intro: { fontSize: 14, fontWeight: '300', color: Colors.textMuted, lineHeight: 21 },
  section: { gap: Spacing.md },
  sectionLabel: { fontSize: 9, fontWeight: '500', letterSpacing: 3, color: Colors.textFaint },
  list: { gap: Spacing.md },
});
