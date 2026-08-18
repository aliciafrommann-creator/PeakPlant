import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { BackButton } from '../../components/ui/BackButton';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useMemories } from '../../lib/hooks/useMemories';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { usePrivacyOverlay } from '../../lib/hooks/usePrivacyOverlay';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { getEdition, SEED_EDITION, SEED_CARDS } from '../../lib/seed';
import { cardRepository } from '../../lib/repositories';
import { PressableScale } from '../../components/ui/PressableScale';
import { MemoryCard } from '../../components/memory/MemoryCard';
import { ShopLink } from '../../components/edition/ShopLink';
import { PrivacyScreen } from '../../components/ui/PrivacyScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Memory, MomentCard } from '../../lib/types';

export default function EditionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeSpace } = useSpaces();
  const { memories, loading, error, refresh } = useMemories(activeSpace?.id);
  const obscured = usePrivacyOverlay();
  const { t } = useLanguage();

  const edition = getEdition(id ?? '') ?? SEED_EDITION;

  /**
   * Die Karten des Decks — bis zum 18.08.2026 zeigte diese Seite nur die
   * bereits bewahrten Momente. Zwei Löcher auf einmal:
   *
   *   1. Wer eine Karte gescannt hatte, kam nie wieder an sie heran. Die
   *      geführte Erfahrung (Anleitung, Fragen, „haltet es fest") war nach
   *      einmal Lesen verschwunden.
   *   2. Wer noch kein Deck hat, sah nicht, was eine Edition der App
   *      hinzufügt — und das ist genau der Mehrwert des Kaufs
   *      (Entscheidung Alicia, 18.08.2026).
   *
   * Ehrlich zur Versiegelung (MANIFESTO §1): `sealed` ist eine Produktgrenze,
   * keine Verschlüsselung. Die Texte liegen im App-Bundle; wer es auspackt,
   * sieht sie. Die Oberfläche behauptet deshalb nirgends „geschützt" oder
   * „verschlüsselt", sondern nur, was stimmt: die gedruckte Karte öffnet sie.
   */
  const [cards, setCards] = useState<MomentCard[]>([]);
  const [cardsFailed, setCardsFailed] = useState(false);

  const loadCards = useCallback(() => {
    if (!activeSpace?.id) {
      setCards([]);
      return () => {};
    }
    let alive = true;
    setCardsFailed(false);
    cardRepository
      .getAll(edition.id, activeSpace.id)
      .then((c) => { if (alive) setCards(c); })
      .catch(() => { if (alive) { setCards([]); setCardsFailed(true); } });
    return () => { alive = false; };
  }, [activeSpace?.id, edition.id]);

  useEffect(() => loadCards(), [loadCards]);

  const openedCount = cards.filter((c) => c.status === 'activated').length;

  const editionCardIds = new Set(
    SEED_CARDS.filter((c) => c.edition === edition.id).map((c) => c.id)
  );
  const editionMemories = memories.filter((m) => m.cardId !== undefined && editionCardIds.has(m.cardId));

  function getCard(cardId: string | undefined) {
    if (!cardId) return undefined;
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
        <BackButton label={t('EDITIONS', 'EDITIONEN')} />
      </View>

      <FlatList
        data={editionMemories}
        keyExtractor={(item) => item.id}
        renderItem={renderMemory}
        refreshControl={
          <RefreshControl
            refreshing={loading && editionMemories.length > 0}
            onRefresh={refresh}
            tintColor={Colors.accent}
          />
        }
        ListHeaderComponent={
          <>
            <View style={[styles.header, { backgroundColor: edition.color }]}>
            <Text style={styles.symbol}>{edition.symbol}</Text>
            <Text style={[styles.editionLabel, { color: fg }]}>{edition.subtitle.toUpperCase()}</Text>
            <Text style={[styles.title, { color: fg }]}>{edition.name.toLowerCase()}</Text>
            <Text style={[styles.description, { color: fgMuted }]}>{edition.description}</Text>

            <View style={styles.statsRow}>
              <Text style={[styles.stat, { color: fgMuted }]}>{momentCount}</Text>
              {edition.sensitive && (
                <Text style={[styles.privateNote, { color: fgFaint }]}>
                  {t('this diary stays private to you two', 'dieses Tagebuch bleibt privat — nur für euch beide')}
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

            {/* Das Deck. Aufgeschlagene Karten sind wieder lesbar, versiegelte
                zeigen, was die gedruckte Ausgabe der App hinzufügt. */}
            {/* Auch bei cardsFailed rendern: der Hinweis war vorher in
                `cards.length > 0` eingeschlossen — und `cards` ist leer genau
                dann, wenn das Laden fehlschlug. Der Wiederholen-Knopf konnte
                also nie erscheinen, und die Seite sah aus wie eine Edition
                ohne Karten. */}
            {(cards.length > 0 || cardsFailed) && (
              <View style={styles.deck}>
                <Text style={styles.deckLabel}>{t('THE DECK', 'DAS DECK')}</Text>

                {cardsFailed && (
                  <TouchableOpacity onPress={loadCards} accessibilityRole="button">
                    <Text style={styles.deckRetry}>
                      {t('could not load the deck — tap to try again.', 'das Deck konnte nicht geladen werden — tippen zum erneut Versuchen.')}
                    </Text>
                  </TouchableOpacity>
                )}

                {cards.length > 0 && (
                <Text style={styles.deckHint}>
                  {openedCount > 0
                    ? t(
                        `${openedCount} of ${cards.length} cards opened. tap one to read it again.`,
                        `${openedCount} von ${cards.length} Karten geöffnet. Tippt eine an, um sie noch einmal zu lesen.`,
                      )
                    : t(
                        'each card brings a guided evening into the app — something to do, questions to ask, and what to keep. the printed card opens it.',
                        'jede Karte bringt einen geführten Abend in die App — etwas zum Tun, Fragen zum Sprechen und was ihr festhaltet. Die gedruckte Karte öffnet sie.',
                      )}
                </Text>
                )}

                <View style={styles.deckGrid}>
                  {cards.map((c) => {
                    const opened = c.status === 'activated';
                    return opened ? (
                      <PressableScale
                        key={c.id}
                        containerStyle={styles.chipSlot}
                        style={[styles.chip, styles.chipOpen]}
                        scaleTo={0.96}
                        onPress={() => router.push(`/card/${c.id}`)}
                        accessibilityLabel={t(
                          `Card ${c.number}, opened — read it again`,
                          `Karte ${c.number}, geöffnet — noch einmal lesen`,
                        )}
                      >
                        <Text style={styles.chipNumOpen}>{String(c.number).padStart(2, '0')}</Text>
                      </PressableScale>
                    ) : (
                      <View
                        key={c.id}
                        style={[styles.chip, styles.chipSealed]}
                        accessible
                        accessibilityLabel={t(
                          `Card ${c.number}, sealed — the printed card opens it`,
                          `Karte ${c.number}, versiegelt — die gedruckte Karte öffnet sie`,
                        )}
                      >
                        <Text style={styles.chipNumSealed}>{String(c.number).padStart(2, '0')}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          loading ? null : error ? (
            <EmptyState
              title={t("couldn't load your diary.", 'euer Tagebuch konnte nicht geladen werden.')}
              hint={t(
                'your moments are safe — this is just a connection hiccup.',
                'eure Momente sind sicher — das ist nur ein Verbindungsproblem.',
              )}
              ctaLabel={t('TRY AGAIN', 'ERNEUT VERSUCHEN')}
              onCta={refresh}
            />
          ) : (
            // Vorher stand hier nur Text: eine Anleitung für etwas, das ohne
            // physisches Deck niemand tun kann, und kein Weg weiter. Jetzt
            // dieselbe Erklärung, aber mit einem Ausgang (MANIFESTO §5).
            <EmptyState
              title={t('no moments yet.', 'noch keine Momente.')}
              hint={t(
                'complete a card, then scan its QR code to add it to your diary.',
                'Schließt eine Karte ab, dann scannt ihren QR-Code, um sie eurem Tagebuch hinzuzufügen.',
              )}
              ctaLabel={t('SCAN A CARD', 'KARTE SCANNEN')}
              onCta={() => router.push('/(tabs)/scan')}
              secondaryLabel={t('no deck yet? keep a moment anyway', 'noch kein Deck? trotzdem einen Moment festhalten')}
              onSecondary={() => router.push('/memory/create')}
            />
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
  back: { fontSize: 12, fontWeight: '500', letterSpacing: 1.2, color: Colors.textMuted },
  list: { paddingBottom: Spacing.xl },
  header: {
    backgroundColor: Colors.backgroundDark,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  symbol: { fontSize: 36, marginBottom: Spacing.sm },
  editionLabel: { fontSize: 12, fontWeight: '500', letterSpacing: 1.2, color: Colors.textSubtle },
  title: { ...Typography.editorial, color: Colors.white },
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
    color: Colors.textSubtle,
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
    borderRadius: Radii.pill,
  },
  scanButtonText: { fontSize: 11, fontWeight: '500', letterSpacing: 1.2, color: Colors.backgroundDark },
  diaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: Colors.textSubtle,
    marginTop: Spacing.xl,
  },
  memoryWrapper: { paddingHorizontal: Spacing.screen },
  deck: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  deckLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  deckHint: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    color: Colors.textMuted,
  },
  deckRetry: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.accentInk,
    paddingVertical: Spacing.xs,
  },
  deckGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  chipSlot: {},
  chip: {
    width: 46,
    height: 46,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Geöffnet: volle Farbe, antippbar — die Karte ist wieder lesbar. */
  chipOpen: {
    backgroundColor: Colors.text,
  },
  chipNumOpen: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.white,
    fontVariant: ['tabular-nums'],
  },
  /** Versiegelt: nur Umriss. Kein Schloss-Symbol — es ist keine Sicherheits-
      sperre, sondern eine Karte, die noch niemand gezogen hat. */
  chipSealed: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
  },
  chipNumSealed: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textFaint,
    fontVariant: ['tabular-nums'],
  },
});
