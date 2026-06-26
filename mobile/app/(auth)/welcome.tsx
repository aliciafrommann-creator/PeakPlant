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
          <Text style={styles.hint}>
            no account needed to explore
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
    letterSpacing: 3,
    color: Colors.white,
  },
  hint: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 1,
    color: Colors.textFaint,
    textTransform: 'uppercase',
  },
});
