import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { SEED_CARDS } from '../../lib/seed';
import { memoryRepository } from '../../lib/repositories';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { shareMemory } from '../../lib/share';
import type { Memory } from '../../lib/types';

export default function MemoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [draftNote, setDraftNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    let active = true;
    memoryRepository
      .getById(id)
      .then((m) => {
        if (active) setMemory(m);
      })
      .catch(() => {
        if (active) setMemory(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const card = memory ? SEED_CARDS.find((c) => c.id === memory.cardId) : undefined;

  const startEdit = () => {
    if (!memory) return;
    setDraftNote(memory.note);
    setError(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setError(null);
  };

  const saveEdit = async () => {
    if (!memory || !draftNote.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await memoryRepository.update(memory.id, { note: draftNote.trim() });
      setMemory(updated);
      setEditing(false);
    } catch {
      setError(t("couldn't save your changes. please try again.", 'Anderungen konnten nicht gespeichert werden. Bitte versuche es erneut.'));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    if (!memory) return;
    Alert.alert(
      t('delete this moment?', 'Diesen Moment loschen?'),
      t(
        'this removes it from your diary for everyone in this space. it cannot be undone.',
        'Das entfernt ihn aus eurem Tagebuch fur alle in diesem Space. Das kann nicht ruckgangig gemacht werden.',
      ),
      [
        { text: t('keep it', 'behalten'), style: 'cancel' },
        {
          text: t('delete', 'loschen'),
          style: 'destructive',
          onPress: async () => {
            try {
              await memoryRepository.delete(memory.id);
              router.back();
            } catch {
              setError(t("couldn't delete this moment. please try again.", 'Dieser Moment konnte nicht geloscht werden. Bitte versuche es erneut.'));
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!memory) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>{t('moment not found.', 'Moment nicht gefunden.')}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('Go back', 'Zuruck')}
          >
            <Text style={styles.backLink}>{t('go back', 'zuruck')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = new Date(memory.createdAt).toLocaleDateString(
    t('en-US', 'de-DE'),
    { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  ).toLowerCase();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          {editing ? (
            <>
              <TouchableOpacity
                onPress={cancelEdit}
                accessibilityRole="button"
                accessibilityLabel={t('Cancel editing', 'Bearbeitung abbrechen')}
              >
                <Text style={styles.backText}>{t('CANCEL', 'ABBRECHEN')}</Text>
              </TouchableOpacity>
              <Text style={styles.headerLabel}>{t('EDIT', 'BEARBEITEN')}</Text>
              <TouchableOpacity
                onPress={saveEdit}
                disabled={!draftNote.trim() || busy}
                accessibilityRole="button"
                accessibilityLabel={t('Save changes', 'Anderungen speichern')}
                style={styles.shareHit}
              >
                <Text style={[styles.shareText, (!draftNote.trim() || busy) && styles.disabled]}>
                  {busy ? t('SAVING...', 'SPEICHERT...') : t('SAVE', 'SPEICHERN')}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel={t('Back', 'Zuruck')}
              >
                <Text style={styles.backText}>{'<-'} {t('BACK', 'ZURUCK')}</Text>
              </TouchableOpacity>
              <Text style={styles.headerLabel}>{t('MOMENT', 'MOMENT')}</Text>
              <TouchableOpacity
                onPress={() => shareMemory(memory, card).catch(() => {})}
                accessibilityRole="button"
                accessibilityLabel={t('Share this moment', 'Diesen Moment teilen')}
                style={styles.shareHit}
              >
                <Text style={styles.shareText}>{t('SHARE', 'TEILEN')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {memory.photoUri && (
            <Image source={{ uri: memory.photoUri }} style={styles.photo} />
          )}

          <View style={styles.body}>
            {card && (
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>{t('CARD', 'KARTE')} {String(card.number).padStart(2, '0')}</Text>
                <Text style={styles.prompt}>{card.prompt}</Text>
              </View>
            )}

            <View style={styles.divider} />

            {editing ? (
              <TextInput
                style={styles.noteInput}
                value={draftNote}
                onChangeText={setDraftNote}
                multiline
                autoFocus
                textAlignVertical="top"
                placeholder={t('what do you want to remember about this moment?', 'was mochtest du von diesem Moment festhalten?')}
                placeholderTextColor={Colors.textFaint}
              />
            ) : (
              <Text style={styles.note}>{memory.note}</Text>
            )}

            {error && (
              <Text style={styles.error} accessibilityLiveRegion="polite">
                {error}
              </Text>
            )}

            <Text style={styles.date}>{formattedDate}</Text>

            {!editing && (
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={startEdit}
                  accessibilityRole="button"
                  accessibilityLabel={t('Edit this moment', 'Diesen Moment bearbeiten')}
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionText}>{t('EDIT NOTE', 'NOTIZ BEARBEITEN')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmDelete}
                  accessibilityRole="button"
                  accessibilityLabel={t('Delete this moment', 'Diesen Moment loschen')}
                  style={styles.actionBtn}
                >
                  <Text style={[styles.actionText, styles.deleteText]}>{t('DELETE', 'LOSCHEN')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
    letterSpacing: 1.5,
    color: Colors.textMuted,
    width: 60,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.text,
  },
  shareHit: { width: 60, alignItems: 'flex-end' },
  shareText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.5,
    color: Colors.textSubtle,
  },
  disabled: { opacity: 0.3 },
  photo: {
    width: '100%',
    height: 280,
    backgroundColor: Colors.backgroundCream,
  },
  body: {
    padding: Spacing.screen,
    gap: Spacing.lg,
  },
  cardInfo: {
    gap: Spacing.sm,
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.textSubtle,
  },
  prompt: {
    ...Typography.editorial,
    fontSize: 22,
    lineHeight: 30,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  note: {
    fontSize: 17,
    fontWeight: '300',
    color: Colors.text,
    lineHeight: 28,
    letterSpacing: 0.05,
  },
  noteInput: {
    fontSize: 16,
    fontWeight: '300',
    color: Colors.text,
    lineHeight: 26,
    letterSpacing: 0.1,
    minHeight: 120,
  },
  date: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 1.5,
    color: Colors.textFaint,
    textTransform: 'uppercase',
  },
  error: {
    fontSize: 13,
    fontWeight: '400',
    color: '#b42318',
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.lg,
    marginTop: Spacing.sm,
  },
  actionBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.pill,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2,
    color: Colors.textMuted,
  },
  deleteText: { color: '#b42318' },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '200',
    color: Colors.textMuted,
  },
  backLink: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.textSubtle,
    letterSpacing: 0.5,
  },
});
