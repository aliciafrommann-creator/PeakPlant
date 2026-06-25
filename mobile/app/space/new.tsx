import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { spaceRepository } from '../../lib/repositories';
import { getActiveUser } from '../../lib/session';
import { useAppStore } from '../../lib/store';
import { useLanguage } from '../../lib/hooks/useLanguage';
import type { SpaceType } from '../../lib/types';

export default function NewSpaceScreen() {
  const setActiveSpace = useAppStore((s) => s.setActiveSpace);
  const { t } = useLanguage();

  const [type, setType] = useState<SpaceType>('friends');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const user = await getActiveUser();
      if (!user) throw new Error('not signed in');
      const space = await spaceRepository.create({
        type,
        name,
        ownerUserId: user.id,
        ownerName: user.name,
      });
      setActiveSpace(space.id);
      router.back();
    } catch {
      setBusy(false);
      setError(t("couldn't create the space. please try again.", 'Space konnte nicht erstellt werden. Bitte versuche es erneut.'));
    }
  };

  const join = async () => {
    if (!code.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const user = await getActiveUser();
      if (!user) throw new Error('not signed in');
      const space = await spaceRepository.joinByCode(code, user.id, user.name);
      setActiveSpace(space.id);
      router.back();
    } catch {
      setBusy(false);
      setError(t("that code didn't work. check it and try again.", 'Dieser Code hat nicht funktioniert. Prufe ihn und versuche es erneut.'));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('Close', 'Schliessen')}
          >
            <Text style={styles.close}>{t('CLOSE', 'SCHLIESSEN')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('NEW SPACE', 'NEUER SPACE')}</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.lead}>
            {t(
              'a space is shared with the people in it. you can be in as many as you like.',
              'Ein Space wird mit den Personen darin geteilt. Du kannst in so vielen sein, wie du mochtest.',
            )}
          </Text>

          <View style={styles.section}>
            <Text style={styles.label}>{t('WHAT KIND OF SPACE?', 'WELCHE ART VON SPACE?')}</Text>
            <View style={styles.typeRow}>
              {(['couple', 'friends'] as SpaceType[]).map((spaceType) => {
                const active = type === spaceType;
                return (
                  <TouchableOpacity
                    key={spaceType}
                    style={[styles.typeChip, active ? styles.typeActive : styles.typeIdle]}
                    onPress={() => setType(spaceType)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={spaceType === 'couple' ? t('A couple', 'Ein Paar') : t('Friends', 'Freunde')}
                  >
                    <Text style={[styles.typeText, active && styles.typeTextActive]}>
                      {spaceType === 'couple' ? t('a couple', 'ein Paar') : t('friends', 'Freunde')}
                    </Text>
                    <Text style={[styles.typeHint, active && styles.typeHintActive]}>
                      {spaceType === 'couple'
                        ? t('just the two of you', 'nur ihr zwei')
                        : t('a small group', 'eine kleine Gruppe')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t('NAME', 'NAME')}</Text>
            <TextInput
              style={styles.input}
              placeholder={type === 'couple'
                ? t('e.g. you & them', 'z.B. ihr & er/sie')
                : t('e.g. the saturday people', 'z.B. die Samstagsmenschen')}
              placeholderTextColor={Colors.textFaint}
              value={name}
              onChangeText={setName}
              maxLength={40}
            />
          </View>

          <TouchableOpacity
            style={[styles.primary, !name.trim() && styles.primaryDisabled]}
            onPress={create}
            disabled={!name.trim() || busy}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('Create space', 'Space erstellen')}
          >
            <Text style={styles.primaryText}>{t('CREATE SPACE', 'SPACE ERSTELLEN')}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('OR JOIN ONE', 'ODER EINEM BEITRETEN')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t('INVITE CODE', 'EINLADUNGSCODE')}</Text>
            <TextInput
              style={styles.input}
              placeholder="PEAK-0000"
              placeholderTextColor={Colors.textFaint}
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              maxLength={11}
            />
          </View>

          <TouchableOpacity
            style={[styles.secondary, !code.trim() && styles.primaryDisabled]}
            onPress={join}
            disabled={!code.trim() || busy}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('Join with code', 'Mit Code beitreten')}
          >
            <Text style={styles.secondaryText}>{t('JOIN WITH CODE', 'MIT CODE BEITRETEN')}</Text>
          </TouchableOpacity>

          {error && (
            <Text style={styles.error} accessibilityLiveRegion="polite">
              {error}
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  close: { fontSize: 10, fontWeight: '400', letterSpacing: 2, color: Colors.textMuted },
  headerTitle: { fontSize: 10, fontWeight: '500', letterSpacing: 2.5, color: Colors.text },
  content: { padding: Spacing.screen, gap: Spacing.xl, paddingBottom: Spacing.xxxl },
  lead: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 21,
  },
  section: { gap: Spacing.sm },
  label: { fontSize: 9, fontWeight: '500', letterSpacing: 3, color: Colors.textFaint },
  typeRow: { flexDirection: 'row', gap: Spacing.sm },
  typeChip: { flex: 1, padding: Spacing.md, gap: 4 },
  typeIdle: { backgroundColor: Colors.backgroundWarm, borderWidth: 1, borderColor: Colors.border },
  typeActive: { backgroundColor: Colors.text },
  typeText: { fontSize: 15, fontWeight: '400', color: Colors.text },
  typeTextActive: { color: Colors.white },
  typeHint: { fontSize: 11, fontWeight: '300', color: Colors.textMuted },
  typeHintActive: { color: Colors.textFaint },
  input: {
    fontSize: 16,
    fontWeight: '300',
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
    letterSpacing: 0.2,
  },
  primary: {
    height: 52,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  primaryDisabled: { opacity: 0.35 },
  primaryText: { fontSize: 11, fontWeight: '500', letterSpacing: 2.5, color: Colors.white },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 9, fontWeight: '400', letterSpacing: 2, color: Colors.textFaint },
  secondary: {
    height: 52,
    borderWidth: 1,
    borderColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  secondaryText: { fontSize: 11, fontWeight: '500', letterSpacing: 2.5, color: Colors.text },
  error: { fontSize: 13, fontWeight: '400', color: '#b42318', lineHeight: 19 },
});
