import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Accents, AccentInks, Sections } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useMemories } from '../../lib/hooks/useMemories';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { savedDateRepository } from '../../lib/repositories';
import { confirmSuccess } from '../../lib/haptics';
import { setPendingReward } from '../../lib/pendingReward';
import { getEnrollments } from '../../lib/challenges';
import { currentWeeklyChallenge, weeklyProgressFor, inSameIsoWeek } from '../../lib/weeklyChallenge';
import { persistPickedPhoto } from '../../lib/photoStorage';
import { PressableScale } from '../../components/ui/PressableScale';
import { FadeInImage } from '../../components/ui/FadeInImage';
import { SEED_CARDS } from '../../lib/seed';

const MOMENT = Sections.together; // warm apricot — capturing "our" moment

export default function CreateMemoryScreen() {
  const {
    cardId,
    prefillNote,
    savedDateId,
    savedDateTitle,
    savedDateMomentId,
    placeId,
    placeName,
    placeAddress,
    placeLat,
    placeLng,
    placeCategory,
    placeMapsUrl,
  } =
    useLocalSearchParams<{
      cardId?: string;
      prefillNote?: string;
      savedDateId?: string;
      savedDateTitle?: string;
      savedDateMomentId?: string;
      placeId?: string;
      placeName?: string;
      placeAddress?: string;
      placeLat?: string;
      placeLng?: string;
      placeCategory?: string;
      placeMapsUrl?: string;
    }>();
  const [note, setNote] = useState(typeof prefillNote === 'string' ? prefillNote : '');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activeSpace } = useSpaces();
  const { memories, createMemory } = useMemories(activeSpace?.id);

  const { t, l } = useLanguage();
  // A moment only belongs to a card when a card actually sent us here (scan /
  // card screen). Everything else is a free moment — attributing it to card-01
  // would fake the collection count (MANIFESTO §1).
  const selectedCardId = typeof cardId === 'string' && cardId.length > 0 ? cardId : undefined;
  const card = selectedCardId ? SEED_CARDS.find((c) => c.id === selectedCardId) : undefined;

  const cardTitle = card?.content ? l(card.content.title) : card?.prompt ?? '';
  const notePlaceholder = t(
    'what do you want to remember about this moment?',
    'was möchtest du von diesem Moment festhalten?'
  );

  const applyResult = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const fromLibrary = async () => {
    try {
      applyResult(
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          allowsEditing: true,
        }),
      );
    } catch {
      // Der Kamera-Weg erklärt eine Verweigerung sauber; dieser hier tat es
      // nicht: das Blatt schloss sich und nichts geschah, ohne ein Wort.
      Alert.alert(
        t('no access to your photos', 'kein Zugriff auf deine Fotos'),
        t(
          'PeakPlant may not open your library on this phone. You can take a photo instead — or allow photo access in your phone settings.',
          'PeakPlant darf die Galerie auf diesem Handy nicht öffnen. Du kannst stattdessen ein Foto aufnehmen — oder den Zugriff in den Handy-Einstellungen erlauben.',
        ),
        [
          { text: t('take a photo', 'Foto aufnehmen'), onPress: () => void fromCamera() },
          { text: t('not now', 'jetzt nicht'), style: 'cancel' },
        ],
      );
    }
  };

  /**
   * Den Moment aufnehmen, in dem man gerade steckt.
   *
   * Bis zum 18.08.2026 konnte diese App genau das nicht: „Moment festhalten"
   * öffnete ausschließlich die Galerie. Für ein Produkt, dessen ganzer Sinn das
   * Festhalten ist, war das die auffälligste Lücke — und app.json versprach
   * dem Betriebssystem schon die ganze Zeit „capture memories", ein Satz, den
   * der Code nicht hielt (MANIFESTO §1).
   */
  const fromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      // Nicht schweigen und nicht so tun, als sei nichts passiert: sagen, was
      // fehlt, und den Weg anbieten, der ohne Kamera funktioniert.
      Alert.alert(
        t('no camera access', 'kein Kamerazugriff'),
        t(
          'PeakPlant may not use the camera on this phone. You can still pick a photo from your library — or allow the camera in your phone settings.',
          'PeakPlant darf die Kamera auf diesem Handy nicht nutzen. Du kannst trotzdem ein Foto aus der Galerie wählen — oder die Kamera in den Handy-Einstellungen erlauben.',
        ),
        [
          { text: t('from library', 'aus der Galerie'), onPress: () => void fromLibrary() },
          { text: t('not now', 'jetzt nicht'), style: 'cancel' },
        ],
      );
      return;
    }
    applyResult(
      await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      }),
    );
  };

  /**
   * EINE sichtbare Fläche, zwei Wege dahinter (MANIFESTO §5). Zwei Knöpfe
   * nebeneinander wären zwei laute Ziele auf einem Bildschirm, der genau eine
   * Handlung hat; die Auswahl kommt deshalb erst nach dem Tippen — und die
   * Kamera steht oben, weil sie der Grund ist, warum jemand hier steht.
   */
  const choosePhoto = () => {
    Alert.alert(
      photoUri ? t('change the photo', 'Foto ändern') : t('add a photo', 'Foto hinzufügen'),
      undefined,
      [
        { text: t('take a photo', 'Foto aufnehmen'), onPress: () => void fromCamera() },
        { text: t('from library', 'aus der Galerie'), onPress: () => void fromLibrary() },
        { text: t('cancel', 'Abbrechen'), style: 'cancel' },
      ],
    );
  };

  const handleSave = async () => {
    if (!note.trim() && !photoUri) return;
    if (!activeSpace) {
      // Vorher nur dieser Satz, ohne Weg dorthin — eine Anweisung ohne Tür.
      // Entdecken und die Ideen-Bibliothek bieten in derselben Lage längst
      // „Space starten" an; hier fehlte es als einziger Stelle (§5).
      Alert.alert(
        t('no space yet', 'noch kein Space'),
        t(
          'a moment needs a space to live in. it takes a moment to set one up.',
          'ein Moment braucht einen Space, in dem er lebt. Das Einrichten dauert einen Augenblick.',
        ),
        [
          { text: t('not now', 'jetzt nicht'), style: 'cancel' },
          { text: t('start a space', 'Space starten'), onPress: () => router.push('/space/new') },
        ],
      );
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // Picker URIs live in the evictable cache — persist before storing so the
      // photo survives cache cleanup (local mode; no-op when Supabase uploads).
      const durablePhotoUri = photoUri
        ? await persistPickedPhoto(photoUri, 'memory')
        : undefined;
      // A photo-only moment keeps an empty note — we never invent user words.
      const memory = await createMemory({
        cardId: selectedCardId,
        note: note.trim(),
        photoUri: durablePhotoUri,
      });
      // Preserving a moment is the app's most meaningful create — confirm it.
      void confirmSuccess();
      // Queue a celebration for the feed. If this very moment completed this
      // week's challenge, celebrate THAT — completion used to be silent (§5).
      let rewardKind: 'moment' | 'challenge' = 'moment';
      if (activeSpace) {
        try {
          const weeklyNow = currentWeeklyChallenge(activeSpace.type);
          const enrollment = (await getEnrollments(activeSpace.id)).find(
            (e) => e.challengeId === weeklyNow.id && inSameIsoWeek(e.joinedAt, new Date()),
          );
          if (enrollment) {
            const dates = memories.map((m) => m.createdAt);
            const before = weeklyProgressFor(weeklyNow, enrollment.joinedAt, dates);
            const after = weeklyProgressFor(weeklyNow, enrollment.joinedAt, [...dates, memory.createdAt]);
            if (!before.complete && after.complete) rewardKind = 'challenge';
          }
        } catch {
          // The celebration must never block the save itself.
        }
      }
      setPendingReward(rewardKind);
      // Close the loop: write memory id back to the saved date so learning
      // can confirm this was a real completed experience.
      if (savedDateId) {
        try {
          await savedDateRepository.update(savedDateId, { memoryId: memory.id });
        } catch {
          // Best-effort; the memory itself is already saved.
        }
        router.replace({
          pathname: '/discover/feedback/[id]',
          params: {
            id: savedDateId,
            memoryId: memory.id,
            title: savedDateTitle ?? '',
            momentId: savedDateMomentId ?? '',
            placeId: placeId ?? '',
            placeName: placeName ?? '',
            placeAddress: placeAddress ?? '',
            placeLat: placeLat ?? '',
            placeLng: placeLng ?? '',
            placeCategory: placeCategory ?? '',
            placeMapsUrl: placeMapsUrl ?? '',
          },
        });
      } else {
        router.replace(`/memory/${memory.id}`);
      }
    } catch {
      // The write failed — tell the user so they don't lose the moment thinking
      // it was saved. Their note stays in the field so they can retry.
      setSaving(false);
      setError(
        t(
          "couldn't save this moment. check your connection and try again.",
          'der Moment konnte nicht gespeichert werden. prüfe deine Verbindung und versuche es erneut.',
        ),
      );
    }
  };

  const handleClose = () => {
    const hasContent = note.trim().length > 0 || !!photoUri;
    if (!hasContent || saving) {
      router.back();
      return;
    }
    Alert.alert(
      t('discard this moment?', 'diesen Moment verwerfen?'),
      t(
        "your note hasn't been saved yet.",
        'deine Notiz wurde noch nicht gespeichert.',
      ),
      [
        { text: t('keep editing', 'weiter bearbeiten'), style: 'cancel' },
        {
          text: t('discard', 'verwerfen'),
          style: 'destructive',
          onPress: () => router.back(),
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel={t('Close', 'Schließen')}
          >
            <Text style={styles.backText}>{t('CLOSE', 'SCHLIESSEN')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('PRESERVE MOMENT', 'MOMENT FESTHALTEN')}</Text>
          {/* One primary action only — it lives at the bottom of the form. */}
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title from the scanned card — confirms the right card was scanned. */}
          {card && (
            <View style={styles.promptSection}>
              <Text style={styles.prompt}>{cardTitle}</Text>
            </View>
          )}

          {/* Photo area — the prominent upload affordance */}
          <PressableScale
            style={[styles.photoArea, !photoUri && styles.photoAreaEmpty]}
            scaleTo={0.985}
            onPress={choosePhoto}
            accessibilityLabel={photoUri ? t('Change photo', 'Foto ändern') : t('Add a photo to this moment', 'Foto zu diesem Moment hinzufügen')}
          >
            {photoUri ? (
              <>
                <FadeInImage source={{ uri: photoUri }} style={styles.photoPreview} />
                <View style={styles.photoChange}>
                  <Ionicons name="camera-reverse-outline" size={16} color={Colors.white} />
                  <Text style={styles.photoChangeText}>{t('CHANGE', 'ÄNDERN')}</Text>
                </View>
              </>
            ) : (
              <View style={styles.photoPlaceholder}>
                <View style={styles.photoIconCircle}>
                  <Ionicons name="camera-outline" size={26} color={MOMENT} />
                </View>
                <Text style={styles.photoText}>{t('ADD A PHOTO', 'FOTO HINZUFÜGEN')}</Text>
                <Text style={styles.photoHint}>{t('take one, or pick from your library · optional', 'aufnehmen oder aus der Galerie wählen · optional')}</Text>
              </View>
            )}
          </PressableScale>

          {/* One human question, not a form label — capture is < 30 seconds. */}
          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>
              {t('how do you want to remember it?', 'wie wollt ihr euch daran erinnern?')}
            </Text>
            <TextInput
              style={styles.noteInput}
              placeholder={notePlaceholder}
              placeholderTextColor={Colors.textSubtle}
              multiline
              value={note}
              onChangeText={setNote}
              textAlignVertical="top"
            />
          </View>

          {error && (
            <View style={styles.errorBlock}>
              <Text style={styles.error} accessibilityLiveRegion="polite">
                {error}
              </Text>
              <TouchableOpacity
                onPress={() => void handleSave()}
                accessibilityRole="button"
                accessibilityLabel={t('Try again', 'Nochmal versuchen')}
              >
                <Text style={styles.errorRetry}>{t('TRY AGAIN', 'NOCHMAL VERSUCHEN')}</Text>
              </TouchableOpacity>
            </View>
          )}

          <PressableScale
            style={[styles.keepButton, ((!note.trim() && !photoUri) || saving) && styles.keepButtonDisabled]}
            onPress={() => void handleSave()}
            disabled={(!note.trim() && !photoUri) || saving}
            accessibilityLabel={t('Preserve this moment', 'Diesen Moment festhalten')}
          >
            <Text style={styles.keepButtonText}>
              {saving ? t('KEEPING…', 'FESTHALTEN…') : t('PRESERVE THIS MOMENT', 'MOMENT FESTHALTEN')}
            </Text>
          </PressableScale>

          <Text style={styles.privateNote}>
            {t(
              // „nur ihr beide" war zweimal falsch: für einen Menschen allein
              // stimmt es nicht, und es verspricht mehr als der Code hält —
              // es gibt keine Verschlüsselung, der Server-Schlüssel umgeht RLS
              // (MANIFESTO §1/§2). „privat in eurem Space" ist wahr, egal wie
              // viele ihr seid, und ist die Formulierung, die das Manifest
              // selbst als richtig benennt.
              'stays private to your space.',
              'bleibt privat in eurem Space.',
            )}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keepButton: {
    height: 56,
    borderRadius: Radii.pill,
    backgroundColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  keepButtonDisabled: { opacity: 0.35 },
  keepButtonText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: Colors.white,
  },
  errorBlock: { gap: 6, marginTop: Spacing.md },
  errorRetry: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    // Ein Fehlertext, den man nicht liest, ist kein Fehlertext: Accents.chili
    // sind auf Papier 3,96:1. AccentInks.chili sind 4,99:1.
    color: AccentInks.chili,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backText: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 1.2,
    color: Colors.textMuted,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: Colors.text,
  },
  content: {
    padding: Spacing.screen,
    gap: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  promptSection: {
    gap: Spacing.sm,
  },
  prompt: {
    ...Typography.title,
  },
  photoArea: {
    backgroundColor: Colors.backgroundCream,
    height: 210,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: Radii.lg,
  },
  photoAreaEmpty: {
    backgroundColor: Accents.cream,
    borderWidth: 1.5,
    borderColor: MOMENT,
    borderStyle: 'dashed',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoChange: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(30,28,26,0.7)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.pill,
  },
  photoChangeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: Colors.white,
  },
  photoPlaceholder: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  photoIconCircle: {
    width: 56,
    height: 56,
    borderRadius: Radii.pill,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  photoText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.text,
  },
  photoHint: {
    fontSize: 11,
    fontWeight: '400',
    // Dieser Hinweis steht im leeren Fotofeld auf `Accents.cream` (#EFE6D4),
    // nicht auf Papier — textSubtle kämen dort nur auf 4,14:1.
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  noteSection: {
    gap: Spacing.sm,
  },
  noteLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: Colors.textSubtle,
  },
  noteInput: {
    fontSize: 15,
    fontWeight: '300',
    color: Colors.text,
    lineHeight: 24,
    minHeight: 120,
    letterSpacing: 0.1,
  },
  privateNote: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textSubtle,
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  error: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.danger,
    lineHeight: 19,
    letterSpacing: 0.1,
  },
});
