import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../components/ui/BackButton';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { savedDateRepository } from '../../lib/repositories';
import { shareCalendarEvent } from '../../lib/calendarShare';
import { ideaLink } from '../../lib/links';
import { acknowledgeSelection, confirmSuccess } from '../../lib/haptics';
import {
  IDEA_CATALOG,
  filterIdeas,
  activeFilterCount,
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  type DateIdea,
  type IdeaFilter,
  type IdeaCategory,
} from '../../lib/discovery/ideaCatalog';
import type { TimeOfDay, Energy, PriceBand, IndoorOutdoor } from '../../lib/together';
import type { Season } from '../../lib/discovery/ideaCatalog';

type Lang = (en: string, de: string) => string;

const PRICE_LABEL: Record<PriceBand, string> = { free: 'free', '€': '€', '€€': '€€', '€€€': '€€€' };

export default function BrowseIdeasScreen() {
  const { activeSpace } = useSpaces();
  const { t } = useLanguage();

  const [filter, setFilter] = useState<IdeaFilter>({});
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  // Load this space's saved ideas so rows reflect saved/done state.
  useFocusEffect(
    useCallback(() => {
      if (!activeSpace) return;
      let alive = true;
      savedDateRepository
        .getAll(activeSpace.id)
        .then((all) => {
          if (!alive) return;
          setSavedIds(new Set(all.map((s) => s.momentId)));
          setCompletedIds(new Set(all.filter((s) => s.status === 'completed').map((s) => s.momentId)));
        })
        .catch(() => { /* best-effort */ });
      return () => { alive = false; };
    }, [activeSpace]),
  );

  const effectiveFilter = useMemo<IdeaFilter>(
    () => ({ ...filter, query: query.trim() || undefined }),
    [filter, query],
  );

  const results = useMemo(() => filterIdeas(effectiveFilter), [effectiveFilter]);
  const count = activeFilterCount(effectiveFilter);

  const patch = useCallback((p: Partial<IdeaFilter>) => {
    void acknowledgeSelection();
    setFilter((prev) => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(p)) {
        // Toggle: tapping the active value clears it.
        if ((next as Record<string, unknown>)[k] === v) delete (next as Record<string, unknown>)[k];
        else (next as Record<string, unknown>)[k] = v;
      }
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    void acknowledgeSelection();
    setFilter({});
    setQuery('');
  }, []);

  const saveIdea = useCallback(
    async (idea: DateIdea, asCompleted: boolean) => {
      if (!activeSpace) return;
      // Optimistic flip.
      setSavedIds((prev) => new Set(prev).add(idea.id));
      if (asCompleted) setCompletedIds((prev) => new Set(prev).add(idea.id));
      try {
        await savedDateRepository.save({
          spaceId: activeSpace.id,
          momentId: idea.id,
          title: idea.title,
          concept: idea.idea,
          priceBand: idea.priceBand,
          estDurationMin: idea.avgDurationMin,
          status: asCompleted ? 'completed' : 'saved',
          ...(asCompleted ? { completedAt: new Date().toISOString() } : {}),
        });
        await confirmSuccess();
      } catch {
        setSavedIds((prev) => { const n = new Set(prev); n.delete(idea.id); return n; });
        if (asCompleted) setCompletedIds((prev) => { const n = new Set(prev); n.delete(idea.id); return n; });
        Alert.alert(
          t('Could not save', 'Konnte nicht speichern'),
          t('Please try again in a moment.', 'Bitte versuche es gleich noch einmal.'),
        );
      }
    },
    [activeSpace, t],
  );

  const addToCalendar = useCallback(
    async (idea: DateIdea) => {
      void acknowledgeSelection();
      try {
        await shareCalendarEvent({ title: idea.title, link: ideaLink(idea.id) });
      } catch {
        Alert.alert(
          t('Could not open calendar', 'Kalender konnte nicht geöffnet werden'),
          t('Please try again in a moment.', 'Bitte versuche es gleich noch einmal.'),
        );
      }
    },
    [t],
  );

  const renderItem = useCallback(
    ({ item }: { item: DateIdea }) => (
      <IdeaRow
        idea={item}
        t={t}
        saved={savedIds.has(item.id)}
        completed={completedIds.has(item.id)}
        onSave={() => void saveIdea(item, false)}
        onComplete={() => void saveIdea(item, true)}
        onCalendar={() => void addToCalendar(item)}
      />
    ),
    [t, savedIds, completedIds, saveIdea, addToCalendar],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BackButton label={t('BACK', 'ZURÜCK')} />
        <Text style={styles.headerLabel}>{t('ALL IDEAS', 'ALLE IDEEN')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={results}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={10}
        maxToRenderPerBatch={12}
        windowSize={9}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={styles.bigTitle}>{t('the idea library', 'die Ideen-Bibliothek')}</Text>
            <Text style={styles.lead}>
              {t(
                `${IDEA_CATALOG.length.toLocaleString()} real, doable ideas. filter, save, or plan one in.`,
                `${IDEA_CATALOG.length.toLocaleString()} echte, machbare Ideen. filtern, merken oder einplanen.`,
              )}
            </Text>

            <View style={styles.searchRow}>
              <Ionicons name="search" size={16} color={Colors.textFaint} />
              <TextInput
                style={styles.search}
                placeholder={t('search ideas…', 'Ideen suchen…')}
                placeholderTextColor={Colors.textFaint}
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={16} color={Colors.textFaint} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.filterBar}>
              <TouchableOpacity
                style={[styles.filterToggle, count > 0 && styles.filterToggleActive]}
                onPress={() => { void acknowledgeSelection(); setShowFilters((s) => !s); }}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={t('Toggle filters', 'Filter umschalten')}
              >
                <Ionicons name="options-outline" size={15} color={count > 0 ? Colors.white : Colors.text} />
                <Text style={[styles.filterToggleText, count > 0 && styles.filterToggleTextActive]}>
                  {count > 0
                    ? t(`${count} filter${count !== 1 ? 's' : ''}`, `${count} Filter`)
                    : t('filters', 'Filter')}
                </Text>
                <Ionicons
                  name={showFilters ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color={count > 0 ? Colors.white : Colors.textMuted}
                />
              </TouchableOpacity>
              {count > 0 && (
                <TouchableOpacity onPress={clearAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.clearText}>{t('clear', 'zurücksetzen')}</Text>
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }} />
              <Text style={styles.resultCount}>
                {t(`${results.length} ideas`, `${results.length} Ideen`)}
              </Text>
            </View>

            {showFilters && (
              <View style={styles.filterPanel}>
                <FilterGroup label={t('WHO', 'WER')}>
                  <Chip label={t('couple', 'Paar')} on={filter.spaceType === 'couple'} onPress={() => patch({ spaceType: 'couple' })} />
                  <Chip label={t('friends', 'Freunde')} on={filter.spaceType === 'friends'} onPress={() => patch({ spaceType: 'friends' })} />
                </FilterGroup>

                <FilterGroup label={t('WHEN', 'WANN')}>
                  {(['morning', 'afternoon', 'evening'] as TimeOfDay[]).map((tod) => (
                    <Chip
                      key={tod}
                      label={t(tod, tod === 'morning' ? 'Morgen' : tod === 'afternoon' ? 'Nachmittag' : 'Abend')}
                      on={filter.timeOfDay === tod}
                      onPress={() => patch({ timeOfDay: tod })}
                    />
                  ))}
                </FilterGroup>

                <FilterGroup label={t('BUDGET', 'BUDGET')}>
                  {(['free', '€', '€€', '€€€'] as PriceBand[]).map((b) => (
                    <Chip
                      key={b}
                      label={b === 'free' ? t('free', 'gratis') : `≤ ${PRICE_LABEL[b]}`}
                      on={filter.maxBudget === b}
                      onPress={() => patch({ maxBudget: b })}
                    />
                  ))}
                </FilterGroup>

                <FilterGroup label={t('ENERGY', 'ENERGIE')}>
                  {(['low', 'medium', 'high'] as Energy[]).map((e) => (
                    <Chip
                      key={e}
                      label={t(e, e === 'low' ? 'niedrig' : e === 'medium' ? 'mittel' : 'hoch')}
                      on={filter.energy === e}
                      onPress={() => patch({ energy: e })}
                    />
                  ))}
                </FilterGroup>

                <FilterGroup label={t('WHERE', 'WO')}>
                  {(['indoor', 'outdoor'] as IndoorOutdoor[]).map((io) => (
                    <Chip
                      key={io}
                      label={io === 'indoor' ? t('indoors', 'drinnen') : t('outdoors', 'draußen')}
                      on={filter.indoorOutdoor === io}
                      onPress={() => patch({ indoorOutdoor: io })}
                    />
                  ))}
                </FilterGroup>

                <FilterGroup label={t('SEASON', 'JAHRESZEIT')}>
                  {(['spring', 'summer', 'autumn', 'winter'] as Season[]).map((s) => (
                    <Chip
                      key={s}
                      label={t(s, s === 'spring' ? 'Frühling' : s === 'summer' ? 'Sommer' : s === 'autumn' ? 'Herbst' : 'Winter')}
                      on={filter.season === s}
                      onPress={() => patch({ season: s })}
                    />
                  ))}
                </FilterGroup>

                <FilterGroup label={t('CATEGORY', 'KATEGORIE')}>
                  {(Object.keys(CATEGORY_LABEL) as IdeaCategory[]).map((c) => (
                    <Chip
                      key={c}
                      label={`${CATEGORY_EMOJI[c]} ${t(CATEGORY_LABEL[c].en, CATEGORY_LABEL[c].de)}`}
                      on={filter.category === c}
                      onPress={() => patch({ category: c })}
                    />
                  ))}
                </FilterGroup>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('nothing matches all of that.', 'nichts passt auf alles.')}</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={clearAll} accessibilityRole="button">
              <Text style={styles.emptyBtnText}>{t('CLEAR FILTERS', 'FILTER LÖSCHEN')}</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupLabel}>{label}</Text>
      <View style={styles.groupChips}>{children}</View>
    </View>
  );
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.chip, on && styles.chipOn]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
    >
      <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

function IdeaRow({
  idea, t, saved, completed, onSave, onComplete, onCalendar,
}: {
  idea: DateIdea;
  t: Lang;
  saved: boolean;
  completed: boolean;
  onSave: () => void;
  onComplete: () => void;
  onCalendar: () => void;
}) {
  const hours = idea.avgDurationMin >= 60
    ? `${Math.round((idea.avgDurationMin / 60) * 10) / 10}h`
    : `${idea.avgDurationMin}m`;
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardEmoji}>{CATEGORY_EMOJI[idea.category]}</Text>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{idea.title}</Text>
          <Text style={styles.cardIdea}>{idea.idea}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{idea.priceBand === 'free' ? t('free', 'gratis') : idea.priceBand}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.meta}>{hours}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.meta}>{t(idea.energy, idea.energy === 'low' ? 'niedrig' : idea.energy === 'medium' ? 'mittel' : 'hoch')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.action, saved && styles.actionDone]}
          onPress={onSave}
          disabled={saved}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={saved ? t('Saved', 'Gemerkt') : t('Save', 'Merken')}
        >
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={14} color={saved ? Colors.accent : Colors.textMuted} />
          <Text style={[styles.actionText, saved && styles.actionTextDone]}>
            {saved ? t('saved', 'gemerkt') : t('save', 'merken')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.action}
          onPress={onCalendar}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('Add to calendar', 'Zum Kalender')}
        >
          <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.actionText}>{t('plan', 'planen')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.action, completed && styles.actionDone]}
          onPress={onComplete}
          disabled={completed}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={completed ? t('Done', 'Erledigt') : t('Mark as done', 'Als erledigt markieren')}
        >
          <Ionicons name={completed ? 'checkmark-circle' : 'checkmark-circle-outline'} size={14} color={completed ? Colors.accent : Colors.textMuted} />
          <Text style={[styles.actionText, completed && styles.actionTextDone]}>
            {completed ? t('done', 'erledigt') : t('did it', 'gemacht')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLabel: { fontSize: 10, fontWeight: '500', letterSpacing: 3, color: Colors.text },
  listContent: { paddingBottom: Spacing.xxxl },
  headerBlock: { paddingHorizontal: Spacing.screen, paddingTop: Spacing.lg, gap: Spacing.md },
  bigTitle: { ...Typography.editorial, fontSize: 30, lineHeight: 34 },
  lead: { fontSize: 13, fontWeight: '300', color: Colors.textMuted, lineHeight: 19 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundWarm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  search: { flex: 1, fontSize: 15, fontWeight: '300', color: Colors.text },
  filterBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    height: 36,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundWarm,
  },
  filterToggleActive: { backgroundColor: Colors.text, borderColor: Colors.text },
  filterToggleText: { fontSize: 12, fontWeight: '500', color: Colors.text, letterSpacing: 0.2 },
  filterToggleTextActive: { color: Colors.white },
  clearText: { fontSize: 11, fontWeight: '500', color: Colors.accent, letterSpacing: 0.3 },
  resultCount: { fontSize: 11, fontWeight: '400', color: Colors.textFaint, letterSpacing: 0.3 },
  filterPanel: {
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.backgroundWarm,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  group: { gap: Spacing.sm },
  groupLabel: { fontSize: 9, fontWeight: '600', letterSpacing: 2, color: Colors.textFaint },
  groupChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipOn: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { fontSize: 12, fontWeight: '500', color: Colors.text },
  chipTextOn: { color: Colors.white },
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radii.md,
    gap: Spacing.sm,
    ...Shadows.subtle,
  },
  cardTop: { flexDirection: 'row', gap: Spacing.md },
  cardEmoji: { fontSize: 22, marginTop: 2 },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { ...Typography.editorial, fontSize: 18, lineHeight: 23 },
  cardIdea: { fontSize: 13, fontWeight: '300', color: Colors.textMuted, lineHeight: 19 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  meta: { fontSize: 11, fontWeight: '500', color: Colors.textSubtle, letterSpacing: 0.2 },
  metaDot: { fontSize: 11, color: Colors.textFaint },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  action: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, height: 32 },
  actionDone: { opacity: 1 },
  actionText: { fontSize: 11, fontWeight: '500', color: Colors.textMuted, letterSpacing: 0.3 },
  actionTextDone: { color: Colors.accent },
  empty: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.screen },
  emptyText: { fontSize: 16, fontWeight: '200', color: Colors.textMuted },
  emptyBtn: {
    height: 44,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  emptyBtnText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.text },
});
