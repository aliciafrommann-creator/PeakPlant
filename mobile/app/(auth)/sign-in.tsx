import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Logo } from '../../components/ui/Logo';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { sendEmailCode, verifyEmailCode, ensureProfile } from '../../lib/supabase/auth';

export default function SignInScreen() {
  const [stage, setStage] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const sendCode = async () => {
    if (busy) return;
    if (!isValidEmail(email)) {
      setError(t('please enter a valid email address.', 'Bitte gib eine gultige E-Mail-Adresse ein.'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await sendEmailCode(email.trim().toLowerCase());
      setStage('code');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Could not send the code.', 'Code konnte nicht gesendet werden.'));
    } finally {
      setBusy(false);
    }
  };

  const resendCode = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await sendEmailCode(email.trim().toLowerCase());
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Could not resend the code.', 'Code konnte nicht erneut gesendet werden.'));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!code || busy) return;
    setBusy(true);
    setError(null);
    try {
      await verifyEmailCode(email, code);
      await ensureProfile(email.split('@')[0]).catch(() => undefined);
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('That code did not work.', 'Dieser Code hat nicht funktioniert.'));
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.top}>
            <Logo size="md" />
          </View>

          {stage === 'email' ? (
            <View style={styles.center}>
              <Text style={styles.title}>{t('sign in', 'anmelden')}</Text>
              <Text style={styles.subtitle}>
                {t(
                  "we'll email you a one-time code. no password to remember.",
                  'Wir senden dir einen Einmalcode per E-Mail. Kein Passwort notwendig.',
                )}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="you@email.com"
                placeholderTextColor={Colors.textFaint}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                autoFocus
              />
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={styles.title}>{t('enter your code', 'Code eingeben')}</Text>
              <Text style={styles.subtitle}>
                {t(
                  `we sent a one-time code to ${email.toLowerCase()}.`,
                  `Wir haben einen Einmalcode an ${email.toLowerCase()} gesendet.`,
                )}
              </Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="12345678"
                placeholderTextColor={Colors.textFaint}
                value={code}
                onChangeText={(value) => setCode(value.replace(/\D/g, ''))}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                autoFocus
              />
              <TouchableOpacity
                onPress={() => { setStage('email'); setCode(''); setError(null); }}
                accessibilityRole="button"
                accessibilityLabel={t('Use a different email', 'Andere E-Mail-Adresse verwenden')}
              >
                <Text style={styles.link}>{t('use a different email', 'andere E-Mail-Adresse')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => void resendCode()}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel={t('Resend code', 'Code erneut senden')}
              >
                <Text style={[styles.link, busy && styles.linkDisabled]}>{t('resend code', 'Code erneut senden')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.bottom}>
            <TouchableOpacity
              style={[styles.button, busy && styles.buttonDisabled]}
              onPress={stage === 'email' ? sendCode : verify}
              disabled={busy}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={stage === 'email' ? t('Send code', 'Code senden') : t('Verify code', 'Code bestatigen')}
            >
              {busy ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.buttonText}>
                  {stage === 'email' ? t('SEND CODE', 'CODE SENDEN') : t('CONTINUE', 'WEITER')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, paddingHorizontal: Spacing.screen, paddingVertical: Spacing.xl, justifyContent: 'space-between' },
  top: { paddingTop: Spacing.md },
  center: { flex: 1, justifyContent: 'center', gap: Spacing.md },
  title: { ...Typography.editorial, fontSize: 34, lineHeight: 40 },
  subtitle: { fontSize: 14, fontWeight: '300', color: Colors.textMuted, lineHeight: 21 },
  input: {
    fontSize: 18,
    fontWeight: '300',
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
  },
  codeInput: { fontSize: 28, letterSpacing: 5 },
  link: { fontSize: 12, fontWeight: '300', color: Colors.textSubtle, marginTop: Spacing.md },
  linkDisabled: { opacity: 0.4 },
  error: { fontSize: 13, fontWeight: '300', color: '#b42318', marginBottom: Spacing.md },
  bottom: { alignItems: 'flex-start' },
  button: {
    height: 52,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: Radii.pill,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 11, fontWeight: '500', letterSpacing: 3, color: Colors.white },
});
