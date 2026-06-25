import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Accents, Sections } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useMemories } from '../../lib/hooks/useMemories';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { savedDateRepository } from '../../lib/repositories';
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
  const { createMemory } = useMemories(activeSpace?.id);

  const { t, l } = useLanguage();
  const selectedCardId = cardId ?? 'card-01';
  const card = SEED_CARDS.find((c) => c.id === selectedCardId);

  const cardTitle = card?.content ? l(card.content.title) : card?.prompt ?? '';
  const notePlaceholder = t(
    'what do you want to remember about this moment?',
    'was möchtest du von diesem Moment festhalten?'
  );

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!note.trim()) return;
    if (!activeSpace) {
      setError(
        t(
          'no active space — set one up first, then preserve this moment.',
          'kein aktiver Raum — richte zuerst einen ein, dann halte diesen Moment fest.',
        ),
      );
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const memory = await createMemory({
        cardId: selectedCardId,
        note: note.trim(),
        photoUri,
      });
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
    } catch (_e) {
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
          <TouchableOpacity
            onPress={handleSave}
            disabled={!note.trim() || saving}
            accessibilityRole="button"
            accessibilityLabel={t('Save moment', 'Moment speichern')}
          >
            <Text style={[styles.saveText, (!note.trim() || saving) && styles.saveDisabled]}>
              {saving ? t('SAVING…', 'SPEICHERT…') : t('SAVE', 'SPEICHERN')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title from the scanned card — confirms the right card was scanned. */}
          {card && (
            <View style={styles.promptSection}>
              <Text style={styles.prompt}>{cardTitle}</Text>
            </View>
          )}

          {/* Photo area — the prominent upload affordance */}
          <TouchableOpacity
            style={[styles.photoArea, !photoUri && styles.photoAreaEmpty]}
            activeOpacity={0.85}
            onPress={pickPhoto}
            accessibilityRole="button"
            accessibilityLabel={photoUri ? t('Change photo', 'Foto ändern') : t('Add a photo to this moment', 'Foto zu diesem Moment hinzufügen')}
          >
            {photoUri ? (
              <>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
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
                <Text style={styles.photoHint}>{t('upload from your library · optional', 'aus der Galerie hochladen · optional')}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Note input */}
          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>{t('YOUR NOTE', 'DEINE NOTIZ')}</Text>
            <TextInput
              style={styles.noteInput}
              placeholder={notePlaceholder}
              placeholderTextColor={Colors.textFaint}
              multiline
              value={note}
              onChangeText={setNote}
              textAlignVertical="top"
            />
          </View>

          {error && (
            <Text style={styles.error} accessibilityLiveRegion="polite">
              {error}
            </Text>
          )}

          <Text style={styles.privateNote}>
            {t(
              'a moment worth keeping. this stays private.',
              'ein Moment, den es sich zu bewahren lohnt. das bleibt privat.',
            )}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 2,
    color: Colors.textMuted,
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2.5,
    color: Colors.text,
  },
  saveText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: Colors.accent,
  },
  saveDisabled: {
    opacity: 0.3,
    color: Colors.textFaint,
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
    ...Typography.editorial,
    fontSize: 24,
    lineHeight: 30,
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
    fontSize: 9,
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
    letterSpacing: 2,
    color: Colors.text,
  },
  photoHint: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.textSubtle,
    letterSpacing: 0.3,
  },
  noteSection: {
    gap: Spacing.sm,
  },
  noteLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.textFaint,
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
    color: Colors.textFaint,
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  error: {
    fontSize: 13,
    fontWeight: '400',
    color: '#b42318',
    lineHeight: 19,
    letterSpacing: 0.1,
  },
});
