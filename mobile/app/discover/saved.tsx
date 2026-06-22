import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { savedDateRepository } from '../../lib/repositories';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { transitionEffect } from '../../lib/savedDates/status';
import { shareSavedDate } from '../../lib/share';
import type { SavedDate } from '../../lib/types';

export default function SavedDatesScreen() {
  const { activeSpace } = useSpaces();
  const { t } = useLanguage();

  const STATUS_LABEL: Record<string, string> = {
    idea: t('idea', 'Idee'),
    saved: t('saved', 'gespeichert'),
    planned: t('planned', 'geplant'),
    cancelled: t('called off', 'abgesagt'),
    completed: t('done', 'erledigt'),
    dismissed: t('dismissed', 'verworfen'),
  };

  const [dates, setDates] = useState<SavedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [planningId, setPlanningId] = useState<string | null>(null);
  const [planText, setPlanText] = useState('');
  const [planNotes, setPlanNotes] = useState('');
  const [planBusy, setPlanBusy] = useState(false);

  const load = useCallback(async () => {
    if (!activeSpace) return;
    setLoading(true);
    try {
      const all = await savedDateRepository.getAll(activeSpace.id);
      setDates(all.filter((d) => d.status !== 'dismissed'));
    } finally {
      setLoading(false);
    }
  }, [activeSpace]);

  useEffect(() => {
    void load();
  }, [load]);

  const openPlan = useCallback((d: SavedDate) => {
    setPlanText(d.plannedFor ?? '');
    setPlanNotes(d.planningNotes ?? '');
    setPlanningId(d.id);
  }, []);

  const closePlan = useCallback(() => {
    setPlanningId(null);
    setPlanText('');
    setPlanNotes('');
  }, []);

  const confirmPlan = useCallback(async () => {
    if (!planningId || !planText.trim() || planBusy) return;
    setPlanBusy(true);
    try {
      await savedDateRepository.update(planningId, {
        status: 'planned',
        plannedFor: planText.trim(),
        planningNotes: planNotes.trim() || undefined,
      });
      closePlan();
      void load();
    } catch {
      Alert.alert(
        t('something went wrong', 'etwas ist schiefgelaufen'),
        t('could not plan this idea. please try again.', 'Idee konnte nicht geplant werden.'),
      );
    } finally {
      setPlanBusy(false);
    }
  }, [planningId, planText, planNotes, planBusy, load, closePlan, t]);

  const cancelPlan = useCallback(
    async (d: SavedDate) => {
      const effect = transitionEffect('cancelled');
      try {
        await savedDateRepository.update(d.id, {
          status: 'cancelled',
          ...(effect.clearPlannedFor ? { plannedFor: undefined, planningNotes: undefined } : {}),
        });
        void load();
      } catch {
        Alert.alert(
          t('something went wrong', 'etwas ist schiefgelaufen'),
          t('could not update this idea. please try again.', 'Idee konnte nicht aktualisiert werden.'),
        );
      }
    },
    [load, t],
  );

  const markDone = useCallback(
    async (d: SavedDate) => {
      try {
        await savedDateRepository.update(d.id, {
          status: 'completed',
          completedAt: new Date().toISOString(),
        });
        router.push({
          pathname: '/memory/create',
          params: {
            prefillNote: t(
              `we did it: ${d.title}. ${d.concept}`,
              `wir haben es gemacht: ${d.title}. ${d.concept}`,
            ),
          },
        });
        void load();
      } catch {
        Alert.alert(
          t('something went wrong', 'etwas ist schiefgelaufen'),
          t('could not update this idea. please try again.', 'Idee konnte nicht aktualisiert werden.'),
        );
      }
    },
    [load, t],
  );

  const dismiss = useCallback(
    async (d: SavedDate) => {
      Alert.alert(t('remove this idea?', 'Diese Idee entfernen?'), d.title, [
        { text: t('keep it', 'behalten'), style: 'cancel' },
        {
          text: t('remove', 'entfernen'),
          style: 'destructive',
          onPress: async () => {
            try {
              await savedDateRepository.update(d.id, { status: 'dismissed' });
              setDates((prev) => prev.filter((x) => x.id !== d.id));
            } catch {
              Alert.alert(
                t('something went wrong', 'etwas ist schiefgelaufen'),
                t('could not remove this idea.', 'Idee konnte nicht entfernt werden.'),
              );
            }
          },
        },
      ]);
    },
    [t],
  );

  const share = useCallback(
    async (d: SavedDate) => {
      try {
        await shareSavedDate(d);
      } catch {
        // The OS share sheet was dismissed or unavailable — nothing to recover.
      }
    },
    [],
  );

  const planningDate = dates.find((d) => d.id === planningId);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('Back', 'Zuruck')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.back}>{'<-'} {t('BACK', 'ZURUCK')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('saved ideas', 'gespeicherte Ideen')}</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : dates.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{t('nothing saved yet.', 'noch nichts gespeichert.')}</Text>
          <Text style={styles.emptyHint}>
            {t(
              'tap SAVE on any idea in Discover — your shortlist lives here.',
              'MERKEN antippen bei einer Idee in Entdecken — deine Shortlist erscheint hier.',
            )}
          </Text>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => router.back()}
            accessibilityRole="button"
          >
            <Text style={styles.ctaText}>{t('BACK TO DISCOVER', 'ZURUCK ZU ENTDECKEN')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.hint}>
            {t(
              "tap DONE when you've experienced it — we'll help you preserve the memory.",
              'ERLEDIGT antippen wenn ihr es erlebt habt — wir helfen euch, den Moment festzuhalten.',
            )}
          </Text>
          {dates.map((d) => (
            <View key={d.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.badge}>{STATUS_LABEL[d.status] ?? d.status}</Text>
                <Text style={styles.savedAt}>
                  {new Date(d.savedAt).toLocaleDateString(t('en-GB', 'de-DE'), {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>
              <Text style={styles.cardTitle}>{d.title}</Text>
              <Text style={styles.cardConcept}>{d.concept}</Text>
              <View style={styles.meta}>
                <Text style={styles.metaItem}>{d.estDurationMin} min</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaItem}>
                  {d.priceBand === 'free' ? t('free', 'kostenlos') : d.priceBand}
                </Text>
                {d.plannedFor && d.status === 'planned' && (
                  <>
                    <Text style={styles.metaDot}>·</Text>
                    <Text style={[styles.metaItem, styles.plannedFor]}>{d.plannedFor}</Text>
                  </>
                )}
              </View>
              {d.planningNotes && d.status === 'planned' && (
                <Text style={styles.notes}>{d.planningNotes}</Text>
              )}
              <View style={styles.actions}>
                {d.status !== 'completed' && (
                  <TouchableOpacity
                    style={styles.actionDone}
                    onPress={() => void markDone(d)}
                    accessibilityRole="button"
                    accessibilityLabel={t(`Mark ${d.title} as done`, `${d.title} als erledigt markieren`)}
                  >
                    <Text style={styles.actionDoneText}>{t('DONE -> PRESERVE', 'ERLEDIGT -> FESTHALTEN')}</Text>
                  </TouchableOpacity>
                )}
                {d.status !== 'completed' && (
                  <TouchableOpacity
                    style={styles.actionPlan}
                    onPress={() => openPlan(d)}
                    accessibilityRole="button"
                    accessibilityLabel={t(`Plan ${d.title}`, `${d.title} planen`)}
                  >
                    <Text style={styles.actionPlanText}>
                      {d.status === 'planned' ? t('RE-PLAN', 'UMPLANEN') : t('PLAN', 'PLANEN')}
                    </Text>
                  </TouchableOpacity>
                )}
                {d.status === 'planned' && (
                  <TouchableOpacity
                    style={styles.actionDismiss}
                    onPress={() => void cancelPlan(d)}
                    accessibilityRole="button"
                    accessibilityLabel={t(`Call off the plan for ${d.title}`, `Plan fur ${d.title} absagen`)}
                  >
                    <Text style={styles.actionDismissText}>{t('CALL OFF', 'ABSAGEN')}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionDismiss}
                  onPress={() => void share(d)}
                  accessibilityRole="button"
                  accessibilityLabel={t(`Share ${d.title}`, `${d.title} teilen`)}
                >
                  <Text style={styles.actionDismissText}>{t('SHARE', 'TEILEN')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionDismiss}
                  onPress={() => void dismiss(d)}
                  accessibilityRole="button"
                  accessibilityLabel={t(`Remove ${d.title}`, `${d.title} entfernen`)}
                >
                  <Text style={styles.actionDismissText}>{t('REMOVE', 'ENTFERNEN')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Plan It sheet */}
      <Modal
        visible={planningId !== null}
        transparent
        animationType="slide"
        onRequestClose={closePlan}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={closePlan}
            accessibilityLabel={t('Close', 'Schliessen')}
          />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{t('when will you do this?', 'wann macht ihr das?')}</Text>
            {planningDate && (
              <Text style={styles.sheetIdea}>{planningDate.title}</Text>
            )}
            <TextInput
              style={styles.sheetInput}
              placeholder={t('e.g. this Saturday, June 28...', 'z.B. diesen Samstag, 28. Juni...')}
              placeholderTextColor={Colors.textFaint}
              value={planText}
              onChangeText={setPlanText}
              autoFocus
              returnKeyType="next"
            />
            <TextInput
              style={styles.sheetNotes}
              placeholder={t('notes (optional) — who books, what to bring...', 'Notizen (optional) - wer bucht, was mitbringen...')}
              placeholderTextColor={Colors.textFaint}
              value={planNotes}
              onChangeText={setPlanNotes}
              multiline
              returnKeyType="done"
              onSubmitEditing={confirmPlan}
            />
            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={styles.sheetCancel}
                onPress={closePlan}
                accessibilityRole="button"
              >
                <Text style={styles.sheetCancelText}>{t('CANCEL', 'ABBRECHEN')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetConfirm, (!planText.trim() || planBusy) && styles.sheetConfirmDisabled]}
                onPress={confirmPlan}
                disabled={!planText.trim() || planBusy}
                accessibilityRole="button"
              >
                {planBusy ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.sheetConfirmText}>{t('SET DATE', 'DATUM SETZEN')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  back: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.textMuted },
  title: { fontSize: 26, fontWeight: '200', color: Colors.text, letterSpacing: -0.3 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screen,
  },
  emptyText: { fontSize: 18, fontWeight: '200', color: Colors.textMuted },
  emptyHint: {
    fontSize: 13,
    fontWeight: '300',
    color: Colors.textFaint,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  cta: {
    height: 44,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.text },
  scroll: { padding: Spacing.screen, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  hint: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.textFaint,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.backgroundCream,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    fontSize: 8,
    fontWeight: '500',
    letterSpacing: 1.5,
    color: Colors.accent,
    textTransform: 'uppercase',
  },
  savedAt: { fontSize: 10, fontWeight: '300', color: Colors.textFaint },
  cardTitle: { fontSize: 20, fontWeight: '200', color: Colors.text, letterSpacing: -0.3 },
  cardConcept: { fontSize: 13, fontWeight: '300', color: Colors.textMuted, lineHeight: 19 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  metaItem: { fontSize: 12, fontWeight: '400', color: Colors.textMuted },
  metaDot: { fontSize: 12, color: Colors.textFaint },
  plannedFor: { color: Colors.accent, fontWeight: '500' },
  notes: { fontSize: 12, fontWeight: '300', color: Colors.textMuted, fontStyle: 'italic', lineHeight: 17 },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
    marginTop: Spacing.xs,
    flexWrap: 'wrap',
  },
  actionDone: {
    height: 40,
    flex: 1,
    minWidth: 120,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionDoneText: { fontSize: 9, fontWeight: '500', letterSpacing: 2, color: Colors.white },
  actionPlan: {
    height: 40,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionPlanText: { fontSize: 9, fontWeight: '500', letterSpacing: 2, color: Colors.accent },
  actionDismiss: {
    height: 40,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionDismissText: { fontSize: 9, fontWeight: '500', letterSpacing: 2, color: Colors.textFaint },
  // Modal / sheet
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  sheetTitle: { fontSize: 18, fontWeight: '200', color: Colors.text, letterSpacing: -0.2 },
  sheetIdea: { fontSize: 13, fontWeight: '300', color: Colors.textMuted, marginTop: -Spacing.sm },
  sheetInput: {
    fontSize: 18,
    fontWeight: '300',
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sheetNotes: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  sheetCancel: {
    height: 44,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetCancelText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.textMuted },
  sheetConfirm: {
    height: 44,
    flex: 1,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetConfirmDisabled: { opacity: 0.35 },
  sheetConfirmText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.white },
});
