/**
 * Learned Preferences — the transparency screen mandated by PP-014.
 *
 * Shows every personalization signal the Discover recommender uses so the
 * couple can see, understand, and clear what shapes their picks. Realizes
 * the "Personalization & learned preferences" entry in the IA (§7 of the
 * strategy doc). For the MVP this is explicit signals only (goals, shortcuts);
 * behavioral signals arrive when the Edge Function path is wired.
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useAppStore } from '../../lib/store';

interface SignalRow {
  label: string;
  value: string;
  source: 'onboarding' | 'shortcut';
  note: string;
}

export default function PreferencesScreen() {
  const goals = useAppStore((s) => s.goals);
  const setGoals = useAppStore((s) => s.setGoals);

  const signals: SignalRow[] = [
    ...goals.map((g) => ({
      label: g,
      value: 'active goal',
      source: 'onboarding' as const,
      note: 'set during onboarding; used to boost matching date ideas',
    })),
  ];

  const clearGoals = useCallback(() => {
    Alert.alert(
      'clear onboarding goals?',
      'your discovery picks will no longer be personalised by these. you can re-set them from onboarding at any time.',
      [
        { text: 'keep them', style: 'cancel' },
        {
          text: 'clear',
          style: 'destructive',
          onPress: () => void setGoals([]),
        },
      ],
    );
  }, [setGoals]);

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
        <Text style={styles.title}>personalization</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.lead}>
          here is everything that shapes your Discover picks. nothing is inferred
          behind the scenes — only what you've explicitly told us is used.
        </Text>

        <Text style={styles.sectionLabel}>WHAT WE USE</Text>

        {signals.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>no signals set yet.</Text>
            <Text style={styles.emptyHint}>
              your picks today are ordered by the ideas in our curated catalog,
              not personalised. set goals during onboarding or use the filter
              chips on Discover to tune results.
            </Text>
          </View>
        ) : (
          signals.map((s, i) => (
            <View key={i} style={styles.signalRow}>
              <View style={styles.signalLeft}>
                <Text style={styles.signalLabel}>{s.label}</Text>
                <Text style={styles.signalNote}>{s.note}</Text>
              </View>
              <View style={styles.signalRight}>
                <Text style={styles.sourceChip}>{s.source}</Text>
              </View>
            </View>
          ))
        )}

        <Text style={styles.sectionLabel}>WHAT WE NEVER USE</Text>
        {[
          'your precise device location (you can share a city per-request, never background)',
          'inferred relationship or intimacy attributes',
          'the content of your diary notes',
          'anything you haven\'t explicitly told us',
        ].map((item, i) => (
          <View key={i} style={styles.neverRow}>
            <Text style={styles.neverBullet}>—</Text>
            <Text style={styles.neverText}>{item}</Text>
          </View>
        ))}

        <Text style={styles.sectionLabel}>SHORTCUT FILTERS</Text>
        <Text style={styles.sectionNote}>
          the chips on the Discover screen (calm, outdoors, free…) are applied
          only for that session and are never stored. they reset when you leave.
        </Text>

        {goals.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={clearGoals}
            accessibilityRole="button"
            accessibilityLabel="Clear onboarding goals"
          >
            <Text style={styles.clearText}>CLEAR ONBOARDING GOALS</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footer}>
          personalization signals live only on this device in local mode, or
          in your private space in backend mode — they are never used for ads,
          sold, or shared outside your space. (PP-014 / PP-016)
        </Text>
      </ScrollView>
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
  scroll: { padding: Spacing.screen, gap: Spacing.lg, paddingBottom: Spacing.xxxl },
  lead: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 22,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2.5,
    color: Colors.accent,
    marginTop: Spacing.sm,
  },
  sectionNote: {
    fontSize: 13,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 19,
    marginTop: -Spacing.sm,
  },
  empty: { gap: Spacing.xs },
  emptyText: { fontSize: 15, fontWeight: '300', color: Colors.textMuted },
  emptyHint: { fontSize: 13, fontWeight: '300', color: Colors.textFaint, lineHeight: 19 },
  signalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  signalLeft: { flex: 1, gap: 2 },
  signalLabel: { fontSize: 14, fontWeight: '400', color: Colors.text },
  signalNote: { fontSize: 11, fontWeight: '300', color: Colors.textFaint, lineHeight: 16 },
  signalRight: { alignItems: 'flex-end' },
  sourceChip: {
    fontSize: 8,
    fontWeight: '500',
    letterSpacing: 1.5,
    color: Colors.textFaint,
    textTransform: 'uppercase',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  neverRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  neverBullet: { fontSize: 13, fontWeight: '300', color: Colors.textFaint, marginTop: 1 },
  neverText: { flex: 1, fontSize: 13, fontWeight: '300', color: Colors.textMuted, lineHeight: 19 },
  clearBtn: {
    height: 44,
    borderWidth: 1,
    borderColor: '#b42318',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  clearText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: '#b42318' },
  footer: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textFaint,
    lineHeight: 17,
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.lg,
  },
});
