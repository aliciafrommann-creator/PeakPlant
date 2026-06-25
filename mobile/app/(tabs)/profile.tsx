import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { useMemories } from '../../lib/hooks/useMemories';
import { useWeeklyChallenge } from '../../lib/hooks/useWeeklyChallenge';
import { PeakBloom } from '../../components/ui/PeakBloom';

export default function ProfileScreen() {
  const { activeSpace } = useSpaces();
  const { t } = useLanguage();
  const { memories } = useMemories(activeSpace?.id);
  const { chillyCount } = useWeeklyChallenge(activeSpace?.id);

  const links: { emoji: string; label: string; route: string }[] = [
    { emoji: '🎨', label: t('customize peakplant', 'PeakPlant anpassen'), route: '/customize' },
    { emoji: '🔐', label: t('account & data', 'Konto & Daten'), route: '/account' },
    { emoji: '🌍', label: t('language & preferences', 'Sprache & Einstellungen'), route: '/settings/preferences' },
    { emoji: '💬', label: t('ask peakplant', 'PeakPlant fragen'), route: '/ask' },
    { emoji: '✨', label: t('peakplant plus', 'PeakPlant Plus'), route: '/plus' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerMain}>
          <Text style={styles.kicker}>{t('PROFILE', 'PROFIL')}</Text>
          <Text style={styles.title}>{t('you', 'du')}</Text>
        </View>
        <PeakBloom size="sm" animate={false} />
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
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{memories.length}</Text>
                <Text style={styles.statLabel}>{t('MOMENTS', 'MOMENTE')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statNum}>{chillyCount}</Text>
                <Text style={styles.statLabel}>{t('CHALLENGES', 'CHALLENGES')}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.linksBlock}>
          {links.map(({ emoji, label, route }) => (
            <TouchableOpacity
              key={route}
              style={styles.linkRow}
              onPress={() => router.push(route)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={label}
            >
              <Text style={styles.linkText}>
                <Text style={styles.linkEmoji}>{emoji}  </Text>
                {label}
              </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerMain: {
    gap: 4,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.textFaint,
  },
  title: {
    ...Typography.editorial,
    fontSize: 32,
    lineHeight: 38,
  },
  content: {
    paddingBottom: Spacing.xxxl,
  },
  spaceBlock: {
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.backgroundCream,
    borderRadius: Radii.lg,
    ...Shadows.subtle,
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
    ...Typography.editorial,
    fontSize: 24,
    lineHeight: 30,
  },
  spaceType: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 1.5,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.xl,
  },
  stat: {
    alignItems: 'center',
  },
  statNum: {
    ...Typography.editorial,
    fontSize: 30,
    lineHeight: 34,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2,
    color: Colors.textFaint,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
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
  linkEmoji: {
    fontSize: 16,
  },
  linkArrow: {
    fontSize: 18,
    fontWeight: '300',
    color: Colors.textMuted,
  },
});
