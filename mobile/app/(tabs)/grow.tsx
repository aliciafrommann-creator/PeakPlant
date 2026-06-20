import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { EditionHeader } from '../../components/edition/EditionHeader';
import { MomentCardItem } from '../../components/edition/MomentCardItem';
import { useEdition } from '../../lib/hooks/useEdition';
import type { MomentCard } from '../../lib/types';

export default function GrowScreen() {
  const { edition, cards, activatedCount } = useEdition();

  function renderCard({ item }: { item: MomentCard }) {
    return (
      <View style={styles.cardWrapper}>
        <MomentCardItem card={item} onPress={() => router.push(`/card/${item.id}`)} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <EditionHeader edition={edition} activatedCount={activatedCount} />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    paddingBottom: Spacing.xl,
  },
  row: {
    paddingHorizontal: Spacing.screen,
    gap: 8,
    marginBottom: 8,
  },
  cardWrapper: {
    flex: 1,
  },
});
