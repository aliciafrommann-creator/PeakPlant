import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useAppStore } from '../../lib/store';
import type { Lang } from '../../lib/types';

const OPTIONS: { lang: Lang; label: string; sublabel: string }[] = [
  { lang: 'en', label: 'English', sublabel: 'the app speaks to you in english' },
  { lang: 'de', label: 'Deutsch', sublabel: 'die app spricht dich auf deutsch an' },
];

export default function LanguageScreen() {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  const choose = (lang: Lang) => {
    setLanguage(lang);
    router.push('/(auth)/onboarding');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.kicker}>LANGUAGE · SPRACHE</Text>
          <Text style={styles.title}>how do you want{'\n'}the app to speak?</Text>
          <Text style={styles.subtitle}>
            the cards are always in english — that's the physical product.
            your in-app experience can be in english or german.
          </Text>
        </View>

        <View style={styles.options}>
          {OPTIONS.map(({ lang, label, sublabel }) => {
            const selected = language === lang;
            return (
              <TouchableOpacity
                key={lang}
                style={[styles.option, selected && styles.optionSelected]}
                onPress={() => setLanguage(lang)}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={label}
              >
                <View style={styles.optionRow}>
                  <View style={[styles.radio, selected && styles.radioSelected]} />
                  <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                    {label}
                  </Text>
                </View>
                <Text style={[styles.optionSub, selected && styles.optionSubSelected]}>
                  {sublabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => choose(language)}
            activeOpacity={0.8}
          >
            <Text style={styles.continueText}>CONTINUE</Text>
          </TouchableOpacity>
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
  kicker: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.textSubtle,
  },
  title: {
    ...Typography.editorial,
    fontSize: 34,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 21,
    marginTop: Spacing.sm,
  },
  options: {
    gap: Spacing.sm,
  },
  option: {
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    gap: 6,
    borderRadius: Radii.md,
  },
  optionSelected: {
    borderColor: Colors.text,
    backgroundColor: Colors.text,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  radioSelected: {
    borderColor: Colors.background,
    backgroundColor: Colors.accent,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '300',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  optionLabelSelected: {
    color: Colors.white,
  },
  optionSub: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.textMuted,
    letterSpacing: 0.2,
    marginLeft: 28,
  },
  optionSubSelected: {
    color: Colors.textFaint,
  },
  actions: {
    marginTop: 'auto',
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
    letterSpacing: 3,
    color: Colors.white,
  },
});
