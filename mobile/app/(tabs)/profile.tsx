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
import { PeakRow } from '../../components/home/PeakRow';
import { spaceTheme } from '../../lib/spaceTheme';
import { PressableScale } from '../../components/ui/PressableScale';
import { SpacePicker } from '../../components/space/SpacePicker';
import { voice } from '../../lib/voice';

export default function ProfileScreen() {
  const { spaces, activeSpace, setActiveSpace } = useSpaces();
  const v = voice(activeSpace?.type);
  const { t } = useLanguage();
  const { memories, loading: memoriesLoading, error: memoriesError } = useMemories(activeSpace?.id);
  const { chillyCount } = useWeeklyChallenge(activeSpace?.id, activeSpace?.type);
  const ritualsEnabled = useAppStore((s) => s.features.rituals);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Me = trust & control center: your spaces, your archive, your settings.
  // No vanity metrics — links lead to control, not a public persona.
  const links: { emoji: string; label: string; route: string }[] = [
    // Die sechs Wege, die bis zum 19.08.2026 auf dem Startbildschirm standen.
    // Sie sind nicht gelöscht, sie haben hier ihr Zuhause bekommen: „Du" ist
    // der Ort für Steuerung und Nebenwege, der Startbildschirm der Ort für
    // die Momente. (Alicia auf dem Gerät: „der Home Screen ist ultra
    // überfordernd voll.")
    { emoji: '🏔️', label: t('take on this week', 'Woche annehmen'), route: '/challenges' },
    { emoji: '📝', label: t('write a note', 'Notiz schreiben'), route: '/note/compose' },
    { emoji: '💬', label: t('ask peakplant', 'peakplant fragen'), route: '/ask' },
    { emoji: '📷', label: t('scan a card', 'Karte scannen'), route: '/(tabs)/scan' },
    { emoji: '🌱', label: t(v.whatGrew.en, v.whatGrew.de), route: '/(tabs)/story' },
    { emoji: '🗂️', label: t('every moment, by month', 'jeder Moment, nach Monat'), route: '/(tabs)/moments' },
    { emoji: '🎨', label: t('customize peakplant', 'PeakPlant anpassen'), route: '/customize' },
    { emoji: '🔖', label: t('saved plans', 'gemerkte Pläne'), route: '/discover/saved' },
    ...(ritualsEnabled
      ? [{ emoji: '🌿', label: t(v.ritualsLink.en, v.ritualsLink.de), route: '/rituals' }]
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
        {/* Die Peaks stehen seit dem 19.08.2026 hier statt auf dem
            Startbildschirm. Alicias Wahl: die Wand führt dort allein. Eine
            Zahl über das eigene Sammeln gehört zu „Du" — dem Ort für alles,
            was man über sich selbst nachsieht. */}
        {activeSpace && (
          <PeakRow
            momentsKept={memories.length}
            spaceId={activeSpace.id}
            emoji={activeSpace.collectibleEmoji ?? spaceTheme(activeSpace.type).emoji}
            label={
              memories.length === 1
                ? t('1 peak collected', '1 Peak gesammelt')
                : t(`${memories.length} peaks collected`, `${memories.length} Peaks gesammelt`)
            }
          />
        )}

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
                : activeSpace.type === 'solo'
                  ? t('just you', 'nur du')
                  : t('friends space', 'Freunde-Space')}
            </Text>
            {/* Archive, not a scoreboard: a quiet line, never big vanity numbers. */}
            {!memoriesLoading && !memoriesError && (
            <Text style={styles.archiveLine}>
              {t(
                // Solange geladen wird oder das Laden scheiterte, ist die
                // Wahrheit „wir wissen es nicht" — und eine 0 wäre dann eine
                // Scheinzahl (MANIFESTO §1). Der Bildschirm sagt dann lieber
                // nichts über Zahlen.
                `${memories.length} moment${memories.length !== 1 ? 's' : ''} kept · ${chillyCount} challenge${chillyCount !== 1 ? 's' : ''} done`,
                `${memories.length} Moment${memories.length !== 1 ? 'e' : ''} festgehalten · ${chillyCount} Challenge${chillyCount !== 1 ? 's' : ''} geschafft`,
              )}
            </Text>
            )}
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
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: Colors.textSubtle,
  },
  title: {
    ...Typography.stack,
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
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: Colors.textSubtle,
    textTransform: 'uppercase',
  },
  spaceSwitch: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: Colors.textMuted,
  },
  spaceName: {
    ...Typography.title,
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
