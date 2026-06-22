import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Logo } from '../../components/ui/Logo';
import { SpaceSwitcher } from '../../components/space/SpaceSwitcher';
import { StreakBanner } from '../../components/space/StreakBanner';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useMemories } from '../../lib/hooks/useMemories';
import { useAppStore } from '../../lib/store';
import { computeWeeklyStreak } from '../../lib/streaks';
import { discovery } from '../../lib/ai';
import type { DateConstraints, DateRecommendation } from '../../lib/ai';
import type { TimeOfDay } from '../../lib/together';

/** Device clock → coarse time of day. Honest, location-free contextual signal. */
function currentTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

/** Mood/shortcut chips — each maps to a slice of DateConstraints. */
type Shortcut = { key: string; label: string; patch: Partial<DateConstraints> };
const SHORTCUTS: Shortcut[] = [
  { key: 'quick', label: 'under 2h', patch: { maxDurationMin: 120 } },
  { key: 'free', label: 'free', patch: { maxBudget: 'free' } },
  { key: 'cheap', label: 'easy spend', patch: { maxBudget: '€€' } },
  { key: 'outdoor', label: 'outdoors', patch: { indoorOutdoor: 'outdoor' } },
  { key: 'indoor', label: 'stay in', patch: { indoorOutdoor: 'indoor' } },
  { key: 'rain', label: 'rainy day', patch: { weather: 'rain' } },
  { key: 'calm', label: 'calm', patch: { categories: ['calm'] } },
  { key: 'play', label: 'playful', patch: { categories: ['play'] } },
];

export default function DiscoverScreen() {
  const { spaces, activeSpace, setActiveSpace } = useSpaces();
  const { memories } = useMemories(activeSpace?.id);
  const goals = useAppStore((s) => s.goals);
  const streaksEnabled = useAppStore((s) => s.features.streaks);
  const challengesEnabled = useAppStore((s) => s.features.challenges);
  const missionsEnabled = useAppStore((s) => s.features.missions);

  const [active, setActive] = useState<Set<string>>(new Set());
  const [excludeIds, setExcludeIds] = useState<string[]>([]);
  const [recs, setRecs] = useState<DateRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const streak = computeWeeklyStreak(memories.map((m) => m.createdAt));
  const timeOfDay = useMemo(currentTimeOfDay, []);

  const constraints = useMemo<DateConstraints | null>(() => {
    if (!activeSpace) return null;
    let c: DateConstraints = { spaceType: activeSpace.type, goals, timeOfDay, excludeIds };
    for (const s of SHORTCUTS) {
      if (active.has(s.key)) c = { ...c, ...s.patch };
    }
    return c;
  }, [activeSpace, goals, timeOfDay, active, excludeIds]);

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
    setExcludeIds([]);
    setActive((prev) => {
      const next = new Set(prev);
      // indoor/outdoor are mutually exclusive; same for the category chips.
      if (key === 'indoor') next.delete('outdoor');
      if (key === 'outdoor') next.delete('indoor');
      if (key === 'free') next.delete('cheap');
      if (key === 'cheap') next.delete('free');
      if (key === 'calm') next.delete('play');
      if (key === 'play') next.delete('calm');
      next.has(key) ? next.delete(key) : next.add(key);
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

  const primary = recs.find((r) => !r.isAlternative);
  const alternative = recs.find((r) => r.isAlternative);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Logo size="sm" />
          <View style={styles.headerRight}>
            <Text style={styles.spaceName}>
              {(activeSpace?.name ?? 'your space').toLowerCase()}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/customize')}
              accessibilityRole="button"
              accessibilityLabel="Customize and account"
            >
              <Text style={styles.settings}>SETTINGS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {spaces.length >= 1 && (
          <SpaceSwitcher
            spaces={spaces}
            activeSpaceId={activeSpace?.id}
            onSelect={setActiveSpace}
          />
        )}

        {streaksEnabled && activeSpace && (
          <StreakBanner
            spaceType={activeSpace.type}
            count={streak.count}
            atRisk={streak.atRisk}
            active={streak.active}
          />
        )}

        <View style={styles.titleBlock}>
          <Text style={styles.title}>what could you do{'\n'}together?</Text>
          <Text style={styles.subtitle}>
            a real, doable idea near you — tuned to this {timeOfDay}. tap a chip to refine.
          </Text>
        </View>

        {/* Quick filters */}
        <View style={styles.chips}>
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
                accessibilityLabel={s.label}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{s.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={Colors.accent} />
            <Text style={styles.loadingText}>finding something that fits…</Text>
          </View>
        ) : primary ? (
          <>
            <RecommendationCard rec={primary} onOpen={() => router.push(`/together/${primary.momentId}`)} />

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={showAnother}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Show another idea"
              >
                <Text style={styles.actionText}>SHOW ANOTHER</Text>
              </TouchableOpacity>
              {active.size > 0 && (
                <TouchableOpacity
                  style={styles.actionBtnGhost}
                  onPress={resetFilters}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Clear filters"
                >
                  <Text style={styles.actionTextGhost}>CLEAR FILTERS</Text>
                </TouchableOpacity>
              )}
            </View>

            {alternative && (
              <View style={styles.altBlock}>
                <Text style={styles.altLabel}>OR INSTEAD</Text>
                <RecommendationCard
                  rec={alternative}
                  compact
                  onOpen={() => router.push(`/together/${alternative.momentId}`)}
                />
              </View>
            )}
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>nothing fits all of that right now.</Text>
            <Text style={styles.emptyHint}>loosen a filter and we’ll find something.</Text>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={resetFilters}
              accessibilityRole="button"
              accessibilityLabel="Clear filters"
            >
              <Text style={styles.actionText}>CLEAR FILTERS</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pillar links — preserve access to the fuller surfaces */}
        <View style={styles.links}>
          {missionsEnabled && (
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => router.push('/together')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Browse all ideas and local places"
            >
              <Text style={styles.linkText}>all ideas & local places</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
          )}
          {challengesEnabled && (
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => router.push('/challenges')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Challenges"
            >
              <Text style={styles.linkText}>challenges</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.tagline}>
          {activeSpace?.type === 'friends'
            ? 'time with friends is not something to optimise.\nit is something to notice.'
            : 'your relationship is not something to optimise.\nit is something to notice.'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function RecommendationCard({
  rec,
  onOpen,
  compact,
}: {
  rec: DateRecommendation;
  onOpen: () => void;
  compact?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={onOpen}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`${rec.title}. ${rec.why}`}
    >
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
          <Text style={styles.whyLabel}>WHY THIS</Text>
          <Text style={styles.whyText}>{rec.why}</Text>
          {rec.signalsNotUsed.length > 0 && (
            <Text style={styles.notUsed}>
              not used: {rec.signalsNotUsed.join(' · ')}
            </Text>
          )}
        </View>
      )}

      <Text style={styles.provenance}>curated · checked {rec.freshnessAt}</Text>
      <Text style={styles.cta}>SEE THIS IDEA →</Text>
    </TouchableOpacity>
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
  spaceName: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 2,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  settings: { fontSize: 9, fontWeight: '500', letterSpacing: 2, color: Colors.accent },
  titleBlock: { paddingHorizontal: Spacing.screen, paddingTop: Spacing.xl, gap: Spacing.sm },
  title: { fontSize: 30, fontWeight: '200', color: Colors.text, letterSpacing: -0.5, lineHeight: 36 },
  subtitle: { fontSize: 14, fontWeight: '300', color: Colors.textMuted, lineHeight: 21 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 999,
  },
  chipOn: { backgroundColor: Colors.text, borderColor: Colors.text },
  chipText: { fontSize: 12, fontWeight: '400', color: Colors.textMuted, letterSpacing: 0.3 },
  chipTextOn: { color: Colors.white },
  loading: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xxl },
  loadingText: { fontSize: 12, fontWeight: '300', color: Colors.textFaint, letterSpacing: 0.5 },
  card: {
    backgroundColor: Colors.backgroundCream,
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardCompact: { backgroundColor: Colors.backgroundWarm },
  cardTitle: { fontSize: 22, fontWeight: '200', color: Colors.text, letterSpacing: -0.3 },
  cardConcept: { fontSize: 14, fontWeight: '300', color: Colors.textMuted, lineHeight: 21 },
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
  whyLabel: { fontSize: 8, fontWeight: '500', letterSpacing: 2, color: Colors.accent },
  whyText: { fontSize: 13, fontWeight: '300', color: Colors.textMuted, lineHeight: 19 },
  notUsed: { fontSize: 10, fontWeight: '300', color: Colors.textFaint, fontStyle: 'italic', marginTop: 2 },
  provenance: {
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 0.5,
    color: Colors.textFaint,
    textTransform: 'uppercase',
  },
  cta: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.accent },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.screen, marginTop: Spacing.md },
  actionBtn: {
    height: 44,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.text },
  actionBtnGhost: { height: 44, paddingHorizontal: Spacing.lg, justifyContent: 'center', alignItems: 'center' },
  actionTextGhost: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.textFaint },
  altBlock: { paddingHorizontal: Spacing.screen, marginTop: Spacing.xl, gap: Spacing.sm },
  altLabel: { fontSize: 9, fontWeight: '500', letterSpacing: 3, color: Colors.textFaint },
  empty: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.screen },
  emptyText: { fontSize: 18, fontWeight: '200', color: Colors.textMuted },
  emptyHint: { fontSize: 13, fontWeight: '300', color: Colors.textFaint, marginBottom: Spacing.md },
  links: {
    marginTop: Spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  linkText: { fontSize: 15, fontWeight: '300', color: Colors.text },
  linkArrow: { fontSize: 18, fontWeight: '200', color: Colors.textMuted },
  tagline: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xxl,
    fontSize: 14,
    fontWeight: '200',
    color: Colors.textMuted,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
});
