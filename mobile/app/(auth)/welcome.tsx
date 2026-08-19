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
import { HOUSE_DYE } from '../../constants/dyes';
import { DyeField } from '../../components/ui/DyeField';
import { editionInk } from '../../lib/editionInk';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Logo } from '../../components/ui/Logo';

export default function WelcomeScreen() {
  const knopfTinte = editionInk(HOUSE_DYE.ground);
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
            style={styles.beginPress}
            onPress={() => router.push('/(auth)/language')}
            activeOpacity={0.8}
          >
            <DyeField style={styles.beginButton}>
              <Text style={[styles.beginText, { color: knopfTinte }]}>BEGIN</Text>
            </DyeField>
          </TouchableOpacity>
          {/* Wer schon ein Konto hat, soll nicht durch den Einstieg laufen.
              Seit dieser Bildschirm wieder der erste ist, ist das der Weg für
              Rückkehrer — ruhig, nicht als zweite Pille. */}
          <TouchableOpacity
            style={styles.signInLink}
            onPress={() => router.push('/(auth)/sign-in')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="I already have an account"
          >
            <Text style={styles.signInText}>i already have an account</Text>
          </TouchableOpacity>

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
  // Der Knopf war vorher inhaltsbreit. Mit der Färbung darauf ist er über die
  // volle Breite: Eine gefärbte Fläche in Wortbreite sieht aus wie ein
  // Textmarker, nicht wie die eine Handlung dieses Bildschirms (K3). Das war
  // beim ersten Durchgang eine stille Änderung — sie steht jetzt hier.
  beginPress: { alignSelf: 'stretch' },
  /** Der erste Knopf der App — und die erste Färbung, die jemand sieht. */
  beginButton: {
    height: 56,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInLink: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  signInText: {
    ...Typography.body,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
  beginText: {
    // KEINE Farbe hier: Sie wird beim Rendern gerechnet (`knopfTinte`). Ein
    // statischer Wert, der nie zum Tragen kommt, täuscht beim Lesen eine
    // Entscheidung vor — und beim nächsten Umbau glaubt ihn jemand.
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.2,
  },
  hint: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 1,
    color: Colors.textSubtle,
    textTransform: 'uppercase',
  },
});
