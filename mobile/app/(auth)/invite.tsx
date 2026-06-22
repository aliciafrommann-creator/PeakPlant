import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Share,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SEED_SPACES } from '../../lib/seed';
import { useAppStore } from '../../lib/store';
import { isSupabaseConfigured } from '../../lib/supabase/client';
import { spaceRepository } from '../../lib/repositories';
import { getActiveUser } from '../../lib/session';
import { composeInviteText } from '../../lib/shareText';
import type { Space } from '../../lib/types';

const FIRST_SPACE = SEED_SPACES[0];

export default function InviteScreen() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const setActiveSpace = useAppStore((s) => s.setActiveSpace);

  // Local-first: the seeded space already has a real, shareable code. Backend:
  // we create the couple space up front so the code shown here is real (no more
  // misleading "— — — —" placeholder).
  const [space, setSpace] = useState<Space | null>(isSupabaseConfigured ? null : FIRST_SPACE);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBackendSpace = useCallback(async () => {
    setCreating(true);
    setError(null);
    try {
      const user = await getActiveUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }
      const created = await spaceRepository.create({
        type: 'couple',
        name: user.name ? `${user.name}'s space` : 'Our space',
        ownerUserId: user.id,
        ownerName: user.name,
      });
      setSpace(created);
      setActiveSpace(created.id);
    } catch {
      setError("couldn't set up your space. tap retry to try again.");
    } finally {
      setCreating(false);
    }
  }, [setActiveSpace]);

  useEffect(() => {
    if (isSupabaseConfigured) void createBackendSpace();
  }, [createBackendSpace]);

  const onShare = async () => {
    if (!space) return;
    try {
      await Share.share({ message: composeInviteText(space.inviteCode, space.name) });
    } catch {
      // The OS share sheet was dismissed or unavailable — nothing to recover.
    }
  };

  const enter = async () => {
    // In backend mode a failed creation leaves no space — CONTINUE becomes retry.
    if (isSupabaseConfigured && !space) {
      await createBackendSpace();
      return;
    }
    setError(null);
    try {
      if (space) setActiveSpace(space.id);
      await completeOnboarding();
      router.replace('/(tabs)/discover');
    } catch {
      setError("couldn't finish setup. please try again.");
    }
  };

  const code = space?.inviteCode;
  const canShare = !!code;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.label}>INVITE YOUR PARTNER</Text>
          <Text style={styles.title}>your{'\n'}invite code</Text>
          <Text style={styles.subtitle}>
            share this with your partner so you can build your shared diary together.
            you can also start friends spaces later.
          </Text>
        </View>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>YOUR CODE</Text>
          {creating && !code ? (
            <ActivityIndicator color={Colors.accent} style={styles.codeLoading} />
          ) : (
            <Text style={styles.code}>{code ?? '— — — —'}</Text>
          )}
          <Text style={styles.codeHint}>
            your partner enters this when they set up their account.
          </Text>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.shareButton, !canShare && styles.disabled]}
          activeOpacity={0.8}
          onPress={onShare}
          disabled={!canShare}
          accessibilityRole="button"
          accessibilityLabel="Share invite link"
        >
          <Text style={styles.shareText}>SHARE INVITE</Text>
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
            accessibilityLabel={isSupabaseConfigured && !space ? 'Retry' : 'Continue'}
          >
            <Text style={styles.continueText}>
              {isSupabaseConfigured && !space && !creating ? 'RETRY' : 'CONTINUE FOR NOW'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.hint}>
            your partner can join later using the code above
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
  hint: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 0.5,
    color: Colors.textFaint,
    textAlign: 'center',
  },
});
