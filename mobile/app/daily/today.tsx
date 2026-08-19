import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Layout } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { BackButton } from '../../components/ui/BackButton';
import { PressableScale } from '../../components/ui/PressableScale';
import { FadeInImage } from '../../components/ui/FadeInImage';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { dailyRepository } from '../../lib/repositories';
import { getSessionUser } from '../../lib/supabase/auth';
import { persistPickedPhoto } from '../../lib/photoStorage';
import { tagesSchluessel, karteVon, NOTIZ_MAX } from '../../lib/daily';
import { confirmSuccess } from '../../lib/haptics';
import type { Daily } from '../../lib/types';

/**
 * Die Tageskarte ablegen — ein Foto und ein paar Worte, einmal am Tag.
 *
 * WAS HIER BEWUSST FEHLT (MANIFESTO §3): kein „du hast heute noch nicht",
 * keine Serie, keine verpassten Tage, kein Vergleich mit den anderen im
 * Space. „Einmal am Tag" ist eine Obergrenze, damit der Tag nicht zum Feed
 * wird — keine Aufgabe, die man erfüllt.
 *
 * Wer schon eine Karte hat, ändert sie hier. Das Ersetzen steht in der
 * Datenbank (`unique (space_id, author_id, day)`), nicht nur in diesem
 * Bildschirm.
 */
export default function TodayScreen() {
  const { t } = useLanguage();
  const { activeSpace } = useSpaces();
  const [foto, setFoto] = useState<string | undefined>();
  const [notiz, setNotiz] = useState('');
  const [busy, setBusy] = useState(false);
  const [laden, setLaden] = useState(true);
  const [vorhanden, setVorhanden] = useState<Daily | undefined>();

  const tag = tagesSchluessel(new Date());

  useEffect(() => {
    let lebt = true;
    (async () => {
      if (!activeSpace) {
        setLaden(false);
        return;
      }
      try {
        const person = await getSessionUser();
        const alle = await dailyRepository.getAll(activeSpace.id);
        const meine = person ? karteVon(alle, person.id, tag) : undefined;
        if (!lebt) return;
        setVorhanden(meine);
        if (meine) {
          setFoto(meine.photoUri);
          setNotiz(meine.note);
        }
      } catch {
        // Ein Ladefehler heißt hier NICHT „du hast nichts abgelegt" (K4/K5).
        // Er heißt: wir wissen es gerade nicht. Also nichts behaupten.
      } finally {
        if (lebt) setLaden(false);
      }
    })();
    return () => {
      lebt = false;
    };
  }, [activeSpace, tag]);

  const fotoWaehlen = useCallback(async (ausKamera: boolean) => {
    const erlaubnis = ausKamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!erlaubnis.granted) {
      Alert.alert(
        t('no access', 'kein Zugriff'),
        t(
          'peakplant needs permission for this. you can change it in your phone settings — a note without a photo works too.',
          'PeakPlant braucht dafür eine Erlaubnis. Du kannst sie in den Telefon-Einstellungen ändern — eine Notiz ohne Foto geht auch.',
        ),
      );
      return;
    }
    const ergebnis = ausKamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (ergebnis.canceled || !ergebnis.assets?.[0]) return;
    // Sofort sichern: Die Adresse aus der Auswahl zeigt in einen Zwischen-
    // speicher, den das Telefon jederzeit leeren darf.
    setFoto(await persistPickedPhoto(ergebnis.assets[0].uri, 'daily'));
  }, [t]);

  const ablegen = async () => {
    if (!activeSpace || busy) return;
    if (!foto && !notiz.trim()) return;
    setBusy(true);
    try {
      const person = await getSessionUser();
      await dailyRepository.upsert({
        spaceId: activeSpace.id,
        authorId: person?.id ?? 'lokal',
        authorName: person?.name ?? t('you', 'du'),
        day: tag,
        note: notiz.trim(),
        photoUri: foto,
      });
      void confirmSuccess();
      router.back();
    } catch {
      Alert.alert(
        t('could not save', 'Speichern ging nicht'),
        t(
          'that was the connection — nothing of yours is lost, try again in a moment.',
          'das war die Verbindung — nichts von dir ist weg, versuch es gleich nochmal.',
        ),
      );
      setBusy(false);
    }
  };

  const bereit = !!foto || notiz.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bar}>
        <BackButton label={t('BACK', 'ZURÜCK')} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.kicker}>{t('TODAY', 'HEUTE')}</Text>
          <Text style={styles.title}>
            {vorhanden
              ? t('change what you left', 'ändern, was du dagelassen hast')
              : t('leave one thing', 'lass eine Sache da')}
          </Text>
          <Text style={styles.lead}>
            {t(
              'a photo and a few words. one a day — that is a ceiling, not a task. skipped days cost nothing.',
              'ein Foto und ein paar Worte. Eins am Tag — das ist eine Obergrenze, keine Aufgabe. Übersprungene Tage kosten nichts.',
            )}
          </Text>

          {laden ? (
            <ActivityIndicator style={styles.laden} color={Colors.accent} />
          ) : (
            <>
              <View style={styles.fotoFeld}>
                {foto ? (
                  <FadeInImage source={{ uri: foto }} style={styles.foto} />
                ) : (
                  <Text style={styles.fotoLeer}>
                    {t('no photo yet — a note alone is a day too.', 'noch kein Foto — ein Satz allein ist auch ein Tag.')}
                  </Text>
                )}
              </View>

              <View style={styles.fotoWege}>
                <PressableScale
                  containerStyle={styles.flexSlot}
                  style={styles.zweit}
                  onPress={() => void fotoWaehlen(true)}
                  scaleTo={0.98}
                  accessibilityLabel={t('Take a photo', 'Foto aufnehmen')}
                >
                  <Text style={styles.zweitText}>{t('CAMERA', 'KAMERA')}</Text>
                </PressableScale>
                <PressableScale
                  containerStyle={styles.flexSlot}
                  style={styles.zweit}
                  onPress={() => void fotoWaehlen(false)}
                  scaleTo={0.98}
                  accessibilityLabel={t('Choose a photo', 'Foto auswählen')}
                >
                  <Text style={styles.zweitText}>{t('LIBRARY', 'MEDIATHEK')}</Text>
                </PressableScale>
              </View>

              <TextInput
                style={styles.eingabe}
                value={notiz}
                onChangeText={(v) => setNotiz(v.slice(0, NOTIZ_MAX))}
                placeholder={t('what today was like...', 'wie der Tag war...')}
                placeholderTextColor={Colors.textSubtle}
                multiline
                textAlignVertical="top"
              />
              <Text style={styles.zaehler}>{NOTIZ_MAX - notiz.length}</Text>
            </>
          )}
        </ScrollView>

        <View style={styles.fuss}>
          <PressableScale
            style={[styles.cta, !bereit && styles.ctaAus]}
            onPress={() => void ablegen()}
            scaleTo={0.98}
            accessibilityLabel={t('Leave it', 'Dalassen')}
          >
            {busy ? (
              <ActivityIndicator color={Colors.background} size="small" />
            ) : (
              <Text style={styles.ctaText}>
                {vorhanden ? t('REPLACE IT', 'ERSETZEN') : t('LEAVE IT', 'DALASSEN')}
              </Text>
            )}
          </PressableScale>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  flexSlot: { flex: 1 },
  bar: { paddingHorizontal: Spacing.screen, paddingVertical: Spacing.md },
  content: { paddingHorizontal: Spacing.screen, paddingBottom: Spacing.xl, gap: Spacing.sm },
  kicker: { fontSize: 11, fontWeight: '500', letterSpacing: 1.2, color: Colors.textMuted },
  title: { ...Typography.editorial },
  lead: {
    fontSize: 13,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 19,
    marginBottom: Spacing.sm,
  },
  laden: { marginTop: Spacing.xl },
  fotoFeld: {
    aspectRatio: 1,
    borderRadius: Radii.md,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foto: { width: '100%', height: '100%' },
  fotoLeer: {
    ...Typography.micro,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.lg,
    textAlign: 'center',
  },
  fotoWege: { flexDirection: 'row', gap: Spacing.sm },
  zweit: {
    height: Layout.control,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zweitText: { fontSize: 11, fontWeight: '500', letterSpacing: 1.2, color: Colors.text },
  eingabe: {
    ...Typography.body,
    color: Colors.text,
    minHeight: 96,
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  zaehler: { fontSize: 11, color: Colors.textSubtle, textAlign: 'right' },
  fuss: { paddingHorizontal: Spacing.screen, paddingBottom: Spacing.md },
  cta: {
    height: Layout.cta,
    borderRadius: Radii.pill,
    backgroundColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaAus: { opacity: 0.4 },
  // kontrast-ok: Papierfarbe nur auf der dunklen Füllung `cta` — 15,4:1.
  ctaText: { fontSize: 12, fontWeight: '500', letterSpacing: 1.2, color: Colors.background },
});
