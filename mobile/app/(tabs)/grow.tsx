import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SEED_EDITIONS, DECK_SIZE_RANGE } from '../../lib/seed';
import { cardRepository } from '../../lib/repositories';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { ShopLink } from '../../components/edition/ShopLink';
import type { Edition } from '../../lib/types';

export default function GrowScreen() {
  const { activeSpace } = useSpaces();
  const [progress, setProgress] = useState<Record<string, number>>({});

  // For each available edition, how many cards this space has preserved.
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
        onPress={() => available && router.push(`/editions/${item.id}`)}
        disabled={!available}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ disabled: !available }}
        accessibilityLabel={`${item.name}, ${available ? 'open edition' : 'coming soon'}`}
      >
        <Text style={styles.symbol}>{item.symbol}</Text>
        <View style={styles.cardBody}>
          <Text style={styles.editionLabel}>{item.subtitle.toUpperCase()}</Text>
          <Text style={styles.name}>{item.name.toLowerCase()}</Text>
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
          <Text style={available ? styles.meta : styles.metaSoon}>
            {available
              ? `${done} of ${item.cardCount} preserved`
              : `${DECK_SIZE_RANGE.min}–${DECK_SIZE_RANGE.max} cards · coming soon`}
          </Text>
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
            <Text style={styles.kicker}>EDITIONS</Text>
            <Text style={styles.title}>grow</Text>
            <Text style={styles.lead}>
              each edition is a deck of moments to collect together. open one,
              then scan the card you finished to preserve it.
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
});
