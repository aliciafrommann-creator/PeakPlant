import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { PressableScale } from '../ui/PressableScale';
import { shareRepository } from '../../lib/repositories';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { voice } from '../../lib/voice';
import { checkShare, titleFor, challengeAnchor, SHARE_TITLE_MAX } from '../../lib/sharing';
import { confirmSuccess } from '../../lib/haptics';
import type { Share } from '../../lib/types';

interface ShareToChallengeProps {
  memoryId: string;
  spaceId: string;
  /** Die laufende Wochen-Challenge — der Anker dieses Publikums. */
  challengeId: string;
  challengeTitle: string;
  /** Der Kartentitel, falls der Moment von einer Karte kam. */
  cardTitle?: string;
  t: (en: string, de: string) => string;
}

/**
 * Diesen Moment an die Wochen-Challenge freigeben.
 *
 * WARUM HIER UND WARUM SO LEISE: Nach `klarheit` K1/K3 hat dieser Bildschirm
 * genau ein Hauptobjekt — den Moment — und seine lauten Handlungen sind
 * Bearbeiten und Löschen. Teilen ist eine dritte Möglichkeit, kein drittes
 * Ziel; es steht deshalb als ruhiger Block darunter und nicht als Pille.
 *
 * WARUM DIE WOCHEN-CHALLENGE: Ein Publikum füllt sich nur, wenn sein Anker
 * existiert, BEVOR jemand etwas hineinlegt (Strava-Segmente, Letterboxd hängt
 * alles an dem Film). Alle Spaces haben in derselben Woche dieselbe Challenge —
 * das ist der einzige Anker, der ab Tag eins nicht leer ist.
 *
 * DIE GRENZE, SICHTBAR GEMACHT: Der Titel wird NIE aus der Notiz vorbefüllt
 * (siehe lib/sharing.ts). Was mitgeht und was nicht, steht wörtlich über dem
 * Feld — nicht im Kleingedruckten, sondern da, wo die Entscheidung fällt
 * (MANIFESTO §2).
 */
export function ShareToChallenge({
  memoryId,
  spaceId,
  challengeId,
  challengeTitle,
  cardTitle,
  t,
}: ShareToChallengeProps) {
  // Die Anrede der Grenze richtet sich nach der Art des Space: in einem
  // Solo-Space gibt es keine „Namen" im Plural (lib/voice.ts).
  const { spaces } = useSpaces();
  const vo = voice(spaces.find((s) => s.id === spaceId)?.type);
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');

  const load = useCallback(() => {
    let alive = true;
    setFailed(false);
    shareRepository
      .forMemory(memoryId)
      .then((s) => { if (alive) { setShares(s); setLoading(false); } })
      .catch(() => { if (alive) { setFailed(true); setLoading(false); } });
    return () => { alive = false; };
  }, [memoryId]);

  useEffect(() => load(), [load]);

  const start = () => {
    // Vorschlag aus Karte oder Thema — nie aus der Notiz.
    setTitle(titleFor({ cardTitle, themeTitle: challengeTitle }));
    setComposing(true);
  };

  async function submit() {
    if (busy) return;
    const geprueft = checkShare({ memoryId, audienceId: 'pending', title });
    if (!geprueft.ok) {
      // Nur der Titel kann hier fehlen; Moment und Publikum stehen fest.
      Alert.alert(
        t('a word is missing', 'ein Wort fehlt'),
        t(
          'write what should be visible — it is the only thing others will read.',
          'schreib, was sichtbar sein soll — mehr lesen die anderen nicht.',
        ),
      );
      return;
    }
    setBusy(true);
    try {
      const audience = await shareRepository.audienceFor('theme', challengeAnchor(challengeId));
      if (!audience) {
        // Ehrlich statt stumm: das Publikum entsteht serverseitig, und solange
        // es das nicht gibt, kann niemand daran teilen.
        Alert.alert(
          t('not open yet', 'noch nicht offen'),
          t(vo.shareNotOpenYet.en, vo.shareNotOpenYet.de),
        );
        return;
      }
      const neu = await shareRepository.create({
        memoryId,
        audienceId: audience.id,
        spaceId,
        title: geprueft.draft.title,
      });
      setShares((s) => [neu, ...s]);
      setComposing(false);
      void confirmSuccess();
    } catch {
      Alert.alert(
        t('could not share', 'Teilen ging nicht'),
        t(vo.shareFailedNote.en, vo.shareFailedNote.de),
      );
    } finally {
      setBusy(false);
    }
  }

  function revoke(share: Share) {
    Alert.alert(
      t('take it back?', 'zurücknehmen?'),
      t(vo.shareRevokeNote.en, vo.shareRevokeNote.de),
      [
        { text: t('keep it shared', 'geteilt lassen'), style: 'cancel' },
        {
          text: t('take it back', 'zurücknehmen'),
          style: 'destructive',
          onPress: () => {
            void shareRepository
              .remove(share.id)
              .then(() => setShares((s) => s.filter((x) => x.id !== share.id)))
              .catch(() =>
                Alert.alert(
                  t('could not take it back', 'Zurücknehmen ging nicht'),
                  t('please try again in a moment.', 'bitte gleich nochmal versuchen.'),
                ),
              );
          },
        },
      ],
    );
  }

  if (loading) return null;

  if (failed) {
    return (
      <PressableScale containerStyle={styles.slot} style={styles.quiet} onPress={load} scaleTo={0.99}>
        <Text style={styles.quietText}>
          {t('could not check sharing — tap to try again.', 'Freigaben konnten nicht geprüft werden — tippen zum erneut Versuchen.')}
        </Text>
      </PressableScale>
    );
  }

  if (shares.length > 0) {
    return (
      <View style={styles.block}>
        <Text style={styles.label}>{t('SHARED', 'GETEILT')}</Text>
        {shares.map((s) => (
          <View key={s.id} style={styles.row}>
            <Text style={styles.rowTitle} numberOfLines={2}>{s.title}</Text>
            <PressableScale
              containerStyle={styles.slot}
              style={styles.quiet}
              onPress={() => revoke(s)}
              scaleTo={0.99}
              accessibilityLabel={t('Take this back', 'Das zurücknehmen')}
            >
              <Text style={styles.quietText}>{t('take it back', 'zurücknehmen')}</Text>
            </PressableScale>
          </View>
        ))}
      </View>
    );
  }

  if (!composing) {
    return (
      <PressableScale
        containerStyle={styles.slot}
        style={styles.quiet}
        onPress={start}
        scaleTo={0.99}
        accessibilityLabel={t('Share this with this week’s challenge', 'Das mit der Wochen-Challenge teilen')}
      >
        <Text style={styles.quietText}>
          {t('share with this week’s challenge →', 'mit der Wochen-Challenge teilen →')}
        </Text>
      </PressableScale>
    );
  }

  return (
    <View style={styles.block}>
      <Text style={styles.label}>{t('SHARE WITH', 'TEILEN MIT')}</Text>
      <Text style={styles.audience}>{challengeTitle}</Text>

      {/* Die Grenze steht da, wo die Entscheidung fällt — nicht im Impressum. */}
      <Text style={styles.boundary}>
        {t(vo.sharingBoundary.en, vo.sharingBoundary.de)}
      </Text>

      <TextInput
        style={styles.input}
        value={title}
        onChangeText={(v) => setTitle(v.slice(0, SHARE_TITLE_MAX))}
        placeholder={t('what should others see?', 'was sollen andere sehen?')}
        placeholderTextColor={Colors.textMuted}
        autoFocus
        multiline
      />

      <View style={styles.actions}>
        <PressableScale
          containerStyle={styles.slot}
          style={styles.cta}
          onPress={() => void submit()}
          disabled={busy}
          accessibilityLabel={t('Share it', 'Teilen')}
        >
          {busy ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.ctaText}>{t('SHARE IT', 'TEILEN')}</Text>
          )}
        </PressableScale>
        <PressableScale
          containerStyle={styles.slot}
          style={styles.quiet}
          onPress={() => setComposing(false)}
          scaleTo={0.99}
          accessibilityLabel={t('Not now', 'Jetzt nicht')}
        >
          <Text style={styles.quietText}>{t('not now', 'jetzt nicht')}</Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {},
  block: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.backgroundWarm,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  label: { ...Typography.label, color: Colors.textMuted },
  audience: { ...Typography.editorial, fontSize: 17, lineHeight: 24, color: Colors.text },
  boundary: { ...Typography.micro, color: Colors.textMuted, lineHeight: 18 },
  input: {
    ...Typography.body,
    marginTop: Spacing.xs,
    minHeight: 60,
    padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.xs },
  cta: {
    minHeight: 44,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
    backgroundColor: Colors.text,
  },
  ctaText: { ...Typography.label, color: Colors.white },
  quiet: { minHeight: 44, justifyContent: 'center' },
  quietText: { ...Typography.body, color: Colors.textMuted },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  rowTitle: { ...Typography.body, flex: 1, color: Colors.text },
});
