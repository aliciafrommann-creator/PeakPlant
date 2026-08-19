import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { BackButton } from '../../components/ui/BackButton';
import { PressableScale } from '../../components/ui/PressableScale';
import { Colors, SectionInks } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useAppStore } from '../../lib/store';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { momentById, libraryIdeaAsMoment, placeById } from '../../lib/together';
import { ideaById } from '../../lib/discovery/ideaCatalog';
import { experienceTags } from '../../lib/discovery/experience';
import { feedbackRepository, savedDateRepository } from '../../lib/repositories';
import { aggregateRatings, ratingsForMoment } from '../../lib/discovery/ratings';
import type { RatingSummary } from '../../lib/discovery/ratings';
import { confirmSuccess } from '../../lib/haptics';
import type { SavedDate } from '../../lib/types';
import { voice } from '../../lib/voice';

// Die Schrift-Fassung derselben Farbe. Als 11-pt-Etikett stand `TOGETHER`
// (apricot) auf Papier bei 2,35:1 — schlechter als jeder Fund des ersten
// Durchgangs, und vom Wächter nicht zu sehen, weil er nur Palettenpfade kennt
// und hier eine lokale Konstante steht.
const TOGETHER_INK = SectionInks.together;

export default function TogetherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const placesEnabled = useAppStore((s) => s.features.localShops);
  const { t } = useLanguage();
  const { activeSpace } = useSpaces();
  const v = voice(activeSpace?.type);
  // Curated pool first; any library idea (idea-*) resolves too, so links and
  // taps from the browse library never dead-end (A3-18/24).
  const moment = useMemo(() => {
    const curated = momentById(id);
    if (curated) return curated;
    const idea = ideaById(id);
    return idea ? libraryIdeaAsMoment(idea) : undefined;
  }, [id]);
  const place = placesEnabled ? placeById(moment?.placeId) : undefined;

  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [savedDate, setSavedDate] = useState<SavedDate | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!activeSpace || !id) return;
      let alive = true;
      Promise.all([
        feedbackRepository.getAll(activeSpace.id),
        savedDateRepository.getAll(activeSpace.id),
      ])
        .then(([allFeedback, allDates]) => {
          if (!alive) return;
          setSummary(aggregateRatings(ratingsForMoment(allFeedback, id)));
          const matching = allDates
            .filter((date) => date.momentId === id && date.status !== 'dismissed')
            .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
          setSavedDate(matching[0] ?? null);
        })
        .catch(() => {
          if (!alive) return;
          setSummary(null);
          setSavedDate(null);
        });
      return () => { alive = false; };
    }, [activeSpace, id]),
  );

  const ensureSaved = useCallback(async (): Promise<SavedDate | null> => {
    if (!activeSpace || !moment) return null;
    if (savedDate) return savedDate;
    const created = await savedDateRepository.save({
      spaceId: activeSpace.id,
      momentId: moment.id,
      title: moment.title,
      concept: moment.idea,
      priceBand: moment.priceBand,
      estDurationMin: moment.avgDurationMin,
      status: 'saved',
    });
    setSavedDate(created);
    return created;
  }, [activeSpace, moment, savedDate]);

  const openSavedDates = useCallback((planId?: string) => {
    if (planId) {
      router.push({ pathname: '/discover/saved', params: { plan: planId } });
    } else {
      router.push('/discover/saved');
    }
  }, []);

  const preserveDate = useCallback((date: SavedDate) => {
    if (!moment) return;
    router.push({
      pathname: '/memory/create',
      params: {
        savedDateId: date.id,
        savedDateTitle: date.title,
        savedDateMomentId: date.momentId,
        prefillNote: t(
          `we did it: ${moment.title}`,
          `wir haben es gemacht: ${moment.title}`,
        ),
      },
    });
  }, [moment, t]);

  const handlePrimary = useCallback(async () => {
    if (!moment || busy) return;
    setBusy(true);
    setActionError(null);
    try {
      const date = await ensureSaved();
      if (!date) return;
      if (date.status === 'completed') {
        if (date.memoryId) router.push(`/memory/${date.memoryId}`);
        else preserveDate(date);
      } else if (date.status === 'planned') {
        openSavedDates();
      } else {
        await confirmSuccess();
        openSavedDates(date.id);
      }
    } catch {
      setActionError(t(
        'Could not save this idea. Please try again.',
        'Die Idee konnte nicht gespeichert werden. Bitte versuche es erneut.',
      ));
    } finally {
      setBusy(false);
    }
  }, [busy, ensureSaved, moment, openSavedDates, preserveDate, t]);

  const handleDone = useCallback(async () => {
    if (!moment || busy) return;
    setBusy(true);
    setActionError(null);
    try {
      const date = await ensureSaved();
      if (!date) return;
      const completed = date.status === 'completed'
        ? date
        : await savedDateRepository.update(date.id, {
          status: 'completed',
          completedAt: new Date().toISOString(),
        });
      setSavedDate(completed);
      await confirmSuccess();
      if (completed.memoryId) router.push(`/memory/${completed.memoryId}`);
      else preserveDate(completed);
    } catch {
      setActionError(t(
        'Could not update this idea. Please try again.',
        'Die Idee konnte nicht aktualisiert werden. Bitte versuche es erneut.',
      ));
    } finally {
      setBusy(false);
    }
  }, [busy, ensureSaved, moment, preserveDate, t]);

  const handleSave = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setActionError(null);
    try {
      const date = await ensureSaved();
      if (date) await confirmSuccess();
    } catch {
      setActionError(t(
        'Could not save this idea. Please try again.',
        'Die Idee konnte nicht gespeichert werden. Bitte versuche es erneut.',
      ));
    } finally {
      setBusy(false);
    }
  }, [busy, ensureSaved, t]);

  if (!moment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>{t('idea not found.', 'Idee nicht gefunden.')}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('Go back', 'Zurück')}
          >
            <Text style={styles.backLink}>{t('go back', 'zurück')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton label={t('BACK', 'ZURÜCK')} />
        <Text style={styles.headerLabel}>{t(v.toDoTogetherLabel.en, v.toDoTogetherLabel.de)}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.category}>{moment.category.toUpperCase()}</Text>
        <Text style={styles.title}>{moment.title}</Text>
        <Text style={styles.idea}>{moment.idea}</Text>

        {(() => {
          const tags = experienceTags(moment);
          if (tags.length === 0) return null;
          return (
            <View style={styles.experience}>
              <Text style={styles.experienceLabel}>{t('WHAT THIS IS LIKE', 'WIE SICH DAS ANFÜHLT')}</Text>
              <View style={styles.tagRow}>
                {tags.map((tg) => (
                  <View key={tg.key} style={styles.tag}>
                    <Text style={styles.tagText}>{t(...tg.label)}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.experienceNote}>
                {t('estimated from this idea, not live data', 'geschätzt aus dieser Idee, keine Live-Daten')}
              </Text>
            </View>
          );
        })()}

        {summary && summary.count > 0 && (
          <View style={styles.ratingBlock}>
            <Text style={styles.ratingLabel}>{t('YOUR SPACE TRIED THIS', 'IHR HABT DAS PROBIERT')}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingStars}>
                {'★'.repeat(Math.round(summary.average))}{'☆'.repeat(5 - Math.round(summary.average))}
              </Text>
              <Text style={styles.ratingMeta}>
                {summary.average} · {summary.count === 1
                  ? t('once', 'einmal')
                  : t(`${summary.count} times`, `${summary.count}-mal`)}
              </Text>
            </View>
            {summary.latestTip ? (
              <Text style={styles.ratingTip}>{'"'}{summary.latestTip}{'"'}</Text>
            ) : null}
            <Text style={styles.ratingNote}>
              {t(v.ownFeedbackNote.en, v.ownFeedbackNote.de)}
            </Text>
          </View>
        )}

        {place && (
          <View style={styles.placeCard}>
            <Text style={styles.placeLabel}>{t('A PLACE FOR IT', 'EIN ORT DAFÜR')}</Text>
            <View style={styles.placeHead}>
              <Text style={styles.placeName}>{place.name.toLowerCase()}</Text>
              {place.isPartner && <Text style={styles.partner}>{t('PARTNER', 'PARTNER')}</Text>}
            </View>
            <Text style={styles.placeArea}>{place.area}</Text>
            {place.perk && <Text style={styles.perk}>{place.perk}</Text>}
            <TouchableOpacity
              style={styles.mapLink}
              onPress={() => router.push({
                pathname: '/(tabs)/community',
                params: { place: place.id },
              })}
              accessibilityRole="button"
              accessibilityLabel={t(`Show ${place.name} on the map`, `${place.name} auf der Karte zeigen`)}
            >
              <Text style={styles.mapLinkText}>{t('VIEW ON MAP →', 'AUF KARTE ZEIGEN →')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.invite}>
          {t(v.saveMakePlanKeep.en, v.saveMakePlanKeep.de)}
        </Text>

        <PressableScale
          style={styles.cta}
          onPress={() => void handlePrimary()}
          disabled={busy}
          accessibilityLabel={t('Continue with this idea', 'Mit dieser Idee weitermachen')}
        >
          {busy ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.ctaText}>
              {savedDate?.status === 'completed'
                ? savedDate.memoryId
                  ? t(v.viewYourMemory.en, v.viewYourMemory.de)
                  : t('PRESERVE THIS MOMENT', 'DIESEN MOMENT BEWAHREN')
                : savedDate?.status === 'planned'
                  ? t(v.openYourPlan.en, v.openYourPlan.de)
                  : t('PLAN THIS DATE', 'DIESES DATE PLANEN')}
            </Text>
          )}
        </PressableScale>

        {/* EINE laute Handlung, zwei ruhige daneben (MANIFESTO §5).
            Vorher standen hier drei Knöpfe übereinander: eine gefüllte Pille,
            eine umrandete Pille und ein Textlink — auf dem Bildschirm, über
            den jede Idee zu einem festgehaltenen Moment werden muss. Drei
            gleich aussehende Angebote sind keine Wahl, sondern eine Frage.

            „Wir haben das schon gemacht" steht bewusst zuerst: es ist der
            Weg, der die Schleife schließt (speichern → abschließen →
            festhalten), und er soll leicht zu finden sein, auch wenn er nicht
            der laute ist. */}
        <View style={styles.quietRow}>
          {savedDate?.status !== 'completed' && (
            <TouchableOpacity
              style={styles.quietAction}
              onPress={() => void handleDone()}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel={t('We already did this', 'Wir haben das schon gemacht')}
            >
              <Text style={styles.quietActionText}>
                {t('we already did this', 'haben wir schon gemacht')}
              </Text>
            </TouchableOpacity>
          )}

          {!savedDate ? (
            <TouchableOpacity
              style={styles.quietAction}
              onPress={() => void handleSave()}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel={t('Save for later', 'Für später merken')}
            >
              <Text style={styles.quietActionText}>{t('save for later', 'für später merken')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.quietAction}
              onPress={() => openSavedDates()}
              accessibilityRole="button"
              accessibilityLabel={t('Open saved ideas', 'Gespeicherte Ideen öffnen')}
            >
              <Text style={styles.quietActionSaved}>{t(v.savedToYourList.en, v.savedToYourList.de)}</Text>
            </TouchableOpacity>
          )}
        </View>

        {actionError ? (
          <Text style={styles.actionError} accessibilityLiveRegion="polite">{actionError}</Text>
        ) : null}

        <Text style={styles.noPressure}>{t('no pressure. only if it feels right.', 'kein Muss. nur wenn es sich richtig anfühlt.')}</Text>
      </ScrollView>
    </SafeAreaView>
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
  backText: { fontSize: 12, fontWeight: '400', letterSpacing: 1.5, color: Colors.textMuted, width: 60 },
  headerLabel: { fontSize: 12, fontWeight: '500', letterSpacing: 1.2, color: Colors.text },
  content: { padding: Spacing.screen, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  category: { fontSize: 11, fontWeight: '500', letterSpacing: 1.2, color: TOGETHER_INK },
  title: { ...Typography.editorial },
  idea: { fontSize: 16, fontWeight: '300', color: Colors.textMuted, lineHeight: 26 },
  experience: { gap: Spacing.sm, marginTop: Spacing.md },
  experienceLabel: { fontSize: 11, fontWeight: '500', letterSpacing: 1.2, color: Colors.textSubtle },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tag: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  tagText: { fontSize: 12, fontWeight: '400', color: Colors.textMuted, letterSpacing: 0.2 },
  experienceNote: { fontSize: 12, fontWeight: '300', color: Colors.textSubtle, fontStyle: 'italic' },
  ratingBlock: {
    backgroundColor: Colors.backgroundCream,
    padding: Spacing.lg,
    gap: Spacing.xs,
    marginTop: Spacing.md,
    borderRadius: Radii.md,
    ...Shadows.subtle,
  },
  ratingLabel: { fontSize: 11, fontWeight: '500', letterSpacing: 1.2, color: Colors.textSubtle },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  ratingStars: { fontSize: 16, color: Colors.accentInk, letterSpacing: 2 },
  ratingMeta: { fontSize: 13, fontWeight: '400', color: Colors.textMuted },
  ratingTip: { fontSize: 13, fontWeight: '300', color: Colors.textMuted, fontStyle: 'italic', lineHeight: 19 },
  ratingNote: { fontSize: 12, fontWeight: '300', color: Colors.textSubtle, fontStyle: 'italic' },
  placeCard: {
    backgroundColor: Colors.backgroundCream,
    padding: Spacing.lg,
    gap: 4,
    marginTop: Spacing.md,
    borderRadius: Radii.md,
    ...Shadows.subtle,
  },
  placeLabel: { fontSize: 11, fontWeight: '500', letterSpacing: 1.2, color: Colors.textSubtle },
  placeHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  placeName: { fontSize: 18, fontWeight: '200', color: Colors.text },
  partner: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: Colors.textSubtle,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  placeArea: { fontSize: 11, fontWeight: '300', color: Colors.textSubtle, letterSpacing: 0.5 },
  perk: { fontSize: 13, fontWeight: '300', color: Colors.textSubtle, marginTop: 2 },
  mapLink: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', marginTop: Spacing.xs },
  mapLinkText: { fontSize: 11, fontWeight: '500', letterSpacing: 1.2, color: Colors.text },
  invite: {
    fontSize: 16,
    fontWeight: '200',
    color: Colors.text,
    fontStyle: 'italic',
    marginTop: Spacing.md,
    lineHeight: 24,
  },
  cta: {
    height: 56,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
    borderRadius: Radii.pill,
  },
  ctaText: { fontSize: 11, fontWeight: '500', letterSpacing: 1.2, color: Colors.white },
  quietRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: Spacing.lg,
  },
  quietAction: { minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  quietActionText: { fontSize: 14, fontWeight: '400', color: Colors.textMuted },
  quietActionSaved: { fontSize: 14, fontWeight: '500', color: Colors.text },
  actionError: { fontSize: 12, fontWeight: '400', color: Colors.danger, lineHeight: 18, textAlign: 'center' },
  noPressure: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textSubtle,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  notFoundText: { fontSize: 16, fontWeight: '200', color: Colors.textMuted },
  backLink: { fontSize: 12, fontWeight: '300', color: Colors.textSubtle, letterSpacing: 0.5 },
});
