import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';

export default function ProfileScreen() {
  const { activeSpace } = useSpaces();
  const { t } = useLanguage();

  const links: { label: string; route: string }[] = [
    { label: t('customize peakplant', 'PeakPlant anpassen'), route: '/customize' },
    { label: t('account & data', 'Konto & Daten'), route: '/account' },
    { label: t('language & preferences', 'Sprache & Einstellungen'), route: '/settings/preferences' },
    { label: t('ask peakplant', 'PeakPlant fragen'), route: '/ask' },
    { label: t('peakplant plus', 'PeakPlant Plus'), route: '/plus' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>{t('PROFILE', 'PROFIL')}</Text>
        <Text style={styles.title}>{t('you', 'du')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeSpace && (
          <View style={styles.spaceBlock}>
            <Text style={styles.spaceKicker}>{t('CURRENT SPACE', 'AKTUELLER SPACE')}</Text>
            <Text style={styles.spaceName}>{activeSpace.name.toLowerCase()}</Text>
            <Text style={styles.spaceType}>
              {activeSpace.type === 'couple'
                ? t('couple space', 'Paar-Space')
                : t('friends space', 'Freunde-Space')}
            </Text>
          </View>
        )}

        <View style={styles.linksBlock}>
          {links.map(({ label, route }) => (
            <TouchableOpacity
              key={route}
              style={styles.linkRow}
              onPress={() => router.push(route)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={label}
            >
              <Text style={styles.linkText}>{label}</Text>
              <Text style={styles.linkArrow}>{'->'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 4,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.textFaint,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  content: {
    paddingBottom: Spacing.xxxl,
  },
  spaceBlock: {
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 4,
  },
  spaceKicker: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2.5,
    color: Colors.textFaint,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  spaceName: {
    fontSize: 22,
    fontWeight: '300',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  spaceType: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 1.5,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  linksBlock: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '300',
    color: Colors.text,
  },
  linkArrow: {
    fontSize: 18,
    fontWeight: '300',
    color: Colors.textMuted,
  },
});
