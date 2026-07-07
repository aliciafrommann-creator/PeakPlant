import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Opacity } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { spaceRepository } from '../../lib/repositories';
import {
  setSpaceEmoji,
  getSpaceEmoji,
  setCollectibleEmoji,
  getCollectibleEmoji,
  DEFAULT_COLLECTIBLE_EMOJI,
} from '../../lib/spaceCustomization';
import { isSupabaseConfigured } from '../../lib/supabase/client';
import { uploadSpaceAvatar } from '../../lib/supabase/storage';
import { persistPickedPhoto } from '../../lib/photoStorage';
import { confirmSuccess, acknowledgeSelection } from '../../lib/haptics';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import type { Space } from '../../lib/types';

const EMOJI_GRID = [
  // love / warmth
  '♥', '🌸', '🌺', '🌼', '🌻', '🌷',
  // nature
  '🌿', '🍃', '🌱', '🌾', '🪴', '🍂',
  // sky / light
  '🌙', '⭐', '✨', '☁️', '🌈', '☀️',
  // elements
  '🔥', '🌊', '🌶️', '🍊', '🫐', '🌵',
  // creatures / misc
  '🦋', '🐚', '🕊️', '🐝', '🧡', '🤍',
];

// A small, playful set the couple stamps each time they finish a challenge.
const COLLECTIBLE_GRID = [
  '🌶️', '🌻', '🌙', '⭐', '🔥', '🏆',
  '💛', '🦋', '🍀', '🐚', '✨', '🌈',
];

export default function EditSpaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { spaces, refresh } = useSpaces();
  const { t } = useLanguage();

  const space: Space | undefined = spaces.find((s) => s.id === id);

  const [name, setName] = useState(space?.name ?? '');
  const [emoji, setEmoji] = useState<string | undefined>(space?.emoji);
  const [collectible, setCollectible] = useState<string>(space?.collectibleEmoji ?? DEFAULT_COLLECTIBLE_EMOJI);
  // Avatar photo: `photoUri` is a freshly-picked local image; `removePhoto`
  // clears an existing one. Untouched → keep whatever the space already has.
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameInitialized = useRef(false);

  // What the avatar should show right now: a new pick wins, then the existing
  // saved avatar (unless being removed), else the emoji fallback.
  const shownAvatarUrl = photoUri ?? (removePhoto ? undefined : space?.avatarUrl);
  const fallbackEmoji = emoji ?? (space?.type === 'couple' ? '♥' : '✦');

  useEffect(() => {
    if (space && !nameInitialized.current) {
      nameInitialized.current = true;
      setName(space.name);
    }
  }, [space]);

  useEffect(() => {
    if (!id) return;
    void getSpaceEmoji(id).then((e) => {
      if (e) setEmoji(e);
    });
    void getCollectibleEmoji(id).then((e) => {
      if (e) setCollectible(e);
    });
  }, [id]);

  if (!space) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>
            {t('space not found.', 'Space nicht gefunden.')}
          </Text>
          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button">
            <Text style={styles.backLink}>{t('go back', 'zurück')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const pickPhoto = async () => {
    void acknowledgeSelection();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
      setRemovePhoto(false);
    }
  };

  const clearPhoto = () => {
    void acknowledgeSelection();
    setPhotoUri(undefined);
    setRemovePhoto(true);
  };

  const save = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      // Resolve the avatar path to persist. undefined = leave unchanged.
      let avatarPath: string | undefined;
      if (photoUri) {
        // Configured: upload (EXIF stripped) → storage path. Otherwise persist
        // the picked file out of the evictable cache and keep that local path
        // (device-only until Supabase is configured).
        avatarPath = isSupabaseConfigured
          ? await uploadSpaceAvatar(space.id, photoUri)
          : await persistPickedPhoto(photoUri, 'space-avatar');
      } else if (removePhoto) {
        avatarPath = ''; // cleared — display falls back to the emoji
      }

      await spaceRepository.update(space.id, {
        name: name.trim(),
        emoji,
        collectibleEmoji: collectible,
        ...(avatarPath !== undefined ? { avatarPath } : {}),
      });
      // Local write-through: a cache/fallback so the marks survive offline and
      // for spaces created before the server columns existed (0012 / 0013).
      if (emoji) await setSpaceEmoji(space.id, emoji);
      await setCollectibleEmoji(space.id, collectible);
      void confirmSuccess();
      await refresh();
      router.back();
    } catch {
      setBusy(false);
      setError(
        t(
          "couldn't save the changes. please try again.",
          'Änderungen konnten nicht gespeichert werden. Bitte versuche es erneut.',
        ),
      );
    }
  };

  const canSave = name.trim().length > 0 && !busy;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('Close', 'Schliessen')}
          >
            <Text style={styles.close}>{t('CLOSE', 'SCHLIESSEN')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('EDIT SPACE', 'SPACE BEARBEITEN')}</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar preview — photo if set, else the chosen emoji */}
          <View style={styles.avatarWrap}>
            <TouchableOpacity
              style={styles.avatar}
              onPress={pickPhoto}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={shownAvatarUrl ? t('Change space photo', 'Space-Foto ändern') : t('Add a space photo', 'Space-Foto hinzufügen')}
            >
              {shownAvatarUrl ? (
                <Image source={{ uri: shownAvatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarEmoji}>{fallbackEmoji}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.avatarActions}>
              <TouchableOpacity onPress={pickPhoto} accessibilityRole="button" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.avatarAction}>
                  {shownAvatarUrl ? t('change photo', 'Foto ändern') : t('add photo', 'Foto hinzufügen')}
                </Text>
              </TouchableOpacity>
              {shownAvatarUrl && (
                <>
                  <Text style={styles.avatarActionDot}>·</Text>
                  <TouchableOpacity onPress={clearPhoto} accessibilityRole="button" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.avatarActionMuted}>{t('use emoji', 'Emoji nutzen')}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Name input */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('SPACE NAME', 'SPACE-NAME')}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              maxLength={40}
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={save}
              accessibilityLabel={t('Space name', 'Space-Name')}
            />
          </View>

          {/* Emoji grid */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('SPACE EMOJI', 'SPACE-EMOJI')}</Text>
            <View style={styles.grid}>
              {EMOJI_GRID.map((e) => {
                const selected = emoji === e;
                return (
                  <TouchableOpacity
                    key={e}
                    style={[styles.emojiCell, selected && styles.emojiCellActive]}
                    onPress={() => setEmoji(e)}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={e}
                  >
                    <Text style={styles.emojiText}>{e}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Collectible emoji */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('YOUR COLLECTIBLE', 'EUER SAMMELZEICHEN')}</Text>
            <Text style={styles.collectibleHint}>
              {t(
                'you earn one each time you finish a challenge together.',
                'ihr verdient eins, jedes Mal wenn ihr eine Challenge zusammen abschließt.',
              )}
            </Text>
            <View style={styles.grid}>
              {COLLECTIBLE_GRID.map((e) => {
                const selected = collectible === e;
                return (
                  <TouchableOpacity
                    key={e}
                    style={[styles.emojiCell, selected && styles.emojiCellActive]}
                    onPress={() => setCollectible(e)}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={e}
                  >
                    <Text style={styles.emojiText}>{e}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {error && (
            <Text style={styles.error} accessibilityLiveRegion="polite">
              {error}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.primary, !canSave && styles.primaryDisabled]}
            onPress={save}
            disabled={!canSave}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('Save changes', 'Änderungen speichern')}
          >
            {busy ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.primaryText}>{t('SAVE', 'SPEICHERN')}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const CELL_SIZE = 48;

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
  content: { padding: Spacing.screen, gap: Spacing.xl, paddingBottom: Spacing.xxxl },
  avatarWrap: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: Radii.pill,
    backgroundColor: Colors.backgroundCream,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: 80, height: 80, borderRadius: Radii.pill },
  avatarEmoji: { fontSize: 36 },
  avatarActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatarAction: { fontSize: 12, fontWeight: '500', color: Colors.accent, letterSpacing: 0.3 },
  avatarActionMuted: { fontSize: 12, fontWeight: '400', color: Colors.textSubtle, letterSpacing: 0.3 },
  avatarActionDot: { fontSize: 12, color: Colors.textFaint },
  section: { gap: Spacing.sm },
  label: { fontSize: 9, fontWeight: '500', letterSpacing: 3, color: Colors.textFaint },
  input: {
    fontFamily: Typography.editorial.fontFamily,
    fontWeight: '500' as const,
    letterSpacing: -0.4,
    fontSize: 22,
    lineHeight: 28,
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  emojiCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: Radii.md,
    backgroundColor: Colors.backgroundWarm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiCellActive: {
    backgroundColor: Colors.backgroundCream,
    borderColor: Colors.text,
    borderWidth: 2,
  },
  emojiText: { fontSize: 24 },
  collectibleHint: { fontSize: 11, fontWeight: '300', color: Colors.textFaint, lineHeight: 16 },
  error: { fontSize: 13, fontWeight: '400', color: Colors.danger, lineHeight: 19 },
  primary: {
    height: 56,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
    marginTop: Spacing.sm,
  },
  primaryDisabled: { opacity: Opacity.disabled },
  primaryText: { fontSize: 11, fontWeight: '500', letterSpacing: 2.5, color: Colors.white },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  notFoundText: { fontSize: 16, fontWeight: '200', color: Colors.textMuted },
  backLink: { fontSize: 12, fontWeight: '300', color: Colors.textSubtle, letterSpacing: 0.5 },
});
