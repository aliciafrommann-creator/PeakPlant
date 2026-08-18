import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { SEED_SPACES } from '../../lib/seed';
import { useAppStore } from '../../lib/store';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { isSupabaseConfigured } from '../../lib/supabase/client';
import { spaceRepository } from '../../lib/repositories';
import { getActiveUser } from '../../lib/session';
import { composeInviteText } from '../../lib/shareText';
import { isValidInviteCode } from '../../lib/invite';
import { classifyJoinError } from '../../lib/joinErrors';
import { peekPendingJoinCode, consumePendingJoinCode } from '../../lib/pendingDestination';
import type { Space } from '../../lib/types';

const FIRST_SPACE = SEED_SPACES[0];

/**
 * First-run space setup. A new user either STARTS a space (becomes the owner and
 * shares the code) or JOINS their partner's space with a code. The two paths are
 * an explicit choice — we never auto-create a space, because a joining partner
 * would otherwise be stranded in their own empty space and the pair never links.
 */
type Phase = 'choice' | 'created' | 'join';

export default function InviteScreen() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const setActiveSpace = useAppStore((s) => s.setActiveSpace);
  const { t } = useLanguage();

  /**
   * Ein angetippter Einladungslink (`/j/PEAK-XXXXXX`) hat den Code bis hierher
   * durchgetragen — über die Anmeldung hinweg, die dazwischen liegt. Dann
   * beginnt dieser Bildschirm direkt beim Beitreten, mit ausgefülltem Feld:
   * Wer eingeladen wurde, soll nicht erst zwischen „Space starten" und
   * „Ich habe einen Code" wählen müssen, und schon gar nicht abtippen.
   */
  // Nur LESEN beim Rendern (rein). Verbraucht wird der Code im Effekt unten —
  // ein Verbrauch im Render würde unter StrictMode zweimal laufen und den Code
  // beim zweiten Durchgang verschlucken.
  const invited = peekPendingJoinCode();

  // Local-first mode has a seeded space already; backend users start by choosing.
  const [phase, setPhase] = useState<Phase>(
    invited ? 'join' : isSupabaseConfigured ? 'choice' : 'created',
  );
  const [space, setSpace] = useState<Space | null>(isSupabaseConfigured ? null : FIRST_SPACE);
  const [code, setCode] = useState(invited ?? '');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Der eingelöste Code ist jetzt im Zustand — aus dem Zwischenspeicher raus,
  // damit ein späterer Besuch dieses Bildschirms nicht erneut im Beitreten
  // startet.
  useEffect(() => {
    consumePendingJoinCode();
  }, []);

  const requireUser = useCallback(async () => {
    const user = await getActiveUser();
    if (!user) {
      router.replace('/(auth)/sign-in');
      return null;
    }
    return user;
  }, []);

  const createBackendSpace = useCallback(async () => {
    if (creating) return;
    setCreating(true);
    setError(null);
    try {
      const user = await requireUser();
      if (!user) return;
      const created = await spaceRepository.create({
        type: 'couple',
        name: user.name ? `${user.name}'s space` : 'Our space',
        ownerUserId: user.id,
        ownerName: user.name,
      });
      setSpace(created);
      setActiveSpace(created.id);
      setPhase('created');
    } catch {
      setError(t("couldn't set up your space. tap retry to try again.", 'Space konnte nicht eingerichtet werden. Tippe auf Wiederholen.'));
    } finally {
      setCreating(false);
    }
  }, [creating, requireUser, setActiveSpace, t]);

  const submitJoin = useCallback(async () => {
    if (joining) return;
    if (!isValidInviteCode(code)) {
      setError(t('that code doesn’t look right. it looks like PEAK-AB23CD.', 'Dieser Code sieht nicht richtig aus. Er sieht aus wie PEAK-AB23CD.'));
      return;
    }
    setJoining(true);
    setError(null);
    try {
      const user = await requireUser();
      if (!user) return;
      const joined = await spaceRepository.joinByCode(code, user.id, user.name);
      setActiveSpace(joined.id);
      await completeOnboarding();
      router.replace('/(tabs)/home');
    } catch (err) {
      // Say which of the refusals it was. Sending someone to re-read a code
      // that is correct — because the space is already full, or because they
      // tried too often — wastes their evening on a wrong explanation.
      switch (classifyJoinError(err)) {
        case 'space_full':
          setError(t(
            'this space already has two people in it. ask your partner for a fresh code — a new one appears once the first pair is complete.',
            'In diesem Space sind schon zwei Menschen. Bitte deinen Partner um einen frischen Code — sobald das erste Paar vollständig ist, entsteht ein neuer.',
          ));
          break;
        case 'too_many_attempts':
          setError(t(
            'that was a lot of tries in a short time. take a breath and try again in an hour.',
            'Das waren viele Versuche in kurzer Zeit. Atme kurz durch und versuch es in einer Stunde nochmal.',
          ));
          break;
        case 'not_authenticated':
          setError(t(
            'your sign-in expired. sign in again, then enter the code.',
            'Deine Anmeldung ist abgelaufen. Melde dich neu an und gib den Code dann ein.',
          ));
          break;
        case 'invalid_code':
          setError(t(
            "we don't know that code. check it with your partner and try again.",
            'Diesen Code kennen wir nicht. Prüfe ihn mit deinem Partner und versuche es erneut.',
          ));
          break;
        default:
          setError(t(
            "that didn't work — it may have been the connection. please try again.",
            'Das hat nicht geklappt — vielleicht lag es an der Verbindung. Bitte versuche es erneut.',
          ));
      }
      setJoining(false);
    }
  }, [joining, code, requireUser, setActiveSpace, completeOnboarding, t]);

  const onShare = async () => {
    if (!space) return;
    try {
      await Share.share({ message: composeInviteText(space.inviteCode, space.name) });
    } catch {
      // The OS share sheet was dismissed or unavailable — nothing to recover.
    }
  };

  const enter = async () => {
    setError(null);
    try {
      if (space) setActiveSpace(space.id);
      await completeOnboarding();
      router.replace('/(tabs)/home');
    } catch {
      setError(t("couldn't finish setup. please try again.", 'Einrichtung konnte nicht abgeschlossen werden. Bitte versuche es erneut.'));
    }
  };

  // ---- JOIN: partner enters the owner's code ----------------------------
  if (phase === 'join') {
    const canJoin = isValidInviteCode(code) && !joining;
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SafeAreaView style={styles.container}>
          <View style={styles.inner}>
            <View style={styles.header}>
              <Text style={styles.label}>{t('JOIN YOUR PARTNER', 'PARTNER BEITRETEN')}</Text>
              <Text style={styles.title}>{t('enter the\ninvite code', 'gib den\nCode ein')}</Text>
              <Text style={styles.subtitle}>
                {t(
                  'ask your partner for the code from their invite screen. it looks like PEAK-AB23CD.',
                  'Frage deinen Partner nach dem Code von seinem Einladungs-Bildschirm. Er sieht aus wie PEAK-AB23CD.',
                )}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.codeLabel}>{t('INVITE CODE', 'EINLADUNGSCODE')}</Text>
              <TextInput
                style={styles.joinInput}
                placeholder="PEAK-AB23CD"
                placeholderTextColor={Colors.textSubtle}
                value={code}
                onChangeText={(v) => { setCode(v.toUpperCase()); if (error) setError(null); }}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={11}
                autoFocus
                accessibilityLabel={t('Invite code', 'Einladungscode')}
              />
            </View>

            {error && <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>}

            <View style={styles.bottom}>
              <TouchableOpacity
                style={[styles.continueButton, !canJoin && styles.disabled]}
                onPress={submitJoin}
                disabled={!canJoin}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={t('Join space', 'Space beitreten')}
              >
                {joining ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.continueText}>{t('JOIN', 'BEITRETEN')}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setPhase('choice'); setError(null); }}
                disabled={joining}
                accessibilityRole="button"
                accessibilityLabel={t('Back', 'Zurück')}
              >
                <Text style={styles.backText}>{t('back', 'zurück')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  // ---- CHOICE: start a space, or join one (backend mode only) -----------
  if (phase === 'choice') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.label}>{t('SET UP YOUR SPACE', 'RICHTE DEINEN SPACE EIN')}</Text>
            <Text style={styles.title}>{t('start, or\njoin a partner', 'starten, oder\nPartner beitreten')}</Text>
            <Text style={styles.subtitle}>
              {t(
                'starting creates a shared space and gives you a code to share. joining links you into a space your partner already made.',
                'Beim Starten entsteht ein gemeinsamer Space mit einem Code zum Teilen. Beim Beitreten verbindest du dich mit dem Space deines Partners.',
              )}
            </Text>
          </View>

          {error && <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>}

          <View style={styles.bottom}>
            <TouchableOpacity
              style={[styles.continueButton, creating && styles.disabled]}
              onPress={createBackendSpace}
              disabled={creating}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('Start a new space', 'Neuen Space starten')}
            >
              {creating ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.continueText}>{t('START A SPACE', 'SPACE STARTEN')}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.shareButton, creating && styles.disabled]}
              onPress={() => { setPhase('join'); setError(null); }}
              disabled={creating}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('I have an invite code', 'Ich habe einen Einladungscode')}
            >
              <Text style={styles.shareText}>{t('I HAVE A CODE', 'ICH HABE EINEN CODE')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ---- CREATED: show the owner's code to share --------------------------
  const inviteCode = space?.inviteCode;
  const canShare = !!inviteCode;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.label}>{t('INVITE YOUR PARTNER', 'PARTNER EINLADEN')}</Text>
          <Text style={styles.title}>{t('your\ninvite code', 'dein\nEinladungscode')}</Text>
          <Text style={styles.subtitle}>
            {t(
              'share this with your partner so you can build your shared diary together. you can also start friends spaces later.',
              'Teile diesen Code mit deinem Partner, damit ihr gemeinsam euer Tagebuch aufbaut. Du kannst später auch Freunde-Spaces starten.',
            )}
          </Text>
        </View>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabelOnDark}>{t('YOUR CODE', 'DEIN CODE')}</Text>
          {creating && !inviteCode ? (
            <ActivityIndicator color={Colors.accent} style={styles.codeLoading} />
          ) : (
            <Text style={styles.code}>{inviteCode ?? '- - - -'}</Text>
          )}
          <Text style={styles.codeHint}>
            {t(
              // Vorher stand hier „on their welcome screen". Der Knopf steht
              // nicht dort, sondern erst nach der Anmeldung — wer danach auf
              // dem Willkommensbildschirm sucht, findet ihn nie.
              'after signing in, your partner taps "I have a code" and enters this.',
              'Nach der Anmeldung tippt dein Mensch auf "Ich habe einen Code" und gibt diesen ein.',
            )}
          </Text>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('OR', 'ODER')}</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.shareButton, !canShare && styles.disabled]}
          activeOpacity={0.8}
          onPress={onShare}
          disabled={!canShare}
          accessibilityRole="button"
          accessibilityLabel={t('Share invite link', 'Einladungslink teilen')}
        >
          <Text style={styles.shareText}>{t('SHARE INVITE', 'EINLADUNG TEILEN')}</Text>
        </TouchableOpacity>

        {error && (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        )}

        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.continueButton, creating && styles.disabled]}
            onPress={enter}
            activeOpacity={0.8}
            disabled={creating}
            accessibilityRole="button"
            accessibilityLabel={t('Go to your first moment', 'Zu eurem ersten Moment')}
          >
            {/* Setup is not the finish line — the first preserved moment is.
                A PeakPlant verb here instead of a generic CONTINUE, so the
                last step of onboarding names where it leads (MANIFESTO §5). */}
            <Text style={styles.continueText}>{t('YOUR FIRST MOMENT', 'EUER ERSTER MOMENT')}</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>
            {t(
              'your partner can join later using the code above',
              'Dein Partner kann später mit dem Code oben beitreten',
            )}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.xl,
    gap: Spacing.xl,
  },
  header: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: Colors.textSubtle,
  },
  title: {
    ...Typography.editorial,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 20,
  },
  section: { gap: Spacing.sm },
  codeContainer: {
    backgroundColor: Colors.backgroundDark,
    padding: Spacing.xl,
    gap: Spacing.sm,
    borderRadius: Radii.lg,
  },
  // Auf Papier (Beitritts-Formular). accentInk = 4,51:1.
  codeLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: Colors.accentInk,
  },
  // Derselbe Text im dunklen `codeContainer`. Bis 18.08.2026 teilte er sich
  // den Stil oben — ein Stil auf zwei Untergründen, und auf dem dunklen kam
  // accentInk auf 3,34:1. kontrast-ok: onDark auf backgroundDark = 8,07:1.
  codeLabelOnDark: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: Colors.onDark,
  },
  code: {
    fontSize: 36,
    fontWeight: '200',
    color: Colors.white,
    letterSpacing: 8,
  },
  codeLoading: {
    alignSelf: 'flex-start',
    marginVertical: Spacing.sm,
  },
  codeHint: {
    fontSize: 12,
    fontWeight: '300',
    // kontrast-ok: ebenfalls im dunklen `codeContainer` (3,31:1 → 8,07:1).
    color: Colors.onDark,
    lineHeight: 18,
  },
  joinInput: {
    fontSize: 28,
    fontWeight: '300',
    color: Colors.text,
    letterSpacing: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 1.2,
    color: Colors.textSubtle,
  },
  shareButton: {
    height: 52,
    borderWidth: 1,
    borderColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  shareText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: Colors.text,
  },
  disabled: { opacity: 0.4 },
  error: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.danger,
    lineHeight: 19,
  },
  bottom: {
    marginTop: 'auto',
    gap: Spacing.md,
  },
  continueButton: {
    height: 52,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  continueText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: Colors.white,
  },
  backText: {
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 0.5,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  hint: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 0.5,
    color: Colors.textSubtle,
    textAlign: 'center',
  },
});
