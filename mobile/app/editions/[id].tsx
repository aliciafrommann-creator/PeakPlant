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
import { getEdition, SEED_EDITION, SEED_CARDS, sampleCardFor } from '../../lib/seed';
import { cardRepository } from '../../lib/repositories';
import { PressableScale } from '../../components/ui/PressableScale';
import { MemoryCard } from '../../components/memory/MemoryCard';
import { ShopLink } from '../../components/edition/ShopLink';
import { editionInk, EDITION_INK_DARK, EDITION_INK_LIGHT } from '../../lib/editionInk';
import { dyeFor } from '../../constants/dyes';
import { DyeField } from '../../components/ui/DyeField';
import { voice } from '../../lib/voice';
import { PrivacyScreen } from '../../components/ui/PrivacyScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Memory, MomentCard } from '../../lib/types';

export default function EditionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeSpace } = useSpaces();
  const v = voice(activeSpace?.type);
  const { memories, loading, error, refresh } = useMemories(activeSpace?.id);
  const obscured = usePrivacyOverlay();
  const { t, l } = useLanguage();

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

  // Die Tinte wird gerechnet, nicht aus dem Seed geglaubt (lib/editionInk.ts).
  // Und sie wird NICHT abgeschwächt: die frühere Deckkraft-Stufung
  // (0,62 / 0,5) blieb auf elf bzw. auf allen zwölf Editionsfarben unter den
  // 4,5:1, die kleine Schrift braucht. Hierarchie kommt hier aus Größe,
  // Gewicht und Sperrung.
  // Der Kopf trägt jetzt den GRUND der Färbung statt der flachen
  // Editionsfarbe (Entscheidung Alicia, 19.08.2026 — `constants/dyes.ts`).
  // Die Tinte wird weiter gerechnet und nicht angenommen: Der Grund IST zwar
  // per Wächter dunkel genug für Papierschrift, aber diese Zeile ist die
  // einzige Stelle, an der das gilt — und sie soll auch dann stimmen, wenn
  // jemand die Färbung ändert.
  const dye = dyeFor(edition.id);
  const flaeche = dye?.ground ?? edition.color;
  const fg = editionInk(flaeche);
  const sample = sampleCardFor(edition.id);
  const btnBg = fg;
  const btnText = fg === EDITION_INK_DARK ? EDITION_INK_LIGHT : EDITION_INK_DARK;

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
            <DyeField editionId={edition.id} style={styles.header}>
            <Text style={styles.symbol}>{edition.symbol}</Text>
            <Text style={[styles.editionLabel, { color: fg }]}>{edition.subtitle.toUpperCase()}</Text>
            <Text style={[styles.title, { color: fg }]}>{edition.name.toLowerCase()}</Text>
            <Text style={[styles.description, { color: fg }]}>{edition.description}</Text>

            <View style={styles.statsRow}>
              <Text style={[styles.stat, { color: fg }]}>{momentCount}</Text>
              {edition.sensitive && (
                <Text style={[styles.privateNote, { color: fg }]}>
                  {t(`this diary stays ${v.privateToSpace.en}`, `dieses Tagebuch bleibt ${v.privateToSpace.de}`)}
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
              <Text style={[styles.diaryLabel, { color: fg }]}>{t('YOUR DIARY', 'EUER TAGEBUCH')}</Text>
            )}
            </DyeField>

            {/* Die Beispielkarte. Vorher zeigte diese Seite zwölf nummerierte
                Umrisse und keinen einzigen Satz davon, was auf einer Karte
                steht — bei den angekündigten Editionen nicht einmal das.
                Eine offene Karte ist ein Beleg statt einer Behauptung
                (Alicia, 18.08.2026). */}
            {sample && (
              <PressableScale
                containerStyle={styles.sampleSlot}
                style={styles.sample}
                scaleTo={0.985}
                onPress={() => router.push({ pathname: '/card/[id]', params: { id: sample.id, sample: '1' } })}
                accessibilityLabel={t(
                  `Read the sample card: ${sample.content ? l(sample.content.title) : sample.prompt}`,
                  `Beispielkarte lesen: ${sample.content ? l(sample.content.title) : sample.prompt}`,
                )}
              >
                <Text style={styles.sampleLabel}>{t('SAMPLE CARD', 'BEISPIELKARTE')}</Text>
                <Text style={styles.sampleTitle}>
                  {sample.content ? l(sample.content.title) : sample.prompt}
                </Text>
                <Text style={styles.samplePrompt}>{sample.prompt}</Text>
                <Text style={styles.sampleCta}>
                  {edition.status === 'available'
                    ? t('read it — one of the twenty, open to everyone', 'lesen — eine der zwanzig, offen für alle')
                    : t('read it — this edition is still in the making', 'lesen — diese Edition entsteht noch')}
                </Text>
              </PressableScale>
            )}

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
                    // Die Beispielkarte ist bei den erschienenen Editionen eine
                    // echte Deck-Karte. Sie hier zusätzlich als „versiegelt"
                    // zu zeigen, hieße: derselbe Bildschirm sagt oben „offen
                    // für alle" und unten „die gedruckte Karte öffnet sie".
                    const istBeispiel = sample?.id === c.id;
                    return opened || istBeispiel ? (
                      <PressableScale
                        key={c.id}
                        containerStyle={styles.chipSlot}
                        style={[styles.chip, styles.chipOpen]}
                        scaleTo={0.96}
                        onPress={() =>
                          router.push({
                            pathname: '/card/[id]',
                            params: { id: c.id, ...(opened ? {} : { sample: '1' }) },
                          })
                        }
                        accessibilityLabel={
                          opened
                            ? t(
                                `Card ${c.number}, opened — read it again`,
                                `Karte ${c.number}, geöffnet — noch einmal lesen`,
                              )
                            : t(
                                `Card ${c.number}, the sample card — open to everyone`,
                                `Karte ${c.number}, die Beispielkarte — offen für alle`,
                              )
                        }
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
  // ACHTUNG, für alle Stile in diesem Kopf: Die Schriftfarbe wird beim
  // Rendern gesetzt (`fg`, gerechnet aus der Editionsfarbe). Hier steht
  // deshalb KEINE Farbe — ein statischer Wert, der nie zum Tragen kommt,
  // täuscht beim Lesen eine Entscheidung vor und liest sich beim Prüfen wie
  // ein Fehler. Genau das ist beim ersten Durchgang passiert.
  editionLabel: { fontSize: 12, fontWeight: '500', letterSpacing: 1.2 },
  title: { ...Typography.editorial },
  description: {
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  statsRow: { marginBottom: Spacing.sm },
  stat: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  privateNote: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 0.3,
    fontStyle: 'italic',
    marginTop: 4,
  },
  // Füllung und Beschriftung kommen ebenfalls beim Rendern (`btnBg`/`btnText`)
  // — die Werte hier waren tot und widersprachen sich sogar (Colors.accent mit
  // backgroundDark-Schrift wären 3,80:1).
  scanButton: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    borderRadius: Radii.pill,
  },
  scanButtonText: { fontSize: 11, fontWeight: '500', letterSpacing: 1.2 },
  diaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.2,
    marginTop: Spacing.xl,
  },
  sampleSlot: { paddingHorizontal: Spacing.screen, paddingTop: Spacing.lg },
  sample: {
    backgroundColor: Colors.backgroundWarm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: 6,
  },
  sampleLabel: { fontSize: 11, fontWeight: '500', letterSpacing: 1.4, color: Colors.textSubtle },
  sampleTitle: { ...Typography.cardTitle },
  samplePrompt: { fontSize: 13, fontWeight: '300', color: Colors.textMuted, lineHeight: 19 },
  sampleCta: { fontSize: 11, fontWeight: '600', letterSpacing: 1.2, color: Colors.accentInk, marginTop: 4 },
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
    // textFaint erreicht auf dem Papierton nur 3,03:1 — bei 13 pt zu wenig
    // (AA verlangt 4,5). textSubtle liegt bei 4,55:1 und sieht fast gleich
    // zurückgenommen aus.
    color: Colors.textSubtle,
    fontVariant: ['tabular-nums'],
  },
});
