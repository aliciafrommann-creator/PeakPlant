import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SEED_CARDS } from '../../lib/seed';
import { memoryRepository } from '../../lib/repositories';
import { shareMemory } from '../../lib/share';
import type { Memory } from '../../lib/types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).toLowerCase();
}

export default function MemoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [draftNote, setDraftNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError("couldn't save your changes. please try again.");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    if (!memory) return;
    Alert.alert(
      'delete this moment?',
      'this removes it from your diary for everyone in this space. it cannot be undone.',
      [
        { text: 'keep it', style: 'cancel' },
        {
          text: 'delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await memoryRepository.delete(memory.id);
              router.back();
            } catch {
              setError("couldn't delete this moment. please try again.");
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
          <Text style={styles.notFoundText}>moment not found.</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backLink}>go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
                accessibilityLabel="Cancel editing"
              >
                <Text style={styles.backText}>CANCEL</Text>
              </TouchableOpacity>
              <Text style={styles.headerLabel}>EDIT</Text>
              <TouchableOpacity
                onPress={saveEdit}
                disabled={!draftNote.trim() || busy}
                accessibilityRole="button"
                accessibilityLabel="Save changes"
                style={styles.shareHit}
              >
                <Text style={[styles.shareText, (!draftNote.trim() || busy) && styles.disabled]}>
                  {busy ? 'SAVING…' : 'SAVE'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Back"
              >
                <Text style={styles.backText}>← BACK</Text>
              </TouchableOpacity>
              <Text style={styles.headerLabel}>MOMENT</Text>
              <TouchableOpacity
                onPress={() => shareMemory(memory, card).catch(() => {})}
                accessibilityRole="button"
                accessibilityLabel="Share this moment"
                style={styles.shareHit}
              >
                <Text style={styles.shareText}>SHARE</Text>
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
                <Text style={styles.cardLabel}>CARD {String(card.number).padStart(2, '0')}</Text>
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
                placeholder="what do you want to remember about this moment?"
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

            <Text style={styles.date}>{formatDate(memory.createdAt)}</Text>

            {!editing && (
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={startEdit}
                  accessibilityRole="button"
                  accessibilityLabel="Edit this moment"
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionText}>EDIT NOTE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmDelete}
                  accessibilityRole="button"
                  accessibilityLabel="Delete this moment"
                  style={styles.actionBtn}
                >
                  <Text style={[styles.actionText, styles.deleteText]}>DELETE</Text>
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
    color: Colors.accent,
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
    color: Colors.accent,
  },
  prompt: {
    fontSize: 22,
    fontWeight: '200',
    color: Colors.text,
    lineHeight: 30,
    letterSpacing: -0.2,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  note: {
    fontSize: 16,
    fontWeight: '300',
    color: Colors.text,
    lineHeight: 26,
    letterSpacing: 0.1,
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
  actionBtn: { paddingVertical: Spacing.xs },
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
    color: Colors.accent,
    letterSpacing: 0.5,
  },
});
