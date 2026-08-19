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
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '../../components/ui/PressableScale';
import { DyeField, dyeOf } from '../../components/ui/DyeField';
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
        style={styles.card}
        onPress={() => void handleEditionPress(item)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${t('open edition', 'Edition öffnen')}`}
      >
        <DyeField editionId={item.id} style={styles.band}>
          <Text style={styles.symbol}>{dyeOf(item.id).emoji}</Text>
        </DyeField>
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
            </View>

            {/* DER SCANNER IST DIE HAUPTHANDLUNG DIESES BILDSCHIRMS.
                Er stand hier als kleine Pille oben rechts, gleich laut wie
                eine Rückwärts-Beschriftung — dabei ist er die eine Bewegung,
                auf der das ganze Produkt beruht: gedruckte Karte → Scan →
                Tagebuch. Ohne ihn ist eine Edition ein Katalog.
                (Alicia, 19.08.2026: „manche Wege sollten prominenter sein und
                nicht random irgendwo als Button.") */}
            <PressableScale
              containerStyle={styles.scanSlot}
              style={styles.scanButton}
              onPress={() => router.push('/(tabs)/scan')}
              scaleTo={0.98}
              accessibilityLabel={t('Scan a card', 'Karte scannen')}
            >
              <Ionicons name="qr-code-outline" size={18} color={Colors.background} />
              <Text style={styles.scanButtonText}>{t('SCAN A CARD', 'KARTE SCANNEN')}</Text>
            </PressableScale>
            {progressFailed && (
              <TouchableOpacity
                style={styles.retry}
                onPress={load}
                accessibilityRole="button"
                accessibilityLabel={t('Try loading your progress again', 'Fortschritt erneut laden')}
              >
                <Text style={styles.retryText}>
                  {t(v.editionProgressFailed.en, v.editionProgressFailed.de)}
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
              {t(v.deckOptionalLead.en, v.deckOptionalLead.de)}
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
            {/* Seit dem 18.08.2026 wieder antippbar — nach derselben Regel,
                die sie damals zu einer Zeile gemacht hat. K3 sagt: Biete keine
                Handlung an, die niemand ausführen kann. Damals führte hinter
                jeder geplanten Edition eine leere Seite; jetzt liegt dort eine
                offen lesbare Beispielkarte, also GIBT es eine Handlung. Ohne
                diesen Weg wären die neun Karten toter Code. */}
            {plannedCount > 0 && (
              <View style={styles.plannedBlock}>
                <Text style={styles.planned}>
                  {plannedCount === 1
                    ? t('one more edition is in the works — with a card you can already read.', 'eine weitere Edition ist in Arbeit — mit einer Karte, die du schon lesen kannst.')
                    : t(
                        `${plannedCount} more editions are in the works — each with a card you can already read.`,
                        `${plannedCount} weitere Editionen sind in Arbeit — jede mit einer Karte, die du schon lesen kannst.`,
                      )}
                </Text>
                <View style={styles.plannedRow}>
                  {SEED_EDITIONS.filter((e) => e.status !== 'available').map((e) => (
                    <PressableScale
                      key={e.id}
                      containerStyle={styles.plannedChipSlot}
                      style={styles.plannedChip}
                      scaleTo={0.96}
                      onPress={() => router.push(`/editions/${e.id}`)}
                      accessibilityLabel={t(
                        `${e.name} — in the works, read its sample card`,
                        `${e.name} — in Arbeit, Beispielkarte lesen`,
                      )}
                    >
                      <Text style={styles.plannedChipSymbol}>{e.symbol}</Text>
                      <Text style={styles.plannedChipName}>{e.name.toLowerCase()}</Text>
                    </PressableScale>
                  ))}
                </View>
              </View>
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
  plannedBlock: { marginTop: Spacing.md, marginBottom: Spacing.xs },
  planned: {
    ...Typography.micro,
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.sm,
  },
  plannedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.screen,
  },
  plannedChipSlot: {},
  plannedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundWarm,
  },
  plannedChipSymbol: { fontSize: 15 },
  plannedChipName: { fontSize: 12, fontWeight: '500', color: Colors.textMuted },
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
  title: { ...Typography.stack },
  lead: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 21,
  },
  scanSlot: { marginTop: Spacing.md },
  scanButton: {
    height: Layout.cta,
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  scanButtonText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.2,
    // kontrast-ok: Papierfarbe sitzt hier NUR auf der dunklen Füllung des
    // Scan-Knopfs (`scanButton`, backgroundColor: Colors.text) — 15,4:1.
    // Auf dem hellen Grund käme sie nie zum Tragen.
    color: Colors.background,
  },
  card: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.sm,
    padding: Spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.backgroundWarm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    ...Shadows.subtle,
  },
  /** Das Kopfband trägt die Färbung der Edition — die Sammlung wird dadurch
   *  auf einen Blick unterscheidbar, ohne dass eine Karte zum Plakat wird. */
  band: {
    width: 60,
    height: 60,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: { fontSize: 26 },
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
