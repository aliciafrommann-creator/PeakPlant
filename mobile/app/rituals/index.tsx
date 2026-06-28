/**
 * Rituals — moments a couple loved, turned into something they return to.
 *
 * Private and space-scoped (same trust boundary as memories). Gated by the
 * `rituals` feature flag (lib/features.ts). Never shared, never public.
 */
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { BackButton } from '../../components/ui/BackButton';
import { Colors, Sections } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { useAppStore } from '../../lib/store';
import { ritualRepository } from '../../lib/repositories';
import type { Ritual, RitualCadence } from '../../lib/types';

const CADENCES: RitualCadence[] = ['weekly', 'monthly', 'seasonally', 'whenever'];

const RITUALS = Sections.rituals; // sage — quiet, returning, grounded

export default function RitualsScreen() {
  const { activeSpace } = useSpaces();
  const { t } = useLanguage();
  const ritualsEnabled = useAppStore((s) => s.features.rituals);

  const CADENCE_LABEL: Record<RitualCadence, string> = {
    weekly: t('weekly', 'wöchentlich'),
    monthly: t('monthly', 'monatlich'),
    seasonally: t('with the seasons', 'mit den Jahreszeiten'),
    whenever: t('whenever it feels right', 'wann immer es sich richtig anfühlt'),
  };

  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [cadence, setCadence] = useState<RitualCadence>('whenever');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!activeSpace) return;
    let alive = true;
    setLoading(true);
    ritualRepository
      .getAll(activeSpace.id)
      .then((r) => { if (alive) { setRituals(r); setLoading(false); } })
      .catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [activeSpace]);

  useFocusEffect(load);

  const openCreate = useCallback(() => {
    setTitle('');
    setNote('');
    setCadence('whenever');
    setCreating(true);
  }, []);

  const closeCreate = useCallback(() => {
    setCreating(false);
    setTitle('');
    setNote('');
  }, []);

  const confirmCreate = useCallback(async () => {
    if (!activeSpace || !title.trim() || busy) return;
    setBusy(true);
    try {
      await ritualRepository.create({
        spaceId: activeSpace.id,
        title: title.trim(),
        note: note.trim() || undefined,
        cadence,
      });
      closeCreate();
      load();
    } catch {
      Alert.alert(
        t('something went wrong', 'etwas ist schiefgelaufen'),
        t('could not save this ritual. please try again.', 'Ritual konnte nicht gespeichert werden.'),
      );
    } finally {
      setBusy(false);
    }
  }, [activeSpace, title, note, cadence, busy, closeCreate, load, t]);

  const revisit = useCallback(
    async (r: Ritual) => {
      try {
        await ritualRepository.update(r.id, { lastRevisitedAt: new Date().toISOString() });
        load();
      } catch {
        // best-effort
      }
    },
    [load],
  );

  const remove = useCallback(
    (r: Ritual) => {
      Alert.alert(t('let this ritual go?', 'Dieses Ritual loslassen?'), r.title, [
        { text: t('keep it', 'behalten'), style: 'cancel' },
        {
          text: t('let go', 'loslassen'),
          style: 'destructive',
          onPress: async () => {
            try {
              await ritualRepository.remove(r.id);
              setRituals((prev) => prev.filter((x) => x.id !== r.id));
            } catch {
              // best-effort
            }
          },
        },
      ]);
    },
    [t],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton label={t('BACK', 'ZURÜCK')} />
        <Text style={styles.title}>{t('rituals', 'Rituale')}</Text>
        <Text style={styles.subtitle}>
          {t(
            'the moments you loved enough to come back to.',
            'die Momente, die ihr genug geliebt habt, um zurückzukehren.',
          )}
        </Text>
      </View>

      {!ritualsEnabled ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{t('rituals are turned off.', 'Rituale sind ausgeschaltet.')}</Text>
          <Text style={styles.emptyHint}>
            {t(
              'turn them on in Settings to start keeping the moments you return to.',
              'schalte sie in den Einstellungen ein, um eure wiederkehrenden Momente zu sammeln.',
            )}
          </Text>
          <TouchableOpacity style={styles.cta} onPress={() => router.push('/customize')} accessibilityRole="button">
            <Text style={styles.ctaText}>{t('OPEN SETTINGS', 'EINSTELLUNGEN ÖFFNEN')}</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : rituals.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{t('no rituals yet.', 'noch keine Rituale.')}</Text>
          <Text style={styles.emptyHint}>
            {t(
              'when a moment is worth repeating, make it a ritual — a Sunday walk, a yearly trip, a small thing that is yours.',
              'wenn ein Moment es wert ist, wiederholt zu werden, macht ein Ritual daraus - ein Sonntagsspaziergang, eine jahrliche Reise, eine kleine Sache, die euch gehort.',
            )}
          </Text>
          <TouchableOpacity style={styles.cta} onPress={openCreate} accessibilityRole="button">
            <Text style={styles.ctaText}>{t('CREATE A RITUAL', 'RITUAL ERSTELLEN')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {rituals.map((r) => (
            <View key={r.id} style={styles.card}>
              <Text style={styles.cardCadence}>{CADENCE_LABEL[r.cadence].toUpperCase()}</Text>
              <Text style={styles.cardTitle}>{r.title}</Text>
              {r.note ? <Text style={styles.cardNote}>{r.note}</Text> : null}
              {r.lastRevisitedAt ? (
                <Text style={styles.cardRevisited}>
                  {t('last returned to', 'zuletzt zurückgekehrt')}{' '}
                  {new Date(r.lastRevisitedAt).toLocaleDateString(t('en-GB', 'de-DE'), {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              ) : null}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionPrimary}
                  onPress={() => void revisit(r)}
                  accessibilityRole="button"
                  accessibilityLabel={t(`We came back to ${r.title}`, `Wir sind zu ${r.title} zurückgekehrt`)}
                >
                  <Text style={styles.actionPrimaryText}>{t('WE CAME BACK', 'WIR WAREN WIEDER DA')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionGhost}
                  onPress={() => remove(r)}
                  accessibilityRole="button"
                  accessibilityLabel={t(`Let go of ${r.title}`, `${r.title} loslassen`)}
                >
                  <Text style={styles.actionGhostText}>{t('LET GO', 'LOSLASSEN')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.addRow} onPress={openCreate} accessibilityRole="button">
            <Text style={styles.addText}>{t('+ NEW RITUAL', '+ NEUES RITUAL')}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Modal visible={creating} transparent animationType="slide" onRequestClose={closeCreate}>
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeCreate} accessibilityLabel={t('Close', 'Schliessen')} />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{t('a ritual you return to', 'ein Ritual, zu dem ihr zurückkehrt')}</Text>
            <TextInput
              style={styles.sheetInput}
              placeholder={t('e.g. Sunday morning walk', 'z.B. Sonntagmorgen-Spaziergang')}
              placeholderTextColor={Colors.textFaint}
              value={title}
              onChangeText={setTitle}
              autoFocus
              returnKeyType="next"
            />
            <TextInput
              style={styles.sheetNote}
              placeholder={t('why it matters to you (optional)', 'warum es euch wichtig ist (optional)')}
              placeholderTextColor={Colors.textFaint}
              value={note}
              onChangeText={setNote}
              multiline
            />
            <Text style={styles.cadenceLabel}>{t('HOW OFTEN', 'WIE OFT')}</Text>
            <View style={styles.cadenceRow}>
              {CADENCES.map((c) => {
                const on = cadence === c;
                return (
                  <TouchableOpacity
                    key={c}
                    style={[styles.cadenceChip, on && styles.cadenceChipOn]}
                    onPress={() => setCadence(c)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                  >
                    <Text style={[styles.cadenceChipText, on && styles.cadenceChipTextOn]}>
                      {CADENCE_LABEL[c]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.sheetCancel} onPress={closeCreate} accessibilityRole="button">
                <Text style={styles.sheetCancelText}>{t('CANCEL', 'ABBRECHEN')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetConfirm, (!title.trim() || busy) && styles.sheetConfirmDisabled]}
                onPress={confirmCreate}
                disabled={!title.trim() || busy}
                accessibilityRole="button"
              >
                {busy ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.sheetConfirmText}>{t('KEEP IT', 'BEHALTEN')}</Text>
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
  title: { ...Typography.editorial, fontSize: 30, lineHeight: 36 },
  subtitle: { fontSize: 13, fontWeight: '300', color: Colors.textMuted, lineHeight: 19 },
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
    borderRadius: Radii.pill,
  },
  ctaText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.text },
  scroll: { padding: Spacing.screen, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  card: {
    backgroundColor: Colors.backgroundCream,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderRadius: Radii.md,
    borderLeftWidth: 3,
    borderLeftColor: RITUALS,
    ...Shadows.subtle,
  },
  cardCadence: { fontSize: 8, fontWeight: '500', letterSpacing: 1.5, color: RITUALS },
  cardTitle: { ...Typography.editorial, fontSize: 21, lineHeight: 27 },
  cardNote: { fontSize: 13, fontWeight: '300', color: Colors.textMuted, lineHeight: 19, fontStyle: 'italic' },
  cardRevisited: { fontSize: 11, fontWeight: '300', color: Colors.textFaint },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
    marginTop: Spacing.xs,
  },
  actionPrimary: {
    height: 40,
    flex: 1,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  actionPrimaryText: { fontSize: 9, fontWeight: '500', letterSpacing: 2, color: Colors.white },
  actionGhost: { height: 40, paddingHorizontal: Spacing.md, justifyContent: 'center', alignItems: 'center' },
  actionGhostText: { fontSize: 9, fontWeight: '500', letterSpacing: 2, color: Colors.textFaint },
  addRow: { paddingVertical: Spacing.md, alignItems: 'center' },
  addText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.text },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
  },
  sheetTitle: { fontSize: 18, fontWeight: '200', color: Colors.text, letterSpacing: -0.2 },
  sheetInput: {
    fontSize: 18,
    fontWeight: '300',
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
  },
  sheetNote: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  cadenceLabel: { fontSize: 9, fontWeight: '500', letterSpacing: 3, color: Colors.textFaint, marginTop: Spacing.sm },
  cadenceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  cadenceChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.pill,
  },
  cadenceChipOn: { borderColor: Colors.text, backgroundColor: Colors.text },
  cadenceChipText: { fontSize: 12, fontWeight: '300', color: Colors.textMuted },
  cadenceChipTextOn: { color: Colors.white },
  sheetActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  sheetCancel: {
    height: 44,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  sheetCancelText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.textMuted },
  sheetConfirm: { height: 44, flex: 1, backgroundColor: Colors.text, justifyContent: 'center', alignItems: 'center', borderRadius: Radii.pill },
  sheetConfirmDisabled: { opacity: 0.35 },
  sheetConfirmText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.white },
});
