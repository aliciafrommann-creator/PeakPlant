import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { Spacing, Radii } from '../constants/spacing';
import { FEATURES } from '../lib/features';
import { useAppStore } from '../lib/store';
import { useLanguage } from '../lib/hooks/useLanguage';

export default function CustomizeScreen() {
  const features = useAppStore((s) => s.features);
  const toggleFeature = useAppStore((s) => s.toggleFeature);
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('Close', 'Schliessen')}
        >
          <Text style={styles.close}>{t('CLOSE', 'SCHLIESSEN')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('CUSTOMIZE', 'ANPASSEN')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          {t(
            "make peakplant yours. a few gentle helpers are on to start — switch off anything you don't want. nothing here is required, and collecting moments always works.",
            'Mach PeakPlant zu deinem. Ein paar hilfreiche Funktionen sind zu Beginn aktiviert - schalte ab, was du nicht mochtest. Nichts davon ist Pflicht, und Momente sammeln funktioniert immer.',
          )}
        </Text>

        {FEATURES.map((f) => {
          const isLive = f.status === 'live';
          const enabled = isLive && !!features[f.key];
          return (
            <View key={f.key} style={styles.row}>
              <View style={styles.rowText}>
                <View style={styles.rowTitleLine}>
                  <Text style={styles.rowLabel}>{t(f.label, f.labelDe)}</Text>
                  {!isLive && <Text style={styles.soon}>{t('SOON', 'BALD')}</Text>}
                </View>
                <Text style={styles.rowDesc}>{t(f.description, f.descriptionDe)}</Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={(v) => toggleFeature(f.key, v)}
                disabled={!isLive}
                trackColor={{ false: Colors.border, true: Colors.text }}
                thumbColor={Colors.white}
                accessibilityLabel={t(`Toggle ${f.label}`, `${f.labelDe} umschalten`)}
              />
            </View>
          );
        })}

        <Text style={styles.footer}>
          {t(
            'more arrives over time. each piece is optional and can be switched off again whenever you like.',
            'Mit der Zeit kommt mehr. Jede Funktion ist optional und kann jederzeit wieder deaktiviert werden.',
          )}
        </Text>

        <TouchableOpacity
          style={styles.accountRow}
          onPress={() => router.push('/settings/preferences')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('Personalization and learned preferences', 'Personalisierung und gelernte Praferenzen')}
        >
          <Text style={styles.accountLabel}>{t('personalization', 'Personalisierung')}</Text>
          <Text style={styles.accountArrow}>-{'>'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.accountRow}
          onPress={() => router.push('/account')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('Account and data', 'Konto und Daten')}
        >
          <Text style={styles.accountLabel}>{t('account & data', 'Konto & Daten')}</Text>
          <Text style={styles.accountArrow}>-{'>'}</Text>
        </TouchableOpacity>
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
  close: { fontSize: 10, fontWeight: '400', letterSpacing: 2, color: Colors.textMuted },
  headerTitle: { fontSize: 10, fontWeight: '500', letterSpacing: 2.5, color: Colors.text },
  content: { padding: Spacing.screen, gap: Spacing.lg, paddingBottom: Spacing.xxxl },
  lead: { fontSize: 14, fontWeight: '300', color: Colors.textMuted, lineHeight: 21 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowText: { flex: 1, gap: 4 },
  rowTitleLine: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rowLabel: { fontSize: 16, fontWeight: '400', color: Colors.text, letterSpacing: 0.1 },
  soon: {
    fontSize: 8,
    fontWeight: '500',
    letterSpacing: 2,
    color: Colors.textSubtle,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: Radii.pill,
  },
  rowDesc: { fontSize: 12, fontWeight: '300', color: Colors.textMuted, lineHeight: 18 },
  footer: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textFaint,
    lineHeight: 17,
    fontStyle: 'italic',
    marginTop: Spacing.md,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.lg,
  },
  accountLabel: { fontSize: 15, fontWeight: '400', color: Colors.text },
  accountArrow: { fontSize: 18, fontWeight: '200', color: Colors.textMuted },
});
