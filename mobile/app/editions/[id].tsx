import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { EditionHeader } from '../../components/edition/EditionHeader';
import { MomentCardItem } from '../../components/edition/MomentCardItem';
import { useEdition } from '../../lib/hooks/useEdition';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useAppStore } from '../../lib/store';
import { ai } from '../../lib/ai';
import type { MomentCard } from '../../lib/types';
import type { CardSuggestion } from '../../lib/ai/types';

export default function EditionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeSpace } = useSpaces();
  const { edition, cards, loading, activatedCount } = useEdition(activeSpace?.id, id);
  const goals = useAppStore((s) => s.goals);
  const [suggestion, setSuggestion] = useState<CardSuggestion | null>(null);

  useEffect(() => {
    if (loading || cards.length === 0) return;
    const context = {
      goals,
      activatedCardIds: cards.filter((c) => c.status === 'activated').map((c) => c.id),
      edition: edition.id,
      sealedCardCount: cards.filter((c) => c.status === 'sealed').length,
      totalMemories: cards.filter((c) => c.status === 'activated').length,
    };
    ai.suggestCard(context, cards).then(setSuggestion).catch(() => setSuggestion(null));
  }, [loading, cards, goals, edition.id]);

  function renderCard({ item }: { item: MomentCard }) {
    const isSuggested = suggestion?.cardId === item.id;
    return (
      <View style={styles.cardWrapper}>
        <MomentCardItem
          card={item}
          onPress={() => router.push(`/card/${item.id}`)}
          isSuggested={isSuggested}
        />
        {isSuggested && suggestion?.rationale ? (
          <Text style={styles.rationale}>{suggestion.rationale}</Text>
        ) : null}
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
        data={cards}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={<EditionHeader edition={edition} activatedCount={activatedCount} />}
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
  row: { paddingHorizontal: Spacing.screen, gap: 8, marginBottom: 8 },
  cardWrapper: { flex: 1 },
  rationale: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Colors.accent,
    marginTop: 4,
    marginBottom: 4,
  },
});
