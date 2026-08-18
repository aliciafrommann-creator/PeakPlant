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
import { Logo } from '../../components/ui/Logo';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.top}>
          <Logo size="md" />
        </View>

        <View style={styles.center}>
          <Text style={styles.hero}>collect{'\n'}moments.</Text>
          <Text style={styles.hero2}>grow together.</Text>
          <Text style={styles.tagline}>
            made for the moments that stay with you.
          </Text>
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={styles.beginButton}
            onPress={() => router.push('/(auth)/language')}
            activeOpacity={0.8}
          >
            <Text style={styles.beginText}>BEGIN</Text>
          </TouchableOpacity>
          {/* Stand vorher: „no account needed to explore". Im echten Betrieb
              ist das Konto zwei Schritte vorher entstanden (app/index.tsx:57
              schickt ohne Sitzung zuerst auf sign-in) — dieser Bildschirm
              kommt erst danach. Ein Satz, den der Code nicht hält, ist genau
              das, was MANIFESTO §1 verbietet. */}
          <Text style={styles.hint}>
            nothing here is public — this space is yours
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
    justifyContent: 'space-between',
  },
  top: {
    paddingTop: Spacing.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  /**
   * Die einzige Stelle, die bewusst NEBEN der Schriftleiter steht (52 pt statt
   * 32). Ein Bildschirm, ein Satz, sonst nichts — hier ist „riesig" die
   * Aussage und nicht das Problem. Alicias Befund („alles etwas riesig") galt
   * Bildschirmen mit neun Blöcken, die um Aufmerksamkeit konkurrierten; dieser
   * hat einen. Wer eine zweite solche Ausnahme braucht, hat vermutlich keine.
   */
  hero: {
    fontSize: 52,
    fontWeight: '200',
    color: Colors.text,
    letterSpacing: -1,
    lineHeight: 58,
  },
  hero2: {
    ...Typography.editorial,
    fontSize: 52,
    color: Colors.accent,
    letterSpacing: -1,
    lineHeight: 58,
    marginBottom: Spacing.xl,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  bottom: {
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  beginButton: {
    height: 52,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  beginText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: Colors.white,
  },
  hint: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 1,
    color: Colors.textSubtle,
    textTransform: 'uppercase',
  },
});
