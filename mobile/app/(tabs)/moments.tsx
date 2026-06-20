import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useMemories } from '../../lib/hooks/useMemories';
import { MemoryCard } from '../../components/memory/MemoryCard';
import { SEED_CARDS } from '../../lib/seed';
import type { Memory } from '../../lib/types';

export default function MomentsScreen() {
  const { memories, loading } = useMemories();

  function renderItem({ item }: { item: Memory }) {
    const card = SEED_CARDS.find((c) => c.id === item.cardId);
    return (
      <MemoryCard
        memory={item}
        card={card}
        onPress={() => router.push(`/memory/${item.id}`)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>moments</Text>
        <Text style={styles.subtitle}>your shared diary</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>loading moments...</Text>
        </View>
      ) : memories.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>no moments yet.</Text>
          <Text style={styles.emptyHint}>scan a card to begin.</Text>
        </View>
      ) : (
        <FlatList
          data={memories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.countLabel}>
              {memories.length} moment{memories.length !== 1 ? 's' : ''} collected
            </Text>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/memory/create')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+ MOMENT</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '200',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 2,
    color: Colors.textFaint,
    textTransform: 'uppercase',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '300',
    color: Colors.textFaint,
    letterSpacing: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '200',
    color: Colors.textMuted,
  },
  emptyHint: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.textFaint,
    letterSpacing: 0.5,
  },
  list: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: 80,
  },
  countLabel: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 1.5,
    color: Colors.textFaint,
    textTransform: 'uppercase',
    marginBottom: Spacing.lg,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.screen,
    backgroundColor: Colors.text,
    height: 44,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2,
    color: Colors.white,
  },
});
