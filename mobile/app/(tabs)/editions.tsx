import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows, Layout } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { SEED_EDITIONS } from '../../lib/seed';
import { cardRepository } from '../../lib/repositories';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useBiometric } from '../../lib/hooks/useBiometric';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { voice } from '../../lib/voice';
import { ShopLink } from '../../components/edition/ShopLink';
import type { Edition } from '../../lib/types';

export default function EditionsScreen() {
  const { activeSpace } = useSpaces();
  const v = voice(activeSpace?.type);
  const { authenticate } = useBiometric();
  const { t } = useLanguage();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [progressFailed, setProgressFailed] = useState(false);

  /**
   * Nur die Decks, die es wirklich gibt. Die geplanten standen bis zum
   * 18.08.2026 als ausgegraute, nicht antippbare Zeilen in derselben Liste:
   * drei echte und neun tote. Der einzige Reiter, der „eure Sammlung" heißt,
   * bestand zu drei Vierteln aus Dingen, die niemandem gehören und die man
   * nicht öffnen kann. Die Information ist nicht verloren — sie steht als
   * eine ehrliche Zeile unter der Liste (MANIFESTO §5).
   */
  const liveEditions = useMemo(
    () => SEED_EDITIONS.filter((e) => e.status === 'available'),
    [],
  );
  const plannedCount = SEED_EDITIONS.length - liveEditions.length;

  /**
   * Der Fortschritt wurde vorher ohne `catch` geladen: schlug der Aufruf fehl
   * (offline, RLS, Sitzung abgelaufen), blieb die Zusage stehen, `progress`
   * blieb leer — und jedes Deck behauptete „0 von 20 bewahrt". Eine Null, die
   * in Wahrheit „wir wissen es nicht" heißt, ist eine Scheinzahl
   * (MANIFESTO §1). Jetzt wird der Fehler benannt und ist wiederholbar.
   */
  const load = useCallback(() => {
    if (!activeSpace?.id) {
      setProgress({});
      setProgressFailed(false);
      setLoading(false);
      return () => {};
    }
    let active = true;
    setLoading(true);
    setProgressFailed(false);
    Promise.all(
      SEED_EDITIONS.filter((e) => e.status === 'available').map(async (e) => {
        const cards = await cardRepository.getAll(e.id, activeSpace.id);
        return [e.id, cards.filter((c) => c.status === 'activated').length] as const;
      })
    )
      .then((entries) => {
        if (!active) return;
        setProgress(Object.fromEntries(entries));
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setProgress({});
        setProgressFailed(true);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeSpace?.id]);

  useEffect(() => load(), [load]);

  // Nach einem Scan kehrt man hierher zurück — ohne das hier stand die Zeile
  // „N von 20 bewahrt" bis zum nächsten App-Start auf dem alten Wert, obwohl
  // die Karte gerade aufgeschlagen wurde.
  useFocusEffect(useCallback(() => load(), [load]));

  const handleEditionPress = useCallback(async (item: Edition) => {
    if (item.status !== 'available') return;
    if (item.sensitive) {
      const granted = await authenticate(t('unlock your private diary', 'privates Tagebuch entsperren'));
      if (!granted) return;
    }
    router.push(`/editions/${item.id}`);
  }, [authenticate, t]);

  /** `liveEditions` filtert bereits — hier kommt nur an, was es wirklich gibt. */
  function renderEdition({ item }: { item: Edition }) {
    const done = progress[item.id] ?? 0;
    return (
      <TouchableOpacity
        style={[styles.card, { borderLeftWidth: 3, borderLeftColor: item.color }]}
        onPress={() => void handleEditionPress(item)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${t('open edition', 'Edition öffnen')}`}
      >
        <Text style={styles.symbol}>{item.symbol}</Text>
        <View style={styles.cardBody}>
          <Text style={styles.editionLabel}>{item.subtitle.toUpperCase()}</Text>
          <Text style={styles.name}>{item.name.toLowerCase()}</Text>
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.meta}>
            {/* „0 von 20" waere gelogen, solange wir es nicht wissen — beim
                Laden und nach einem Fehler steht deshalb die Deckgroesse da,
                nicht eine Null (MANIFESTO §1). */}
            {loading || progressFailed
              ? t(`${item.cardCount} cards`, `${item.cardCount} Karten`)
              : done > 0 && item.cardCount > 0 && done >= item.cardCount
                ? t('✦ every moment preserved', '✦ jeder Moment bewahrt')
                : t(`${done} of ${item.cardCount} preserved`, `${done} von ${item.cardCount} bewahrt`)}
          </Text>
          {item.sensitive && (
            <Text style={styles.privateBadge}>{t(v.privateBadge.en, v.privateBadge.de)}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={liveEditions}
        keyExtractor={(e) => e.id}
        renderItem={renderEdition}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.kicker}>{t('COLLECTION', 'SAMMLUNG')}</Text>
                <Text style={styles.title}>{t('your editions', 'deine Editionen')}</Text>
              </View>
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => router.push('/(tabs)/scan')}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={t('Scan a card', 'Karte scannen')}
              >
                <Text style={styles.scanButtonText}>{t('SCAN CARD', 'KARTE SCANNEN')}</Text>
              </TouchableOpacity>
            </View>
            {progressFailed && (
              <TouchableOpacity
                style={styles.retry}
                onPress={load}
                accessibilityRole="button"
                accessibilityLabel={t('Try loading your progress again', 'Fortschritt erneut laden')}
              >
                <Text style={styles.retryText}>
                  {t(
                    "we could not read how far you are. your cards are safe — tap to try again.",
                    'wir konnten euren Stand nicht lesen. Eure Karten sind sicher — tippen zum erneut Versuchen.',
                  )}
                </Text>
              </TouchableOpacity>
            )}
            {/* ENTSCHEIDUNG (Alicia, 18.08.2026): Die App ist ohne Deck
                vollwertig — Ideen, Orte, Challenges, Notizen und das Tagebuch
                brauchen keine Karte. Die Decks sind die physische Ausgabe, man
                kauft und scannt sie.

                Vorher las sich dieser Absatz, als sei die Karte der Eingang
                („öffnet eine, scannt dann die fertige Karte"): für alle ohne
                Deck — und das sind bis Oktober alle — klang der einzige Reiter
                mit ihrem Namen wie eine verschlossene Tür. Jetzt steht da, was
                stimmt: das Deck ist das Schöne obendrauf, nicht die Eintritts-
                karte (MANIFESTO §1). */}
            <Text style={styles.lead}>
              {t(
                'everything in PeakPlant works without a deck — ideas, places, challenges, your diary. an edition is the printed version: real cards on seed paper, to pull together and scan.',
                'alles in PeakPlant geht ohne Deck — Ideen, Orte, Challenges, euer Tagebuch. Eine Edition ist die gedruckte Fassung: echte Karten auf Saatpapier, zum gemeinsamen Ziehen und Scannen.',
              )}
            </Text>
          </View>
        }
        ListFooterComponent={
          <>
            {/* Vorher standen die geplanten Editionen als ausgegraute,
                nicht antippbare Zeilen in der Liste: drei echte Decks und
                neun tote. Drei Viertel des Reiters waren ein abgeschalteter
                Katalog — der einzige Reiter, der „eure Sammlung" heißt, zeigte
                überwiegend Dinge, die euch nicht gehören und die man nicht
                öffnen kann. Die Information ist nicht weg, sie ist jetzt eine
                Zeile statt neun Sackgassen (MANIFESTO §5). */}
            {plannedCount > 0 && (
              <Text style={styles.planned}>
                {plannedCount === 1
                  ? t('one more edition is in the works.', 'eine weitere Edition ist in Arbeit.')
                  : t(
                      `${plannedCount} more editions are in the works.`,
                      `${plannedCount} weitere Editionen sind in Arbeit.`,
                    )}
              </Text>
            )}
            <ShopLink variant="inline" />
          </>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: Spacing.xl },
  retry: {
    marginTop: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  retryText: {
    ...Typography.micro,
    color: Colors.accentInk,
  },
  planned: {
    ...Typography.micro,
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  header: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  kicker: { fontSize: 12, fontWeight: '500', letterSpacing: 1.2, color: Colors.textSubtle },
  title: { ...Typography.editorial },
  lead: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 21,
  },
  scanButton: {
    height: Layout.tapMin,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  scanButtonText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: Colors.text,
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
    borderRadius: Radii.md,
    ...Shadows.subtle,
  },
  symbol: { fontSize: 28 },
  cardBody: { flex: 1, gap: 3 },
  editionLabel: { fontSize: 11, fontWeight: '500', letterSpacing: 1.2, color: Colors.textSubtle },
  name: { fontSize: 20, fontWeight: '300', color: Colors.text, letterSpacing: -0.3 },
  desc: { fontSize: 13, fontWeight: '300', color: Colors.textMuted, lineHeight: 19 },
  meta: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Colors.textSubtle,
    marginTop: 4,
  },
  privateBadge: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.textSubtle,
    marginTop: 2,
  },
});
