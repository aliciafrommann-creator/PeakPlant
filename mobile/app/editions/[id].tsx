import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useMemories } from '../../lib/hooks/useMemories';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { getEdition, SEED_EDITION, SEED_CARDS } from '../../lib/seed';
import { MemoryCard } from '../../components/memory/MemoryCard';
import { ShopLink } from '../../components/edition/ShopLink';
import type { Memory } from '../../lib/types';

export default function EditionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeSpace } = useSpaces();
  const { memories, loading } = useMemories(activeSpace?.id);

  const edition = getEdition(id ?? '') ?? SEED_EDITION;

  // Show only memories whose card belongs to this edition.
  const editionCardIds = new Set(
    SEED_CARDS.filter((c) => c.edition === edition.id).map((c) => c.id)
  );
  const editionMemories = memories.filter((m) => editionCardIds.has(m.cardId));

  function getCard(cardId: string) {
    return SEED_CARDS.find((c) => c.id === cardId);
  }

  function renderMemory({ item }: { item: Memory }) {
    return (
      <View style={styles.memoryWrapper}>
        <MemoryCard
          memory={item}
          card={getCard(item.cardId)}
          onPress={() => router.push(`/memory/${item.id}`)}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bar}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back to editions"
        >
          <Text style={styles.back}>← EDITIONS</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={editionMemories}
        keyExtractor={(item) => item.id}
        renderItem={renderMemory}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.symbol}>{edition.symbol}</Text>
            <Text style={styles.editionLabel}>{edition.subtitle.toUpperCase()}</Text>
            <Text style={styles.title}>{edition.name.toLowerCase()}</Text>
            <Text style={styles.description}>{edition.description}</Text>

            <View style={styles.statsRow}>
              <Text style={styles.stat}>
                {editionMemories.length} moment{editionMemories.length !== 1 ? 's' : ''} preserved
              </Text>
            </View>

            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => router.push('/(tabs)/scan')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Scan a card from this edition"
            >
              <Text style={styles.scanButtonText}>SCAN A CARD</Text>
            </TouchableOpacity>

            {editionMemories.length > 0 && (
              <Text style={styles.diaryLabel}>YOUR DIARY</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>no moments yet.</Text>
              <Text style={styles.emptyHint}>
                complete a card, then scan its QR code to add it to your diary.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          editionMemories.length > 0 ? <ShopLink variant="card" /> : null
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bar: {
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  back: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.textMuted },
  list: { paddingBottom: Spacing.xl },
  header: {
    backgroundColor: Colors.backgroundDark,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  symbol: { fontSize: 36, marginBottom: Spacing.sm },
  editionLabel: { fontSize: 10, fontWeight: '500', letterSpacing: 3, color: Colors.accent },
  title: { fontSize: 36, fontWeight: '200', color: Colors.white, letterSpacing: -0.5 },
  description: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.textFaint,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  statsRow: { marginBottom: Spacing.sm },
  stat: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 1.5,
    color: Colors.textSubtle,
    textTransform: 'uppercase',
  },
  scanButton: {
    height: 52,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  scanButtonText: { fontSize: 11, fontWeight: '500', letterSpacing: 3, color: Colors.backgroundDark },
  diaryLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.textFaint,
    marginTop: Spacing.xl,
  },
  memoryWrapper: { paddingHorizontal: Spacing.screen },
  empty: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: { fontSize: 18, fontWeight: '200', color: Colors.textMuted },
  emptyHint: {
    fontSize: 13,
    fontWeight: '300',
    color: Colors.textFaint,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
});
