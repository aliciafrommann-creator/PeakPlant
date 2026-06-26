import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { BackButton } from '../../components/ui/BackButton';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useAppStore } from '../../lib/store';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { savedDateRepository } from '../../lib/repositories';
import { summarizeLearning } from '../../lib/discovery/learning';
import { momentById, type MomentCategory } from '../../lib/together';
import type { SavedDate } from '../../lib/types';

interface SignalRow {
  label: string;
  value: string;
  source: 'onboarding' | 'shortcut';
  note: string;
}

/** Human, bilingual labels for the learned categories. */
const CATEGORY_LABEL: Record<MomentCategory, [en: string, de: string]> = {
  food: ['food & drink', 'Essen & Trinken'],
  outdoors: ['the outdoors', 'die Natur'],
  create: ['making things', 'gemeinsam gestalten'],
  calm: ['calm & quiet', 'ruhig & still'],
  play: ['playful things', 'verspielte Dinge'],
};

export default function PreferencesScreen() {
  const goals = useAppStore((s) => s.goals);
  const setGoals = useAppStore((s) => s.setGoals);
  const personalization = useAppStore((s) => s.personalization);
  const setPersonalization = useAppStore((s) => s.setPersonalization);
  const personalizationResetAt = useAppStore((s) => s.personalizationResetAt);
  const resetLearning = useAppStore((s) => s.resetLearning);
  const { activeSpace } = useSpaces();
  const { t } = useLanguage();

  const [saved, setSaved] = useState<SavedDate[]>([]);
  useFocusEffect(
    useCallback(() => {
      if (!activeSpace) return;
      let alive = true;
      savedDateRepository
        .getAll(activeSpace.id)
        .then((d) => { if (alive) setSaved(d); })
        .catch(() => { /* best-effort: show no learning rather than crash */ });
      return () => { alive = false; };
    }, [activeSpace]),
  );

  const learning = summarizeLearning(saved, {
    categoryOf: (id) => momentById(id)?.category,
    enabled: personalization,
    since: personalizationResetAt ?? undefined,
  });

  const resetLearned = useCallback(() => {
    Alert.alert(
      t('forget what you have learned?', 'Gelerntes vergessen?'),
      t(
        'your saved ideas stay. only the gentle bias learned from them is forgotten, and Discover starts fresh.',
        'Deine gemerkten Ideen bleiben. Nur die daraus gelernte sanfte Tendenz wird vergessen, und Entdecken beginnt neu.',
      ),
      [
        { text: t('keep it', 'behalten'), style: 'cancel' },
        { text: t('forget', 'vergessen'), style: 'destructive', onPress: () => resetLearning() },
      ],
    );
  }, [resetLearning, t]);

  const signals: SignalRow[] = [
    ...goals.map((g) => ({
      label: g,
      value: 'active goal',
      source: 'onboarding' as const,
      note: t(
        'set during onboarding; used to boost matching date ideas',
        'beim Onboarding gesetzt; hebt passende Ideen in Entdecken hervor',
      ),
    })),
  ];

  const clearGoals = useCallback(() => {
    Alert.alert(
      t('clear onboarding goals?', 'Onboarding-Ziele loschen?'),
      t(
        'your discovery picks will no longer be personalised by these. you can re-set them from onboarding at any time.',
        'Deine Entdecken-Vorschlage werden nicht mehr danach personalisiert. Du kannst sie jederzeit neu setzen.',
      ),
      [
        { text: t('keep them', 'behalten'), style: 'cancel' },
        {
          text: t('clear', 'loschen'),
          style: 'destructive',
          onPress: () => void setGoals([]),
        },
      ],
    );
  }, [setGoals, t]);

  const neverItems = [
    t(
      'your precise device location (you can share a city per-request, never background)',
      'dein genauer Standort (du kannst einen Ort pro Anfrage teilen, nie im Hintergrund)',
    ),
    t(
      'inferred relationship or intimacy attributes',
      'abgeleitete Beziehungs- oder Intimitatsmerkmale',
    ),
    t('the content of your diary notes', 'der Inhalt deiner Tagebuch-Notizen'),
    t("anything you haven't explicitly told us", 'alles, was du uns nicht explizit mitgeteilt hast'),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton label={t('BACK', 'ZURUCK')} />
        <Text style={styles.title}>{t('personalization', 'Personalisierung')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.lead}>
          {t(
            "here is everything that shapes your Discover picks. nothing is inferred behind the scenes — only what you've explicitly told us is used.",
            'Hier ist alles, was deine Entdecken-Vorschlage beeinflusst. Nichts wird im Hintergrund abgeleitet - nur was du uns explizit mitgeteilt hast, wird verwendet.',
          )}
        </Text>

        <Text style={styles.sectionLabel}>{t('WHAT WE USE', 'WAS WIR VERWENDEN')}</Text>

        {signals.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('no signals set yet.', 'noch keine Signale gesetzt.')}</Text>
            <Text style={styles.emptyHint}>
              {t(
                'your picks today are ordered by the ideas in our curated catalog, not personalised. set goals during onboarding or use the filter chips on Discover to tune results.',
                'Deine heutigen Vorschlage basieren auf unserem kuratierten Katalog, nicht auf personlichen Praferenzen. Setze Ziele beim Onboarding oder nutze die Filter-Chips in Entdecken.',
              )}
            </Text>
          </View>
        ) : (
          signals.map((s, i) => (
            <View key={i} style={styles.signalRow}>
              <View style={styles.signalLeft}>
                <Text style={styles.signalLabel}>{s.label}</Text>
                <Text style={styles.signalNote}>{s.note}</Text>
              </View>
              <View style={styles.signalRight}>
                <Text style={styles.sourceChip}>{s.source}</Text>
              </View>
            </View>
          ))
        )}

        <Text style={styles.sectionLabel}>{t('WHAT WE NEVER USE', 'WAS WIR NIE VERWENDEN')}</Text>
        {neverItems.map((item, i) => (
          <View key={i} style={styles.neverRow}>
            <Text style={styles.neverBullet}>-</Text>
            <Text style={styles.neverText}>{item}</Text>
          </View>
        ))}

        <Text style={styles.sectionLabel}>{t('SHORTCUT FILTERS', 'SCHNELLFILTER')}</Text>
        <Text style={styles.sectionNote}>
          {t(
            'the chips on the Discover screen (calm, outdoors, free...) are applied only for that session and are never stored. they reset when you leave.',
            'Die Chips auf dem Entdecken-Bildschirm (ruhig, draussen, kostenlos ...) gelten nur fur diese Sitzung und werden nie gespeichert. Sie werden zuruckgesetzt, wenn du die Seite verlasst.',
          )}
        </Text>

        {goals.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={clearGoals}
            accessibilityRole="button"
            accessibilityLabel={t('Clear onboarding goals', 'Onboarding-Ziele loschen')}
          >
            <Text style={styles.clearText}>{t('CLEAR ONBOARDING GOALS', 'ONBOARDING-ZIELE LOSCHEN')}</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionLabel}>{t('WHAT PEAKPLANT HAS LEARNED', 'WAS PEAKPLANT GELERNT HAT')}</Text>
        <View style={styles.learnToggleRow}>
          <View style={styles.learnToggleLeft}>
            <Text style={styles.signalLabel}>{t('learn from what you save', 'aus Gemerktem lernen')}</Text>
            <Text style={styles.signalNote}>
              {t(
                'gently lifts ideas like the ones you save, plan and complete. only your own explicit actions — never inferred.',
                'hebt sanft Ideen hervor, die du merkst, planst und abschliesst. nur deine eigenen Aktionen - nie abgeleitet.',
              )}
            </Text>
          </View>
          <Switch
            value={personalization}
            onValueChange={setPersonalization}
            trackColor={{ false: Colors.border, true: Colors.text }}
            thumbColor={Colors.white}
            accessibilityLabel={t('Toggle learning from what you save', 'Lernen aus Gemerktem umschalten')}
          />
        </View>

        {personalization && (
          learning.total === 0 ? (
            <Text style={styles.sectionNote}>
              {t(
                "nothing learned yet. save, plan or complete a few ideas and a gentle picture forms here — always visible, always yours to reset.",
                'noch nichts gelernt. merke, plane oder schliesse ein paar Ideen ab, und hier entsteht ein sanftes Bild - immer sichtbar, immer von dir rucksetzbar.',
              )}
            </Text>
          ) : (
            <>
              {learning.liked.length > 0 && (
                <View style={styles.learnedBlock}>
                  <Text style={styles.learnedHeading}>{t('you seem drawn to', 'du scheinst dich hingezogen zu fuhlen zu')}</Text>
                  {learning.liked.map((a) => (
                    <View key={a.category} style={styles.learnedRow}>
                      <Text style={styles.learnedCat}>{t(...CATEGORY_LABEL[a.category])}</Text>
                      <Text style={styles.learnedFrom}>
                        {t(`from ${a.signals} idea${a.signals === 1 ? '' : 's'}`, `aus ${a.signals} Idee${a.signals === 1 ? '' : 'n'}`)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              {learning.disliked.length > 0 && (
                <View style={styles.learnedBlock}>
                  <Text style={styles.learnedHeading}>{t('you tend to pass on', 'du lasst eher aus')}</Text>
                  {learning.disliked.map((a) => (
                    <View key={a.category} style={styles.learnedRow}>
                      <Text style={styles.learnedCat}>{t(...CATEGORY_LABEL[a.category])}</Text>
                      <Text style={styles.learnedFrom}>
                        {t(`from ${a.signals} idea${a.signals === 1 ? '' : 's'}`, `aus ${a.signals} Idee${a.signals === 1 ? '' : 'n'}`)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={resetLearned}
                accessibilityRole="button"
                accessibilityLabel={t('Forget what has been learned', 'Gelerntes vergessen')}
              >
                <Text style={styles.clearText}>{t('FORGET WHAT WAS LEARNED', 'GELERNTES VERGESSEN')}</Text>
              </TouchableOpacity>
            </>
          )
        )}

        <Text style={styles.footer}>
          {t(
            'personalization signals live only on this device in local mode, or in your private space in backend mode — they are never used for ads, sold, or shared outside your space. (PP-014 / PP-016)',
            'Personalisierungssignale leben nur auf diesem Gerat (lokaler Modus) oder in deinem privaten Space (Backend-Modus) - sie werden nie fur Werbung verwendet, verkauft oder ausserhalb deines Space geteilt. (PP-014 / PP-016)',
          )}
        </Text>
      </ScrollView>
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
  title: { ...Typography.editorial, fontSize: 26, lineHeight: 32 },
  scroll: { padding: Spacing.screen, gap: Spacing.lg, paddingBottom: Spacing.xxxl },
  lead: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 22,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2.5,
    color: Colors.textSubtle,
    marginTop: Spacing.sm,
  },
  sectionNote: {
    fontSize: 13,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 19,
    marginTop: -Spacing.sm,
  },
  empty: { gap: Spacing.xs },
  emptyText: { fontSize: 15, fontWeight: '300', color: Colors.textMuted },
  emptyHint: { fontSize: 13, fontWeight: '300', color: Colors.textFaint, lineHeight: 19 },
  signalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  signalLeft: { flex: 1, gap: 2 },
  signalLabel: { fontSize: 14, fontWeight: '400', color: Colors.text },
  signalNote: { fontSize: 11, fontWeight: '300', color: Colors.textFaint, lineHeight: 16 },
  signalRight: { alignItems: 'flex-end' },
  sourceChip: {
    fontSize: 8,
    fontWeight: '500',
    letterSpacing: 1.5,
    color: Colors.textFaint,
    textTransform: 'uppercase',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.pill,
  },
  neverRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  neverBullet: { fontSize: 13, fontWeight: '300', color: Colors.textFaint, marginTop: 1 },
  neverText: { flex: 1, fontSize: 13, fontWeight: '300', color: Colors.textMuted, lineHeight: 19 },
  clearBtn: {
    height: 44,
    borderWidth: 1,
    borderColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    borderRadius: Radii.pill,
  },
  clearText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.danger },
  learnToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  learnToggleLeft: { flex: 1, gap: 2 },
  learnedBlock: { gap: Spacing.xs, marginTop: Spacing.sm },
  learnedHeading: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  learnedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  learnedCat: { fontSize: 15, fontWeight: '300', color: Colors.text },
  learnedFrom: { fontSize: 10, fontWeight: '300', color: Colors.textFaint, letterSpacing: 0.3 },
  footer: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textFaint,
    lineHeight: 17,
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.lg,
  },
});
