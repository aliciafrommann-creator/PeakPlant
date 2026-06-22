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
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useMemories } from '../../lib/hooks/useMemories';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { savedDateRepository } from '../../lib/repositories';
import { SEED_CARDS } from '../../lib/seed';

export default function CreateMemoryScreen() {
  const { cardId, prefillNote, savedDateId, savedDateTitle, savedDateMomentId } =
    useLocalSearchParams<{
      cardId?: string;
      prefillNote?: string;
      savedDateId?: string;
      savedDateTitle?: string;
      savedDateMomentId?: string;
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

          {/* Photo area */}
          <TouchableOpacity
            style={styles.photoArea}
            activeOpacity={0.8}
            onPress={pickPhoto}
            accessibilityRole="button"
            accessibilityLabel={photoUri ? t('Change photo', 'Foto andern') : t('Add a photo (optional)', 'Foto hinzufugen (optional)')}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoIcon}>○</Text>
                <Text style={styles.photoText}>{t('ADD PHOTO', 'FOTO HINZUFUGEN')}</Text>
                <Text style={styles.photoHint}>{t('optional', 'optional')}</Text>
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
              autoFocus
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
    fontWeight: '500',
    letterSpacing: 2.5,
    color: Colors.text,
  },
  saveText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2,
    color: Colors.accent,
  },
  saveDisabled: {
    opacity: 0.3,
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
    fontSize: 22,
    fontWeight: '200',
    color: Colors.text,
    lineHeight: 30,
    letterSpacing: -0.2,
  },
  photoArea: {
    backgroundColor: Colors.backgroundCream,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  photoIcon: {
    fontSize: 32,
    color: Colors.border,
  },
  photoText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2.5,
    color: Colors.textFaint,
  },
  photoHint: {
    fontSize: 10,
    fontWeight: '300',
    color: Colors.textFaint,
    letterSpacing: 0.5,
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
