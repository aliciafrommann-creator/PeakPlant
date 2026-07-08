import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { useMemories } from '../../lib/hooks/useMemories';
import { useWeeklyChallenge } from '../../lib/hooks/useWeeklyChallenge';
import { useAppStore } from '../../lib/store';
import { acknowledgeSelection } from '../../lib/haptics';
import { PeakBloom } from '../../components/ui/PeakBloom';
import { PressableScale } from '../../components/ui/PressableScale';
import { SpacePicker } from '../../components/space/SpacePicker';

export default function ProfileScreen() {
  const { spaces, activeSpace, setActiveSpace } = useSpaces();
  const { t } = useLanguage();
  const { memories } = useMemories(activeSpace?.id);
  const { chillyCount } = useWeeklyChallenge(activeSpace?.id);
  const ritualsEnabled = useAppStore((s) => s.features.rituals);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Me = trust & control center: your spaces, your archive, your settings.
  // No vanity metrics — links lead to control, not a public persona.
  const links: { emoji: string; label: string; route: string }[] = [
    { emoji: '🎨', label: t('customize peakplant', 'PeakPlant anpassen'), route: '/customize' },
    { emoji: '🔖', label: t('saved plans', 'gemerkte Pläne'), route: '/discover/saved' },
    ...(ritualsEnabled
      ? [{ emoji: '🌿', label: t('your rituals', 'eure Rituale'), route: '/rituals' }]
      : []),
    { emoji: '🌍', label: t('language & preferences', 'Sprache & Einstellungen'), route: '/settings/preferences' },
    { emoji: '🔐', label: t('account & data', 'Konto & Daten'), route: '/account' },
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
          <TouchableOpacity
            style={styles.spaceBlock}
            onPress={() => { void acknowledgeSelection(); setPickerOpen(true); }}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('Switch, add or invite to a space', 'Space wechseln, hinzufügen oder einladen')}
          >
            <View style={styles.spaceHeadRow}>
              <Text style={styles.spaceKicker}>{t('CURRENT SPACE', 'AKTUELLER SPACE')}</Text>
              <Text style={styles.spaceSwitch}>
                {t('switch / invite', 'wechseln / einladen')}{'  '}
                <Ionicons name="chevron-down" size={11} color={Colors.textMuted} />
              </Text>
            </View>
            <Text style={styles.spaceName}>
              {(activeSpace.emoji ? `${activeSpace.emoji}  ` : '') + activeSpace.name.toLowerCase()}
            </Text>
            <Text style={styles.spaceType}>
              {activeSpace.type === 'couple'
                ? t('couple space', 'Paar-Space')
                : t('friends space', 'Freunde-Space')}
            </Text>
            {/* Archive, not a scoreboard: a quiet line, never big vanity numbers. */}
            <Text style={styles.archiveLine}>
              {t(
                `${memories.length} moment${memories.length !== 1 ? 's' : ''} kept · ${chillyCount} challenge${chillyCount !== 1 ? 's' : ''} done together`,
                `${memories.length} Moment${memories.length !== 1 ? 'e' : ''} festgehalten · ${chillyCount} Challenge${chillyCount !== 1 ? 's' : ''} zusammen geschafft`,
              )}
            </Text>
          </TouchableOpacity>
        )}

        <SpacePicker
          visible={pickerOpen}
          spaces={spaces}
          activeSpaceId={activeSpace?.id}
          onSelect={(id) => { setActiveSpace(id); setPickerOpen(false); }}
          onClose={() => setPickerOpen(false)}
        />

        <View style={styles.linksBlock}>
          {links.map(({ emoji, label, route }) => (
            <PressableScale
              key={route}
              style={styles.linkRow}
              scaleTo={0.99}
              onPress={() => router.push(route)}
              accessibilityLabel={label}
            >
              <Text style={styles.linkText}>
                <Text style={styles.linkEmoji}>{emoji}  </Text>
                {label}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textFaint} />
            </PressableScale>
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
  spaceHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  spaceKicker: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2.5,
    color: Colors.textFaint,
    textTransform: 'uppercase',
  },
  spaceSwitch: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: Colors.textMuted,
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
  archiveLine: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: Spacing.md,
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
});
