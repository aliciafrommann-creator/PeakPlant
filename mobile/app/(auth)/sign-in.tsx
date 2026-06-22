import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Logo } from '../../components/ui/Logo';
import { sendEmailCode, verifyEmailCode, ensureProfile } from '../../lib/supabase/auth';

export default function SignInScreen() {
  const [stage, setStage] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async () => {
    if (!email.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await sendEmailCode(email);
      setStage('code');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send the code.');
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
      // Seed a profile name from the email local-part; editable later.
      await ensureProfile(email.split('@')[0]).catch(() => undefined);
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That code did not work.');
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
              <Text style={styles.title}>sign in</Text>
              <Text style={styles.subtitle}>
                we'll email you a one-time code. no password to remember.
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
              <Text style={styles.title}>enter your code</Text>
              <Text style={styles.subtitle}>we sent a one-time code to {email.toLowerCase()}.</Text>
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
              <TouchableOpacity onPress={() => setStage('email')} accessibilityRole="button" accessibilityLabel="Use a different email">
                <Text style={styles.link}>use a different email</Text>
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
              accessibilityLabel={stage === 'email' ? 'Send code' : 'Verify code'}
            >
              {busy ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.buttonText}>{stage === 'email' ? 'SEND CODE' : 'CONTINUE'}</Text>
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
  title: { fontSize: 34, fontWeight: '200', color: Colors.text, letterSpacing: -0.5 },
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
  link: { fontSize: 12, fontWeight: '300', color: Colors.accent, marginTop: Spacing.md },
  error: { fontSize: 13, fontWeight: '300', color: '#b42318', marginBottom: Spacing.md },
  bottom: { alignItems: 'flex-start' },
  button: {
    height: 52,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 11, fontWeight: '500', letterSpacing: 3, color: Colors.white },
});
