import React, { useCallback, useState } from 'react';
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
import { Colors, Sections } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useAppStore } from '../../lib/store';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { momentById, placeById } from '../../lib/together';
import { experienceTags } from '../../lib/discovery/experience';
import { feedbackRepository, savedDateRepository } from '../../lib/repositories';
import { aggregateRatings, ratingsForMoment } from '../../lib/discovery/ratings';
import type { RatingSummary } from '../../lib/discovery/ratings';
import { confirmSuccess } from '../../lib/haptics';
import type { SavedDate } from '../../lib/types';

const TOGETHER = Sections.together;

export default function TogetherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const placesEnabled = useAppStore((s) => s.features.localShops);
  const { t } = useLanguage();
  const { activeSpace } = useSpaces();
  const moment = momentById(id);
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
        <Text style={styles.headerLabel}>{t('TO DO TOGETHER', 'GEMEINSAM TUN')}</Text>
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
              <Text style={styles.experienceLabel}>{t('WHAT THIS IS LIKE', 'WIE SICH DAS ANFUHLT')}</Text>
              <View style={styles.tagRow}>
                {tags.map((tg) => (
                  <View key={tg.key} style={styles.tag}>
                    <Text style={styles.tagText}>{t(...tg.label)}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.experienceNote}>
                {t('estimated from this idea, not live data', 'geschatzt aus dieser Idee, keine Live-Daten')}
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
              {t(
                'from your own feedback — private on this device',
                'aus eurem eigenen Feedback – privat auf diesem Gerät',
              )}
            </Text>
          </View>
        )}

        {place && (
          <View style={styles.placeCard}>
            <Text style={styles.placeLabel}>{t('A PLACE FOR IT', 'EIN ORT DAFUR')}</Text>
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
          {t(
            'save it, make a plan, then keep the memory when it becomes yours.',
            'Merkt es euch, macht einen Plan und bewahrt danach euren Moment.',
          )}
        </Text>

        <TouchableOpacity
          style={styles.cta}
          onPress={() => void handlePrimary()}
          disabled={busy}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('Continue with this idea', 'Mit dieser Idee weitermachen')}
        >
          {busy ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.ctaText}>
              {savedDate?.status === 'completed'
                ? savedDate.memoryId
                  ? t('VIEW YOUR MEMORY', 'EUREN MOMENT ANSEHEN')
                  : t('PRESERVE THIS MOMENT', 'DIESEN MOMENT BEWAHREN')
                : savedDate?.status === 'planned'
                  ? t('OPEN YOUR PLAN', 'EUREN PLAN ÖFFNEN')
                  : t('PLAN THIS DATE', 'DIESES DATE PLANEN')}
            </Text>
          )}
        </TouchableOpacity>

        {savedDate?.status !== 'completed' && (
          <TouchableOpacity
            style={styles.secondaryCta}
            onPress={() => void handleDone()}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={t('We already did this', 'Wir haben das schon gemacht')}
          >
            <Text style={styles.secondaryCtaText}>{t('WE ALREADY DID THIS', 'WIR HABEN DAS SCHON GEMACHT')}</Text>
          </TouchableOpacity>
        )}

        {!savedDate ? (
          <TouchableOpacity
            style={styles.tertiaryCta}
            onPress={() => void handleSave()}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={t('Save for later', 'Für später merken')}
          >
            <Text style={styles.tertiaryCtaText}>{t('SAVE FOR LATER', 'FÜR SPÄTER MERKEN')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.tertiaryCta}
            onPress={() => openSavedDates()}
            accessibilityRole="button"
            accessibilityLabel={t('Open saved ideas', 'Gespeicherte Ideen öffnen')}
          >
            <Text style={styles.savedState}>{t('SAVED ✓ · VIEW YOUR LIST', 'GEMERKT ✓ · LISTE ANSEHEN')}</Text>
          </TouchableOpacity>
        )}

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
  backText: { fontSize: 10, fontWeight: '400', letterSpacing: 1.5, color: Colors.textMuted, width: 60 },
  headerLabel: { fontSize: 10, fontWeight: '500', letterSpacing: 3, color: Colors.text },
  content: { padding: Spacing.screen, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  category: { fontSize: 9, fontWeight: '500', letterSpacing: 3, color: TOGETHER },
  title: { ...Typography.editorial, fontSize: 32, lineHeight: 40 },
  idea: { fontSize: 16, fontWeight: '300', color: Colors.textMuted, lineHeight: 26 },
  experience: { gap: Spacing.sm, marginTop: Spacing.md },
  experienceLabel: { fontSize: 9, fontWeight: '500', letterSpacing: 2.5, color: Colors.textFaint },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tag: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  tagText: { fontSize: 12, fontWeight: '400', color: Colors.textMuted, letterSpacing: 0.2 },
  experienceNote: { fontSize: 10, fontWeight: '300', color: Colors.textFaint, fontStyle: 'italic' },
  ratingBlock: {
    backgroundColor: Colors.backgroundCream,
    padding: Spacing.lg,
    gap: Spacing.xs,
    marginTop: Spacing.md,
    borderRadius: Radii.md,
    ...Shadows.subtle,
  },
  ratingLabel: { fontSize: 9, fontWeight: '500', letterSpacing: 2.5, color: Colors.textSubtle },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  ratingStars: { fontSize: 16, color: Colors.accent, letterSpacing: 2 },
  ratingMeta: { fontSize: 13, fontWeight: '400', color: Colors.textMuted },
  ratingTip: { fontSize: 13, fontWeight: '300', color: Colors.textMuted, fontStyle: 'italic', lineHeight: 19 },
  ratingNote: { fontSize: 10, fontWeight: '300', color: Colors.textFaint, fontStyle: 'italic' },
  placeCard: {
    backgroundColor: Colors.backgroundCream,
    padding: Spacing.lg,
    gap: 4,
    marginTop: Spacing.md,
    borderRadius: Radii.md,
    ...Shadows.subtle,
  },
  placeLabel: { fontSize: 9, fontWeight: '500', letterSpacing: 2.5, color: Colors.textSubtle },
  placeHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  placeName: { fontSize: 18, fontWeight: '200', color: Colors.text },
  partner: {
    fontSize: 7,
    fontWeight: '500',
    letterSpacing: 2,
    color: Colors.textSubtle,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  placeArea: { fontSize: 11, fontWeight: '300', color: Colors.textFaint, letterSpacing: 0.5 },
  perk: { fontSize: 13, fontWeight: '300', color: Colors.textSubtle, marginTop: 2 },
  mapLink: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', marginTop: Spacing.xs },
  mapLinkText: { fontSize: 9, fontWeight: '500', letterSpacing: 2, color: Colors.text },
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
  ctaText: { fontSize: 11, fontWeight: '500', letterSpacing: 3, color: Colors.white },
  secondaryCta: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  secondaryCtaText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.text },
  tertiaryCta: { minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  tertiaryCtaText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.textMuted },
  savedState: { fontSize: 10, fontWeight: '500', letterSpacing: 1.5, color: Colors.text },
  actionError: { fontSize: 12, fontWeight: '400', color: Colors.danger, lineHeight: 18, textAlign: 'center' },
  noPressure: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textFaint,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  notFoundText: { fontSize: 16, fontWeight: '200', color: Colors.textMuted },
  backLink: { fontSize: 12, fontWeight: '300', color: Colors.textSubtle, letterSpacing: 0.5 },
});
