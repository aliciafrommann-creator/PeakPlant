import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useLanguage } from '../../lib/hooks/useLanguage';

export default function CommunityScreen() {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>{t('COMMUNITIES', 'GEMEINSCHAFTEN')}</Text>
        <Text style={styles.title}>{t('coming soon', 'demnächst')}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.desc}>
          {t(
            'connect with other couples. see what people are growing together. share the moments that matter.',
            'Verbinde euch mit anderen Paaren. Seht, was andere zusammen wachsen lassen. Teilt die Momente, die zählen.',
          )}
        </Text>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>✦</Text>
        </View>
      </View>
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
  body: {
    flex: 1,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xxl,
    gap: Spacing.xl,
  },
  desc: {
    fontSize: 16,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 26,
  },
  placeholder: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
  },
  placeholderText: {
    fontSize: 48,
    color: Colors.accentLight,
  },
});
