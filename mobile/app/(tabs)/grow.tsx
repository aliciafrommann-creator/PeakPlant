import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SEED_EDITIONS, DECK_SIZE_RANGE } from '../../lib/seed';
import { cardRepository } from '../../lib/repositories';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useBiometric } from '../../lib/hooks/useBiometric';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { ShopLink } from '../../components/edition/ShopLink';
import type { Edition } from '../../lib/types';

export default function GrowScreen() {
  const { activeSpace } = useSpaces();
  const { authenticate } = useBiometric();
  const { t } = useLanguage();
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!activeSpace?.id) {
      setProgress({});
      return;
    }
    let active = true;
    Promise.all(
      SEED_EDITIONS.filter((e) => e.status === 'available').map(async (e) => {
        const cards = await cardRepository.getAll(e.id, activeSpace.id);
        return [e.id, cards.filter((c) => c.status === 'activated').length] as const;
      })
    ).then((entries) => {
      if (active) setProgress(Object.fromEntries(entries));
    });
    return () => {
      active = false;
    };
  }, [activeSpace?.id]);

  const handleEditionPress = useCallback(async (item: Edition) => {
    if (item.status !== 'available') return;
    if (item.sensitive) {
      const granted = await authenticate(t('unlock your private diary', 'privates Tagebuch entsperren'));
      if (!granted) return;
    }
    router.push(`/editions/${item.id}`);
  }, [authenticate, t]);

  function renderEdition({ item }: { item: Edition }) {
    const available = item.status === 'available';
    const done = progress[item.id] ?? 0;
    return (
      <TouchableOpacity
        style={[
          styles.card,
          { borderLeftWidth: 3, borderLeftColor: item.color },
          !available && styles.cardUpcoming,
        ]}
        onPress={() => void handleEditionPress(item)}
        disabled={!available}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ disabled: !available }}
        accessibilityLabel={`${item.name}, ${available ? t('open edition', 'Edition offnen') : t('coming soon', 'demnachst')}`}
      >
        <Text style={styles.symbol}>{item.symbol}</Text>
        <View style={styles.cardBody}>
          <Text style={styles.editionLabel}>{item.subtitle.toUpperCase()}</Text>
          <Text style={styles.name}>{item.name.toLowerCase()}</Text>
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
          <Text style={available ? styles.meta : styles.metaSoon}>
            {available
              ? t(`${done} of ${item.cardCount} preserved`, `${done} von ${item.cardCount} bewahrt`)
              : t(
                  `${DECK_SIZE_RANGE.min}-${DECK_SIZE_RANGE.max} cards - coming soon`,
                  `${DECK_SIZE_RANGE.min}-${DECK_SIZE_RANGE.max} Karten - demnachst`,
                )}
          </Text>
          {item.sensitive && available && (
            <Text style={styles.privateBadge}>{t('private - device only', 'privat - nur auf dem Gerat')}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={SEED_EDITIONS}
        keyExtractor={(e) => e.id}
        renderItem={renderEdition}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.kicker}>{t('EDITIONS', 'EDITIONEN')}</Text>
            <Text style={styles.title}>{t('grow', 'wachsen')}</Text>
            <Text style={styles.lead}>
              {t(
                'each edition is a deck of moments to collect together. open one, then scan the card you finished to preserve it.',
                'jede Edition ist ein Stapel Momente, die ihr gemeinsam sammelt. Offnet eine, scannt dann die fertige Karte, um sie zu bewahren.',
              )}
            </Text>
          </View>
        }
        ListFooterComponent={<ShopLink variant="inline" />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: Spacing.xl },
  header: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: 4,
  },
  kicker: { fontSize: 10, fontWeight: '500', letterSpacing: 3, color: Colors.textFaint },
  title: { fontSize: 28, fontWeight: '200', color: Colors.text, letterSpacing: -0.5 },
  lead: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 21,
    marginTop: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.sm,
    padding: Spacing.lg,
    backgroundColor: Colors.backgroundWarm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardUpcoming: { opacity: 0.55 },
  symbol: { fontSize: 28 },
  cardBody: { flex: 1, gap: 3 },
  editionLabel: { fontSize: 9, fontWeight: '500', letterSpacing: 2.5, color: Colors.accent },
  name: { fontSize: 20, fontWeight: '200', color: Colors.text, letterSpacing: -0.3 },
  desc: { fontSize: 13, fontWeight: '300', color: Colors.textMuted, lineHeight: 19 },
  meta: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Colors.textSubtle,
    marginTop: 4,
  },
  metaSoon: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Colors.textFaint,
    marginTop: 4,
  },
  privateBadge: {
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: Colors.accent,
    marginTop: 2,
  },
});
