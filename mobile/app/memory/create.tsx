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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useMemories } from '../../lib/hooks/useMemories';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { SEED_CARDS } from '../../lib/seed';

export default function CreateMemoryScreen() {
  const { cardId } = useLocalSearchParams<{ cardId?: string }>();
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
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
    if (!note.trim() || !activeSpace) return;
    setSaving(true);
    try {
      const memory = await createMemory({
        cardId: selectedCardId,
        note: note.trim(),
        photoUri,
      });
      router.replace(`/memory/${memory.id}`);
    } catch (_e) {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>CLOSE</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PRESERVE MOMENT</Text>
          <TouchableOpacity onPress={handleSave} disabled={!note.trim() || saving}>
            <Text style={[styles.saveText, (!note.trim() || saving) && styles.saveDisabled]}>
              SAVE
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
            accessibilityLabel={photoUri ? 'Change photo' : 'Add a photo (optional)'}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoIcon}>○</Text>
                <Text style={styles.photoText}>ADD PHOTO</Text>
                <Text style={styles.photoHint}>optional</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Note input */}
          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>YOUR NOTE</Text>
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

          <Text style={styles.privateNote}>
            a moment worth keeping. this stays private.
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
});
