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

  /**
   * Aus einem technischen Fehler einen Satz machen, den ein Mensch lesen kann.
   *
   * Alicia sah auf ihrem Telefon rot und auf Englisch „Supabase not
   * configured" — den Namen eines Dienstes, von dem sie nichts wissen muss,
   * ohne Erklärung und ohne Ausweg. Das ist der Fehlertyp aus K4: „kaputt"
   * sah aus wie eine Bedienfehlermeldung.
   *
   * Der häufigste Grund dafür ist NICHT ein Ausfall, sondern eine fehlende
   * `.env` beim lokalen Entwickeln. Deshalb steht der Hinweis dazu — er hilft
   * genau der Person, die ihn braucht, und verwirrt sonst niemanden, weil er
   * im gebauten Programm nie erscheint.
   */
  const menschlich = (e: unknown): string => {
    const roh = e instanceof Error ? e.message : '';
    if (/not configured/i.test(roh)) {
      return __DEV__
        ? t(
            'this copy of the app has no backend keys — copy .env.example to .env and restart with `npx expo start -c`.',
            'Diese Kopie der App hat keine Server-Zugänge — kopiere .env.example nach .env und starte neu mit `npx expo start -c`.',
          )
        : t(
            'sign-in is unavailable right now. nothing of yours is affected — please try again in a moment.',
            'Die Anmeldung geht gerade nicht. An deinen Sachen ändert das nichts — versuch es gleich noch einmal.',
          );
    }
    if (/network|fetch|timeout/i.test(roh)) {
      return t(
        'that was the connection, not you. try again.',
        'Das war die Verbindung, nicht du. Versuch es nochmal.',
      );
    }
    return t('Could not send the code.', 'Code konnte nicht gesendet werden.');
  };

  const sendCode = async () => {
    if (busy) return;
    if (!isValidEmail(email)) {
      setError(t('please enter a valid email address.', 'Bitte gib eine gültige E-Mail-Adresse ein.'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await sendEmailCode(email.trim().toLowerCase());
      setStage('code');
    } catch (e) {
      setError(menschlich(e));
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
      setError(menschlich(e));
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
          {/* EIN WEG ZURÜCK. Bis zum 19.08.2026 war dieser Bildschirm eine
              Sackgasse: Wer versehentlich auf „ich habe schon ein Konto"
              tippte, kam nicht mehr heraus — kein Zurück, keine Reiterleiste.
              (Alicia auf dem Gerät: „man kommt auch nicht zurück".) */}
          <View style={styles.top}>
            <TouchableOpacity
              onPress={() => {
                if (stage === 'code') {
                  setStage('email');
                  setCode('');
                  setError(null);
                  return;
                }
                if (router.canGoBack()) router.back();
                else router.replace('/(auth)/welcome');
              }}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t('Back', 'Zurück')}
            >
              <Text style={styles.back}>{t('← BACK', '← ZURÜCK')}</Text>
            </TouchableOpacity>
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
                placeholderTextColor={Colors.textSubtle}
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
                placeholderTextColor={Colors.textSubtle}
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
              accessibilityLabel={stage === 'email' ? t('Send code', 'Code senden') : t('Verify code', 'Code bestätigen')}
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
  top: { paddingTop: Spacing.md, gap: Spacing.md },
  back: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: Colors.textMuted,
  },
  center: { flex: 1, justifyContent: 'center', gap: Spacing.md },
  title: { ...Typography.editorial },
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
  error: { fontSize: 13, fontWeight: '300', color: Colors.danger, marginBottom: Spacing.md },
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
  buttonText: { fontSize: 11, fontWeight: '500', letterSpacing: 1.2, color: Colors.white },
});
