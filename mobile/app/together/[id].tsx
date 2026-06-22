import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useAppStore } from '../../lib/store';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { momentById, placeById } from '../../lib/together';
import { experienceTags } from '../../lib/discovery/experience';
import { feedbackRepository } from '../../lib/repositories';
import { aggregateRatings, ratingsForMoment } from '../../lib/discovery/ratings';
import type { RatingSummary } from '../../lib/discovery/ratings';

export default function TogetherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const placesEnabled = useAppStore((s) => s.features.localShops);
  const { t } = useLanguage();
  const { activeSpace } = useSpaces();
  const moment = momentById(id);
  const place = placesEnabled ? placeById(moment?.placeId) : undefined;

  const [summary, setSummary] = useState<RatingSummary | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (!activeSpace || !id) return;
      let alive = true;
      feedbackRepository
        .getAll(activeSpace.id)
        .then((all) => {
          if (!alive) return;
          setSummary(aggregateRatings(ratingsForMoment(all, id)));
        })
        .catch(() => { /* best-effort: no rating block rather than a crash */ });
      return () => { alive = false; };
    }, [activeSpace, id]),
  );

  if (!moment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>{t('idea not found.', 'Idee nicht gefunden.')}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('Go back', 'Zuruck')}
          >
            <Text style={styles.backLink}>{t('go back', 'zuruck')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('Back', 'Zuruck')}
        >
          <Text style={styles.backText}>{'<-'} {t('BACK', 'ZURUCK')}</Text>
        </TouchableOpacity>
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
              {t('from your own feedback — stays private to your space', 'aus eurem eigenen Feedback - bleibt privat in eurem Space')}
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
          </View>
        )}

        <Text style={styles.invite}>
          {t(
            "when you've done it, preserve it as a moment in your diary.",
            'Wenn ihr es erlebt habt, bewahrt es als Moment in eurem Tagebuch.',
          )}
        </Text>

        <TouchableOpacity
          style={styles.cta}
          onPress={() =>
            router.push({
              pathname: '/memory/create',
              params: {
                prefillNote: t(
                  `${moment.title} - ${moment.idea}`,
                  `${moment.title} - ${moment.idea}`,
                ),
              },
            })
          }
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('Preserve this as a moment in your diary', 'Als Moment im Tagebuch bewahren')}
        >
          <Text style={styles.ctaText}>{t('PRESERVE THIS MOMENT', 'DIESEN MOMENT BEWAHREN')}</Text>
        </TouchableOpacity>

        <Text style={styles.noPressure}>{t('no pressure. only if it feels right.', 'kein Muss. nur wenn es sich richtig anfuhlt.')}</Text>
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
  category: { fontSize: 9, fontWeight: '500', letterSpacing: 3, color: Colors.textSubtle },
  title: { fontSize: 30, fontWeight: '200', color: Colors.text, letterSpacing: -0.4, lineHeight: 36 },
  idea: { fontSize: 16, fontWeight: '300', color: Colors.textMuted, lineHeight: 24 },
  experience: { gap: Spacing.sm, marginTop: Spacing.md },
  experienceLabel: { fontSize: 9, fontWeight: '500', letterSpacing: 2.5, color: Colors.textFaint },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tag: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 999,
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
  },
  ctaText: { fontSize: 11, fontWeight: '500', letterSpacing: 3, color: Colors.white },
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
