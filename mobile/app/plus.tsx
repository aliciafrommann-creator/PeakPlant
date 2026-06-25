import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { Spacing, Radii } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { useLanguage } from '../lib/hooks/useLanguage';
import { useAppStore } from '../lib/store';
import { billing } from '../lib/monetization/billing';
import { PRICE_HYPOTHESES } from '../lib/monetization/config';

const MONTHLY_PRODUCT_ID = 'couple_monthly';

export default function PlusScreen() {
  const { t } = useLanguage();
  const activeSpaceId = useAppStore((s) => s.activeSpaceId);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleStartTrial = useCallback(async () => {
    if (!activeSpaceId) return;
    setLoading(true);
    try {
      const result = await billing.purchase(MONTHLY_PRODUCT_ID, activeSpaceId);
      if (result.success) {
        router.back();
      } else if (result.error !== 'cancelled') {
        Alert.alert(
          t('Something went wrong', 'Etwas ist schiefgelaufen'),
          t('Please try again or restore your purchases below.', 'Bitte versuche es erneut oder stelle deine Käufe unten wieder her.'),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [activeSpaceId, t]);

  const handleRestore = useCallback(async () => {
    if (!activeSpaceId) return;
    setRestoring(true);
    try {
      const result = await billing.restore(activeSpaceId);
      if (result.success && result.entitlement?.tier === 'plus') {
        Alert.alert(
          t('Restored!', 'Wiederhergestellt!'),
          t('Your Plus subscription is active again.', 'Dein Plus-Abo ist wieder aktiv.'),
          [{ text: 'OK', onPress: () => router.back() }],
        );
      } else {
        Alert.alert(
          t('Nothing to restore', 'Nichts gefunden'),
          t('No active Plus subscription found for this account.', 'Kein aktives Plus-Abo für dieses Konto gefunden.'),
        );
      }
    } finally {
      setRestoring(false);
    }
  }, [activeSpaceId, t]);

  const monthly = PRICE_HYPOTHESES.find((p) => p.id === MONTHLY_PRODUCT_ID);
  const priceLabel = monthly
    ? `€${(monthly.amountCents / 100).toFixed(2).replace('.', ',')} / ${t('month', 'Monat')}`
    : '€4,99 / Monat';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.closeRow}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('Close', 'Schließen')}>
          <Text style={styles.close}>{t('maybe later', 'vielleicht später')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>PEAKPLANT PLUS</Text>
        <Text style={styles.heading}>
          {t('An AI that knows you two.', 'Eine KI, die euch kennt.')}
        </Text>
        <Text style={styles.sub}>
          {t(
            'The free plan has everything for your diary. Plus unlocks the AI layer.',
            'Der kostenlose Plan hat alles für dein Tagebuch. Plus schaltet die KI-Ebene frei.',
          )}
        </Text>

        <View style={styles.features}>
          {[
            [
              t('Ask PeakPlant', 'Ask PeakPlant'),
              t('Conversational date ideas, just for you two.', 'Date-Ideen im Gespräch, nur für euch.'),
            ],
            [
              t('Personalized recommendations', 'Personalisierte Empfehlungen'),
              t('Suggestions that learn from what you save and love.', 'Vorschläge, die aus euren Saves lernen.'),
            ],
            [
              t('Live weather context', 'Live-Wetter-Kontext'),
              t("Ideas matched to today's weather — automatically.", 'Ideen passend zum Wetter von heute — automatisch.'),
            ],
          ].map(([title, desc]) => (
            <View key={title} style={styles.feature}>
              <Text style={styles.featureMark}>+</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureDesc}>{desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.ctaBlock}>
          <TouchableOpacity
            style={[styles.cta, loading && styles.ctaDisabled]}
            onPress={() => void handleStartTrial()}
            disabled={loading || !activeSpaceId}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.ctaText}>
                {t('START 7 DAYS FREE', '7 TAGE KOSTENLOS TESTEN')}
              </Text>
            )}
          </TouchableOpacity>
          <Text style={styles.priceNote}>
            {t(`then ${priceLabel} per couple · cancel anytime`, `danach ${priceLabel} pro Paar · jederzeit kündbar`)}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.legal}>
            {t(
              'One subscription per couple. Payment charged after the trial. Manage or cancel in your App Store / Play Store account settings.',
              'Ein Abo pro Paar. Zahlung nach der Testphase. Verwalten oder kündigen in den App Store / Play Store Kontoeinstellungen.',
            )}
          </Text>
          <TouchableOpacity
            onPress={() => void handleRestore()}
            disabled={restoring}
            accessibilityRole="button"
          >
            <Text style={styles.restore}>
              {restoring
                ? t('Restoring...', 'Wird wiederhergestellt...')
                : t('Restore purchases', 'Käufe wiederherstellen')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  closeRow: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    alignItems: 'flex-end',
  },
  close: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textSubtle,
    letterSpacing: 0.3,
  },
  content: {
    padding: Spacing.screen,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xl,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.accent,
    marginBottom: -Spacing.sm,
  },
  heading: {
    ...Typography.editorial,
    fontSize: 34,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  sub: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.textMuted,
    lineHeight: 22,
  },
  features: { gap: Spacing.lg },
  feature: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  featureMark: {
    fontSize: 18,
    fontWeight: '300',
    color: Colors.accent,
    lineHeight: 22,
    width: 20,
  },
  featureText: { flex: 1, gap: 2 },
  featureTitle: { fontSize: 15, fontWeight: '500', color: Colors.text },
  featureDesc: { fontSize: 13, fontWeight: '400', color: Colors.textMuted, lineHeight: 18 },
  ctaBlock: { gap: Spacing.sm, marginTop: Spacing.md },
  cta: {
    height: 56,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { fontSize: 11, fontWeight: '500', letterSpacing: 3, color: Colors.white },
  priceNote: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textSubtle,
    textAlign: 'center',
  },
  footer: { gap: Spacing.md, marginTop: Spacing.sm },
  legal: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.textFaint,
    lineHeight: 16,
    textAlign: 'center',
  },
  restore: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textSubtle,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
