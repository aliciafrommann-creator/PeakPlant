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
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { MemoryCard } from '../../components/memory/MemoryCard';
import { SpaceSwitcher } from '../../components/space/SpaceSwitcher';
import { SEED_CARDS } from '../../lib/seed';
import type { Memory } from '../../lib/types';

export default function MomentsScreen() {
  const { spaces, activeSpace, setActiveSpace } = useSpaces();
  const { memories, loading } = useMemories(activeSpace?.id);
  const { t } = useLanguage();

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

  const subtitle = activeSpace
    ? `${activeSpace.name.toLowerCase()} · ${t('shared diary', 'gemeinsames Tagebuch')}`
    : t('your shared diary', 'euer gemeinsames Tagebuch');

  const countLabel = t(
    `${memories.length} moment${memories.length !== 1 ? 's' : ''} collected`,
    `${memories.length} Moment${memories.length !== 1 ? 'e' : ''} gesammelt`,
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('moments', 'Momente')}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {spaces.length >= 1 && (
        <SpaceSwitcher
          spaces={spaces}
          activeSpaceId={activeSpace?.id}
          onSelect={setActiveSpace}
        />
      )}

      {loading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>{t('loading moments...', 'Momente werden geladen...')}</Text>
        </View>
      ) : memories.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t('no moments yet.', 'noch keine Momente.')}</Text>
          <Text style={styles.emptyHint}>{t('scan a card to begin.', 'Karte scannen, um zu beginnen.')}</Text>
        </View>
      ) : (
        <FlatList
          data={memories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.countLabel}>{countLabel}</Text>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/memory/create')}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={t('Add a moment', 'Moment hinzufugen')}
      >
        <Text style={styles.fabText}>+ {t('MOMENT', 'MOMENT')}</Text>
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
