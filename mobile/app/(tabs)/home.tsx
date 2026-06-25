import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Sections } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useMemories } from '../../lib/hooks/useMemories';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { MemoryCard } from '../../components/memory/MemoryCard';
import { SpaceSwitcher } from '../../components/space/SpaceSwitcher';
import { PressableScale } from '../../components/ui/PressableScale';
import { FloatingActionButton } from '../../components/ui/FloatingActionButton';
import { SEED_CARDS, SEED_EDITIONS } from '../../lib/seed';
import { cardRepository } from '../../lib/repositories';
import type { Memory } from '../../lib/types';

const TOGETHER = Sections.together; // warm apricot — "our space"

export default function HomeScreen() {
  const { spaces, activeSpace, setActiveSpace } = useSpaces();
  const { memories, loading } = useMemories(activeSpace?.id);
  const { t } = useLanguage();
  const [editionProgress, setEditionProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!activeSpace?.id) {
      setEditionProgress({});
      return;
    }
    let alive = true;
    Promise.all(
      SEED_EDITIONS.filter((e) => e.status === 'available').map(async (e) => {
        const cards = await cardRepository.getAll(e.id, activeSpace.id);
        return [e.id, cards.filter((c) => c.status === 'activated').length] as const;
      }),
    ).then((entries) => {
      if (alive) setEditionProgress(Object.fromEntries(entries));
    });
    return () => {
      alive = false;
    };
  }, [activeSpace?.id]);

  const activeEditions = SEED_EDITIONS.filter(
    (e) => e.status === 'available' && (editionProgress[e.id] ?? 0) > 0,
  );

  const recentMemories = [...memories].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const spaceLabel =
    activeSpace?.type === 'couple'
      ? t('couple space', 'Paar-Space')
      : t('friends space', 'Freunde-Space');

  function renderMemory({ item }: { item: Memory }) {
    const card = SEED_CARDS.find((c) => c.id === item.cardId);
    return (
      <MemoryCard
        memory={item}
        card={card}
        onPress={() => router.push(`/memory/${item.id}`)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <View style={styles.kickerRow}>
            <View style={[styles.kickerDot, { backgroundColor: TOGETHER }]} />
            <Text style={styles.kicker}>{spaceLabel.toUpperCase()}</Text>
          </View>
          <Text style={styles.spaceName} numberOfLines={1}>
            {(activeSpace?.name ?? 'your space').toLowerCase()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/space/new')}
          accessibilityRole="button"
          accessibilityLabel={t('Add a new space', 'Neuen Space hinzufügen')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.headerAction}>{t('+ SPACE', '+ SPACE')}</Text>
        </TouchableOpacity>
      </View>

      {spaces.length > 1 && (
        <SpaceSwitcher
          spaces={spaces}
          activeSpaceId={activeSpace?.id}
          onSelect={setActiveSpace}
        />
      )}

      <FlatList
        data={recentMemories}
        keyExtractor={(item) => item.id}
        renderItem={renderMemory}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            {activeEditions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  {t('GROWING TOGETHER', 'ZUSAMMEN WACHSEN')}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.editionRow}
                >
                  {activeEditions.map((e) => (
                    <PressableScale
                      key={e.id}
                      style={[styles.editionChip, { borderLeftColor: e.color }]}
                      onPress={() => router.push(`/editions/${e.id}`)}
                      accessibilityLabel={`${e.name}, ${editionProgress[e.id]} of ${e.cardCount} cards`}
                    >
                      <Text style={styles.editionSymbol}>{e.symbol}</Text>
                      <View>
                        <Text style={styles.editionName}>{e.name.toLowerCase()}</Text>
                        <Text style={styles.editionMeta}>
                          {editionProgress[e.id]} / {e.cardCount}
                        </Text>
                      </View>
                    </PressableScale>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.feedHeader}>
              <Text style={styles.sectionLabel}>
                {t('RECENTLY TOGETHER', 'ZULETZT ZUSAMMEN')}
              </Text>
              <Text style={styles.memoryCount}>
                {recentMemories.length > 0
                  ? t(
                      `${recentMemories.length} moment${recentMemories.length !== 1 ? 's' : ''}`,
                      `${recentMemories.length} Moment${recentMemories.length !== 1 ? 'e' : ''}`,
                    )
                  : ''}
              </Text>
            </View>

            {!loading && recentMemories.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyMark}>✦</Text>
                <Text style={styles.emptyText}>
                  {t('your diary is empty.', 'euer Tagebuch ist leer.')}
                </Text>
                <Text style={styles.emptyHint}>
                  {t(
                    'scan a card to unlock your first experience — or add a moment of your own.',
                    'Karte scannen, um euer erstes Erlebnis freizuschalten — oder einen eigenen Moment festhalten.',
                  )}
                </Text>
                <PressableScale
                  style={styles.emptyCta}
                  onPress={() => router.push('/(tabs)/scan')}
                  accessibilityLabel={t('Scan your first card', 'Erste Karte scannen')}
                >
                  <Text style={styles.emptyCtaText}>
                    {t('SCAN YOUR FIRST CARD', 'ERSTE KARTE SCANNEN')}
                  </Text>
                </PressableScale>
              </View>
            )}
          </>
        }
      />

      {/* Upload a moment from anywhere — the entry point that was missing. */}
      <FloatingActionButton
        onPress={() => router.push('/memory/create')}
        icon="camera-outline"
        label={t('MOMENT', 'MOMENT')}
        color={TOGETHER}
        accessibilityLabel={t('Add a moment or upload a photo', 'Moment hinzufügen oder Foto hochladen')}
        style={styles.fab}
      />

      <View style={styles.addBar}>
        <PressableScale
          style={styles.scanBar}
          onPress={() => router.push('/(tabs)/scan')}
          accessibilityLabel={t('Scan a card', 'Karte scannen')}
        >
          <Text style={styles.scanBarText}>{t('SCAN CARD', 'KARTE SCANNEN')}</Text>
        </PressableScale>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerText: { flex: 1, paddingRight: Spacing.md },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  kickerDot: { width: 7, height: 7, borderRadius: 4 },
  kicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    color: Colors.textSubtle,
  },
  spaceName: {
    ...Typography.editorial,
    fontSize: 30,
    lineHeight: 34,
  },
  headerAction: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    color: Colors.textSubtle,
  },
  list: {
    paddingBottom: 150,
  },
  section: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2.5,
    color: Colors.textSubtle,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.screen,
    marginBottom: Spacing.md,
  },
  editionRow: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing.sm,
  },
  editionChip: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    backgroundColor: Colors.backgroundWarm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderRadius: Radii.sm,
  },
  editionSymbol: { fontSize: 20 },
  editionName: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.text,
  },
  editionMeta: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 1,
    color: Colors.textSubtle,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  memoryCount: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
    color: Colors.textSubtle,
    textTransform: 'uppercase',
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyMark: { fontSize: 34, color: TOGETHER, marginBottom: Spacing.sm },
  emptyText: {
    ...Typography.editorial,
    fontSize: 22,
    color: Colors.text,
  },
  emptyHint: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textSubtle,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyCta: {
    height: 48,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    borderRadius: Radii.pill,
  },
  emptyCtaText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2.5,
    color: Colors.white,
  },
  fab: {
    bottom: 54 + Spacing.lg, // float above the scan bar
  },
  addBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  scanBar: {
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.text,
  },
  scanBarText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.5,
    color: Colors.white,
  },
});
