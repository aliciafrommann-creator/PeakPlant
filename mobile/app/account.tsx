import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { isSupabaseConfigured } from '../lib/supabase/client';
import { signOut, deleteAccount } from '../lib/supabase/auth';
import { useAppStore } from '../lib/store';

export default function AccountScreen() {
  const reset = useAppStore((s) => s.reset);
  const [busy, setBusy] = useState(false);

  const handleSignOut = async () => {
    setBusy(true);
    try {
      if (isSupabaseConfigured) await signOut();
      await reset();
      router.replace('/');
    } catch {
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'delete your account?',
      'this permanently removes your account, your spaces where you are the only member, and your moments. this cannot be undone.',
      [
        { text: 'cancel', style: 'cancel' },
        {
          text: 'delete',
          style: 'destructive',
          onPress: handleDelete,
        },
      ],
    );
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      if (isSupabaseConfigured) await deleteAccount();
      await reset();
      router.replace('/');
    } catch (e) {
      setBusy(false);
      Alert.alert('could not delete', e instanceof Error ? e.message : 'please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Text style={styles.close}>CLOSE</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ACCOUNT & DATA</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          your diary is private to your spaces. you're always in control of your data.
        </Text>

        <TouchableOpacity
          style={styles.row}
          onPress={handleSignOut}
          disabled={busy}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>sign out</Text>
            <Text style={styles.rowDesc}>you can sign back in any time.</Text>
          </View>
          {busy ? (
            <ActivityIndicator color={Colors.accent} size="small" />
          ) : (
            <Text style={styles.arrow}>→</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerLabel}>DANGER ZONE</Text>
          <TouchableOpacity
            style={styles.dangerRow}
            onPress={confirmDelete}
            disabled={busy}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Delete account"
          >
            <View style={styles.rowText}>
              <Text style={styles.dangerText}>delete account</Text>
              <Text style={styles.rowDesc}>
                permanently removes your account and your moments. cannot be undone.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          questions about your data? hello@peak-plant.com
        </Text>
      </ScrollView>
    </SafeAreaView>
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
  content: { padding: Spacing.screen, gap: Spacing.lg, paddingBottom: Spacing.xxxl },
  lead: { fontSize: 14, fontWeight: '300', color: Colors.textMuted, lineHeight: 21 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rowText: { flex: 1, gap: 3 },
  rowLabel: { fontSize: 16, fontWeight: '400', color: Colors.text },
  rowDesc: { fontSize: 12, fontWeight: '300', color: Colors.textMuted, lineHeight: 17 },
  arrow: { fontSize: 18, fontWeight: '200', color: Colors.textMuted },
  dangerZone: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  dangerLabel: { fontSize: 9, fontWeight: '500', letterSpacing: 3, color: '#b42318' },
  dangerRow: {
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  dangerText: { fontSize: 16, fontWeight: '400', color: '#b42318' },
  footer: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textFaint,
    fontStyle: 'italic',
    marginTop: Spacing.lg,
  },
});
