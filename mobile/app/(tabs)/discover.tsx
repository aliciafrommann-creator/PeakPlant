import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Colors, Sections } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '../../components/ui/Logo';
import { PressableScale } from '../../components/ui/PressableScale';
import { SpacePicker } from '../../components/space/SpacePicker';
import { StreakBanner } from '../../components/space/StreakBanner';
import { Toast } from '../../components/ui/Toast';
import { AnimatedFill } from '../../components/ui/AnimatedFill';
import { IdeaCardSkeleton } from '../../components/ui/Skeleton';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useMemories } from '../../lib/hooks/useMemories';
import { useAppStore } from '../../lib/store';
import { computeWeeklyStreak } from '../../lib/streaks';
import { discovery } from '../../lib/ai';
import type { DateConstraints, DateRecommendation } from '../../lib/ai';
import { momentById, type TimeOfDay, type Weather } from '../../lib/together';
import { savedDateRepository } from '../../lib/repositories';
import { summarizeLearning, affinityWeights } from '../../lib/discovery/learning';
import { enrichWithLiveWeather } from '../../lib/discovery/weatherContext';
import type { SavedDate } from '../../lib/types';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { useWeeklyChallenge } from '../../lib/hooks/useWeeklyChallenge';
import { acknowledgeSelection, confirmSuccess } from '../../lib/haptics';

/** Device clock → coarse time of day. Honest, location-free contextual signal. */
function currentTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

/** Filter chips, grouped so they read intentionally (not a random pile). */
type Shortcut = { key: string; emoji: string; label: string; labelDe: string; patch: Partial<DateConstraints> };
type FilterGroup = { label: string; labelDe: string; options: Shortcut[] };
const FILTER_GROUPS: FilterGroup[] = [
  {
    label: 'how long', labelDe: 'wie lang',
    options: [
      { key: 'quick', emoji: '⏱️', label: 'under 2h', labelDe: 'unter 2 Std', patch: { maxDurationMin: 120 } },
    ],
  },
  {
    label: 'budget', labelDe: 'Budget',
    options: [
      { key: 'free', emoji: '✨', label: 'free', labelDe: 'gratis', patch: { maxBudget: 'free' } },
      { key: 'cheap', emoji: '💸', label: 'easy spend', labelDe: 'günstig', patch: { maxBudget: '€€' } },
    ],
  },
  {
    label: 'energy', labelDe: 'Energie',
    options: [
      { key: 'easy', emoji: '🍃', label: 'easy', labelDe: 'ruhig', patch: { energy: 'low' } },
      { key: 'lively', emoji: '🔥', label: 'lively', labelDe: 'aktiv', patch: { energy: 'high' } },
    ],
  },
  {
    label: 'where', labelDe: 'wo',
    options: [
      { key: 'outdoor', emoji: '🌤️', label: 'outdoors', labelDe: 'draußen', patch: { indoorOutdoor: 'outdoor' } },
      { key: 'indoor', emoji: '🛋️', label: 'stay in', labelDe: 'drinnen', patch: { indoorOutdoor: 'indoor' } },
    ],
  },
  {
    label: 'vibe', labelDe: 'Stimmung',
    options: [
      { key: 'calm', emoji: '🌙', label: 'calm', labelDe: 'ruhig', patch: { categories: ['calm'] } },
      { key: 'play', emoji: '🎲', label: 'playful', labelDe: 'verspielt', patch: { categories: ['play'] } },
      { key: 'food', emoji: '🍽️', label: 'tasty', labelDe: 'lecker', patch: { categories: ['food'] } },
      { key: 'create', emoji: '🎨', label: 'creative', labelDe: 'kreativ', patch: { categories: ['create'] } },
    ],
  },
];
const SHORTCUTS: Shortcut[] = FILTER_GROUPS.flatMap((g) => g.options);
/** key → group label, so toggling a chip clears its siblings (single-select). */
const GROUP_OF: Record<string, string> = Object.fromEntries(
  FILTER_GROUPS.flatMap((g) => g.options.map((o) => [o.key, g.label])),
);

const DISCOVER = Sections.discover; // sunlit gold identity; actions stay chili

export default function DiscoverScreen() {
  const { spaces, activeSpace, setActiveSpace } = useSpaces();
  const { memories } = useMemories(activeSpace?.id);
  const goals = useAppStore((s) => s.goals);
  const streaksEnabled = useAppStore((s) => s.features.streaks);
  const challengesEnabled = useAppStore((s) => s.features.challenges);
  const ritualsEnabled = useAppStore((s) => s.features.rituals);
  const personalization = useAppStore((s) => s.personalization);
  const personalizationResetAt = useAppStore((s) => s.personalizationResetAt);
  const { t } = useLanguage();

  const [active, setActive] = useState<Set<string>>(new Set());
  const [excludeIds, setExcludeIds] = useState<string[]>([]);
  const [recs, setRecs] = useState<DateRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<SavedDate[]>([]);
  const [savedMomentIds, setSavedMomentIds] = useState<Set<string>>(new Set());
  const [liveWeather, setLiveWeather] = useState<Weather | undefined>(undefined);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Keep the "already saved" set in sync with what's loaded for this space, so
  // the SAVE button can reflect saved state immediately (and across re-focus).
  useEffect(() => {
    setSavedMomentIds(new Set(saved.map((s) => s.momentId)));
  }, [saved]);

  const streak = computeWeeklyStreak(memories.map((m) => m.createdAt));
  const timeOfDay = useMemo(currentTimeOfDay, []);
  const { weekly, enrolled, progress: challengeProgress, accept: acceptChallenge, chillyCount } =
    useWeeklyChallenge(activeSpace?.id);

  // Fetch live weather once (Open-Meteo, no key). Used as a gentle default when
  // the user hasn't picked a weather chip. Best-effort: silent no-op on failure.
  useEffect(() => {
    let alive = true;
    enrichWithLiveWeather({ spaceType: 'couple' })
      .then(({ constraints: c }) => { if (alive && c.weather) setLiveWeather(c.weather); })
      .catch(() => { /* no live weather rather than a crash */ });
    return () => { alive = false; };
  }, []);

  // Load the space's saved ideas so we can learn a gentle, explicit affinity
  // from them. Re-runs whenever the screen regains focus (e.g. after saving).
  useFocusEffect(
    useCallback(() => {
      if (!activeSpace) return;
      let alive = true;
      savedDateRepository
        .getAll(activeSpace.id)
        .then((d) => { if (alive) setSaved(d); })
        .catch(() => { /* best-effort: no learning rather than a crash */ });
      return () => { alive = false; };
    }, [activeSpace]),
  );

  const categoryAffinity = useMemo(() => {
    const summary = summarizeLearning(saved, {
      categoryOf: (id) => momentById(id)?.category,
      enabled: personalization,
      since: personalizationResetAt ?? undefined,
    });
    const weights = affinityWeights(summary);
    return Object.keys(weights).length > 0 ? weights : undefined;
  }, [saved, personalization, personalizationResetAt]);

  const constraints = useMemo<DateConstraints | null>(() => {
    if (!activeSpace) return null;
    let c: DateConstraints = { spaceType: activeSpace.type, goals, timeOfDay, excludeIds, categoryAffinity };
    for (const s of SHORTCUTS) {
      if (active.has(s.key)) c = { ...c, ...s.patch };
    }
    // Live weather is a default only — a manual weather chip always wins.
    if (!c.weather && liveWeather) c = { ...c, weather: liveWeather };
    return c;
  }, [activeSpace, goals, timeOfDay, active, excludeIds, categoryAffinity, liveWeather]);

  useEffect(() => {
    if (!constraints) {
      setRecs([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    discovery
      .recommend(constraints)
      .then((r) => {
        if (!alive) return;
        // Exhausted the pool via "show another"? Reset and start over.
        if (r.length === 0 && excludeIds.length > 0) {
          setExcludeIds([]);
          return;
        }
        setRecs(r);
        setLoading(false);
      })
      .catch(() => {
        if (alive) {
          setRecs([]);
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [constraints, excludeIds.length]);

  const toggleShortcut = useCallback((key: string) => {
    void acknowledgeSelection();
    setExcludeIds([]);
    setActive((prev) => {
      const next = new Set(prev);
      // Single-select within a group: tapping a chip clears its siblings, so
      // budget / energy / where / vibe each hold at most one choice.
      const group = GROUP_OF[key];
      for (const k of Array.from(next)) {
        if (k !== key && GROUP_OF[k] === group) next.delete(k);
      }
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const showAnother = useCallback(() => {
    const current = recs[0];
    if (current) setExcludeIds((prev) => [...prev, current.momentId]);
  }, [recs]);

  const resetFilters = useCallback(() => {
    setActive(new Set());
    setExcludeIds([]);
  }, []);

  const saveDate = useCallback(
    async (rec: DateRecommendation) => {
      if (!activeSpace) return;
      if (savedMomentIds.has(rec.momentId)) return; // already saved
      // Optimistic: flip the button to "saved" immediately so the tap is felt.
      setSavedMomentIds((prev) => new Set(prev).add(rec.momentId));
      try {
        await savedDateRepository.save({
          spaceId: activeSpace.id,
          momentId: rec.momentId,
          title: rec.title,
          concept: rec.concept,
          priceBand: rec.priceBand,
          estDurationMin: rec.estDurationMin,
          status: 'saved',
        });
        await confirmSuccess();
        setToast(t('saved to your space ♥', 'in eurem Space gemerkt ♥'));
      } catch {
        // Roll back the optimistic flip and tell the user — a silently dropped
        // save looks identical to success and is exactly what confused testers.
        setSavedMomentIds((prev) => {
          const next = new Set(prev);
          next.delete(rec.momentId);
          return next;
        });
        Alert.alert(
          t('Could not save', 'Konnte nicht speichern'),
          t('Please try again in a moment.', 'Bitte versuche es gleich noch einmal.'),
        );
      }
    },
    [activeSpace, savedMomentIds, t],
  );

  const primary = recs.find((r) => !r.isAlternative);
  const alternative = recs.find((r) => r.isAlternative);

  return (
    <SafeAreaView style={styles.container}>
      {toast && <Toast message={toast} onHide={() => setToast(null)} />}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Logo size="sm" />
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.spaceTrigger}
              onPress={() => setPickerOpen(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('Switch, add or share a space', 'Space wechseln, hinzufügen oder teilen')}
            >
              <Text style={styles.spaceName} numberOfLines={1}>
                {(activeSpace?.name ?? 'your space').toLowerCase()}
              </Text>
              <Ionicons name="chevron-down" size={15} color={Colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/customize')}
              accessibilityRole="button"
              accessibilityLabel={t('Customize and account', 'Anpassen und Konto')}
            >
              <Text style={styles.settings}>{t('SETTINGS', 'EINSTELLUNGEN')}</Text>
            </TouchableOpacity>
          </View>
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

        {streaksEnabled && activeSpace && (
          <StreakBanner
            spaceType={activeSpace.type}
            count={streak.count}
            atRisk={streak.atRisk}
            active={streak.active}
          />
        )}

        {/* Section toggle: Surprise me / Idea library / Places map */}
        <View style={styles.sectionToggle}>
          <TouchableOpacity
            style={[styles.toggleChip, styles.toggleChipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: true }}
          >
            <Text style={[styles.toggleChipText, styles.toggleChipTextActive]}>
              {t('✨ SURPRISE ME', '✨ ÜBERRASCH MICH')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleChip}
            onPress={() => { void acknowledgeSelection(); router.push('/discover/browse'); }}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('Browse the full idea library', 'Die ganze Ideen-Bibliothek durchstöbern')}
          >
            <Text style={styles.toggleChipText}>
              {t('💡 ALL IDEAS', '💡 ALLE IDEEN')}{'  '}
              <Ionicons name="arrow-forward" size={11} color={Colors.textSubtle} />
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleChip}
            onPress={() => { void acknowledgeSelection(); router.push('/(tabs)/community'); }}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('Local places near you', 'Orte in eurer Nähe')}
          >
            <Text style={styles.toggleChipText}>
              {t('🗺️ MAP', '🗺️ KARTE')}{'  '}
              <Ionicons name="arrow-forward" size={11} color={Colors.textSubtle} />
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.generatorLabel}>{t('LASST EUCH ÜBERRASCHEN · DATE GENERATOR', 'LASST EUCH ÜBERRASCHEN · DATE GENERATOR')}</Text>
          <Text style={styles.title}>{t('what could you do\ntogether?', 'was könntet\nihr zusammen tun?')}</Text>
          <Text style={styles.subtitle}>
            {t(
              `a real, doable idea — tuned to this ${timeOfDay}. tap a chip to refine.`,
              `eine konkrete Idee für diesen ${timeOfDay === 'morning' ? 'Morgen' : timeOfDay === 'afternoon' ? 'Nachmittag' : 'Abend'}. chip antippen zum Eingrenzen.`,
            )}
          </Text>
          <TouchableOpacity
            style={styles.askInline}
            onPress={() => router.push('/ask')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('Ask PeakPlant for a specific idea', 'PeakPlant nach einer spezifischen Idee fragen')}
          >
            <Text style={styles.askInlineText}>
              {t('ASK PEAKPLANT FOR SOMETHING SPECIFIC', 'PEAKPLANT NACH ETWAS SPEZIFISCHEM FRAGEN')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Refine — one quiet scrolling row, not a wall of labelled groups */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {SHORTCUTS.map((s) => {
            const on = active.has(s.key);
            return (
              <TouchableOpacity
                key={s.key}
                style={[styles.chip, on && styles.chipOn]}
                onPress={() => toggleShortcut(s.key)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={t(s.label, s.labelDe)}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>
                  {s.emoji}  {t(s.label, s.labelDe)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? (
          <View style={styles.loading}>
            <IdeaCardSkeleton />
            <Text style={styles.loadingText}>{t('finding something that fits...', 'wir suchen etwas Passendes...')}</Text>
          </View>
        ) : primary ? (
          <>
            <RecommendationCard
              rec={primary}
              onOpen={() => router.push(`/together/${primary.momentId}`)}
              onSave={() => void saveDate(primary)}
              saved={savedMomentIds.has(primary.momentId)}
              onViewSaved={() => router.push('/discover/saved')}
              saveLabel={t('SAVE FOR US', 'FÜR UNS MERKEN')}
              savedLabel={t('SAVED FOR US ✓', 'FÜR UNS GEMERKT ✓')}
              seeLabel={t('SEE THIS IDEA', 'DIESE IDEE ANSEHEN')}
              whyLabel={t('WHY THIS', 'WARUM DIES')}
              notUsedPrefix={t('not used:', 'nicht verwendet:')}
              curatedLabel={t('curated', 'kuratiert')}
              checkedLabel={t('checked', 'geprüft')}
            />

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={showAnother}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={t('Show another idea', 'Andere Idee zeigen')}
              >
                <Text style={styles.actionText}>{t('SHOW ANOTHER', 'ANDERE IDEE')}</Text>
              </TouchableOpacity>
              {active.size > 0 && (
                <TouchableOpacity
                  style={styles.actionBtnGhost}
                  onPress={resetFilters}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={t('Clear filters', 'Filter zurücksetzen')}
                >
                  <Text style={styles.actionTextGhost}>{t('CLEAR FILTERS', 'FILTER LÖSCHEN')}</Text>
                </TouchableOpacity>
              )}
            </View>

            {alternative && (
              <View style={styles.altBlock}>
                <Text style={styles.altLabel}>{t('OR INSTEAD', 'ODER STATTDESSEN')}</Text>
                <RecommendationCard
                  rec={alternative}
                  compact
                  onOpen={() => router.push(`/together/${alternative.momentId}`)}
                  seeLabel={t('SEE THIS IDEA', 'DIESE IDEE ANSEHEN')}
                  whyLabel={t('WHY THIS', 'WARUM DIES')}
                  notUsedPrefix={t('not used:', 'nicht verwendet:')}
                  curatedLabel={t('curated', 'kuratiert')}
                  checkedLabel={t('checked', 'geprüft')}
                />
              </View>
            )}
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('nothing fits all of that right now.', 'nichts passt gerade auf alles.')}</Text>
            <Text style={styles.emptyHint}>
              {t(
                "loosen a filter, or ask PeakPlant in words — that's often faster.",
                'Lockert einen Filter oder fragt PeakPlant in Worten — das ist oft schneller.',
              )}
            </Text>
            <View style={styles.emptyActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.emptyActionGrow]}
                onPress={() => router.push('/ask')}
                accessibilityRole="button"
                accessibilityLabel={t('Ask PeakPlant', 'PeakPlant fragen')}
              >
                <Text style={styles.actionText}>{t('ASK PEAKPLANT', 'PEAKPLANT FRAGEN')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtnGhost, styles.emptyActionGrow]}
                onPress={resetFilters}
                accessibilityRole="button"
                accessibilityLabel={t('Clear filters', 'Filter zurücksetzen')}
              >
                <Text style={styles.actionTextGhost}>{t('CLEAR FILTERS', 'FILTER LÖSCHEN')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Pillar links — a compact pill cluster, not a stack of full-width rows */}
        <View style={styles.links}>
          <Text style={styles.linksLabel}>{t('MORE WAYS IN', 'MEHR WEGE REIN')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.linkPills}
          >
            {/* "ask peakplant" and "idea library" intentionally omitted here —
                they already have prominent entry points above (the inline ask
                button + the ALL IDEAS toggle). One door each, not three. */}
            <TouchableOpacity
              style={styles.linkPill}
              onPress={() => router.push('/discover/saved')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={t('Your saved plans', 'Eure gemerkten Pläne')}
            >
              <Text style={styles.linkPillText}>
                {t('🔖 saved plans', '🔖 gemerkte Pläne')}
                {saved.length > 0 ? ` · ${saved.length}` : ''}
              </Text>
            </TouchableOpacity>
            {challengesEnabled && (
              <TouchableOpacity
                style={styles.linkPill}
                onPress={() => router.push('/challenges')}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={t('Challenges', 'Herausforderungen')}
              >
                <Text style={styles.linkPillText}>{t('🔥 challenges', '🔥 Challenges')}</Text>
              </TouchableOpacity>
            )}
            {ritualsEnabled && (
              <TouchableOpacity
                style={styles.linkPill}
                onPress={() => router.push('/rituals')}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={t('Rituals', 'Rituale')}
              >
                <Text style={styles.linkPillText}>{t('🌿 rituals', '🌿 Rituale')}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Weekly challenge */}
        <View style={styles.challengeSection}>
          <View style={styles.challengeHeader}>
            <Text style={styles.challengeSectionLabel}>
              {t('THIS WEEK', 'DIESE WOCHE')}
            </Text>
            {chillyCount > 0 && (
              <Text style={styles.chillyCounter}>
                {t(`${chillyCount} challenge${chillyCount !== 1 ? 's' : ''} done`, `${chillyCount} Challenge${chillyCount !== 1 ? 's' : ''} geschafft`)} {'✓'}
              </Text>
            )}
          </View>

          <View style={styles.challengeCard}>
            <Text style={styles.challengePrompt}>
              {t('a little extra energy today?', 'ein bisschen extra Energie heute?')}
            </Text>
            <Text style={styles.challengeTitle}>{weekly.title}</Text>
            <Text style={styles.challengeSubtitle}>{weekly.subtitle}</Text>

            {challengeProgress?.complete ? (
              <View style={styles.challengeDone}>
                <Text style={styles.challengeDoneBadge}>{weekly.badge}</Text>
                <Text style={styles.challengeDoneText}>
                  {t('challenge complete!', 'Challenge geschafft!')}
                </Text>
              </View>
            ) : enrolled && challengeProgress ? (
              <View style={styles.challengeProgress}>
                <View style={styles.challengeProgressBar}>
                  <AnimatedFill
                    ratio={challengeProgress.goal > 0 ? challengeProgress.count / challengeProgress.goal : 0}
                    style={styles.challengeProgressFill}
                  />
                </View>
                <Text style={styles.challengeProgressText}>
                  {t(
                    `${challengeProgress.count} of ${challengeProgress.goal} moments`,
                    `${challengeProgress.count} von ${challengeProgress.goal} Momenten`,
                  )}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.challengeAccept}
                onPress={() => void acceptChallenge().then(() => confirmSuccess())}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={t('Accept the weekly challenge', 'Wöchentliche Challenge annehmen')}
              >
                <Text style={styles.challengeAcceptText}>
                  {t('ACCEPT CHALLENGE', 'CHALLENGE ANNEHMEN')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.tagline}>
          {activeSpace?.type === 'friends'
            ? t(
                'time with friends is not something to optimise.\nit is something to notice.',
                'Zeit mit Freunden ist nichts zum Optimieren.\nSie ist etwas zum Bemerken.',
              )
            : t(
                'your relationship is not something to optimise.\nit is something to notice.',
                'Eure Beziehung ist nichts zum Optimieren.\nSie ist etwas zum Bemerken.',
              )}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function RecommendationCard({
  rec,
  onOpen,
  onSave,
  saved,
  onViewSaved,
  compact,
  saveLabel = 'SAVE',
  savedLabel = 'SAVED ✓',
  seeLabel = 'SEE THIS IDEA ->',
  whyLabel = 'WHY THIS',
  notUsedPrefix = 'not used:',
  curatedLabel = 'curated',
  checkedLabel = 'checked',
}: {
  rec: DateRecommendation;
  onOpen: () => void;
  onSave?: () => void;
  saved?: boolean;
  onViewSaved?: () => void;
  compact?: boolean;
  saveLabel?: string;
  savedLabel?: string;
  seeLabel?: string;
  whyLabel?: string;
  notUsedPrefix?: string;
  curatedLabel?: string;
  checkedLabel?: string;
}) {
  return (
    <PressableScale
      style={[styles.card, compact && styles.cardCompact]}
      onPress={onOpen}
      scaleTo={compact ? 0.98 : 0.985}
      accessibilityLabel={`${rec.title}. ${rec.why}`}
    >
      {!compact && <View style={styles.cardAccent} />}
      <Text style={styles.cardTitle}>{rec.title}</Text>
      <Text style={styles.cardConcept}>{rec.concept}</Text>

      <View style={styles.facts}>
        {rec.facts.map((f) => (
          <View key={f.label} style={styles.fact}>
            <Text style={styles.factLabel}>{f.label}</Text>
            <Text style={styles.factValue}>{f.value}</Text>
          </View>
        ))}
      </View>

      {!compact && (
        <View style={styles.why}>
          <Text style={styles.whyLabel}>{whyLabel}</Text>
          <Text style={styles.whyText}>{rec.why}</Text>
          {rec.signalsNotUsed.length > 0 && (
            <Text style={styles.notUsed}>
              {notUsedPrefix} {rec.signalsNotUsed.join(' · ')}
            </Text>
          )}
        </View>
      )}

      <Text style={styles.provenance}>{curatedLabel} · {checkedLabel} {rec.freshnessAt}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cta}>{seeLabel}</Text>
        {onSave && !compact && (
          saved ? (
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation?.(); onViewSaved?.(); }}
              accessibilityRole="button"
              accessibilityLabel={savedLabel}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.savedDone}>{savedLabel}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation?.(); onSave(); }}
              accessibilityRole="button"
              accessibilityLabel={saveLabel}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.save}>{saveLabel}</Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing.xxxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerRight: { alignItems: 'flex-end', gap: 4 },
  spaceTrigger: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: 200 },
  spaceName: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 2,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  settings: { fontSize: 9, fontWeight: '500', letterSpacing: 2, color: Colors.textSubtle },
  titleBlock: { paddingHorizontal: Spacing.screen, paddingTop: Spacing.xl, gap: Spacing.sm },
  title: { ...Typography.editorial, fontSize: 34, lineHeight: 38 },
  subtitle: { fontSize: 14, fontWeight: '400', color: Colors.textSubtle, lineHeight: 21 },
  askInline: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  askInlineText: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2,
    color: Colors.text,
    textAlign: 'center',
  },
  chips: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundWarm,
    borderRadius: Radii.pill,
    ...Shadows.subtle,
  },
  chipOn: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.text, letterSpacing: 0.2 },
  chipTextOn: { color: Colors.white },
  loading: { gap: Spacing.md, paddingBottom: Spacing.xxl },
  loadingText: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.textFaint,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.md,
    borderRadius: Radii.lg,
    ...Shadows.card,
  },
  cardCompact: {
    backgroundColor: Colors.backgroundWarm,
    paddingTop: Spacing.lg,
    ...Shadows.subtle,
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: Spacing.lg,
    width: 40,
    height: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: DISCOVER,
  },
  cardTitle: { ...Typography.editorial, fontSize: 24, lineHeight: 29 },
  cardConcept: { fontSize: 14, fontWeight: '400', color: Colors.textMuted, lineHeight: 21 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  fact: { gap: 2 },
  factLabel: {
    fontSize: 8,
    fontWeight: '500',
    letterSpacing: 1.5,
    color: Colors.textFaint,
    textTransform: 'uppercase',
  },
  factValue: { fontSize: 12, fontWeight: '400', color: Colors.text },
  why: {
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  whyLabel: { fontSize: 8, fontWeight: '500', letterSpacing: 2, color: Colors.textSubtle },
  whyText: { fontSize: 13, fontWeight: '300', color: Colors.textMuted, lineHeight: 19 },
  notUsed: { fontSize: 10, fontWeight: '300', color: Colors.textFaint, fontStyle: 'italic', marginTop: 2 },
  provenance: {
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 0.5,
    color: Colors.textFaint,
    textTransform: 'uppercase',
  },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cta: { fontSize: 10, fontWeight: '600', letterSpacing: 2, color: Colors.accent },
  save: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.textMuted },
  savedDone: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.accent },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.screen, marginTop: Spacing.md },
  actionBtn: {
    height: 44,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  actionText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.text },
  actionBtnGhost: { height: 44, paddingHorizontal: Spacing.lg, justifyContent: 'center', alignItems: 'center' },
  actionTextGhost: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.textFaint },
  altBlock: { paddingHorizontal: Spacing.screen, marginTop: Spacing.xl, gap: Spacing.sm },
  altLabel: { fontSize: 9, fontWeight: '500', letterSpacing: 3, color: Colors.textFaint },
  empty: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.screen },
  emptyText: { fontSize: 18, fontWeight: '200', color: Colors.textMuted },
  emptyHint: { fontSize: 13, fontWeight: '300', color: Colors.textFaint, marginBottom: Spacing.md, textAlign: 'center', lineHeight: 19 },
  emptyActions: { flexDirection: 'row', gap: Spacing.sm, alignSelf: 'stretch' },
  emptyActionGrow: { flex: 1, paddingHorizontal: Spacing.sm },
  links: {
    marginTop: Spacing.xxl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  linksLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2.5,
    color: Colors.textFaint,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.screen,
  },
  linkPills: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xs,
  },
  linkPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.pill,
    backgroundColor: Colors.backgroundWarm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  linkPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text,
    letterSpacing: 0.2,
  },
  tagline: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xxl,
    fontSize: 14,
    fontWeight: '200',
    color: Colors.textMuted,
    lineHeight: 22,
    letterSpacing: 0.3,
  },

  // Section toggle (All Ideas / Local Places)
  sectionToggle: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
  },
  toggleChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.pill,
  },
  toggleChipActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  toggleChipText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.5,
    color: Colors.textMuted,
  },
  toggleChipTextActive: {
    color: Colors.white,
  },

  // Date generator label
  generatorLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2.5,
    color: Colors.accent,
    textTransform: 'uppercase',
  },

  // Weekly challenge
  challengeSection: {
    marginTop: Spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.lg,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    marginBottom: Spacing.md,
  },
  challengeSectionLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2.5,
    color: Colors.textFaint,
    textTransform: 'uppercase',
  },
  chillyCounter: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
    color: Colors.accent,
  },
  challengeCard: {
    backgroundColor: Colors.backgroundCream,
    marginHorizontal: Spacing.screen,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderRadius: Radii.lg,
    ...Shadows.subtle,
  },
  challengePrompt: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.5,
    color: Colors.textFaint,
    fontStyle: 'italic',
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  challengeSubtitle: {
    fontSize: 13,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 19,
  },
  challengeDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  challengeDoneBadge: { fontSize: 22 },
  challengeDoneText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    color: Colors.text,
  },
  challengeProgress: { gap: Spacing.sm, paddingTop: Spacing.sm },
  challengeProgressBar: {
    height: 2,
    backgroundColor: Colors.border,
  },
  challengeProgressFill: {
    height: 2,
    backgroundColor: Colors.accent,
  },
  challengeProgressText: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.5,
    color: Colors.textMuted,
  },
  challengeAccept: {
    height: 44,
    borderWidth: 1,
    borderColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
    borderRadius: Radii.pill,
  },
  challengeAcceptText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2,
    color: Colors.text,
  },
});
