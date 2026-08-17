import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Colors, Accents, Sections } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useMemories } from '../../lib/hooks/useMemories';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { relativeDay } from '../../lib/relativeTime';
import { MemoryFeedSkeleton } from '../../components/ui/Skeleton';
import { AnimatedFill } from '../../components/ui/AnimatedFill';
import { FadeInImage } from '../../components/ui/FadeInImage';
import { useNotes } from '../../lib/hooks/useNotes';
import { useWeeklyChallenge } from '../../lib/hooks/useWeeklyChallenge';
import { useBiometric } from '../../lib/hooks/useBiometric';
import { MemoryCard } from '../../components/memory/MemoryCard';
import { SpacePicker } from '../../components/space/SpacePicker';
import { PressableScale } from '../../components/ui/PressableScale';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../components/ui/EmptyState';
import { SEED_CARDS, SEED_EDITIONS } from '../../lib/seed';
import { cardRepository, savedDateRepository } from '../../lib/repositories';
import { shareMemory } from '../../lib/share';
import { acknowledgeSelection, confirmSuccess } from '../../lib/haptics';
import { Toast } from '../../components/ui/Toast';
import { consumePendingReward } from '../../lib/pendingReward';
import { discovery } from '../../lib/ai';
import { momentById } from '../../lib/together';
import type { DateRecommendation } from '../../lib/discovery/types';
import type { Memory, SavedDate } from '../../lib/types';

const TOGETHER = Sections.together;

export default function HomeScreen() {
  const { spaces, activeSpace, setActiveSpace } = useSpaces();
  const { memories, loading, error, refresh } = useMemories(activeSpace?.id);
  const { t, l, language } = useLanguage();
  const { latestNote, latestFromPartner } = useNotes(activeSpace?.id);
  const { weekly, enrolled, progress: challengeProgress, accept: acceptChallenge, chillyCount } =
    useWeeklyChallenge(activeSpace?.id, activeSpace?.type);

  // The hub challenge card acts in place — one clear action per state:
  // not enrolled → take it on; in progress → add a moment (note/photo);
  // complete → review the badge you earned.
  const onHubChallenge = useCallback(async () => {
    if (challengeProgress?.complete) {
      router.push(`/challenges/${weekly.id}`);
      return;
    }
    if (!enrolled) {
      await acceptChallenge();
      void confirmSuccess();
      return;
    }
    router.push({
      pathname: '/memory/create',
      params: {
        prefillNote: t(`weekly challenge: ${l(weekly.title)}`, `Wochen-Challenge: ${l(weekly.title)}`),
      },
    });
  }, [challengeProgress?.complete, enrolled, acceptChallenge, weekly.id, weekly.title, t, l]);
  const { authenticate } = useBiometric();
  const [editionProgress, setEditionProgress] = useState<Record<string, number>>({});

  // Time-based greeting — the home is "entering your shared world", not a
  // dashboard (design north star: the reference home opens with a greeting).
  const hour = new Date().getHours();
  const greeting =
    hour < 11
      ? t('GOOD MORNING', 'GUTEN MORGEN')
      : hour < 17
        ? t('GOOD AFTERNOON', 'SCHÖNEN TAG')
        : t('GOOD EVENING', 'GUTEN ABEND');
  const timeOfDay: 'morning' | 'afternoon' | 'evening' =
    hour < 11 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  // Today's Moment — one editorial suggestion from the same daily-variety
  // recommender Discover uses. One idea, not a menu.
  const [todaysMoment, setTodaysMoment] = useState<DateRecommendation | null>(null);
  useEffect(() => {
    if (!activeSpace) {
      setTodaysMoment(null);
      return;
    }
    let alive = true;
    discovery
      .recommend({ spaceType: activeSpace.type, timeOfDay })
      .then((r) => {
        if (alive) setTodaysMoment(r[0] ?? null);
      })
      .catch(() => {
        if (alive) setTodaysMoment(null);
      });
    return () => {
      alive = false;
    };
  }, [activeSpace, timeOfDay]);

  // Saved dates feed YOUR STORY (dates/places) and the COMING UP card.
  const [savedDates, setSavedDates] = useState<SavedDate[]>([]);
  useFocusEffect(
    useCallback(() => {
      if (!activeSpace) {
        setSavedDates([]);
        return;
      }
      let alive = true;
      savedDateRepository
        .getAll(activeSpace.id)
        .then((all) => {
          if (alive) setSavedDates(all);
        })
        .catch(() => {});
      return () => {
        alive = false;
      };
    }, [activeSpace]),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [reward, setReward] = useState<string | null>(null);

  // A little celebration when you land back on the feed after keeping a moment.
  useFocusEffect(
    useCallback(() => {
      const kind = consumePendingReward();
      if (kind === 'moment') setReward(t('moment kept ♥', 'Moment festgehalten ♥'));
      else if (kind === 'challenge') setReward(t('challenge done ✦', 'Challenge geschafft ✦'));
    }, [t]),
  );

  // Sensitive editions stay gated wherever they're opened from — Home included
  // (the editions tab already gates; this closes the bypass from the feed).
  const openEdition = useCallback(
    async (edition: { id: string; sensitive?: boolean }) => {
      if (edition.sensitive) {
        const granted = await authenticate(
          t('unlock your private diary', 'privates Tagebuch entsperren'),
        );
        if (!granted) return;
      }
      router.push(`/editions/${edition.id}`);
    },
    [authenticate, t],
  );

  const loadEditionProgress = useCallback(async () => {
    if (!activeSpace?.id) {
      setEditionProgress({});
      return;
    }
    const entries = await Promise.all(
      SEED_EDITIONS.filter((e) => e.status === 'available').map(async (e) => {
        const cards = await cardRepository.getAll(e.id, activeSpace.id);
        return [e.id, cards.filter((c) => c.status === 'activated').length] as const;
      }),
    );
    setEditionProgress(Object.fromEntries(entries));
  }, [activeSpace?.id]);

  useEffect(() => {
    void loadEditionProgress();
  }, [loadEditionProgress]);

  // Re-check on focus so a card just scanned/activated shows up in "growing
  // together" the moment you return to the feed.
  useFocusEffect(
    useCallback(() => {
      void loadEditionProgress();
    }, [loadEditionProgress]),
  );

  const activeEditions = SEED_EDITIONS.filter(
    (e) => e.status === 'available' && (editionProgress[e.id] ?? 0) > 0,
  );

  const totalCards = Object.values(editionProgress).reduce((a, b) => a + b, 0);

  const recentMemories = [...memories].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // A gentle, living reward — moments preserved in the last 7 days.
  const momentsThisWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86_400_000;
    return memories.filter((m) => new Date(m.createdAt).getTime() >= weekAgo).length;
  }, [memories]);

  // Warm tint per category for the hero card — colour communicates the idea's
  // mood, never decoration (design north star §4).
  const heroTint = useMemo(() => {
    const category = todaysMoment ? momentById(todaysMoment.momentId)?.category : undefined;
    switch (category) {
      case 'food':
        return { bg: '#3A2A22', bloom: Accents.ember };
      case 'outdoors':
        return { bg: '#33301F', bloom: Accents.sunflower };
      case 'create':
        return { bg: '#37232C', bloom: Accents.blossom };
      case 'play':
        return { bg: '#3A2E20', bloom: Accents.apricot };
      default:
        return { bg: '#2A2D24', bloom: Accents.sage };
    }
  }, [todaysMoment]);

  // YOUR STORY — honest numbers only: every figure is counted from real data.
  const datesDone = useMemo(
    () => savedDates.filter((d) => d.status === 'completed').length,
    [savedDates],
  );
  const placesCount = useMemo(
    () => new Set(savedDates.filter((d) => d.placeName).map((d) => d.placeName)).size,
    [savedDates],
  );
  const nextPlanned = useMemo(() => {
    const planned = savedDates.filter((d) => d.status === 'planned');
    return planned.sort((a, b) => {
      const ta = a.plannedFor ? new Date(a.plannedFor).getTime() : Infinity;
      const tb = b.plannedFor ? new Date(b.plannedFor).getTime() : Infinity;
      return ta - tb;
    })[0];
  }, [savedDates]);


  // Home shows the three most recent moments as a warm preview — the full
  // album lives in the MOMENTS tab (target IA), so Home stays "what is
  // happening in our relationship right now" instead of an endless feed.
  const feedPreview = useMemo(() => recentMemories.slice(0, 3), [recentMemories]);

  // One lookup map instead of a SEED_CARDS.find per row per render, and a
  // stable renderItem so FlatList can skip re-rendering unchanged rows.
  const cardById = useMemo(() => new Map(SEED_CARDS.map((c) => [c.id, c])), []);
  const renderMemory = useCallback(
    ({ item }: { item: Memory }) => {
      const card = item.cardId ? cardById.get(item.cardId) : undefined;
      return (
        <MemoryCard
          memory={item}
          card={card}
          onPress={() => router.push(`/memory/${item.id}`)}
          onLongPress={() => void shareMemory(item, card)}
        />
      );
    },
    [cardById],
  );

  return (
    <SafeAreaView style={styles.container}>
      {reward && <Toast message={reward} onHide={() => setReward(null)} />}
      {/* Header — the space name is the dropdown trigger (Instagram-style) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerTrigger}
          onPress={() => { void acknowledgeSelection(); setPickerOpen(true); }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('Switch, add or share a space', 'Space wechseln, hinzufügen oder teilen')}
          accessibilityHint={t('Opens the space picker', 'Öffnet die Space-Auswahl')}
        >
          <View style={styles.headerAvatar}>
            {activeSpace?.avatarUrl ? (
              <FadeInImage source={{ uri: activeSpace.avatarUrl }} style={styles.headerAvatarImage} />
            ) : (
              <Text style={styles.headerAvatarEmoji}>
                {activeSpace?.emoji ?? (activeSpace?.type === 'friends' ? '✦' : '♥')}
              </Text>
            )}
          </View>
          <View style={styles.headerText}>
            <View style={styles.kickerRow}>
              <View style={[styles.kickerDot, { backgroundColor: TOGETHER }]} />
              <Text style={styles.kicker}>{greeting}</Text>
            </View>
            <View style={styles.nameRow}>
              <Text style={styles.spaceName} numberOfLines={1}>
                {(activeSpace?.name ?? 'your space').toLowerCase()}
              </Text>
              <Ionicons name="chevron-down" size={18} color={Colors.textMuted} style={styles.chevron} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Trust & control live one quiet tap away — "Me" is no longer a tab
            (target IA: HOME · MOMENTS · DISCOVER · STORY · COLLECTION). */}
        <TouchableOpacity
          style={styles.headerMe}
          onPress={() => { void acknowledgeSelection(); router.push('/(tabs)/profile'); }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={t('You and your settings', 'Du und deine Einstellungen')}
        >
          <Ionicons name="person-circle-outline" size={26} color={Colors.textMuted} />
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
        data={feedPreview}
        keyExtractor={(item) => item.id}
        renderItem={renderMemory}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
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
            {/* TODAY'S MOMENT — one editorial suggestion, the door into the
                loop. One idea, generous type, one arrow (design north star). */}
            {activeSpace && todaysMoment && (
              <PressableScale
                style={[styles.heroCard, { backgroundColor: heroTint.bg }]}
                onPress={() => router.push(`/together/${todaysMoment.momentId}`)}
                scaleTo={0.985}
                accessibilityLabel={t(
                  `Today's moment: ${todaysMoment.title}`,
                  `Moment des Tages: ${todaysMoment.title}`,
                )}
              >
                <View style={[styles.heroBloom, { backgroundColor: heroTint.bloom }]} />
                <Text style={styles.heroKicker}>☀ {t("TODAY'S MOMENT", 'MOMENT DES TAGES')}</Text>
                <Text style={styles.heroTitle} numberOfLines={3}>
                  {todaysMoment.title}
                </Text>
                <View style={styles.heroMetaRow}>
                  <View style={styles.heroPill}>
                    <Text style={styles.heroPillText}>
                      {todaysMoment.priceBand === 'free' ? t('FREE', 'GRATIS') : todaysMoment.priceBand}
                    </Text>
                  </View>
                  <View style={styles.heroPill}>
                    <Text style={styles.heroPillText}>
                      ◷ {todaysMoment.estDurationMin >= 60
                        ? `${Math.round((todaysMoment.estDurationMin / 60) * 10) / 10} h`
                        : `${todaysMoment.estDurationMin} min`}
                    </Text>
                  </View>
                  <View style={styles.heroSpacer} />
                  <View style={styles.heroArrow}>
                    <Ionicons name="arrow-forward" size={18} color={Colors.text} />
                  </View>
                </View>
              </PressableScale>
            )}

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
                    containerStyle={styles.flexSlot}
                    style={[styles.quickCard, styles.quickCardDark]}
                    onPress={() => void onHubChallenge()}
                    accessibilityLabel={
                      challengeProgress?.complete
                        ? t('Review this week’s finished challenge', 'Geschaffte Wochen-Challenge ansehen')
                        : enrolled
                          ? t('Add a photo or note for this challenge', 'Foto oder Notiz für diese Challenge hinzufügen')
                          : t('Take on this week’s challenge together', 'Diese Wochen-Challenge gemeinsam annehmen')
                    }
                  >
                    <Text style={styles.quickKickerDark}>
                      {challengeProgress?.complete
                        ? t('THIS WEEK ✓', 'DIESE WOCHE ✓')
                        : t('THIS WEEK', 'DIESE WOCHE')}
                    </Text>
                    <Text style={styles.quickTitleDark} numberOfLines={2}>
                      {l(weekly.title)}
                    </Text>
                    <Text style={styles.quickBodyDark} numberOfLines={2}>
                      {challengeProgress?.complete
                        ? t(
                            `done — ${activeSpace.collectibleEmoji ?? '🌶️'} collected this week`,
                            `geschafft — ${activeSpace.collectibleEmoji ?? '🌶️'} diese Woche gesammelt`,
                          )
                        : enrolled && challengeProgress
                          ? challengeProgress.goal <= 1
                            ? t(
                                'tap to add your moment',
                                'tippen, um euren Moment hinzuzufügen',
                              )
                            : t(
                                `${challengeProgress.count}/${challengeProgress.goal} moments · tap to add one`,
                                `${challengeProgress.count}/${challengeProgress.goal} Momente · tippen zum Hinzufügen`,
                              )
                          : t(
                              'tap to take it on together',
                              'tippen, um sie gemeinsam anzunehmen',
                            )}
                    </Text>
                  </PressableScale>

                  <View style={styles.quickColumn}>
                    <PressableScale
                      containerStyle={styles.flexSlot}
                      style={styles.quickMini}
                      onPress={() => router.push('/ask')}
                      accessibilityLabel={t('Ask PeakPlant', 'PeakPlant fragen')}
                    >
                      <Text style={styles.quickMiniTitle}>{t('ask peakplant', 'peakplant fragen')}</Text>
                      <Text style={styles.quickMiniBody}>{t('get a fitted idea', 'passende Idee holen')}</Text>
                    </PressableScale>
                    <PressableScale
                      containerStyle={styles.flexSlot}
                      style={styles.quickMini}
                      onPress={() => router.push('/discover/saved')}
                      accessibilityLabel={t('Open saved plans', 'Gemerkte Pläne öffnen')}
                    >
                      <Text style={styles.quickMiniTitle}>{t('saved plans', 'gemerkte Pläne')}</Text>
                      <Text style={styles.quickMiniBody}>{t('plan, do, preserve', 'planen, machen, festhalten')}</Text>
                    </PressableScale>
                  </View>
                </View>

                {momentsThisWeek > 0 && (
                  <Text style={styles.weekReward}>
                    {t(
                      `✦ ${momentsThisWeek} moment${momentsThisWeek !== 1 ? 's' : ''} together this week`,
                      `✦ ${momentsThisWeek} Moment${momentsThisWeek !== 1 ? 'e' : ''} diese Woche zusammen`,
                    )}
                  </Text>
                )}

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
            {/* YOUR STORY — poetic, honest numbers, all counted from real data
                (moments kept, dates completed, distinct places, cards kept). */}
            {memories.length > 0 && (
              <View style={styles.heartbeat}>
                <Text style={styles.storyLabel}>{t('YOUR STORY', 'EURE GESCHICHTE')}</Text>
                <View style={styles.storyRow}>
                  <View style={styles.heartbeatStat}>
                    <Text style={styles.heartbeatNum}>{memories.length}</Text>
                    <Text style={styles.heartbeatLabel}>{t('MOMENTS', 'MOMENTE')}</Text>
                  </View>
                  {datesDone > 0 && (
                    <>
                      <View style={styles.heartbeatDiv} />
                      <View style={styles.heartbeatStat}>
                        <Text style={styles.heartbeatNum}>{datesDone}</Text>
                        <Text style={styles.heartbeatLabel}>{t('DATES', 'DATES')}</Text>
                      </View>
                    </>
                  )}
                  {placesCount > 0 && (
                    <>
                      <View style={styles.heartbeatDiv} />
                      <View style={styles.heartbeatStat}>
                        <Text style={styles.heartbeatNum}>{placesCount}</Text>
                        <Text style={styles.heartbeatLabel}>{t('PLACES', 'ORTE')}</Text>
                      </View>
                    </>
                  )}
                  {totalCards > 0 && (
                    <>
                      <View style={styles.heartbeatDiv} />
                      <View style={styles.heartbeatStat}>
                        <Text style={styles.heartbeatNum}>{totalCards}</Text>
                        <Text style={styles.heartbeatLabel}>{t('CARDS', 'KARTEN')}</Text>
                      </View>
                    </>
                  )}
                </View>
                <View style={styles.heartbeatFill} />
                <Text style={styles.heartbeatGlyph}>♥</Text>
              </View>
            )}

            {/* COMING UP — the next planned date, so anticipation lives on Home. */}
            {nextPlanned && (
              <PressableScale
                style={styles.comingCard}
                onPress={() => router.push({ pathname: '/discover/saved', params: { plan: nextPlanned.id } })}
                scaleTo={0.985}
                accessibilityLabel={t(
                  `Coming up: ${nextPlanned.title}`,
                  `Bald bei euch: ${nextPlanned.title}`,
                )}
              >
                <Text style={styles.comingKicker}>{t('COMING UP', 'BALD BEI EUCH')}</Text>
                <Text style={styles.comingTitle} numberOfLines={2}>{nextPlanned.title}</Text>
                <Text style={styles.comingMeta}>
                  {nextPlanned.plannedFor
                    ? new Date(nextPlanned.plannedFor).toLocaleDateString(t('en-US', 'de-DE'), {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })
                    : t('no date yet — tap to plan it in', 'noch kein Datum — tippen zum Einplanen')}
                  {nextPlanned.placeName ? ` · 📍 ${nextPlanned.placeName}` : ''}
                </Text>
              </PressableScale>
            )}

            {/* Memory filmstrip — a little album of your latest moments */}
            {recentMemories.length > 0 && (
              <View style={styles.filmstripSection}>
                <View style={styles.filmstripHeader}>
                  <Text style={styles.sectionLabelInline}>
                    {t('RECENTLY TOGETHER', 'ZULETZT ZUSAMMEN')}
                  </Text>
                  <Text style={styles.filmstripCount}>
                    {memories.length === 1
                      ? t('1 kept', '1 festgehalten')
                      : t(`${memories.length} kept`, `${memories.length} festgehalten`)}
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filmstrip}
                >
                  {recentMemories.slice(0, 8).map((m, i) => {
                    const card = SEED_CARDS.find((c) => c.id === m.cardId);
                    const hero = i === 0; // first moment reads as the album cover
                    return (
                      <PressableScale
                        key={m.id}
                        style={[styles.polaroid, hero && styles.polaroidHero]}
                        onPress={() => router.push(`/memory/${m.id}`)}
                        scaleTo={0.97}
                        accessibilityLabel={`Moment ${relativeDay(m.createdAt, language)}`}
                      >
                        {m.photoUri ? (
                          <FadeInImage
                            source={{ uri: m.photoUri }}
                            style={[styles.polaroidPhoto, hero && styles.polaroidPhotoHero]}
                            accessibilityLabel="Moment photo"
                          />
                        ) : (
                          <View style={[styles.polaroidBlank, hero && styles.polaroidPhotoHero]}>
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
                      onPress={() => void openEdition(e)}
                      accessibilityLabel={`${e.name}, ${progress} von ${e.cardCount} Karten`}
                    >
                      <Text style={styles.editionSymbol}>{e.symbol}</Text>
                      <View style={styles.editionText}>
                        <Text style={styles.editionName}>{e.name.toLowerCase()}</Text>
                        <Text style={styles.editionSub}>{e.subtitle}</Text>
                        <View style={styles.progressTrack}>
                          <AnimatedFill
                            ratio={pct / 100}
                            style={[styles.progressFill, { backgroundColor: e.color }]}
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
                title={t("couldn't load your moments.", 'kurz die Verbindung verloren.')}
                hint={t(
                  'your memories are safe — this is just a connection hiccup.',
                  'eure Erinnerungen sind sicher — wir versuchen es gleich nochmal.',
                )}
                ctaLabel={t('TRY AGAIN', 'NOCHMAL VERSUCHEN')}
                onCta={refresh}
              />
            )}

            {/* True empty state with brand bloom.

                The second, quiet way out exists because the deck ships in
                october while the app is already in people's hands: without it,
                anyone whose cards have not arrived hits a scan screen they
                cannot use, and the first ten minutes end in a dead end instead
                of in a preserved moment. A free moment needs no card. */}
            {!loading && !error && recentMemories.length === 0 && (
              <EmptyState
                mark="bloom"
                title={t('your first moment starts here.', 'euer erster Moment beginnt hier.')}
                hint={t(
                  'do something together, then keep it here — a photo, a few words. the first one you keep becomes your space’s first bloom.',
                  'macht etwas zusammen und haltet es hier fest — ein Foto, ein paar Worte. Euer erster festgehaltener Moment wird eure erste Blüte.',
                )}
                // Vertauscht: solange die Decks nicht ausgeliefert sind
                // (Oktober), war die lauteste Handlung auf diesem Bildschirm
                // die einzige, die niemand ausführen kann. Der laute Knopf
                // muss einer sein, der geht; die Karte bleibt der schönere
                // Weg hinein, nicht der einzige.
                ctaLabel={t('KEEP YOUR FIRST MOMENT', 'ERSTEN MOMENT FESTHALTEN')}
                onCta={() => router.push('/memory/create')}
                secondaryLabel={t('got your deck? scan a card', 'Deck schon da? Karte scannen')}
                onSecondary={() => router.push('/(tabs)/scan')}
              />
            )}
          </>
        }
        ListFooterComponent={
          // Home is the preview; the whole album lives in MOMENTS.
          recentMemories.length > feedPreview.length ? (
            <PressableScale
              style={styles.allMomentsLink}
              onPress={() => router.push('/(tabs)/moments')}
              scaleTo={0.985}
              accessibilityLabel={t('Open all your moments', 'Alle eure Momente öffnen')}
            >
              <Text style={styles.allMomentsText}>
                {t(
                  `READ ALL ${recentMemories.length} MOMENTS`,
                  `ALLE ${recentMemories.length} MOMENTE LESEN`,
                )}
              </Text>
            </PressableScale>
          ) : null
        }
      />

      {/* Hidden on the empty feed: the EmptyState's SCAN-CTA is then the one
          clear action — the same target twice broke §5 (audit A6-6.1). */}
      {recentMemories.length > 0 && (
        <View style={styles.addBar}>
          <PressableScale
            containerStyle={styles.addBtnSlot}
            style={[styles.addBtn, styles.addBtnFill]}
            onPress={() => router.push('/(tabs)/scan')}
            accessibilityLabel={t('Scan a card', 'Karte scannen')}
          >
            <Text style={styles.addBtnTextFill}>{t('SCAN CARD', 'KARTE SCANNEN')}</Text>
          </PressableScale>
          <PressableScale
            containerStyle={styles.addBtnSlot}
            style={styles.addBtn}
            onPress={() => router.push('/memory/create')}
            accessibilityLabel={t('Add a moment to your diary', 'Einen Moment ins Tagebuch legen')}
          >
            <Text style={styles.addBtnText}>{t('ADD A MOMENT', 'MOMENT FESTHALTEN')}</Text>
          </PressableScale>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  headerMe: { paddingLeft: Spacing.sm, paddingBottom: 4 },
  allMomentsLink: {
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.sm,
    height: 50,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allMomentsText: { fontSize: 11, fontWeight: '500', letterSpacing: 2, color: Colors.textMuted },
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
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  storyLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2.5,
    color: Colors.textSubtle,
    marginBottom: Spacing.sm,
  },
  storyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  heroCard: {
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.md,
    borderRadius: 22,
    padding: Spacing.lg,
    overflow: 'hidden',
    gap: Spacing.sm,
  },
  heroBloom: {
    position: 'absolute',
    right: -70,
    top: -70,
    width: 190,
    height: 190,
    borderRadius: 95,
    opacity: 0.32,
  },
  heroKicker: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2.5,
    color: 'rgba(250,247,240,0.75)',
  },
  heroTitle: {
    ...Typography.display,
    fontSize: 30,
    lineHeight: 36,
    color: '#FAF7F0',
    maxWidth: '92%',
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  heroPill: {
    borderWidth: 1,
    borderColor: 'rgba(250,247,240,0.35)',
    borderRadius: Radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  heroPillText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.5,
    color: 'rgba(250,247,240,0.85)',
  },
  heroSpacer: { flex: 1 },
  heroArrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FAF7F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingCard: {
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    gap: 4,
  },
  comingKicker: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2.2,
    color: Accents.chili,
  },
  comingTitle: {
    ...Typography.editorial,
    fontSize: 19,
    lineHeight: 24,
  },
  comingMeta: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.textMuted,
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
  filmstripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen,
    marginBottom: Spacing.md,
  },
  sectionLabelInline: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2.5,
    color: Colors.textSubtle,
    textTransform: 'uppercase',
  },
  filmstripCount: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.3,
    color: Colors.textFaint,
  },
  polaroid: {
    width: 116,
    backgroundColor: Colors.surface,
    borderRadius: Radii.sm,
    overflow: 'hidden',
    ...Shadows.card,
  },
  polaroidHero: { width: 150 },
  polaroidPhoto: {
    width: 116,
    height: 116,
    backgroundColor: Colors.border,
  },
  polaroidPhotoHero: { width: 150, height: 150 },
  polaroidBlank: {
    width: 116,
    height: 116,
    backgroundColor: Accents.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  polaroidMark: { fontSize: 26, color: Accents.apricot },
  polaroidCaption: {
    paddingHorizontal: Spacing.sm,
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
  /** Layoutanteil für ein `PressableScale` — gehört ans äußere Element. */
  flexSlot: { flex: 1 },
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
  weekReward: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
    color: Accents.sage,
    marginTop: Spacing.md,
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
  // Die halbe Breite gehört an das ÄUSSERE Pressable (containerStyle), nicht an
  // die innere Fläche: die innere skaliert beim Druck, und ein Elternteil, das
  // sie misst, würde bei jedem Tippen neu umbrechen.
  addBtnSlot: { flex: 1 },
  addBtn: {
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
