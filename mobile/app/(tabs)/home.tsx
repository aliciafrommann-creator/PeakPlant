import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Colors, Sections } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useMemories } from '../../lib/hooks/useMemories';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { MemoryFeedSkeleton } from '../../components/ui/Skeleton';
import { FadeInImage } from '../../components/ui/FadeInImage';
import { useNotes } from '../../lib/hooks/useNotes';
import { useWeeklyChallenge } from '../../lib/hooks/useWeeklyChallenge';
import { SpacePicker } from '../../components/space/SpacePicker';
import { PressableScale } from '../../components/ui/PressableScale';
import { FloatingActionButton } from '../../components/ui/FloatingActionButton';
import { MomentWall } from '../../components/home/MomentWall';
import { PeakRow } from '../../components/home/PeakRow';
import { AloneRow } from '../../components/home/AloneRow';
import { spaceRepository } from '../../lib/repositories';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../components/ui/EmptyState';
import { SEED_CARDS } from '../../lib/seed';
import { savedDateRepository } from '../../lib/repositories';
import { shareMemory } from '../../lib/share';
import { acknowledgeSelection, confirmSuccess } from '../../lib/haptics';
import { Toast } from '../../components/ui/Toast';
import { consumePendingReward } from '../../lib/pendingReward';
import { computeSharedWeeks } from '../../lib/streaks';
import { discovery } from '../../lib/ai';
import type { DateRecommendation } from '../../lib/discovery/types';
import type { Memory, SavedDate } from '../../lib/types';

const TOGETHER = Sections.together;

/**
 * Wie viele Momente die Wand direkt trägt. Darüber hinaus führt ein ruhiger
 * Link ins nach Monaten gruppierte Archiv — nichts geht verloren, aber der
 * Startbildschirm bleibt ein Bildschirm und keine unendliche Liste.
 */
const WALL_LIMIT = 30;

/**
 * Der Startbildschirm ist die Wand: eure Momente, groß, wiederholt.
 *
 * ENTSCHEIDUNG (Alicia, 17.08.2026, nach dem ersten Gerätetest): Vorher stand
 * hier ein Hub — eine Vorschlagskarte, darunter die Frage „was wollt ihr
 * zusammen machen?", darunter drei weitere Wege, sie zu beantworten, darunter
 * Statistiken, ein Filmstreifen, Editionen und Notizen. Dreizehn
 * Abschnitts-Überschriften in Großbuchstaben; die festgehaltenen Momente kamen
 * an dritter Stelle und waren auf drei begrenzt.
 *
 * Alicias Befund: „das ist die landing page, das hooked mich schon hier — kann
 * ich dies und das machen, DAS IST MEIN SPACE." Genau das ging verloren. Eine
 * Wand aus den eigenen Momenten IST der Space; ein Raster fremder Vorschläge
 * ist ein Katalog.
 *
 * Die Regeln dieses Bildschirms, damit er nicht wieder zuwächst:
 *   1. EIN Hauptobjekt — der festgehaltene Moment. Nichts anderes wird groß.
 *   2. EINE laute Handlung, und die liegt außerhalb der Liste (der Knopf
 *      unten rechts). Alles andere sind ruhige Textlinks.
 *   3. Keine Abschnitts-Überschriften in Großbuchstaben. Wer hier eine
 *      hinzufügt, fügt ein Thema hinzu — und Themen waren das Problem.
 *   4. Zahlen sind Tatsachen, nie Fortschritt (MANIFESTO §3): „N festgehalten"
 *      ja, „N von 20" oder Prozente nein.
 *
 * Was von hier weggezogen ist, statt gelöscht: die Statistiken in die
 * Geschichte, die Editionen in die Sammlung, das Archiv in die Momente-Seite.
 */
export default function HomeScreen() {
  const { spaces, activeSpace, setActiveSpace } = useSpaces();
  const { memories, loading, error, refresh } = useMemories(activeSpace?.id);
  const { t, l, language } = useLanguage();
  const { latestFromPartner } = useNotes(activeSpace?.id);
  const { weekly, enrolled, progress: challengeProgress, accept: acceptChallenge, chillyCount } =
    useWeeklyChallenge(activeSpace?.id, activeSpace?.type);

  // Die Wochen-Challenge handelt an Ort und Stelle — ein Ziel pro Zustand:
  // nicht dabei → annehmen; dabei → Moment hinzufügen; geschafft → ansehen.
  const onWeekly = useCallback(async () => {
    if (challengeProgress?.complete) {
      router.push(`/challenges/${weekly.id}`);
      return;
    }
    if (!enrolled) {
      try {
        await acceptChallenge();
        void confirmSuccess();
      } catch {
        // Ein Tipp, der nichts tut und nichts sagt, ist schlimmer als einer,
        // der scheitert und es zugibt (MANIFESTO §5: jede Primäraktion hat
        // eine sichtbare Folge).
        setReward(t('could not join — check your connection', 'Annehmen ging nicht — prüf die Verbindung'));
      }
      return;
    }
    router.push({
      pathname: '/memory/create',
      params: {
        prefillNote: t(`weekly challenge: ${l(weekly.title)}`, `Wochen-Challenge: ${l(weekly.title)}`),
      },
    });
  }, [challengeProgress?.complete, enrolled, acceptChallenge, weekly.id, weekly.title, t, l]);

  const hour = new Date().getHours();
  const greeting =
    hour < 11
      ? t('good morning', 'guten Morgen')
      : hour < 17
        ? t('good afternoon', 'schönen Tag')
        : t('good evening', 'guten Abend');
  const timeOfDay: 'morning' | 'afternoon' | 'evening' =
    hour < 11 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  // Ein einziger Vorschlag, als EINE Zeile. Vorher war das eine 230 pt hohe
  // Karte — ein Viertel Bildschirm für etwas, das noch nicht passiert ist,
  // über allem, was tatsächlich passiert ist.
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

  // Nur noch für den ruhigen Link „gemerkte Pläne" — die Terminkarte selbst
  // ist weg, ihr Inhalt steckt jetzt im Untertitel des Links.
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

  /**
   * Ist außer dir schon jemand hier?
   *
   * Kein Bildschirm der App las bisher die Mitgliederzahl — ein Space mit
   * einem Menschen sah exakt aus wie einer mit zweien, während überall „ihr
   * beide" stand. In der Produktionsdatenbank: vier Spaces, keiner mit einem
   * zweiten Mitglied. Nach dem Onboarding fragte die App nie wieder.
   *
   * `undefined` heißt „wissen wir noch nicht" — dann wird nichts behauptet.
   */
  const [memberCount, setMemberCount] = useState<number | undefined>(undefined);
  useFocusEffect(
    useCallback(() => {
      if (!activeSpace?.id) {
        setMemberCount(undefined);
        return;
      }
      let alive = true;
      spaceRepository
        .getMembers(activeSpace.id)
        .then((m) => { if (alive) setMemberCount(m.length); })
        .catch(() => { if (alive) setMemberCount(undefined); });
      return () => { alive = false; };
    }, [activeSpace?.id]),
  );

  const [pickerOpen, setPickerOpen] = useState(false);
  const [reward, setReward] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const kind = consumePendingReward();
      if (kind === 'moment') setReward(t('moment kept ♥', 'Moment festgehalten ♥'));
      else if (kind === 'challenge') setReward(t('challenge done ✦', 'Challenge geschafft ✦'));
    }, [t]),
  );

  const recentMemories = useMemo(
    () =>
      [...memories].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [memories],
  );
  const wallMemories = useMemo(() => recentMemories.slice(0, WALL_LIMIT), [recentMemories]);

  const nextPlanned = useMemo(() => {
    const planned = savedDates.filter((d) => d.status === 'planned');
    return planned.sort((a, b) => {
      const ta = a.plannedFor ? new Date(a.plannedFor).getTime() : Infinity;
      const tb = b.plannedFor ? new Date(b.plannedFor).getTime() : Infinity;
      return ta - tb;
    })[0];
  }, [savedDates]);

  const sharedWeeks = useMemo(
    () => computeSharedWeeks(memories.map((m) => m.createdAt)),
    [memories],
  );

  const cardById = useMemo(() => new Map(SEED_CARDS.map((c) => [c.id, c])), []);

  const openMemory = useCallback((m: Memory) => router.push(`/memory/${m.id}`), []);
  const shareOne = useCallback(
    (m: Memory) => void shareMemory(m, m.cardId ? cardById.get(m.cardId) : undefined),
    [cardById],
  );

  const isEmpty = !loading && !error && recentMemories.length === 0;

  /** Ruhige Textlinks. Kein Link ist laut, keiner doppelt ein Ziel. */
  const links: { key: string; label: string; onPress: () => void }[] = [
    {
      key: 'weekly',
      label: challengeProgress?.complete
        ? t('this week ✓', 'diese Woche ✓')
        : enrolled
          ? t('this week', 'diese Woche')
          : t('take on this week', 'Woche annehmen'),
      onPress: () => void onWeekly(),
    },
    {
      key: 'saved',
      label: nextPlanned
        ? t('saved plans ·  next one waiting', 'gemerkte Pläne ·  einer steht an')
        : t('saved plans', 'gemerkte Pläne'),
      onPress: () => router.push('/discover/saved'),
    },
    {
      key: 'ask',
      label: t('ask peakplant', 'peakplant fragen'),
      onPress: () => router.push('/ask'),
    },
    {
      key: 'note',
      label: t('write a note', 'Notiz schreiben'),
      onPress: () => router.push('/note/compose'),
    },
    {
      key: 'scan',
      label: t('scan a card', 'Karte scannen'),
      onPress: () => router.push('/(tabs)/scan'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {reward && <Toast message={reward} onHide={() => setReward(null)} />}

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
            <View style={styles.nameRow}>
              <Text style={styles.spaceName} numberOfLines={1}>
                {(activeSpace?.name ?? 'your space').toLowerCase()}
              </Text>
              <Ionicons name="chevron-down" size={16} color={Colors.textMuted} style={styles.chevron} />
            </View>
            <View style={styles.kickerRow}>
              <View style={[styles.kickerDot, { backgroundColor: TOGETHER }]} />
              <Text style={styles.kicker}>{greeting}</Text>
            </View>
          </View>
        </TouchableOpacity>

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

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading && recentMemories.length > 0}
            onRefresh={refresh}
            tintColor={Colors.accent}
          />
        }
      >
        {/* Nur wenn wir es WISSEN und die Zahl wirklich eins ist. Bei
            unbekannt (Ladefehler) wird nichts behauptet. */}
        {activeSpace && memberCount === 1 && (
          <AloneRow inviteCode={activeSpace.inviteCode} spaceName={activeSpace.name} t={t} />
        )}

        {/* Ein Vorschlag, eine Zeile. Er steht über der Wand, weil er das
            Angebot des Tages ist — aber er nimmt keinen Platz weg, den die
            Momente brauchen. */}
        {activeSpace && todaysMoment && (
          <PressableScale
            containerStyle={styles.stripSlot}
            style={styles.strip}
            onPress={() => router.push(`/together/${todaysMoment.momentId}`)}
            scaleTo={0.99}
            accessibilityLabel={t(
              `Today's idea: ${todaysMoment.title}`,
              `Idee für heute: ${todaysMoment.title}`,
            )}
          >
            <Text style={styles.stripSun}>☀</Text>
            <Text style={styles.stripText} numberOfLines={1}>
              {todaysMoment.title}
            </Text>
            <Ionicons name="arrow-forward" size={15} color={Colors.textMuted} />
          </PressableScale>
        )}

        {/* Eine Notiz vom anderen Menschen ist das Wertvollste, was in einer
            Paar-App ankommen kann — sie bekommt eine eigene Zeile, aber nur
            wenn es sie wirklich gibt. Die eigene letzte Notiz ist keine
            Nachricht und steht deshalb unten bei den Links. */}
        {latestFromPartner && (
          <PressableScale
            containerStyle={styles.stripSlot}
            style={styles.partnerNote}
            onPress={() => router.push('/note/compose')}
            scaleTo={0.99}
            accessibilityLabel={t('Read the note from your partner', 'Notiz von deinem Menschen lesen')}
          >
            <Text style={styles.partnerHeart}>♥</Text>
            <Text style={styles.partnerText} numberOfLines={2}>
              {latestFromPartner.text}
            </Text>
          </PressableScale>
        )}

        {loading && recentMemories.length === 0 && !error && <MemoryFeedSkeleton count={3} />}

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

        {/* Leerzustand: zwei Zeilen Text, und darunter läuft die Wand trotzdem
            — als Raster leerer Felder. Man sieht die FORM dessen, was hier
            entsteht, bevor man das erste angelegt hat. Die Handlung dazu ist
            der Knopf unten; hier steht kein zweiter. */}
        {isEmpty && (
          <View style={styles.lead}>
            <Text style={styles.leadTitle}>
              {t('this is your space.', 'das ist euer Space.')}
            </Text>
            <Text style={styles.leadHint}>
              {t(
                'do something together, then keep it here — a photo, a few words. it stays private to the two of you.',
                'macht etwas zusammen und haltet es hier fest — ein Foto, ein paar Worte. Es bleibt privat für euch beide.',
              )}
            </Text>
          </View>
        )}

        {/* Während des ersten Ladens zeigen die Skelette schon die Form —
            die leeren Plätze der Wand daneben wären dieselbe Aussage zweimal. */}
        {!error && !(loading && recentMemories.length === 0) && (
          <MomentWall
            memories={wallMemories}
            cardById={cardById}
            language={language}
            onOpen={openMemory}
            onShare={shareOne}
          />
        )}

        {recentMemories.length > WALL_LIMIT && (
          <PressableScale
            containerStyle={styles.quietSlot}
            style={styles.quietLink}
            onPress={() => router.push('/(tabs)/moments')}
            scaleTo={0.99}
            accessibilityLabel={t('Open the full archive', 'Ganzes Archiv öffnen')}
          >
            <Text style={styles.quietLinkText}>
              {t(
                `all ${recentMemories.length} moments, by month →`,
                `alle ${recentMemories.length} Momente, nach Monat →`,
              )}
            </Text>
          </PressableScale>
        )}

        {/* Die anderen Wege — ruhig, in einer Reihe, ohne Überschrift. */}
        <View style={styles.links}>
          {links.map((link) => (
            <PressableScale
              key={link.key}
              containerStyle={styles.quietSlot}
              style={styles.quietLink}
              onPress={link.onPress}
              scaleTo={0.99}
              accessibilityLabel={link.label}
            >
              <Text style={styles.quietLinkText}>{link.label}</Text>
              <Text style={styles.quietArrow}>→</Text>
            </PressableScale>
          ))}
          {memories.length > 0 && (
            <PressableScale
              containerStyle={styles.quietSlot}
              style={styles.quietLink}
              onPress={() => router.push('/(tabs)/story')}
              scaleTo={0.99}
              accessibilityLabel={t('What grew between you', 'Was zwischen euch gewachsen ist')}
            >
              <Text style={styles.quietLinkText}>
                {t('what grew between you', 'was zwischen euch gewachsen ist')}
              </Text>
              <Text style={styles.quietArrow}>→</Text>
            </PressableScale>
          )}
        </View>

        {/* Die Peaks: ein Zeichen je festgehaltenem Moment, in eurer eigenen
            Farbe. Die Regel und ihre Grenze stehen in lib/peaks.ts. */}
        {activeSpace && (
          <PeakRow
            momentsKept={memories.length}
            emoji={activeSpace.collectibleEmoji ?? (activeSpace.type === 'friends' ? '🌻' : '🌶️')}
            label={
              memories.length === 1
                ? t('1 peak collected', '1 Peak gesammelt')
                : t(`${memories.length} peaks collected`, `${memories.length} Peaks gesammelt`)
            }
          />
        )}

        {/* Tatsachen, kein Fortschritt (MANIFESTO §3). Nichts hier kann
            kleiner werden, und nichts sagt, wie viel noch „fehlt". */}
        {memories.length > 0 && (
          <Text style={styles.facts}>
            {[
              // „Momente festgehalten" steht jetzt als Peaks-Reihe darüber —
              // zweimal dieselbe Zahl auf einem Bildschirm wäre Lärm.
              sharedWeeks.count === 1
                ? t('1 week collected', '1 Woche gesammelt')
                : t(`${sharedWeeks.count} weeks collected`, `${sharedWeeks.count} Wochen gesammelt`),
              chillyCount > 0
                ? t(
                    `${chillyCount} challenge${chillyCount !== 1 ? 's' : ''} together`,
                    `${chillyCount} Challenge${chillyCount !== 1 ? 's' : ''} zusammen`,
                  )
                : null,
            ]
              .filter(Boolean)
              .join('  ·  ')}
          </Text>
        )}
      </ScrollView>

      <FloatingActionButton
        icon="add"
        label={t('KEEP A MOMENT', 'MOMENT FESTHALTEN')}
        onPress={() => router.push('/memory/create')}
        accessibilityLabel={t('Keep a moment in your diary', 'Einen Moment ins Tagebuch legen')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header — der Space-Name ist der Auslöser für die Space-Auswahl.
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  headerTrigger: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  headerMe: { paddingLeft: Spacing.sm, paddingBottom: 4 },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: Radii.pill,
    backgroundColor: Colors.backgroundWarm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerAvatarImage: { width: '100%', height: '100%' },
  headerAvatarEmoji: { fontSize: 19 },
  headerText: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  spaceName: {
    ...Typography.title,
    color: Colors.text,
    flexShrink: 1,
  },
  chevron: { marginLeft: 4, marginTop: 2 },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 },
  kickerDot: { width: 6, height: 6, borderRadius: 3 },
  kicker: { fontSize: 12, fontWeight: '400', color: Colors.textMuted },

  scroll: { paddingBottom: 140 },

  // Vorschlagszeile
  stripSlot: { marginHorizontal: Spacing.screen, marginBottom: Spacing.md },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 13,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.backgroundWarm,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stripSun: { fontSize: 14 },
  stripText: { flex: 1, fontSize: 15, fontWeight: '400', color: Colors.text },

  // Notiz vom Partner
  partnerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.backgroundCream,
    borderRadius: Radii.sm,
    borderLeftWidth: 2,
    borderLeftColor: Colors.accent,
  },
  partnerHeart: { fontSize: 14, color: Colors.accentInk, marginTop: 2 },
  partnerText: {
    ...Typography.editorial,
    flex: 1,
    fontSize: 16,
    lineHeight: 23,
    color: Colors.text,
  },

  // Leerzustand über der leeren Wand
  lead: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  leadTitle: { ...Typography.title, color: Colors.text },
  leadHint: { fontSize: 14, fontWeight: '400', lineHeight: 21, color: Colors.textMuted },

  // Ruhige Links
  links: { marginTop: Spacing.xl },
  quietSlot: { marginHorizontal: Spacing.screen },
  quietLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 46,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  quietLinkText: { fontSize: 15, fontWeight: '400', color: Colors.text },
  quietArrow: { fontSize: 14, color: Colors.textMuted },

  facts: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.screen,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    color: Colors.textMuted,
  },
});
