import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../../components/ui/BackButton';
import { Colors, AccentInks } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { voice } from '../../lib/voice';
import { useNotes } from '../../lib/hooks/useNotes';
import { confirmSuccess } from '../../lib/haptics';
import { relativeDay } from '../../lib/relativeTime';
import { PressableScale } from '../../components/ui/PressableScale';

const MAX_CHARS = 280;

export default function ComposeNoteScreen() {
  const { activeSpace } = useSpaces();
  const v = voice(activeSpace?.type);
  const { t, language } = useLanguage();
  const { notes, loading, error: notesError, userId, sendNote, deleteNote } = useNotes(activeSpace?.id);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  /** Nur eigene Notizen, und nur nach Rückfrage — Löschen ist endgültig. */
  const confirmDelete = useCallback(
    (id: string) => {
      Alert.alert(
        t('delete this note?', 'diese Notiz löschen?'),
        t(v.noteDeleteWarning.en, v.noteDeleteWarning.de),
        [
          { text: t('cancel', 'Abbrechen'), style: 'cancel' },
          {
            text: t('delete', 'löschen'),
            style: 'destructive',
            onPress: () => {
              void deleteNote(id).catch(() =>
                Alert.alert(
                  t('Error', 'Fehler'),
                  t('Could not delete the note.', 'Notiz konnte nicht gelöscht werden.'),
                ),
              );
            },
          },
        ],
      );
    },
    [deleteNote, t, v.noteDeleteWarning.en, v.noteDeleteWarning.de],
  );

  const remaining = MAX_CHARS - text.length;
  const canSend = text.trim().length > 0 && !sending;

  async function handleSend() {
    if (!canSend) return;
    setSending(true);
    try {
      await sendNote(text);
      void confirmSuccess();
      // Vorher sprang der Bildschirm nach dem Senden zurück — und die Notiz
      // war weg, denn niemand zeigte sie je wieder an. Jetzt bleibt man hier
      // und sieht sie unten erscheinen: eine Handlung mit sichtbarer Folge
      // (MANIFESTO §5).
      setText('');
      setSending(false);
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
        <BackButton variant="close" width={32} />
        <Text style={styles.title}>{t('NOTE', 'NOTIZ')}</Text>
        <View style={styles.titleSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.composer}>
          <Text style={styles.addressee}>
            {/* Das Herz gehört zu einer zweiten Person. Im Solo-Space steht
                dort eine Notiz an sich selbst — ohne Empfänger, ohne Herz. */}
            {activeSpace?.type === 'solo'
              ? t(v.noteAddresseeFallback.en, v.noteAddresseeFallback.de)
              : `${(activeSpace?.name ?? t(v.noteAddresseeFallback.en, v.noteAddresseeFallback.de)).toLowerCase()} ♥`}
          </Text>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={(v) => setText(v.slice(0, MAX_CHARS))}
            placeholder={t('write something beautiful...', 'schreib etwas Schönes...')}
            placeholderTextColor={Colors.textSubtle}
            multiline
            autoFocus
            textAlignVertical="top"
            returnKeyType="default"
          />
          {/* Der Zähler gehört UNTER das Feld — er zählt, was darin steht.
              Solange das Feld keine Höhe hatte, stand er darüber und sah aus
              wie eine Angabe zum Bildschirm. */}
          <Text style={[styles.counter, remaining < 40 && styles.counterWarn]}>
            {remaining}
          </Text>
        </View>

        {/* Die geschriebenen Notizen. Bis zum 18.08.2026 zeigte sie NIEMAND:
            `noteRepository` speicherte sie, der Startbildschirm rendert nur
            die letzte Notiz DES PARTNERS, und dieser Bildschirm zeigte gar
            nichts. Wer allein im Space ist — und das sind heute alle —
            schrieb ins Leere. */}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!loading && notes.length === 0 && (
            <Text style={styles.emptyNote}>
              {notesError
                ? t(
                    'we could not load your notes just now — nothing is lost.',
                    'wir konnten die Notizen gerade nicht laden — nichts davon ist weg.',
                  )
                : t(
                    v.noteStaysHere.en,
                    v.noteStaysHere.de,
                  )}
            </Text>
          )}
          {notes.map((n) => {
            const mine = !n.authorId || n.authorId === userId;
            return (
              <PressableScale
                key={n.id}
                containerStyle={styles.noteSlot}
                style={[styles.note, mine ? styles.noteMine : styles.noteTheirs]}
                scaleTo={0.99}
                haptic={false}
                onLongPress={mine ? () => confirmDelete(n.id) : undefined}
                accessibilityLabel={`${mine ? t('you wrote', 'du hast geschrieben') : (n.authorName ?? t('your person', 'dein Mensch'))}: ${n.text}`}
                accessibilityHint={mine ? t('Hold to delete', 'Gedrückt halten zum Löschen') : undefined}
              >
                <Text style={styles.noteText}>{n.text}</Text>
                <Text style={styles.noteMeta}>
                  {mine ? t('you', 'du') : (n.authorName ?? t('your person', 'dein Mensch'))}
                  {'  ·  '}
                  {relativeDay(n.createdAt, language)}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>

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
  composer: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.md,
    gap: Spacing.xs,
  },
  list: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyNote: {
    // Kleiner und leiser als das Eingabefeld — sonst liest man ihn als
    // Platzhalter und wundert sich, warum das Tippen nichts ändert.
    ...Typography.micro,
    color: Colors.textSubtle,
    lineHeight: 18,
  },
  noteSlot: {},
  note: {
    padding: Spacing.md,
    borderRadius: Radii.sm,
    gap: 6,
  },
  noteMine: {
    backgroundColor: Colors.backgroundWarm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  /** Vom anderen Menschen: warm hervorgehoben — das ist das Wertvollste hier. */
  noteTheirs: {
    backgroundColor: Colors.backgroundCream,
    borderLeftWidth: 2,
    borderLeftColor: Colors.accent,
  },
  noteText: {
    ...Typography.editorial,
    fontSize: 16,
    lineHeight: 23,
    color: Colors.text,
  },
  noteMeta: {
    ...Typography.micro,
    color: Colors.textMuted,
  },
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
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.textSubtle,
  },
  titleSpacer: { width: 32 },
  addressee: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1,
    // Auf `backgroundCream` war Accents.apricot 2,38:1 — der schlechteste
    // Textwert der App, ausgerechnet an der Anrede. Jetzt 5,04:1.
    color: AccentInks.apricot,
    marginBottom: Spacing.lg,
  },
  input: {
    // DAS FELD WAR UNSICHTBAR. `flex: 1` in einem Elternteil OHNE eigene
    // Höhe ergibt null — das Eingabefeld war ein Schlitz von wenigen Punkten,
    // und was darunter stand („nothing written yet…") sah aus wie sein
    // Platzhalter, war aber ein anderer Text. Alicia, 19.08.2026: „hier kann
    // ich nicht schreiben … bzw. man sieht es nicht."
    //
    // Eine feste Mindesthöhe statt `flex`: Das Feld ist jetzt ein Blatt, auf
    // das man schreibt, und wächst mit dem Text.
    ...Typography.body,
    color: Colors.text,
    minHeight: 132,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  counter: {
    fontSize: 11,
    color: Colors.textSubtle,
    textAlign: 'right',
    marginTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  counterWarn: {
    // 4,01:1 auf backgroundCream → 5,05:1.
    color: AccentInks.chili,
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
    letterSpacing: 1.2,
    color: Colors.white,
  },
});
