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
import { Spacing } from '../../constants/spacing';
import { spaceRepository } from '../../lib/repositories';
import { getActiveUser } from '../../lib/session';
import { useAppStore } from '../../lib/store';
import type { SpaceType } from '../../lib/types';

export default function NewSpaceScreen() {
  const setActiveSpace = useAppStore((s) => s.setActiveSpace);

  const [type, setType] = useState<SpaceType>('friends');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      const user = await getActiveUser();
      if (!user) throw new Error('Not signed in');
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
    }
  };

  const join = async () => {
    if (!code.trim() || busy) return;
    setBusy(true);
    try {
      const user = await getActiveUser();
      if (!user) throw new Error('Not signed in');
      const space = await spaceRepository.joinByCode(code, user.id, user.name);
      setActiveSpace(space.id);
      router.back();
    } catch {
      setBusy(false);
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
            accessibilityLabel="Close"
          >
            <Text style={styles.close}>CLOSE</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>NEW SPACE</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.lead}>
            a space is shared with the people in it. you can be in as many as you like.
          </Text>

          <View style={styles.section}>
            <Text style={styles.label}>WHAT KIND OF SPACE?</Text>
            <View style={styles.typeRow}>
              {(['couple', 'friends'] as SpaceType[]).map((t) => {
                const active = type === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeChip, active ? styles.typeActive : styles.typeIdle]}
                    onPress={() => setType(t)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={t === 'couple' ? 'A couple' : 'Friends'}
                  >
                    <Text style={[styles.typeText, active && styles.typeTextActive]}>
                      {t === 'couple' ? 'a couple' : 'friends'}
                    </Text>
                    <Text style={[styles.typeHint, active && styles.typeHintActive]}>
                      {t === 'couple' ? 'just the two of you' : 'a small group'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>NAME</Text>
            <TextInput
              style={styles.input}
              placeholder={type === 'couple' ? 'e.g. you & them' : 'e.g. the saturday people'}
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
            accessibilityLabel="Create space"
          >
            <Text style={styles.primaryText}>CREATE SPACE</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR JOIN ONE</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>INVITE CODE</Text>
            <TextInput
              style={styles.input}
              placeholder="PEAK-0000"
              placeholderTextColor={Colors.textFaint}
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              maxLength={9}
            />
          </View>

          <TouchableOpacity
            style={[styles.secondary, !code.trim() && styles.primaryDisabled]}
            onPress={join}
            disabled={!code.trim() || busy}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Join with code"
          >
            <Text style={styles.secondaryText}>JOIN WITH CODE</Text>
          </TouchableOpacity>
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
  },
  secondaryText: { fontSize: 11, fontWeight: '500', letterSpacing: 2.5, color: Colors.text },
});
