import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useMemories } from '../../lib/hooks/useMemories';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { useWeeklyChallenge } from '../../lib/hooks/useWeeklyChallenge';
import { MemoryCard } from '../../components/memory/MemoryCard';
import { SpaceSwitcher } from '../../components/space/SpaceSwitcher';
import { SEED_CARDS, SEED_EDITIONS } from '../../lib/seed';
import { cardRepository } from '../../lib/repositories';
import type { Memory } from '../../lib/types';

export default function HomeScreen() {
  const { spaces, activeSpace, setActiveSpace } = useSpaces();
  const { memories, loading } = useMemories(activeSpace?.id);
  const { t } = useLanguage();
  const { weekly, enrolled, progress: challengeProgress, chillyCount } = useWeeklyChallenge(activeSpace?.id);
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
        <View>
          <Text style={styles.spaceName}>
            {(activeSpace?.name ?? 'your space').toLowerCase()}
          </Text>
          <Text style={styles.spaceLabel}>{spaceLabel}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/space/new')}
          accessibilityRole="button"
          accessibilityLabel={t('Add a new space', 'Neuen Space hinzufügen')}
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
                    <TouchableOpacity
                      key={e.id}
                      style={[styles.editionChip, { borderLeftColor: e.color }]}
                      onPress={() => router.push(`/editions/${e.id}`)}
                      activeOpacity={0.85}
                      accessibilityRole="button"
                      accessibilityLabel={`${e.name}, ${editionProgress[e.id]} of ${e.cardCount} cards`}
                    >
                      <Text style={styles.editionSymbol}>{e.symbol}</Text>
                      <View>
                        <Text style={styles.editionName}>{e.name.toLowerCase()}</Text>
                        <Text style={styles.editionMeta}>
                          {editionProgress[e.id]} / {e.cardCount}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.hubSection}>
              <View style={styles.hubIntro}>
                <Text style={styles.sectionLabel}>
                  {t('YOUR SPACE', 'EUER SPACE')}
                </Text>
                <Text style={styles.hubTitle}>
                  {t('what do you want to do together?', 'was wollt ihr zusammen machen?')}
                </Text>
              </View>

              <View style={styles.quickGrid}>
                <TouchableOpacity
                  style={[styles.quickCard, styles.quickCardDark]}
                  onPress={() => router.push(`/challenges/${weekly.id}`)}
                  activeOpacity={0.88}
                  accessibilityRole="button"
                  accessibilityLabel={t('Complete this weekly challenge', 'Wöchentliche Challenge abschließen')}
                >
                  <Text style={styles.quickKickerDark}>{t('THIS WEEK', 'DIESE WOCHE')}</Text>
                  <Text style={styles.quickTitleDark}>{weekly.title}</Text>
                  <Text style={styles.quickBodyDark}>
                    {challengeProgress?.complete
                      ? t('complete — keep the glow going.', 'geschafft — nehmt den Schwung mit.')
                      : enrolled && challengeProgress
                        ? t(
                            `${challengeProgress.count}/${challengeProgress.goal} moments collected`,
                            `${challengeProgress.count}/${challengeProgress.goal} Momente gesammelt`,
                          )
                        : t('choose it together, then add a photo or note when you live it.', 'wählt sie zusammen, dann Foto oder Notiz hinzufügen, wenn ihr sie erlebt.')}
                  </Text>
                </TouchableOpacity>

                <View style={styles.quickColumn}>
                  <TouchableOpacity
                    style={styles.quickMini}
                    onPress={() => router.push('/ask')}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={t('Ask PeakPlant', 'PeakPlant fragen')}
                  >
                    <Text style={styles.quickMiniTitle}>{t('ask peakplant', 'peakplant fragen')}</Text>
                    <Text style={styles.quickMiniBody}>{t('get a fitted idea', 'passende Idee holen')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickMini}
                    onPress={() => router.push('/discover/saved')}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={t('Open saved ideas', 'Gemerkte Ideen öffnen')}
                  >
                    <Text style={styles.quickMiniTitle}>{t('saved plans', 'gemerkte Pläne')}</Text>
                    <Text style={styles.quickMiniBody}>{t('plan, do, preserve', 'planen, machen, festhalten')}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.collectibleLine}>
                {chillyCount > 0
                  ? t(
                      `${chillyCount} challenge${chillyCount !== 1 ? 's' : ''} completed together`,
                      `${chillyCount} Challenge${chillyCount !== 1 ? 's' : ''} zusammen geschafft`,
                    )
                  : t('your weekly collectible starts with the first completed challenge.', 'euer wöchentliches Sammelzeichen startet mit der ersten geschafften Challenge.')}
              </Text>
            </View>

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
                <Text style={styles.emptyText}>
                  {t('your diary is empty.', 'euer Tagebuch ist leer.')}
                </Text>
                <Text style={styles.emptyHint}>
                  {t(
                    'scan a card or complete a weekly challenge to begin.',
                    'Karte scannen oder Wochen-Challenge abschließen, um zu beginnen.',
                  )}
                </Text>
              </View>
            )}
          </>
        }
      />

      <View style={styles.addBar}>
        <TouchableOpacity
          style={[styles.addBtn, styles.addBtnFill]}
          onPress={() => router.push('/(tabs)/scan')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('Scan a card', 'Karte scannen')}
        >
          <Text style={styles.addBtnTextFill}>{t('SCAN CARD', 'KARTE SCANNEN')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push(`/challenges/${weekly.id}`)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('Complete the weekly challenge', 'Wöchentliche Challenge abschließen')}
        >
          <Text style={styles.addBtnText}>{t('WEEKLY CHALLENGE', 'WOCHEN-CHALLENGE')}</Text>
        </TouchableOpacity>
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
  spaceName: {
    fontSize: 22,
    fontWeight: '300',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  spaceLabel: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 2,
    color: Colors.textFaint,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  headerAction: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2,
    color: Colors.textSubtle,
  },
  list: {
    paddingBottom: 90,
  },
  section: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2.5,
    color: Colors.textFaint,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.screen,
    marginBottom: Spacing.md,
  },
  hubSection: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  hubIntro: {
    gap: 2,
  },
  hubTitle: {
    fontSize: 24,
    fontWeight: '200',
    color: Colors.text,
    letterSpacing: -0.4,
    lineHeight: 30,
    paddingHorizontal: Spacing.screen,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screen,
  },
  quickCard: {
    flex: 1.15,
    minHeight: 154,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  quickCardDark: {
    backgroundColor: Colors.text,
  },
  quickKickerDark: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2.2,
    color: Colors.accent,
  },
  quickTitleDark: {
    fontSize: 20,
    fontWeight: '200',
    color: Colors.white,
    letterSpacing: -0.3,
    lineHeight: 25,
  },
  quickBodyDark: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.backgroundCream,
    lineHeight: 18,
  },
  quickColumn: {
    flex: 1,
    gap: Spacing.sm,
  },
  quickMini: {
    flex: 1,
    minHeight: 72,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundWarm,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  quickMiniTitle: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.text,
  },
  quickMiniBody: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 16,
  },
  collectibleLine: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textFaint,
    lineHeight: 17,
    paddingHorizontal: Spacing.screen,
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
  },
  editionSymbol: { fontSize: 20 },
  editionName: {
    fontSize: 13,
    fontWeight: '300',
    color: Colors.text,
  },
  editionMeta: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 1,
    color: Colors.textFaint,
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
    fontWeight: '400',
    letterSpacing: 1,
    color: Colors.textFaint,
    textTransform: 'uppercase',
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '300',
    color: Colors.textMuted,
  },
  emptyHint: {
    fontSize: 13,
    fontWeight: '300',
    color: Colors.textFaint,
    textAlign: 'center',
    lineHeight: 20,
  },
  addBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  addBtn: {
    flex: 1,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  addBtnFill: {
    backgroundColor: Colors.text,
    borderRightColor: Colors.text,
  },
  addBtnText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2,
    color: Colors.text,
  },
  addBtnTextFill: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2,
    color: Colors.white,
  },
});
