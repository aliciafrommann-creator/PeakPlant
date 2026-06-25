import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { Spacing, Radii } from '../constants/spacing';
import { isSupabaseConfigured } from '../lib/supabase/client';
import { signOut, deleteAccount } from '../lib/supabase/auth';
import { useAppStore } from '../lib/store';
import { useLanguage } from '../lib/hooks/useLanguage';

export default function AccountScreen() {
  const reset = useAppStore((s) => s.reset);
  const [busy, setBusy] = useState(false);
  const { t } = useLanguage();

  const handleSignOut = async () => {
    setBusy(true);
    try {
      if (isSupabaseConfigured) await signOut();
      await reset();
      router.replace('/');
    } catch {
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      t('delete your account?', 'Konto loschen?'),
      t(
        'this permanently removes your account, your spaces where you are the only member, and your moments. this cannot be undone.',
        'Dein Konto, deine Spaces (wo du das einzige Mitglied bist) und deine Momente werden dauerhaft geloscht. Das kann nicht ruckgangig gemacht werden.',
      ),
      [
        { text: t('cancel', 'abbrechen'), style: 'cancel' },
        {
          text: t('delete', 'loschen'),
          style: 'destructive',
          onPress: handleDelete,
        },
      ],
    );
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      if (isSupabaseConfigured) await deleteAccount();
      await reset();
      router.replace('/');
    } catch (e) {
      setBusy(false);
      Alert.alert(
        t('could not delete', 'Loschen fehlgeschlagen'),
        e instanceof Error ? e.message : t('please try again.', 'Bitte versuche es erneut.'),
      );
    }
  };

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
        <Text style={styles.headerTitle}>{t('ACCOUNT & DATA', 'KONTO & DATEN')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          {t(
            'your diary is private to your spaces. you\'re always in control of your data.',
            'Dein Tagebuch ist privat fur deinen Space. Du hast jederzeit die Kontrolle uber deine Daten.',
          )}
        </Text>

        <TouchableOpacity
          style={styles.row}
          onPress={handleSignOut}
          disabled={busy}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('Sign out', 'Abmelden')}
        >
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{t('sign out', 'abmelden')}</Text>
            <Text style={styles.rowDesc}>{t('you can sign back in any time.', 'Du kannst dich jederzeit wieder anmelden.')}</Text>
          </View>
          {busy ? (
            <ActivityIndicator color={Colors.accent} size="small" />
          ) : (
            <Text style={styles.arrow}>-{'>'}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerLabel}>{t('DANGER ZONE', 'GEFAHRENZONE')}</Text>
          <TouchableOpacity
            style={styles.dangerRow}
            onPress={confirmDelete}
            disabled={busy}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('Delete account', 'Konto loschen')}
          >
            <View style={styles.rowText}>
              <Text style={styles.dangerText}>{t('delete account', 'Konto loschen')}</Text>
              <Text style={styles.rowDesc}>
                {t(
                  'permanently removes your account and your moments. cannot be undone.',
                  'Loscht dein Konto und deine Momente dauerhaft. Kann nicht ruckgangig gemacht werden.',
                )}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          {t('questions about your data? hello@peak-plant.com', 'Fragen zu deinen Daten? hello@peak-plant.com')}
        </Text>
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
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rowText: { flex: 1, gap: 3 },
  rowLabel: { fontSize: 16, fontWeight: '400', color: Colors.text },
  rowDesc: { fontSize: 12, fontWeight: '300', color: Colors.textMuted, lineHeight: 17 },
  arrow: { fontSize: 18, fontWeight: '200', color: Colors.textMuted },
  dangerZone: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
    backgroundColor: 'rgba(180,35,24,0.06)',
    borderRadius: Radii.md,
    padding: Spacing.lg,
  },
  dangerLabel: { fontSize: 9, fontWeight: '500', letterSpacing: 3, color: Colors.danger },
  dangerRow: {
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  dangerText: { fontSize: 16, fontWeight: '400', color: Colors.danger },
  footer: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textFaint,
    fontStyle: 'italic',
    marginTop: Spacing.lg,
  },
});
