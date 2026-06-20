import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SEED_COUPLE } from '../../lib/seed';
import { useAppStore } from '../../lib/store';

export default function InviteScreen() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const enter = async () => {
    await completeOnboarding();
    router.replace('/(tabs)/us');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.label}>INVITE YOUR PARTNER</Text>
          <Text style={styles.title}>your{'\n'}invite code</Text>
          <Text style={styles.subtitle}>
            share this with your partner so you can build your shared diary together.
          </Text>
        </View>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>YOUR CODE</Text>
          <Text style={styles.code}>{SEED_COUPLE.inviteCode}</Text>
          <Text style={styles.codeHint}>
            your partner enters this when they set up their account
          </Text>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
          <Text style={styles.shareText}>SHARE LINK</Text>
        </TouchableOpacity>

        <View style={styles.bottom}>
          <TouchableOpacity style={styles.continueButton} onPress={enter} activeOpacity={0.8}>
            <Text style={styles.continueText}>CONTINUE FOR NOW</Text>
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
