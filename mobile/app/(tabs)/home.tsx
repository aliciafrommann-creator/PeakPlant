import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Accents, Sections } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useMemories } from '../../lib/hooks/useMemories';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { relativeDay } from '../../lib/relativeTime';
import { MemoryFeedSkeleton } from '../../components/ui/Skeleton';
import { useNotes } from '../../lib/hooks/useNotes';
import { useWeeklyChallenge } from '../../lib/hooks/useWeeklyChallenge';
import { MemoryCard } from '../../components/memory/MemoryCard';
import { SpacePicker } from '../../components/space/SpacePicker';
import { PressableScale } from '../../components/ui/PressableScale';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../components/ui/EmptyState';
import { SEED_CARDS, SEED_EDITIONS } from '../../lib/seed';
import { cardRepository } from '../../lib/repositories';
import { shareMemory } from '../../lib/share';
import type { Memory } from '../../lib/types';

const TOGETHER = Sections.together;

export default function HomeScreen() {
  const { spaces, activeSpace, setActiveSpace } = useSpaces();
  const { memories, loading, error, refresh } = useMemories(activeSpace?.id);
  const { t, language } = useLanguage();
  const { latestNote, latestFromPartner } = useNotes(activeSpace?.id);
  const { weekly, enrolled, progress: challengeProgress, chillyCount } = useWeeklyChallenge(
    activeSpace?.id,
  );
  const [editionProgress, setEditionProgress] = useState<Record<string, number>>({});
  const [pickerOpen, setPickerOpen] = useState(false);

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

  const totalCards = Object.values(editionProgress).reduce((a, b) => a + b, 0);

  const recentMemories = [...memories].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const spaceLabel =
    activeSpace?.type === 'couple'
      ? t('COUPLE SPACE', 'PAAR-SPACE')
      : t('FRIENDS SPACE', 'FREUNDE-SPACE');

  function renderMemory({ item }: { item: Memory }) {
    const card = SEED_CARDS.find((c) => c.id === item.cardId);
    return (
      <MemoryCard
        memory={item}
        card={card}
        onPress={() => router.push(`/memory/${item.id}`)}
        onLongPress={() => void shareMemory(item, card)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header — the space name is the dropdown trigger (Instagram-style) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerTrigger}
          onPress={() => setPickerOpen(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('Switch, add or share a space', 'Space wechseln, hinzufügen oder teilen')}
          accessibilityHint={t('Opens the space picker', 'Öffnet die Space-Auswahl')}
        >
          <View style={styles.headerAvatar}>
            {activeSpace?.avatarUrl ? (
              <Image source={{ uri: activeSpace.avatarUrl }} style={styles.headerAvatarImage} />
            ) : (
              <Text style={styles.headerAvatarEmoji}>
                {activeSpace?.emoji ?? (activeSpace?.type === 'friends' ? '✦' : '♥')}
              </Text>
            )}
          </View>
          <View style={styles.headerText}>
            <View style={styles.kickerRow}>
              <View style={[styles.kickerDot, { backgroundColor: TOGETHER }]} />
              <Text style={styles.kicker}>{spaceLabel}</Text>
            </View>
            <View style={styles.nameRow}>
              <Text style={styles.spaceName} numberOfLines={1}>
                {(activeSpace?.name ?? 'your space').toLowerCase()}
              </Text>
              <Ionicons name="chevron-down" size={18} color={Colors.textMuted} style={styles.chevron} />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <SpacePicker
        visible={pickerOpen}
        spaces={spaces}
        activeSpaceId={activeSpace?.id}
        onSelect={(id) => {
          setActiveSpace(id);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />

      <FlatList
        data={recentMemories}
        keyExtractor={(item) => item.id}
        renderItem={renderMemory}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading && recentMemories.length > 0}
            onRefresh={refresh}
            tintColor={Colors.accent}
          />
        }
        ListHeaderComponent={
          <>
            {/* Hub — the couple space is where everything starts: this week's
                challenge, a fitted idea, your saved plans. */}
            {activeSpace && (
              <View style={styles.hubSection}>
                <Text style={styles.sectionLabel}>{t('YOUR SPACE', 'EUER SPACE')}</Text>
                <Text style={styles.hubTitle}>
                  {t('what do you want to do together?', 'was wollt ihr zusammen machen?')}
                </Text>

                <View style={styles.quickGrid}>
                  <PressableScale
                    style={[styles.quickCard, styles.quickCardDark]}
                    onPress={() => router.push(`/challenges/${weekly.id}`)}
                    accessibilityLabel={t(
                      'Complete this weekly challenge',
                      'Wöchentliche Challenge abschließen',
                    )}
                  >
                    <Text style={styles.quickKickerDark}>{t('THIS WEEK', 'DIESE WOCHE')}</Text>
                    <Text style={styles.quickTitleDark} numberOfLines={2}>
                      {weekly.title}
                    </Text>
                    <Text style={styles.quickBodyDark} numberOfLines={2}>
                      {challengeProgress?.complete
                        ? t('complete — keep the glow going.', 'geschafft — nehmt den Schwung mit.')
                        : enrolled && challengeProgress
                          ? t(
                              `${challengeProgress.count}/${challengeProgress.goal} moments collected`,
                              `${challengeProgress.count}/${challengeProgress.goal} Momente gesammelt`,
                            )
                          : t(
                              'choose it together, add a photo or note when you live it.',
                              'wählt sie zusammen, Foto oder Notiz hinzufügen, wenn ihr sie erlebt.',
                            )}
                    </Text>
                  </PressableScale>

                  <View style={styles.quickColumn}>
                    <PressableScale
                      style={styles.quickMini}
                      onPress={() => router.push('/ask')}
                      accessibilityLabel={t('Ask PeakPlant', 'PeakPlant fragen')}
                    >
                      <Text style={styles.quickMiniTitle}>{t('ask peakplant', 'peakplant fragen')}</Text>
                      <Text style={styles.quickMiniBody}>{t('get a fitted idea', 'passende Idee holen')}</Text>
                    </PressableScale>
                    <PressableScale
                      style={styles.quickMini}
                      onPress={() => router.push('/discover/saved')}
                      accessibilityLabel={t('Open saved plans', 'Gemerkte Pläne öffnen')}
                    >
                      <Text style={styles.quickMiniTitle}>{t('saved plans', 'gemerkte Pläne')}</Text>
                      <Text style={styles.quickMiniBody}>{t('plan, do, preserve', 'planen, machen, festhalten')}</Text>
                    </PressableScale>
                  </View>
                </View>

                {chillyCount > 0 && (
                  <Text style={styles.collectibleStrip}>
                    {(activeSpace.collectibleEmoji ?? '🌶️').repeat(Math.min(chillyCount, 12))}
                  </Text>
                )}
                <Text style={styles.collectibleLine}>
                  {chillyCount > 0
                    ? t(
                        `${chillyCount} challenge${chillyCount !== 1 ? 's' : ''} completed together`,
                        `${chillyCount} Challenge${chillyCount !== 1 ? 's' : ''} zusammen geschafft`,
                      )
                    : t(
                        `your collectible ${activeSpace.collectibleEmoji ?? '🌶️'} starts with the first completed challenge.`,
                        `euer Sammelzeichen ${activeSpace.collectibleEmoji ?? '🌶️'} startet mit der ersten geschafften Challenge.`,
                      )}
                </Text>
              </View>
            )}

            {/* Heartbeat stats — visible once there's content */}
            {memories.length > 0 && (
              <View style={styles.heartbeat}>
                <View style={styles.heartbeatStat}>
                  <Text style={styles.heartbeatNum}>{memories.length}</Text>
                  <Text style={styles.heartbeatLabel}>{t('MOMENTS', 'MOMENTE')}</Text>
                </View>
                {totalCards > 0 && (
                  <>
                    <View style={styles.heartbeatDiv} />
                    <View style={styles.heartbeatStat}>
                      <Text style={styles.heartbeatNum}>{totalCards}</Text>
                      <Text style={styles.heartbeatLabel}>{t('CARDS', 'KARTEN')}</Text>
                    </View>
                  </>
                )}
                <View style={styles.heartbeatFill} />
                <Text style={styles.heartbeatGlyph}>♥</Text>
              </View>
            )}

            {/* Memory filmstrip — polaroid scroll */}
            {recentMemories.length > 0 && (
              <View style={styles.filmstripSection}>
                <Text style={styles.sectionLabel}>
                  {t('RECENTLY TOGETHER', 'ZULETZT ZUSAMMEN')}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filmstrip}
                >
                  {recentMemories.slice(0, 8).map((m) => {
                    const card = SEED_CARDS.find((c) => c.id === m.cardId);
                    return (
                      <PressableScale
                        key={m.id}
                        style={styles.polaroid}
                        onPress={() => router.push(`/memory/${m.id}`)}
                        scaleTo={0.97}
                        accessibilityLabel={`Moment ${relativeDay(m.createdAt, language)}`}
                      >
                        {m.photoUri ? (
                          <Image
                            source={{ uri: m.photoUri }}
                            style={styles.polaroidPhoto}
                            accessibilityLabel="Moment photo"
                          />
                        ) : (
                          <View style={styles.polaroidBlank}>
                            <Text style={styles.polaroidMark}>✦</Text>
                          </View>
                        )}
                        <View style={styles.polaroidCaption}>
                          {card && (
                            <Text style={styles.polaroidCard}>
                              {String(card.number).padStart(2, '0')}
                            </Text>
                          )}
                          <Text style={styles.polaroidDate} numberOfLines={1}>{relativeDay(m.createdAt, language)}</Text>
                        </View>
                      </PressableScale>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Active editions — editorial progress cards */}
            {activeEditions.length > 0 && (
              <View style={styles.editionsSection}>
                <Text style={styles.sectionLabel}>
                  {t('GROWING TOGETHER', 'ZUSAMMEN WACHSEN')}
                </Text>
                {activeEditions.map((e) => {
                  const progress = editionProgress[e.id] ?? 0;
                  const pct = Math.min(100, (progress / e.cardCount) * 100);
                  return (
                    <PressableScale
                      key={e.id}
                      style={[styles.editionCard, { borderLeftColor: e.color }]}
                      onPress={() => router.push(`/editions/${e.id}`)}
                      accessibilityLabel={`${e.name}, ${progress} von ${e.cardCount} Karten`}
                    >
                      <Text style={styles.editionSymbol}>{e.symbol}</Text>
                      <View style={styles.editionText}>
                        <Text style={styles.editionName}>{e.name.toLowerCase()}</Text>
                        <Text style={styles.editionSub}>{e.subtitle}</Text>
                        <View style={styles.progressTrack}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${pct}%` as `${number}%`, backgroundColor: e.color },
                            ]}
                          />
                        </View>
                        <Text style={styles.editionProgress}>
                          {progress} / {e.cardCount} {t('cards', 'Karten')}
                        </Text>
                      </View>
                      <Text style={styles.editionArrow}>→</Text>
                    </PressableScale>
                  );
                })}
              </View>
            )}

            {/* Notes nudge — a note from the partner takes priority over your own */}
            {activeSpace &&
              (() => {
                const shown = latestFromPartner ?? latestNote;
                const fromPartner = !!latestFromPartner;
                const title = fromPartner
                  ? t('FROM YOUR PARTNER', 'VON DEINEM PARTNER')
                  : shown
                    ? t('YOUR LAST NOTE', 'DEINE LETZTE NOTIZ')
                    : t('WRITE A NOTE', 'SCHREIB EINE NOTIZ');
                return (
                  <TouchableOpacity
                    style={[styles.notesRow, fromPartner && styles.notesRowPartner]}
                    onPress={() => router.push('/note/compose')}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={t(
                      'Write a note to your partner',
                      'Schreib deinem Partner eine Notiz',
                    )}
                  >
                    <View style={styles.notesLeft}>
                      <Text style={styles.notesIcon}>{fromPartner ? '♥' : '✉'}</Text>
                      <View style={styles.notesTextBlock}>
                        <Text
                          style={[styles.notesTitle, fromPartner && styles.notesTitlePartner]}
                        >
                          {title}
                        </Text>
                        <Text style={styles.notesBody} numberOfLines={2}>
                          {shown
                            ? shown.text
                            : t('tell your partner something...', 'sag deinem Partner etwas...')}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.notesArrow}>→</Text>
                  </TouchableOpacity>
                );
              })()}

            {/* All moments feed header */}
            {recentMemories.length > 0 && (
              <View style={styles.feedHeader}>
                <Text style={styles.sectionLabel}>{t('ALL MOMENTS', 'ALLE MOMENTE')}</Text>
              </View>
            )}

            {/* First paint while loading — content-shaped skeletons, not a lone
                spinner, so the feed reads as "about to appear". */}
            {loading && recentMemories.length === 0 && !error && (
              <MemoryFeedSkeleton count={3} />
            )}

            {/* Load failure must NOT read as "no memories" — distinct, retryable. */}
            {!loading && error && recentMemories.length === 0 && (
              <EmptyState
                mark="✦"
                title={t("couldn't load your moments.", 'eure Momente konnten nicht geladen werden.')}
                hint={t(
                  'your memories are safe — this is just a connection hiccup.',
                  'eure Erinnerungen sind sicher — das ist nur ein Verbindungsproblem.',
                )}
                ctaLabel={t('TRY AGAIN', 'ERNEUT VERSUCHEN')}
                onCta={refresh}
              />
            )}

            {/* True empty state with brand bloom */}
            {!loading && !error && recentMemories.length === 0 && (
              <EmptyState
                mark="bloom"
                title={t('your space is waiting.', 'euer Space wartet.')}
                hint={t(
                  "scan a card to unlock your first experience — or take on this week's challenge together.",
                  'Karte scannen, um euer erstes Erlebnis freizuschalten — oder nehmt gemeinsam die Wochen-Challenge an.',
                )}
                ctaLabel={t("START THIS WEEK'S CHALLENGE", 'WOCHEN-CHALLENGE STARTEN')}
                onCta={() => router.push(`/challenges/${weekly.id}`)}
              />
            )}
          </>
        }
      />

      <View style={styles.addBar}>
        <PressableScale
          style={[styles.addBtn, styles.addBtnFill]}
          onPress={() => router.push('/(tabs)/scan')}
          accessibilityLabel={t('Scan a card', 'Karte scannen')}
        >
          <Text style={styles.addBtnTextFill}>{t('SCAN CARD', 'KARTE SCANNEN')}</Text>
        </PressableScale>
        <PressableScale
          style={styles.addBtn}
          onPress={() => router.push(`/challenges/${weekly.id}`)}
          accessibilityLabel={t('Complete the weekly challenge', 'Wöchentliche Challenge abschließen')}
        >
          <Text style={styles.addBtnText}>{t('WEEKLY CHALLENGE', 'WOCHEN-CHALLENGE')}</Text>
        </PressableScale>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
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
  headerTrigger: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingRight: Spacing.md },
  headerAvatar: {
    width: 52,
    height: 52,
    borderRadius: Radii.pill,
    backgroundColor: Colors.backgroundCream,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerAvatarImage: { width: 52, height: 52 },
  headerAvatarEmoji: { fontSize: 26 },
  headerText: { flex: 1 },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  kickerDot: { width: 7, height: 7, borderRadius: 4 },
  kicker: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: TOGETHER,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  spaceName: {
    ...Typography.editorial,
    fontSize: 30,
    lineHeight: 34,
    flexShrink: 1,
  },
  chevron: { marginTop: 4 },

  list: { paddingBottom: 150 },

  // Heartbeat strip
  heartbeat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  heartbeatStat: { alignItems: 'center' },
  heartbeatNum: {
    ...Typography.editorial,
    fontSize: 26,
    lineHeight: 30,
    color: Colors.text,
  },
  heartbeatLabel: {
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 2,
    color: Colors.textFaint,
    marginTop: 2,
  },
  heartbeatDiv: { width: 1, height: 26, backgroundColor: Colors.border },
  heartbeatFill: { flex: 1 },
  heartbeatGlyph: { fontSize: 18, color: Accents.apricot },

  // Filmstrip section
  filmstripSection: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
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
  filmstrip: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing.xs,
  },
  polaroid: {
    width: 116,
    backgroundColor: Colors.surface,
    borderRadius: Radii.sm,
    overflow: 'hidden',
    ...Shadows.card,
  },
  polaroidPhoto: {
    width: 116,
    height: 116,
    backgroundColor: Colors.border,
  },
  polaroidBlank: {
    width: 116,
    height: 116,
    backgroundColor: Accents.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  polaroidMark: { fontSize: 26, color: Accents.apricot },
  polaroidCaption: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  polaroidCard: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 2,
    color: Colors.accent,
  },
  polaroidDate: {
    fontSize: 10,
    fontWeight: '400',
    color: Colors.textSubtle,
  },

  // Active editions
  editionsSection: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  editionCard: {
    marginHorizontal: Spacing.screen,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.backgroundWarm,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: Colors.border,
    padding: Spacing.md,
    ...Shadows.subtle,
  },
  editionSymbol: { fontSize: 30 },
  editionText: { flex: 1, gap: 3 },
  editionName: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    letterSpacing: 0.1,
  },
  editionSub: {
    fontSize: 10,
    fontWeight: '400',
    color: Colors.textSubtle,
    letterSpacing: 0.4,
  },
  progressTrack: {
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginTop: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
  editionProgress: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 1,
    color: Colors.textFaint,
    marginTop: 3,
  },
  editionArrow: {
    fontSize: 18,
    fontWeight: '300',
    color: Colors.textMuted,
  },

  // Notes nudge
  notesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  notesRowPartner: {
    backgroundColor: Colors.backgroundCream,
  },
  notesTitlePartner: {
    color: Accents.blossom,
  },
  notesLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    flex: 1,
  },
  notesIcon: { fontSize: 20, marginTop: 1 },
  notesTextBlock: { flex: 1, gap: 4 },
  notesTitle: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2.5,
    color: Colors.textSubtle,
    textTransform: 'uppercase',
  },
  notesBody: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.text,
    lineHeight: 20,
  },
  notesArrow: {
    fontSize: 18,
    fontWeight: '300',
    color: Colors.textMuted,
  },

  // Feed header
  feedHeader: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },

  // Hub — the action center
  hubSection: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  hubTitle: {
    ...Typography.editorial,
    fontSize: 20,
    lineHeight: 26,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickCard: {
    flex: 1,
    borderRadius: Radii.md,
    padding: Spacing.md,
    justifyContent: 'flex-start',
    minHeight: 132,
    ...Shadows.subtle,
  },
  quickCardDark: {
    backgroundColor: Colors.text,
  },
  quickKickerDark: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: Accents.sunflower,
    marginBottom: Spacing.xs,
  },
  quickTitleDark: {
    ...Typography.editorial,
    fontSize: 19,
    lineHeight: 23,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  quickBodyDark: {
    fontSize: 12,
    fontWeight: '300',
    lineHeight: 17,
    color: 'rgba(250,247,240,0.72)',
  },
  quickColumn: {
    flex: 1,
    gap: Spacing.sm,
  },
  quickMini: {
    flex: 1,
    backgroundColor: Colors.backgroundWarm,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  quickMiniTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 3,
  },
  quickMiniBody: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textSubtle,
  },
  collectibleStrip: {
    fontSize: 18,
    letterSpacing: 2,
    marginTop: Spacing.md,
  },
  collectibleLine: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.3,
    color: Colors.textSubtle,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },

  // Bottom action bar — two primary couple actions
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
  },
  addBtnFill: {
    backgroundColor: Colors.text,
  },
  addBtnTextFill: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.5,
    color: Colors.white,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.5,
    color: Colors.text,
  },
});
