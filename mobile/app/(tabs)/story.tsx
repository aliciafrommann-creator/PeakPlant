/**
 * OUR STORY — the relationship history (Nordstern screen 6).
 *
 * Emotional, never clinical: big honest numbers, quiet observations derived
 * from the couple's own data, and the places they returned to. No score, no
 * ranking, no "X% complete" (MANIFESTO §3). Every figure is counted from real
 * moments — nothing is estimated or invented (MANIFESTO §1).
 */
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Colors, AccentInks, Sections } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useMemories } from '../../lib/hooks/useMemories';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { voice } from '../../lib/voice';
import { useWeeklyChallenge } from '../../lib/hooks/useWeeklyChallenge';
import { usePrivacyOverlay } from '../../lib/hooks/usePrivacyOverlay';
import { PrivacyScreen } from '../../components/ui/PrivacyScreen';
import { BackButton } from '../../components/ui/BackButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { PressableScale } from '../../components/ui/PressableScale';
import { savedDateRepository, cardRepository } from '../../lib/repositories';
import { SEED_EDITIONS } from '../../lib/seed';
import { buildStoryInsights } from '../../lib/storyInsights';
import type { SavedDate } from '../../lib/types';

const TOGETHER = Sections.together;

export default function StoryScreen() {
  const { activeSpace } = useSpaces();
  const { memories, loading, error, refresh } = useMemories(activeSpace?.id);
  const { chillyCount } = useWeeklyChallenge(activeSpace?.id, activeSpace?.type);
  const { t } = useLanguage();
  const v = voice(activeSpace?.type);
  const obscured = usePrivacyOverlay();

  const [savedDates, setSavedDates] = useState<SavedDate[]>([]);
  const [cardsKept, setCardsKept] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!activeSpace) {
      setSavedDates([]);
      setCardsKept(0);
      return;
    }
    const [dates, editionCounts] = await Promise.all([
      savedDateRepository.getAll(activeSpace.id).catch(() => [] as SavedDate[]),
      Promise.all(
        SEED_EDITIONS.filter((e) => e.status === 'available').map(async (e) => {
          const cards = await cardRepository.getAll(e.id, activeSpace.id).catch(() => []);
          return cards.filter((c) => c.status === 'activated').length;
        }),
      ),
    ]);
    setSavedDates(dates);
    setCardsKept(editionCounts.reduce((a, b) => a + b, 0));
  }, [activeSpace]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refresh(), load()]);
    } finally {
      setRefreshing(false);
    }
  }, [refresh, load]);

  const datesDone = useMemo(
    () => savedDates.filter((d) => d.status === 'completed').length,
    [savedDates],
  );

  // Distinct places you actually went to.
  const places = useMemo(() => {
    const seen = new Map<string, number>();
    for (const d of savedDates) {
      if (d.status !== 'completed' || !d.placeName) continue;
      seen.set(d.placeName, (seen.get(d.placeName) ?? 0) + 1);
    }
    return [...seen.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, times]) => ({ name, times }));
  }, [savedDates]);

  const insights = useMemo(
    () => buildStoryInsights(memories, savedDates),
    [memories, savedDates],
  );

  const stats: { value: number; label: string }[] = [
    { value: memories.length, label: t('MOMENTS', 'MOMENTE') },
    ...(datesDone > 0 ? [{ value: datesDone, label: t('DATES', 'DATES') }] : []),
    ...(places.length > 0 ? [{ value: places.length, label: t('PLACES', 'ORTE') }] : []),
    ...(cardsKept > 0 ? [{ value: cardsKept, label: t('CARDS', 'KARTEN') }] : []),
    ...(chillyCount > 0 ? [{ value: chillyCount, label: t('CHALLENGES', 'CHALLENGES') }] : []),
  ];

  // Ein Ladefehler ist nicht dasselbe wie „noch nichts erlebt". Wer offline
  // vierzig Momente hat, bekam hier gesagt, seine Geschichte beginne gerade
  // erst. moments.tsx und editions/[id].tsx machen das längst richtig — dieser
  // Bildschirm war der letzte, der es nicht tat.
  if (!loading && error && memories.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {obscured && <PrivacyScreen />}
        <View style={styles.header}>
          <BackButton />
          <View style={styles.kickerRow}>
            <View style={[styles.kickerDot, { backgroundColor: TOGETHER }]} />
            <Text style={styles.kicker}>{t(v.ourStoryKicker.en, v.ourStoryKicker.de)}</Text>
          </View>
        </View>
        <EmptyState
          title={t("couldn't load your story.", 'eure Geschichte konnte nicht geladen werden.')}
          hint={t(
            'everything you kept is safe — this was the connection.',
            'alles, was ihr behalten habt, ist sicher — das war die Verbindung.',
          )}
          ctaLabel={t('TRY AGAIN', 'NOCHMAL VERSUCHEN')}
          onCta={refresh}
        />
      </SafeAreaView>
    );
  }

  if (!loading && memories.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {obscured && <PrivacyScreen />}
        <View style={styles.header}>
          {/* Diese Seite war ein Reiter und wird jetzt vom Fuß der
              Momente-Wand geoeffnet — ohne Reiter-Leiste braucht sie einen
              Weg zurück (Entscheidung Alicia, 17.08.2026). */}
          <BackButton />
          <View style={styles.kickerRow}>
            <View style={[styles.kickerDot, { backgroundColor: TOGETHER }]} />
            <Text style={styles.kicker}>{t('OUR STORY', 'EURE GESCHICHTE')}</Text>
          </View>
        </View>
        <EmptyState
          title={t(v.storyStartsHere.en, v.storyStartsHere.de)}
          hint={t(v.storyStartsHint.en, v.storyStartsHint.de)}
          ctaLabel={t('FIND SOMETHING TO DO', 'ETWAS ZUM ERLEBEN FINDEN')}
          onCta={() => router.push('/(tabs)/discover')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {obscured && <PrivacyScreen />}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
        }
      >
        <View style={styles.header}>
          <BackButton />
          <View style={styles.kickerRow}>
            <View style={[styles.kickerDot, { backgroundColor: TOGETHER }]} />
            <Text style={styles.kicker}>{t('OUR STORY', 'EURE GESCHICHTE')}</Text>
          </View>
          <Text style={styles.title}>
            {t(`${v.whatGrew.en}.`, `${v.whatGrew.de}.`)}
          </Text>
        </View>

        {/* Big honest numbers — counted, never estimated. */}
        <View style={styles.statGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCell}>
              <Text style={styles.statNum}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Quiet observations — only what the data supports. */}
        {insights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('WHAT WE NOTICE', 'WAS UNS AUFFÄLLT')}</Text>
            {insights.map((insight) => (
              <View key={insight.en} style={styles.insightRow}>
                <Text style={styles.insightMark}>✦</Text>
                <Text style={styles.insightText}>{t(insight.en, insight.de)}</Text>
              </View>
            ))}
          </View>
        )}

        {places.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('PLACES YOU WENT', 'ORTE, AN DENEN IHR WART')}</Text>
            {places.slice(0, 8).map((p) => (
              <View key={p.name} style={styles.placeRow}>
                <Text style={styles.placeName} numberOfLines={1}>📍 {p.name}</Text>
                {p.times > 1 && (
                  <Text style={styles.placeTimes}>
                    {t(`${p.times}×`, `${p.times}×`)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        <PressableScale
          style={styles.momentsLink}
          onPress={() => router.push('/(tabs)/moments')}
          scaleTo={0.985}
          accessibilityLabel={t('Open all your moments', 'Alle eure Momente öffnen')}
        >
          <Text style={styles.momentsLinkText}>
            {t('READ EVERY MOMENT', 'JEDEN MOMENT LESEN')}
          </Text>
        </PressableScale>

        <Text style={styles.footer}>
          {t(
            'all of this is counted from what you kept — nothing is guessed, nothing leaves your space.',
            v.countedFromWhatYouKept.de,
          )}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxxl },
  header: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: 6,
  },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kickerDot: { width: 6, height: 6, borderRadius: 3 },
  kicker: { fontSize: 12, fontWeight: '500', letterSpacing: 1.2, color: Colors.textSubtle },
  title: { ...Typography.editorial },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.sm,
    gap: Spacing.lg,
  },
  statCell: { minWidth: 74 },
  statNum: { ...Typography.display },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: Colors.textSubtle,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xl,
    gap: Spacing.xs,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: Colors.textSubtle,
    marginBottom: Spacing.xs,
  },
  insightRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 7 },
  // Das Zeichen steht direkt neben dem Text und wird mitgelesen — also gilt
  // die Textschwelle. Accents.chili waren 3,96:1 auf Papier.
  insightMark: { fontSize: 13, color: AccentInks.chili, lineHeight: 22 },
  insightText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '300',
    color: Colors.text,
    lineHeight: 22,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  placeName: { flex: 1, fontSize: 14, fontWeight: '300', color: Colors.text },
  placeTimes: { fontSize: 12, fontWeight: '400', color: Colors.textSubtle },
  momentsLink: {
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.xl,
    height: 52,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  momentsLinkText: { fontSize: 11, fontWeight: '500', letterSpacing: 1.2, color: Colors.text },
  footer: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.textSubtle,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
  },
});
