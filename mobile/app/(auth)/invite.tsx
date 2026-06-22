import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Share,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SEED_SPACES } from '../../lib/seed';
import { useAppStore } from '../../lib/store';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { isSupabaseConfigured } from '../../lib/supabase/client';
import { spaceRepository } from '../../lib/repositories';
import { getActiveUser } from '../../lib/session';
import { composeInviteText } from '../../lib/shareText';
import { isValidInviteCode } from '../../lib/invite';
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

  // Local-first mode has a seeded space already; backend users start by choosing.
  const [phase, setPhase] = useState<Phase>(isSupabaseConfigured ? 'choice' : 'created');
  const [space, setSpace] = useState<Space | null>(isSupabaseConfigured ? null : FIRST_SPACE);
  const [code, setCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      router.replace('/(tabs)/discover');
    } catch {
      setError(t("that code didn't work. check it with your partner and try again.", 'Dieser Code hat nicht funktioniert. Prufe ihn mit deinem Partner und versuche es erneut.'));
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
      router.replace('/(tabs)/discover');
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
                placeholderTextColor={Colors.textFaint}
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
                accessibilityLabel={t('Back', 'Zuruck')}
              >
                <Text style={styles.backText}>{t('back', 'zuruck')}</Text>
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
              'Teile diesen Code mit deinem Partner, damit ihr gemeinsam euer Tagebuch aufbaut. Du kannst spater auch Freunde-Spaces starten.',
            )}
          </Text>
        </View>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>{t('YOUR CODE', 'DEIN CODE')}</Text>
          {creating && !inviteCode ? (
            <ActivityIndicator color={Colors.accent} style={styles.codeLoading} />
          ) : (
            <Text style={styles.code}>{inviteCode ?? '- - - -'}</Text>
          )}
          <Text style={styles.codeHint}>
            {t(
              'your partner taps "I have a code" on their welcome screen and enters this.',
              'Dein Partner tippt auf "Ich habe einen Code" und gibt diesen ein.',
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
            accessibilityLabel={t('Continue', 'Weiter')}
          >
            <Text style={styles.continueText}>{t('CONTINUE', 'WEITER')}</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>
            {t(
              'your partner can join later using the code above',
              'Dein Partner kann spater mit dem Code oben beitreten',
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
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.accent,
  },
  title: {
    fontSize: 34,
    fontWeight: '200',
    color: Colors.text,
    lineHeight: 40,
    letterSpacing: -0.5,
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
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.accent,
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
    color: Colors.textSubtle,
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
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 2,
    color: Colors.textFaint,
  },
  shareButton: {
    height: 52,
    borderWidth: 1,
    borderColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.text,
  },
  disabled: { opacity: 0.4 },
  error: {
    fontSize: 13,
    fontWeight: '400',
    color: '#b42318',
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
  },
  continueText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 2.5,
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
    color: Colors.textFaint,
    textAlign: 'center',
  },
});
