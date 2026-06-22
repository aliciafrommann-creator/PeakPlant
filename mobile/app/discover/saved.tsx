import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { savedDateRepository } from '../../lib/repositories';
import type { SavedDate } from '../../lib/types';

const STATUS_LABEL: Record<string, string> = {
  idea: 'idea',
  saved: 'saved',
  planned: 'planned',
  completed: 'done',
  dismissed: 'dismissed',
};

export default function SavedDatesScreen() {
  const { activeSpace } = useSpaces();
  const [dates, setDates] = useState<SavedDate[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!activeSpace) return;
    setLoading(true);
    try {
      const all = await savedDateRepository.getAll(activeSpace.id);
      setDates(all.filter((d) => d.status !== 'dismissed'));
    } finally {
      setLoading(false);
    }
  }, [activeSpace]);

  useEffect(() => {
    void load();
  }, [load]);

  const markDone = useCallback(
    async (d: SavedDate) => {
      try {
        await savedDateRepository.update(d.id, {
          status: 'completed',
          completedAt: new Date().toISOString(),
        });
        // Completion → memory bridge: pre-fill create screen with the date's context.
        router.push({
          pathname: '/memory/create',
          params: { prefillNote: `we did it: ${d.title}. ${d.concept}` },
        });
        void load();
      } catch {
        Alert.alert('something went wrong', 'could not update this idea. please try again.');
      }
    },
    [load],
  );

  const dismiss = useCallback(
    async (d: SavedDate) => {
      Alert.alert('remove this idea?', d.title, [
        { text: 'keep it', style: 'cancel' },
        {
          text: 'remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await savedDateRepository.update(d.id, { status: 'dismissed' });
              setDates((prev) => prev.filter((x) => x.id !== d.id));
            } catch {
              Alert.alert('something went wrong', 'could not remove this idea.');
            }
          },
        },
      ]);
    },
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.back}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>saved ideas</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : dates.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>nothing saved yet.</Text>
          <Text style={styles.emptyHint}>
            tap SAVE on any idea in Discover — your shortlist lives here.
          </Text>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => router.back()}
            accessibilityRole="button"
          >
            <Text style={styles.ctaText}>BACK TO DISCOVER</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.hint}>tap DONE when you've experienced it — we'll help you preserve the memory.</Text>
          {dates.map((d) => (
            <View key={d.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.badge}>{STATUS_LABEL[d.status] ?? d.status}</Text>
                <Text style={styles.savedAt}>
                  {new Date(d.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
              <Text style={styles.cardTitle}>{d.title}</Text>
              <Text style={styles.cardConcept}>{d.concept}</Text>
              <View style={styles.meta}>
                <Text style={styles.metaItem}>{d.estDurationMin} min</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaItem}>{d.priceBand === 'free' ? 'free' : d.priceBand}</Text>
              </View>
              <View style={styles.actions}>
                {d.status !== 'completed' && (
                  <TouchableOpacity
                    style={styles.actionDone}
                    onPress={() => void markDone(d)}
                    accessibilityRole="button"
                    accessibilityLabel={`Mark ${d.title} as done`}
                  >
                    <Text style={styles.actionDoneText}>DONE → PRESERVE</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionDismiss}
                  onPress={() => void dismiss(d)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${d.title}`}
                >
                  <Text style={styles.actionDismissText}>REMOVE</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  back: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.textMuted },
  title: { fontSize: 26, fontWeight: '200', color: Colors.text, letterSpacing: -0.3 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screen,
  },
  emptyText: { fontSize: 18, fontWeight: '200', color: Colors.textMuted },
  emptyHint: {
    fontSize: 13,
    fontWeight: '300',
    color: Colors.textFaint,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  cta: {
    height: 44,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.text },
  scroll: { padding: Spacing.screen, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  hint: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.textFaint,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.backgroundCream,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    fontSize: 8,
    fontWeight: '500',
    letterSpacing: 1.5,
    color: Colors.accent,
    textTransform: 'uppercase',
  },
  savedAt: { fontSize: 10, fontWeight: '300', color: Colors.textFaint },
  cardTitle: { fontSize: 20, fontWeight: '200', color: Colors.text, letterSpacing: -0.3 },
  cardConcept: { fontSize: 13, fontWeight: '300', color: Colors.textMuted, lineHeight: 19 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaItem: { fontSize: 12, fontWeight: '400', color: Colors.textMuted },
  metaDot: { fontSize: 12, color: Colors.textFaint },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
    marginTop: Spacing.xs,
  },
  actionDone: {
    height: 40,
    flex: 1,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionDoneText: { fontSize: 9, fontWeight: '500', letterSpacing: 2, color: Colors.white },
  actionDismiss: {
    height: 40,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionDismissText: { fontSize: 9, fontWeight: '500', letterSpacing: 2, color: Colors.textFaint },
});
