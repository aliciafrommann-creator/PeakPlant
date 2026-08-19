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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Opacity } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { spaceRepository } from '../../lib/repositories';
import { glyphForSpace } from '../../lib/spaceTheme';
import { voice } from '../../lib/voice';
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
import { FadeInImage } from '../../components/ui/FadeInImage';
import { confirmSuccess, acknowledgeSelection } from '../../lib/haptics';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { getActiveUser } from '../../lib/session';
import type { Space, SpaceMember } from '../../lib/types';

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
  const fallbackEmoji = emoji ?? glyphForSpace(space?.type);
  const v = voice(space?.type);

  useEffect(() => {
    if (space && !nameInitialized.current) {
      nameInitialized.current = true;
      setName(space.name);
    }
  }, [space]);

  // WHO IS HERE — the members list makes "private to your space" checkable.
  const [members, setMembers] = useState<SpaceMember[]>([]);
  useEffect(() => {
    if (!id) return;
    let alive = true;
    void spaceRepository
      .getMembers(id)
      .then((m) => {
        if (alive) setMembers(m);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [id]);

  /**
   * Einen Solo-Space öffnen (Migration 0024, `open_space`).
   *
   * Bewusst hier und nicht auf dem Startbildschirm: Wer „nur ich" gewählt hat,
   * soll nicht bei jedem Öffnen der App gefragt werden, ob nicht doch jemand
   * dazu soll. Der Weg existiert, er ist ruhig, und er kostet nichts — es ist
   * derselbe Space, dieselben Momente, derselbe Code (MANIFESTO §3).
   */
  const confirmOpen = () => {
    if (!space) return;
    const öffne = (typ: 'couple' | 'friends') => {
      void (async () => {
        setBusy(true);
        try {
          await spaceRepository.openSpace(space.id, typ);
          await refresh();
          void confirmSuccess();
          router.back();
        } catch {
          setError(
            t(
              "couldn't open this space. please try again.",
              'Der Space ließ sich nicht öffnen. Versuch es gleich nochmal.',
            ),
          );
        } finally {
          setBusy(false);
        }
      })();
    };
    Alert.alert(
      t('open this space up?', 'Diesen Space öffnen?'),
      t(
        'everything you kept stays exactly where it is. your invite code starts working, and whoever joins sees this diary. it cannot be turned back — that would lock someone out.',
        'Alles, was du festgehalten hast, bleibt genau da, wo es ist. Dein Einladungscode fängt an zu funktionieren, und wer beitritt, sieht dieses Tagebuch. Zurück geht es nicht — das würde jemanden aussperren.',
      ),
      [
        { text: t('not now', 'jetzt nicht'), style: 'cancel' },
        { text: t('for a couple', 'für ein Paar'), onPress: () => öffne('couple') },
        { text: t('for friends', 'für Freunde'), onPress: () => öffne('friends') },
      ],
    );
  };

  const confirmLeave = () => {
    if (!space) return;
    Alert.alert(
      t('leave this space?', 'Diesen Space verlassen?'),
      t(
        'you lose access to this shared diary. nothing shared gets deleted — the others keep every moment.',
        'Du verlierst den Zugang zu diesem gemeinsamen Tagebuch. Nichts Geteiltes wird gelöscht — die anderen behalten jeden Moment.',
      ),
      [
        { text: t('stay', 'bleiben'), style: 'cancel' },
        {
          text: t('leave', 'verlassen'),
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setBusy(true);
              try {
                const user = await getActiveUser();
                if (!user) throw new Error('no user');
                await spaceRepository.leave(space.id, user.id);
                await refresh();
                void confirmSuccess();
                router.back();
              } catch {
                setError(
                  t(
                    "couldn't leave the space. please try again.",
                    'Der Space ließ sich nicht verlassen. Versuch es gleich nochmal.',
                  ),
                );
              } finally {
                setBusy(false);
              }
            })();
          },
        },
      ],
    );
  };

  // Local values are a FALLBACK only. The server value (already resolved into
  // `space` by useSpaces) wins — otherwise a stale local emoji silently
  // overwrites the partner's newer choice on the next save (audit A2-4.1).
  useEffect(() => {
    if (!id) return;
    if (!space?.emoji) {
      void getSpaceEmoji(id).then((e) => {
        if (e) setEmoji(e);
      });
    }
    if (!space?.collectibleEmoji) {
      void getCollectibleEmoji(id).then((e) => {
        if (e) setCollectible(e);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            accessibilityLabel={t('Close', 'Schließen')}
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
                <FadeInImage source={{ uri: shownAvatarUrl }} style={styles.avatarImage} />
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
            <Text style={styles.label}>{t(v.collectibleLabel.en, v.collectibleLabel.de)}</Text>
            <Text style={styles.collectibleHint}>
              {t(v.collectibleHint.en, v.collectibleHint.de)}
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

          {/* Trust: WHO IS HERE — you can only trust "private to your space"
              if you can see who your space is (audit A2-10.3). */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('WHO IS HERE', 'WER IST HIER')}</Text>
            {members.length === 0 ? (
              <Text style={styles.memberHint}>
                {t('just you so far.', 'bisher nur du.')}
              </Text>
            ) : (
              members.map((m) => (
                <View key={m.id} style={styles.memberRow}>
                  <Text style={styles.memberName}>{m.name || t('member', 'Mitglied')}</Text>
                  <Text style={styles.memberMeta}>
                    {t(
                      `since ${new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
                      `seit ${new Date(m.joinedAt).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}`,
                    )}
                  </Text>
                </View>
              ))
            )}
            {/* In einem Solo-Space lässt der Code NIEMANDEN herein — dieser
                Satz stand dort trotzdem, vier Zeilen über dem Block, der das
                Gegenteil sagt (MANIFESTO §1). */}
            {space.type !== 'solo' && (
              <Text style={styles.memberHint}>
                {t(
                  // „the invite code above" zeigte auf etwas, das auf diesem
                  // Bildschirm gar nicht steht (hier gibt es Name, Emoji,
                  // Sammelstück und Mitglieder — keinen Code).
                  // anrede-ok: hängt an `space.type !== 'solo'` — ein Solo-Space
                  // hat weder Mitglieder noch einen Code und sieht das nie.
                  'everyone here can see your shared diary. your invite code lets people in — share it only with people you trust.',
                  'alle hier sehen euer gemeinsames Tagebuch. Der Einladungscode lässt Menschen herein — teil ihn nur mit Menschen, denen du vertraust.',
                )}
              </Text>
            )}
          </View>

          {/* Der eine Weg aus dem Solo-Space heraus. Nur sichtbar, wenn es
              ihn überhaupt gibt — in einem geteilten Space wäre die Frage
              schon beantwortet. */}
          {space.type === 'solo' && (
            <View style={styles.section}>
              <Text style={styles.label}>{t('JUST YOU, FOR NOW', 'BIS HIER NUR DU')}</Text>
              <Text style={styles.memberHint}>
                {t(
                  'this space is for one person. if you ever want someone in it, you can open it up — nothing you kept is lost.',
                  'Dieser Space ist für eine Person. Wenn du irgendwann jemanden darin haben willst, kannst du ihn öffnen — nichts von dem, was du festgehalten hast, geht dabei verloren.',
                )}
              </Text>
              <TouchableOpacity
                style={styles.openBtn}
                onPress={confirmOpen}
                disabled={busy}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={t('Open this space up', 'Diesen Space öffnen')}
              >
                <Text style={styles.openText}>{t('OPEN THIS SPACE UP', 'DIESEN SPACE ÖFFNEN')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quiet exit — leaving takes away access, it deletes nothing shared. */}
          <TouchableOpacity
            style={styles.leaveBtn}
            onPress={confirmLeave}
            disabled={busy}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('Leave this space', 'Diesen Space verlassen')}
          >
            <Text style={styles.leaveText}>{t('LEAVE THIS SPACE', 'DIESEN SPACE VERLASSEN')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const CELL_SIZE = 48;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  memberName: { fontSize: 14, fontWeight: '400', color: Colors.text },
  memberMeta: { fontSize: 11, fontWeight: '300', color: Colors.textSubtle },
  memberHint: { fontSize: 12, fontWeight: '300', color: Colors.textMuted, lineHeight: 18, marginTop: 8 },
  openBtn: {
    minHeight: 44,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xs,
  },
  openText: { fontSize: 11, fontWeight: '600', letterSpacing: 1.4, color: Colors.text },
  leaveBtn: { alignItems: 'center', paddingVertical: 18, marginTop: 4 },
  leaveText: { fontSize: 11, fontWeight: '500', letterSpacing: 1.2, color: '#B04A38' },
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
  avatarEmoji: { fontSize: 30 },
  avatarActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatarAction: { fontSize: 12, fontWeight: '500', color: Colors.accentInk, letterSpacing: 0.3 },
  avatarActionMuted: { fontSize: 12, fontWeight: '400', color: Colors.textSubtle, letterSpacing: 0.3 },
  avatarActionDot: { fontSize: 12, color: Colors.textSubtle },
  section: { gap: Spacing.sm },
  label: { fontSize: 11, fontWeight: '500', letterSpacing: 1.2, color: Colors.textSubtle },
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
  collectibleHint: { fontSize: 11, fontWeight: '300', color: Colors.textSubtle, lineHeight: 16 },
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
  primaryText: { fontSize: 11, fontWeight: '500', letterSpacing: 1.2, color: Colors.white },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  notFoundText: { fontSize: 16, fontWeight: '200', color: Colors.textMuted },
  backLink: { fontSize: 12, fontWeight: '300', color: Colors.textSubtle, letterSpacing: 0.5 },
});
