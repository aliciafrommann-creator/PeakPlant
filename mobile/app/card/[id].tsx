import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { BackButton } from '../../components/ui/BackButton';
import { PressableScale } from '../../components/ui/PressableScale';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { findCard, isSampleCard, getEdition, SEED_EDITION } from '../../lib/seed';
import { sampleNotice } from '../../lib/content/samples';
import { editionInk } from '../../lib/editionInk';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { usePrivacyOverlay } from '../../lib/hooks/usePrivacyOverlay';
import { useBiometric } from '../../lib/hooks/useBiometric';
import { PrivacyScreen } from '../../components/ui/PrivacyScreen';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { voice } from '../../lib/voice';
import { UnlockCurtain } from '../../components/card/UnlockCurtain';
import type { CardGroup, CardSection } from '../../lib/types';

export default function CardDetailScreen() {
  const { id, unlocked, sample } = useLocalSearchParams<{
    id: string;
    unlocked?: string;
    /**
     * Gesetzt, wenn die Karte über die Beispielkarte der Editionsseite
     * geöffnet wurde — also von jemandem, der sie NICHT gescannt hat.
     *
     * Warum das nötig ist: Bei den erschienenen Editionen ist die
     * Beispielkarte eine echte Deck-Karte. Ohne diese Unterscheidung könnte
     * jeder mit zwei Tipps „MOMENT FESTHALTEN" drücken, und `activate()`
     * schriebe Karte 01 als geöffnet in die Sammlung — „1 von 20 Karten
     * geöffnet", ohne Deck, ohne Scan. Genau das verbietet Entscheidung 024
     * („der Kauf bringt mehr Inhalt") und der Kommentar in `useMemories.ts`.
     */
    sample?: string;
  }>();
  const { t, l } = useLanguage();
  const { activeSpace } = useSpaces();
  const v = voice(activeSpace?.type);
  const obscured = usePrivacyOverlay();
  const { authenticate } = useBiometric();
  // Gate lives HERE, not only at the callers: deep links (/c/<id>) and the
  // scanner reach this screen directly, bypassing the tab-level gates (A6-4.1).
  const [bioGranted, setBioGranted] = useState(false);
  const cardForGate = findCard(id);
  const editionForGate = cardForGate ? getEdition(cardForGate.edition) : undefined;
  const needsBio = !!editionForGate?.sensitive && !bioGranted;
  useEffect(() => {
    if (!editionForGate?.sensitive || bioGranted) return;
    let cancelled = false;
    void authenticate(t('unlock your private diary', 'privates Tagebuch entsperren'))
      .then((granted) => {
        if (cancelled) return;
        if (granted) setBioGranted(true);
        else router.back();
      })
      // Gürtel und Hosenträger: `authenticate` fängt inzwischen selbst und
      // liefert false. Sollte hier je wieder etwas werfen, wäre der Bildschirm
      // ohne dieses catch dauerhaft hinter dem Sichtschutz stehen geblieben —
      // ohne Erfolg, ohne Abbruch, ohne Ausweg außer Wegwischen.
      .catch(() => {
        if (!cancelled) router.back();
      });
    return () => {
      cancelled = true;
    };
  }, [editionForGate?.sensitive, bioGranted, authenticate, t]);

  // QR magic: a scan opens a short curtain ("ihr habt diesen moment gemacht")
  // before the card appears — the physical→digital handover deserves a beat.
  const [showCurtain, setShowCurtain] = useState(unlocked === 'true');
  const dismissCurtain = useCallback(() => setShowCurtain(false), []);

  const card = findCard(id);
  const edition = card ? (getEdition(card.edition) ?? SEED_EDITION) : SEED_EDITION;

  if (!card) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>{t('card not found.', 'Karte nicht gefunden.')}</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>{t('go back', 'zurück')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Never paint sensitive content before Face ID/passcode granted access.
  if (needsBio) {
    return (
      <SafeAreaView style={styles.container}>
        <PrivacyScreen />
      </SafeAreaView>
    );
  }

  const group: CardGroup = card.group ?? 'question';
  const groupLabel = edition.groupLabels ? l(edition.groupLabels[group]) : t('Card', 'Karte');
  const isQuestion = group === 'question';

  const title = card.content ? l(card.content.title) : card.prompt;
  const sections = card.content?.sections ?? [];

  // Die Kartenfläche trägt die Editionsfarbe. Die Tinte wird dazu gerechnet
  // (lib/editionInk.ts) und in voller Stärke gesetzt: die frühere Abstufung
  // über Deckkraft (0,7 und 0,6 auf 11 pt) fiel auf fast jeder Editionsfarbe
  // unter die 4,5:1 für kleine Schrift. Unterschieden werden die beiden
  // Etiketten jetzt über das Schriftgewicht (600 gegen 400) — der einzige
  // Hebel, der hier keine Lesbarkeit kostet.
  const ink = editionInk(edition.color);
  // Als Beispiel gelesen: entweder über den Beispiel-Block (Parameter) oder
  // weil es eine Karte einer noch nicht erschienenen Edition ist — die kann
  // niemand gescannt haben.
  const alsBeispiel = sample === '1' || isSampleCard(card.id);
  const hinweis = sampleNotice(edition.name, edition.status === 'available' ? 'available' : 'upcoming');

  // A quiet note that adapts to the kind of card (and intimate editions).
  const quietNote = isQuestion
    ? t(v.cardQuietQuestion.en, v.cardQuietQuestion.de)
    : t(v.cardQuietAct.en, v.cardQuietAct.de);

  function renderPreserveCTA(keyPrefix: string) {
    /**
     * Eine Beispielkarte ist zum LESEN da.
     *
     * Der Festhalten-Weg war hier geerbt, nicht entschieden — und je nach
     * Edition führte er in eine aufgeblähte Sammlung (01–03: `activate()`
     * gelingt, die Karte gilt als geöffnet) oder in einen Moment, der im
     * Tagebuch der Edition gar nicht auftaucht (04–12: die Karte steht nicht
     * in `SEED_CARDS`, also nicht im Filter). Beide Male sagt die Oberfläche
     * etwas, das nicht stimmt.
     */
    if (alsBeispiel) {
      return (
        <View key={`${keyPrefix}-cta`} style={styles.ctaBlock}>
          <Text style={styles.noPressure}>
            {edition.status === 'available'
              ? t(
                  'this one is here to read. with the printed card, the moment lands in your diary.',
                  'diese hier ist zum Lesen da. Mit der gedruckten Karte landet der Moment in eurem Tagebuch.',
                )
              : t(
                  'this one is here to read — the edition it belongs to does not exist yet.',
                  'diese hier ist zum Lesen da — die Edition dazu gibt es noch nicht.',
                )}
          </Text>
        </View>
      );
    }
    return (
      <View key={`${keyPrefix}-cta`} style={styles.ctaBlock}>
        <PressableScale
          style={styles.preserveButton}
          onPress={() => router.push({ pathname: '/memory/create', params: { cardId: card!.id } })}
          accessibilityLabel={t('Preserve this moment', 'Diesen Moment festhalten')}
        >
          <Text style={styles.preserveText}>
            {t('PRESERVE THIS MOMENT', 'MOMENT FESTHALTEN')}
          </Text>
        </PressableScale>
        {edition.sensitive && (
          <Text style={styles.privacyNote}>
            {/* „only you and your partner" stimmte in einem Freundes-Space
                nie und in einem Solo-Space erst recht nicht (MANIFESTO §1). */}
            {t(`This stays ${v.privateToSpace.en}.`, `Das bleibt ${v.privateToSpace.de}.`)}
          </Text>
        )}
        <Text style={styles.noPressure}>
          {t('no pressure. choose what feels right.', 'kein druck. macht, was sich richtig anfühlt.')}
        </Text>
      </View>
    );
  }

  function renderSection(section: CardSection, index: number) {
    return (
      <React.Fragment key={index}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{l(section.heading).toUpperCase()}</Text>
          {section.body ? <Text style={styles.sectionText}>{l(section.body)}</Text> : null}
          {section.bullets && section.bullets.length > 0 ? (
            <View style={styles.bullets}>
              {section.bullets.map((b, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>·</Text>
                  <Text style={styles.bulletText}>{l(b)}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {section.footer ? <Text style={styles.sectionText}>{l(section.footer)}</Text> : null}
        </View>
        {section.preserveHere ? renderPreserveCTA(String(index)) : null}
      </React.Fragment>
    );
  }

  const hasPreserve = sections.some((s) => s.preserveHere);

  return (
    <SafeAreaView style={styles.container}>
      {/* Sensitive-edition content is hidden in the app switcher / on background. */}
      {edition.sensitive && obscured && <PrivacyScreen />}
      {showCurtain && (
        <UnlockCurtain
          title={t('you made this moment.', 'ihr habt diesen moment gemacht.')}
          subtitle={title}
          onDone={dismissCurtain}
        />
      )}
      <View style={styles.header}>
        <BackButton variant="close" label={t('CLOSE', 'SCHLIESSEN')} />
        <Text style={styles.headerLabel} numberOfLines={2}>{groupLabel.toUpperCase()}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Card visual — mirrors the physical card */}
        <View style={[styles.cardVisual, { backgroundColor: edition.color }]}>
          <View style={styles.cardInner}>
            <Text style={[styles.cardEdition, { color: ink }]}>
              PEAKPLANT — {edition.name.toUpperCase()}
            </Text>
            <Text style={[styles.cardKindLabel, { color: ink }]}>
              {groupLabel.toUpperCase()} · #{String(card.number).padStart(2, '0')}
            </Text>
            <Text style={[styles.cardTitle, { color: ink }]}>{title}</Text>
            <View
              style={[
                styles.cardDot,
                { backgroundColor: ink },
              ]}
            />
          </View>
        </View>

        {/* Eine Beispielkarte sagt, dass sie eine ist. Sie sieht sonst genau
            aus wie eine, die jemand mit einem gekauften Deck geöffnet hat —
            und das wäre eine Behauptung, die nicht stimmt (MANIFESTO §1). */}
        {alsBeispiel && (
          <View style={styles.sampleNote}>
            <Text style={styles.sampleNoteText}>
              {t(hinweis.en, hinweis.de)}
            </Text>
          </View>
        )}

        <Text style={styles.quietNote}>{quietNote}</Text>

        {sections.map(renderSection)}

        {/* If a card has no explicit keep-the-moment section, still offer the CTA. */}
        {!hasPreserve ? renderPreserveCTA('end') : null}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backText: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 1.5,
    color: Colors.textMuted,
    width: 60,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: Colors.text,
    textAlign: 'center',
    flex: 1,
  },
  content: {
    padding: Spacing.screen,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  cardVisual: {
    padding: 2,
    borderRadius: Radii.lg,
    overflow: 'hidden',
  },
  cardInner: {
    padding: Spacing.xl,
    aspectRatio: 0.7,
    justifyContent: 'space-between',
    gap: Spacing.md,
    borderRadius: Radii.lg - 2,
  },
  cardEdition: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  cardKindLabel: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 1.2,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '300',
    lineHeight: 34,
    letterSpacing: -0.3,
    flex: 1,
    paddingVertical: Spacing.lg,
  },
  cardDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sampleNote: {
    backgroundColor: Colors.backgroundCream,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sampleNoteText: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textMuted,
    lineHeight: 18,
  },
  quietNote: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.textSubtle,
    lineHeight: 18,
    letterSpacing: 0.2,
    fontStyle: 'italic',
  },
  section: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: Colors.textSubtle,
  },
  sectionText: {
    fontSize: 15,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  bullets: {
    gap: 6,
    marginTop: 2,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  bulletDot: {
    fontSize: 15,
    // 15 pt auf dem Papierton: textFaint sind 3,03:1, nötig 4,5.
    color: Colors.textSubtle,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '300',
    color: Colors.text,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  ctaBlock: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  preserveButton: {
    height: 56,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  preserveText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: Colors.white,
  },
  privacyNote: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  noPressure: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textSubtle,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  unlockedBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // Weiße 11-pt-Schrift darauf — accent wären 4,47:1 (siehe accentInk).
    backgroundColor: Colors.accentInk,
    paddingVertical: 10,
    alignItems: 'center',
    zIndex: 100,
  },
  unlockedBannerText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: Colors.white,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '200',
    color: Colors.textMuted,
  },
  backLink: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.textSubtle,
    letterSpacing: 0.5,
  },
});
