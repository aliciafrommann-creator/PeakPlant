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
import { SpacePicker } from '../../components/space/SpacePicker';
import { PressableScale } from '../../components/ui/PressableScale';
import { MomentWall } from '../../components/home/MomentWall';
import { AloneRow } from '../../components/home/AloneRow';
import { spaceRepository } from '../../lib/repositories';
import { voice } from '../../lib/voice';
import { HOUSE_DYE } from '../../constants/dyes';
import { DyeField } from '../../components/ui/DyeField';
import { editionInk } from '../../lib/editionInk';
import { glyphForSpace } from '../../lib/spaceTheme';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../components/ui/EmptyState';
import { READABLE_CARDS } from '../../lib/seed';
import { shareMemory } from '../../lib/share';
import { acknowledgeSelection } from '../../lib/haptics';
import { Toast } from '../../components/ui/Toast';
import { consumePendingReward } from '../../lib/pendingReward';
import { discovery } from '../../lib/ai';
import type { DateRecommendation } from '../../lib/discovery/types';
import type { Memory} from '../../lib/types';

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
  const { t, language } = useLanguage();
  // Die Anrede richtet sich nach der Art des Space: „euer" oder „dein"
  // (lib/voice.ts). Ein Raum für eine Person darf keine zweite behaupten.
  const v = voice(activeSpace?.type);
  // Die Tinte auf der Haus-Färbung — gerechnet, nicht gesetzt.
  const hausTinte = editionInk(HOUSE_DYE.ground);
  const { latestFromPartner } = useNotes(activeSpace?.id);


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


  const cardById = useMemo(() => new Map(READABLE_CARDS.map((c) => [c.id, c])), []);

  const openMemory = useCallback((m: Memory) => router.push(`/memory/${m.id}`), []);
  const shareOne = useCallback(
    (m: Memory) => void shareMemory(m, m.cardId ? cardById.get(m.cardId) : undefined),
    [cardById],
  );

  const isEmpty = !loading && !error && recentMemories.length === 0;

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
                {/* Ein binäres Ternär mit drei Werten: Der Solo-Space fiel in den
                    Else-Zweig und bekam das HERZ — das Zeichen für ein Paar. */}
                {activeSpace?.emoji ?? glyphForSpace(activeSpace?.type)}
              </Text>
            )}
          </View>
          <View style={styles.headerText}>
            <View style={styles.nameRow}>
              <Text style={styles.spaceName} numberOfLines={1}>
                {(activeSpace?.name ?? t(v.spaceFallbackName.en, v.spaceFallbackName.de)).toLowerCase()}
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
            unbekannt (Ladefehler) wird nichts behauptet.

            Nicht im Solo-Space: dort ist „gerade seid ihr hier noch zu einem"
            keine Beobachtung, sondern ein Vorwurf. Diese Person hat sich
            bewusst für einen Raum für eine entschieden (MANIFESTO §3). Den
            Weg nach draußen gibt es trotzdem — ruhig, in den
            Space-Einstellungen. */}
        {activeSpace && activeSpace.type !== 'solo' && memberCount === 1 && (
          <AloneRow inviteCode={activeSpace.inviteCode} spaceName={activeSpace.name} t={t} />
        )}

        {/* Ein Vorschlag, eine Zeile. Er steht über der Wand, weil er das
            Angebot des Tages ist — aber er nimmt keinen Platz weg, den die
            Momente brauchen. */}
        {activeSpace && todaysMoment && (
          <PressableScale
            containerStyle={styles.stripSlot}
            style={styles.stripPress}
            onPress={() => router.push(`/together/${todaysMoment.momentId}`)}
            scaleTo={0.99}
            accessibilityLabel={t(
              `Today's idea: ${todaysMoment.title}`,
              `Idee für heute: ${todaysMoment.title}`,
            )}
          >
            <DyeField style={styles.strip}>
              <Text style={styles.stripSun}>{HOUSE_DYE.emoji}</Text>
              <Text style={[styles.stripText, { color: hausTinte }]} numberOfLines={1}>
                {todaysMoment.title}
              </Text>
              <Ionicons name="arrow-forward" size={15} color={hausTinte} />
            </DyeField>
          </PressableScale>
        )}

        {/* Eine Notiz vom anderen Menschen ist das Wertvollste, was in einer
            Paar-App ankommen kann — sie bekommt eine eigene Zeile.
            
            DIESE ZEILE STEHT JETZT IMMER, und das war Alicias Fund vom
            19.08.2026 („manche Wege sollten prominenter sein"): Vorher gab es
            sie NUR, wenn schon eine Notiz da war. Wer noch keine bekommen
            hatte — also jeder am Anfang —, fand das Schreiben nur als leise
            Textzeile zwei Bildschirme weiter. Eine Funktion, deren Tür erst
            aufgeht, nachdem jemand anderes sie benutzt hat, kann nie
            anfangen.

            Im Solo-Space ist es eine Notiz an sich selbst; die Anrede kommt
            aus `lib/voice.ts`. */}
        <PressableScale
          containerStyle={styles.stripSlot}
          style={styles.partnerNote}
          onPress={() => router.push('/note/compose')}
          scaleTo={0.99}
          accessibilityLabel={
            latestFromPartner
              ? t('Read the note and write back', 'Notiz lesen und zurückschreiben')
              : t(v.writeNoteInvite.en, v.writeNoteInvite.de)
          }
        >
          <Text style={styles.partnerHeart}>♥</Text>
          {latestFromPartner ? (
            <Text style={styles.partnerText} numberOfLines={2}>
              {latestFromPartner.text}
            </Text>
          ) : (
            <Text style={[styles.partnerText, styles.partnerInvite]} numberOfLines={2}>
              {t(v.writeNoteInvite.en, v.writeNoteInvite.de)}
            </Text>
          )}
          <Text style={styles.partnerArrow}>→</Text>
        </PressableScale>

        {loading && recentMemories.length === 0 && !error && <MemoryFeedSkeleton count={3} />}

        {!loading && error && recentMemories.length === 0 && (
          <EmptyState
            mark="✦"
            title={t("couldn't load your moments.", 'kurz die Verbindung verloren.')}
            hint={t(v.loadMomentsFailedHint.en, v.loadMomentsFailedHint.de)}
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
              {t(v.thisIsYourSpace.en, v.thisIsYourSpace.de)}
            </Text>
            <Text style={styles.leadHint}>
              {t(v.keepWhatMatters.en, v.keepWhatMatters.de)}
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

        {/* DIE SECHS TEXTLINKS STANDEN HIER — und sind zu „Du" gezogen.
            Alicia auf dem Gerät, 19.08.2026: „der Home Screen ist ultra
            überfordernd voll." Sie hatte recht, und es war ein Rückfall in
            genau das, was Entscheidung 021 abgeschafft hatte: ein Hub statt
            eines Bildschirms. Instagram und Strava zeigen EIN Objekt, groß,
            wiederholt — die Nebenwege liegen woanders.

            Nichts ist gelöscht: Jeder der sechs Wege hat jetzt sein Zuhause
            im Reiter „Du". */}

        {/* Die Peaks: ein Zeichen je festgehaltenem Moment, in eurer eigenen
            Farbe. Die Regel und ihre Grenze stehen in lib/peaks.ts. */}
        {/* PEAKS UND WOCHEN STANDEN HIER — beide sind zu „Du" gezogen.
            Alicias Wahl vom 19.08.2026: der Startbildschirm führt mit der
            Momente-Wand, sonst nichts. Das ist die Struktur, gegen die sie ihn
            verglichen hat: Instagram zeigt EIN Objekt, groß, wiederholt.
            Zahlen über dem Bildschirmende sind kein Objekt, sie sind ein
            Armaturenbrett. */}

      </ScrollView>

      {/* Der schwebende Knopf ist weg: „Moment festhalten" sitzt seit dem
          19.08.2026 als runder Knopf in der MITTE der Reiterleiste, wie bei
          Instagram. Zwei Wege zur selben Handlung auf einem Bildschirm sind
          einer zu viel (MANIFESTO §5). */}
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
  /**
   * Die eine gefärbte Fläche des Startbildschirms (Entwurf „E · Batik leise",
   * Alicia 19.08.2026). Bewusst NUR hier: Die Färbung bleibt besonders, weil
   * sie selten ist — und bei vierzig Momenten erschlägt einen keine Farbfläche.
   *
   * Die Farbe kommt beim Rendern aus `HOUSE_DYE`, die Schrift aus
   * `editionInk()`. Deshalb steht hier weder Hintergrund noch Schriftfarbe:
   * ein toter Wert würde beim Lesen eine Entscheidung vortäuschen.
   */
  stripPress: { borderRadius: Radii.sm, overflow: 'hidden' },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 13,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.sm,
  },
  stripSun: { fontSize: 14 },
  stripText: { flex: 1, fontSize: 15, fontWeight: '500' },

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
  /** Die Einladung ist leiser als eine echte Notiz — sie ist ein Angebot,
   *  keine Nachricht. Aber sie steht an derselben, sichtbaren Stelle. */
  partnerInvite: { color: Colors.textMuted },
  partnerArrow: { fontSize: 14, color: Colors.textSubtle, marginTop: 2 },
  partnerText: {
    // Bewusst `editorial`, NICHT `stack`: Der gestapelte Titel ist eine
    // Überschrift ab 24 pt. Hier steht der Satz eines anderen Menschen bei
    // 16 pt — als `stack` wäre er fette, eng gesperrte Georgia gewesen.
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
