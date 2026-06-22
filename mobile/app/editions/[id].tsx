import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useMemories } from '../../lib/hooks/useMemories';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { usePrivacyOverlay } from '../../lib/hooks/usePrivacyOverlay';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { getEdition, SEED_EDITION, SEED_CARDS } from '../../lib/seed';
import { MemoryCard } from '../../components/memory/MemoryCard';
import { ShopLink } from '../../components/edition/ShopLink';
import { PrivacyScreen } from '../../components/ui/PrivacyScreen';
import type { Memory } from '../../lib/types';

export default function EditionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeSpace } = useSpaces();
  const { memories, loading } = useMemories(activeSpace?.id);
  const obscured = usePrivacyOverlay();
  const { t } = useLanguage();

  const edition = getEdition(id ?? '') ?? SEED_EDITION;

  const editionCardIds = new Set(
    SEED_CARDS.filter((c) => c.edition === edition.id).map((c) => c.id)
  );
  const editionMemories = memories.filter((m) => editionCardIds.has(m.cardId));

  function getCard(cardId: string) {
    return SEED_CARDS.find((c) => c.id === cardId);
  }

  const onLight = edition.ink === 'dark';
  const fg = onLight ? '#1A1A1A' : '#FAF7F0';
  const fgMuted = onLight ? 'rgba(26,26,26,0.62)' : 'rgba(250,247,240,0.78)';
  const fgFaint = onLight ? 'rgba(26,26,26,0.5)' : 'rgba(250,247,240,0.62)';
  const btnBg = onLight ? '#1A1A1A' : '#FAF7F0';
  const btnText = onLight ? '#FAF7F0' : '#1A1A1A';

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

  const momentCount = t(
    `${editionMemories.length} moment${editionMemories.length !== 1 ? 's' : ''} preserved`,
    `${editionMemories.length} Moment${editionMemories.length !== 1 ? 'e' : ''} bewahrt`,
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bar}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('Back to editions', 'Zuruck zu Editionen')}
        >
          <Text style={styles.back}>{'<-'} {t('EDITIONS', 'EDITIONEN')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={editionMemories}
        keyExtractor={(item) => item.id}
        renderItem={renderMemory}
        ListHeaderComponent={
          <View style={[styles.header, { backgroundColor: edition.color }]}>
            <Text style={styles.symbol}>{edition.symbol}</Text>
            <Text style={[styles.editionLabel, { color: fg }]}>{edition.subtitle.toUpperCase()}</Text>
            <Text style={[styles.title, { color: fg }]}>{edition.name.toLowerCase()}</Text>
            <Text style={[styles.description, { color: fgMuted }]}>{edition.description}</Text>

            <View style={styles.statsRow}>
              <Text style={[styles.stat, { color: fgMuted }]}>{momentCount}</Text>
              {edition.sensitive && (
                <Text style={[styles.privateNote, { color: fgFaint }]}>
                  {t('this diary stays private on your device', 'dieses Tagebuch bleibt privat auf deinem Gerat')}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.scanButton, { backgroundColor: btnBg }]}
              onPress={() => router.push('/(tabs)/scan')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={t('Scan a card from this edition', 'Karte aus dieser Edition scannen')}
            >
              <Text style={[styles.scanButtonText, { color: btnText }]}>{t('SCAN A CARD', 'KARTE SCANNEN')}</Text>
            </TouchableOpacity>

            {editionMemories.length > 0 && (
              <Text style={[styles.diaryLabel, { color: fgFaint }]}>{t('YOUR DIARY', 'EUER TAGEBUCH')}</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t('no moments yet.', 'noch keine Momente.')}</Text>
              <Text style={styles.emptyHint}>
                {t(
                  'complete a card, then scan its QR code to add it to your diary.',
                  'Schliesse eine Karte ab, dann scanne ihren QR-Code, um sie eurem Tagebuch hinzuzufugen.',
                )}
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
      {edition.sensitive && obscured && <PrivacyScreen />}
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
  privateNote: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textFaint,
    letterSpacing: 0.3,
    fontStyle: 'italic',
    marginTop: 4,
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
