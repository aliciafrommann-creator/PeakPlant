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
import { signOut, deleteAccount, getSessionUser } from '../lib/supabase/auth';
import { useAppStore } from '../lib/store';
import { useLanguage } from '../lib/hooks/useLanguage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useSpaces } from '../lib/hooks/useSpaces';
import {
  memoryRepository,
  noteRepository,
  savedDateRepository,
  feedbackRepository,
  spaceRepository,
} from '../lib/repositories';
import { buildDataExport, exportDateiname, type SpaceExport } from '../lib/dataExport';

export default function AccountScreen() {
  const reset = useAppStore((s) => s.reset);
  const [busy, setBusy] = useState(false);
  const [exportiert, setExportiert] = useState(false);
  const { spaces } = useSpaces();
  const { t } = useLanguage();

  /**
   * Auskunft und Mitnahme (Art. 15/20 DSGVO).
   *
   * Die App konnte ein Konto löschen, aber nicht sagen, was sie über einen
   * Menschen weiß. Löschen ist ein Knopf, Auskunft ist Arbeit — und genau
   * deshalb fehlte die unangenehmere Hälfte.
   *
   * Was hier NICHT passiert: kein Versand, kein Server, kein Ticket. Die
   * Datei entsteht auf dem Gerät und geht in das Teilen-Blatt. Ein
   * Auskunftsweg, der die Daten erst an einen Dienst schickt, wäre ein
   * neuer Datenfluss, um einen Datenschutz-Anspruch zu erfüllen.
   */
  const handleExport = async () => {
    setBusy(true);
    try {
      const teile: SpaceExport[] = [];
      for (const space of spaces) {
        const [momente, notizen, gemerkteIdeen, bewertungen, mitglieder] = await Promise.all([
          memoryRepository.getAll(space.id),
          noteRepository.getAll(space.id),
          savedDateRepository.getAll(space.id),
          feedbackRepository.getAll(space.id),
          spaceRepository.getMembers(space.id),
        ]);
        teile.push({ space, mitglieder, momente, notizen, gemerkteIdeen, bewertungen });
      }

      // Ohne Supabase (lokaler Betrieb) gibt es kein Konto — die Auskunft
      // gilt dann für die Daten auf diesem Gerät und sagt das über die
      // fehlende Kennung auch aus.
      const person = await getSessionUser();
      const paket = buildDataExport({
        userId: person?.id ?? 'nur auf diesem Gerät',
        email: person?.email ?? null,
        name: person?.name ?? null,
        erstelltAm: new Date().toISOString(),
        spaces: teile,
      });

      const datei = `${FileSystem.cacheDirectory}${exportDateiname(paket.erstelltAm)}`;
      await FileSystem.writeAsStringAsync(datei, JSON.stringify(paket, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(datei, {
          mimeType: 'application/json',
          dialogTitle: t('Your data', 'Deine Daten'),
        });
        setExportiert(true);
      } else {
        // Ehrlich statt stumm: Ohne Teilen-Blatt liegt die Datei zwar da,
        // aber der Mensch käme nicht an sie heran.
        Alert.alert(
          t('not possible here', 'hier nicht möglich'),
          t(
            'this device cannot share files. write to the address in the privacy policy and you will get the same package by mail.',
            'Dieses Gerät kann keine Dateien teilen. Schreib an die Adresse in der Datenschutzerklärung, dann bekommst du dasselbe Paket per Mail.',
          ),
        );
      }
    } catch {
      Alert.alert(
        t('could not build the file', 'Datei konnte nicht erstellt werden'),
        t(
          'nothing was sent and nothing changed. try again, or write to the address in the privacy policy.',
          'Es wurde nichts verschickt und nichts verändert. Versuch es nochmal, oder schreib an die Adresse in der Datenschutzerklärung.',
        ),
      );
    } finally {
      setBusy(false);
    }
  };

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
      t('delete your account?', 'Konto löschen?'),
      t(
        // Was die Löschfunktion WIRKLICH tut (Migration 0014): Spaces, in
        // denen du allein bist, werden mit allem darin gelöscht. In geteilten
        // Spaces bleiben eure Momente bei der anderen Person — nur deine
        // Urheberschaft wird entfernt. Vorher stand hier „und deine Momente",
        // was in einem Paar-Space — also dem Normalfall dieses Produkts —
        // schlicht falsch war, und zwar in einem DSGVO-Zusammenhang.
        // Der richtige Ton steht längst in space/edit.tsx: „Nichts Geteiltes
        // wird gelöscht — die anderen behalten jeden Moment."
        'this permanently removes your account. spaces where you are alone are deleted with everything in them. in a shared space, what you kept stays with the other person — your name comes off it. this cannot be undone.',
        'Dein Konto wird dauerhaft gelöscht. Spaces, in denen du allein bist, verschwinden mit allem darin. In einem geteilten Space bleibt bei der anderen Person, was ihr festgehalten habt — nur dein Name wird davon gelöst. Das kann nicht rückgängig gemacht werden.',
      ),
      [
        { text: t('cancel', 'abbrechen'), style: 'cancel' },
        {
          text: t('delete', 'löschen'),
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
        t('could not delete', 'Löschen fehlgeschlagen'),
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
          accessibilityLabel={t('Close', 'Schließen')}
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
            'Dein Tagebuch ist privat für deinen Space. Du hast jederzeit die Kontrolle über deine Daten.',
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

        {/* Auskunft steht VOR der Gefahrenzone: Wer über das Löschen
            nachdenkt, soll vorher mitnehmen können, was ihm gehört. */}
        <TouchableOpacity
          style={styles.row}
          onPress={handleExport}
          disabled={busy}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('Export your data', 'Deine Daten mitnehmen')}
        >
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>
              {exportiert
                ? t('take your data again', 'Daten erneut mitnehmen')
                : t('take your data with you', 'deine Daten mitnehmen')}
            </Text>
            <Text style={styles.rowDesc}>
              {t(
                'builds a file with everything this app holds under your account, on this device. photos are files and stay outside it — the package says so itself.',
                'Baut auf diesem Gerät eine Datei mit allem, was die App unter deinem Konto führt. Fotos sind Bilddateien und bleiben außen vor — das Paket sagt es selbst.',
              )}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerLabel}>{t('DANGER ZONE', 'GEFAHRENZONE')}</Text>
          <TouchableOpacity
            style={styles.dangerRow}
            onPress={confirmDelete}
            disabled={busy}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('Delete account', 'Konto löschen')}
          >
            <View style={styles.rowText}>
              <Text style={styles.dangerText}>{t('delete account', 'Konto löschen')}</Text>
              <Text style={styles.rowDesc}>
                {t(
                  'permanently removes your account. shared moments stay with the other person. cannot be undone.',
                  'Löscht dein Konto dauerhaft. Geteilte Momente bleiben bei der anderen Person. Kann nicht rückgängig gemacht werden.',
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
  close: { fontSize: 12, fontWeight: '400', letterSpacing: 1.2, color: Colors.textMuted },
  headerTitle: { fontSize: 12, fontWeight: '500', letterSpacing: 1.2, color: Colors.text },
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
  dangerLabel: { fontSize: 11, fontWeight: '500', letterSpacing: 1.2, color: Colors.danger },
  dangerRow: {
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  dangerText: { fontSize: 16, fontWeight: '400', color: Colors.danger },
  footer: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textSubtle,
    fontStyle: 'italic',
    marginTop: Spacing.lg,
  },
});
