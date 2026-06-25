import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Accents } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { useNotes } from '../../lib/hooks/useNotes';

const MAX_CHARS = 280;

export default function ComposeNoteScreen() {
  const { activeSpace } = useSpaces();
  const { t } = useLanguage();
  const { sendNote } = useNotes(activeSpace?.id);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const remaining = MAX_CHARS - text.length;
  const canSend = text.trim().length > 0 && !sending;

  async function handleSend() {
    if (!canSend) return;
    setSending(true);
    try {
      await sendNote(text);
      router.back();
    } catch {
      Alert.alert(
        t('Error', 'Fehler'),
        t('Could not save note.', 'Notiz konnte nicht gespeichert werden.'),
      );
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel={t('Go back', 'Zurück')}
        >
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('NOTE', 'NOTIZ')}</Text>
        <View style={styles.titleSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.noteArea}>
          <Text style={styles.addressee}>
            {(activeSpace?.name ?? t('partner', 'partner')).toLowerCase()} ♥
          </Text>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={(v) => setText(v.slice(0, MAX_CHARS))}
            placeholder={t('write something beautiful...', 'schreib etwas Schönes...')}
            placeholderTextColor={Colors.textFaint}
            multiline
            autoFocus
            textAlignVertical="top"
            returnKeyType="default"
          />
          <Text style={[styles.counter, remaining < 40 && styles.counterWarn]}>
            {remaining}
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.cta, !canSend && styles.ctaDisabled]}
            onPress={handleSend}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel={t('Send note', 'Notiz senden')}
          >
            <Text style={styles.ctaText}>
              {sending ? t('SAVING...', 'SPEICHERT...') : t('SEND', 'SENDEN')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundCream },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  back: {
    fontSize: 22,
    fontWeight: '300',
    color: Colors.text,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    color: Colors.textSubtle,
  },
  titleSpacer: { width: 32 },
  noteArea: {
    flex: 1,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xl,
  },
  addressee: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1,
    color: Accents.apricot,
    marginBottom: Spacing.lg,
  },
  input: {
    ...Typography.editorial,
    fontSize: 22,
    lineHeight: 32,
    color: Colors.text,
    flex: 1,
    textAlignVertical: 'top',
  },
  counter: {
    fontSize: 11,
    color: Colors.textFaint,
    textAlign: 'right',
    marginTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  counterWarn: {
    color: Accents.chili,
  },
  footer: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.backgroundCream,
  },
  cta: {
    height: 52,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  ctaDisabled: {
    opacity: 0.3,
  },
  ctaText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.5,
    color: Colors.white,
  },
});
