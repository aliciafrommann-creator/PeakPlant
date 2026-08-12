/**
 * MOMENTS — the editorial two-person feed (Nordstern screen 5).
 *
 * Every preserved moment is one story: photo, card, place, the line you wrote.
 * Grouped by month so the feed reads like an album, not a timeline dump.
 * Only the two of you are in here — no likes, no followers, no counters.
 */
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SectionList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Colors, Sections } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useMemories } from '../../lib/hooks/useMemories';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { useBiometric } from '../../lib/hooks/useBiometric';
import { usePrivacyOverlay } from '../../lib/hooks/usePrivacyOverlay';
import { PrivacyScreen } from '../../components/ui/PrivacyScreen';
import { MemoryFeedSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { MemoryCard } from '../../components/memory/MemoryCard';
import { SEED_CARDS, SEED_EDITIONS } from '../../lib/seed';
import { shareMemory } from '../../lib/share';
import type { Memory } from '../../lib/types';

const TOGETHER = Sections.together;

export default function MomentsScreen() {
  const { activeSpace } = useSpaces();
  const { memories, loading, error, refresh } = useMemories(activeSpace?.id);
  const { t } = useLanguage();
  const { authenticate } = useBiometric();
  const obscured = usePrivacyOverlay();

  const cardById = useMemo(() => new Map(SEED_CARDS.map((c) => [c.id, c])), []);
  const sensitiveCardIds = useMemo(() => {
    const sensitiveEditions = new Set(
      SEED_EDITIONS.filter((e) => e.sensitive).map((e) => e.id),
    );
    return new Set(SEED_CARDS.filter((c) => sensitiveEditions.has(c.edition)).map((c) => c.id));
  }, []);

  // A moment from a sensitive edition opens only behind biometrics — the same
  // gate the editions tab and the card screen use (MANIFESTO §2).
  const openMemory = useCallback(
    async (memory: Memory) => {
      if (memory.cardId && sensitiveCardIds.has(memory.cardId)) {
        const granted = await authenticate(
          t('unlock your private diary', 'privates Tagebuch entsperren'),
        );
        if (!granted) return;
      }
      router.push(`/memory/${memory.id}`);
    },
    [authenticate, sensitiveCardIds, t],
  );

  // Group by month — the feed reads like an album with chapters.
  const sections = useMemo(() => {
    const sorted = [...memories].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const groups: { title: string; key: string; data: Memory[] }[] = [];
    for (const memory of sorted) {
      const date = new Date(memory.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const title = date.toLocaleDateString(t('en-US', 'de-DE'), {
        month: 'long',
        year: 'numeric',
      });
      const last = groups[groups.length - 1];
      if (last && last.key === key) last.data.push(memory);
      else groups.push({ key, title, data: [memory] });
    }
    return groups;
  }, [memories, t]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  // Keep the feed live when returning from creating a moment.
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const renderMemory = useCallback(
    ({ item }: { item: Memory }) => {
      const card = item.cardId ? cardById.get(item.cardId) : undefined;
      return (
        <View style={styles.cardWrap}>
          <MemoryCard
            memory={item}
            card={card}
            onPress={() => void openMemory(item)}
            onLongPress={() => void shareMemory(item, card)}
          />
        </View>
      );
    },
    [cardById, openMemory],
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* The whole feed is private — hide it in the app switcher. */}
      {obscured && <PrivacyScreen />}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderMemory}
        stickySectionHeadersEnabled={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.kickerRow}>
              <View style={[styles.kickerDot, { backgroundColor: TOGETHER }]} />
              <Text style={styles.kicker}>{t('YOUR MOMENTS', 'EURE MOMENTE')}</Text>
            </View>
            <Text style={styles.title}>
              {t('everything you kept.', 'alles, was ihr behalten habt.')}
            </Text>
            {memories.length > 0 && (
              <Text style={styles.subtitle}>
                {memories.length === 1
                  ? t('1 moment · only the two of you can see this.', '1 Moment · nur ihr beide seht das hier.')
                  : t(
                      `${memories.length} moments · only the two of you can see this.`,
                      `${memories.length} Momente · nur ihr beide seht das hier.`,
                    )}
              </Text>
            )}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.monthLabel}>{section.title.toLowerCase()}</Text>
        )}
        ListEmptyComponent={
          loading ? (
            <MemoryFeedSkeleton />
          ) : error ? (
            <EmptyState
              title={t("couldn't load your moments.", 'eure Momente konnten nicht geladen werden.')}
              hint={t(
                'they are safe — this is just a connection hiccup.',
                'sie sind sicher — das ist nur ein Verbindungsproblem.',
              )}
              ctaLabel={t('TRY AGAIN', 'NOCHMAL VERSUCHEN')}
              onCta={refresh}
            />
          ) : (
            <EmptyState
              title={t('your story starts here.', 'eure Geschichte beginnt hier.')}
              hint={t(
                'live a card together, scan its QR — and the moment lands here, with your photo and your words.',
                'erlebt eine Karte zusammen, scannt ihren QR-Code — und der Moment landet hier, mit eurem Foto und euren Worten.',
              )}
              ctaLabel={t('SCAN YOUR FIRST CARD', 'ERSTE KARTE SCANNEN')}
              onCta={() => router.push('/(tabs)/scan')}
            />
          )
        }
        ListFooterComponent={
          memories.length > 0 ? (
            <Text style={styles.footer}>
              {t(
                '✦ every moment here is private to your space.',
                '✦ jeder Moment hier ist privat in eurem Space.',
              )}
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: Spacing.xxxl },
  header: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: 6,
  },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kickerDot: { width: 6, height: 6, borderRadius: 3 },
  kicker: { fontSize: 10, fontWeight: '500', letterSpacing: 2.5, color: Colors.textSubtle },
  title: { ...Typography.editorial, fontSize: 30, lineHeight: 36 },
  subtitle: {
    fontSize: 13,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 19,
  },
  monthLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 2,
    color: Colors.textSubtle,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  cardWrap: { paddingHorizontal: Spacing.screen, paddingBottom: Spacing.md },
  footer: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.textFaint,
    textAlign: 'center',
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.screen,
  },
});
