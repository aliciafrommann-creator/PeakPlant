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
import { SEED_CARDS, getEdition, SEED_EDITION } from '../../lib/seed';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { usePrivacyOverlay } from '../../lib/hooks/usePrivacyOverlay';
import { useBiometric } from '../../lib/hooks/useBiometric';
import { PrivacyScreen } from '../../components/ui/PrivacyScreen';
import { UnlockCurtain } from '../../components/card/UnlockCurtain';
import type { CardGroup, CardSection } from '../../lib/types';

export default function CardDetailScreen() {
  const { id, unlocked } = useLocalSearchParams<{ id: string; unlocked?: string }>();
  const { t, l } = useLanguage();
  const obscured = usePrivacyOverlay();
  const { authenticate } = useBiometric();
  // Gate lives HERE, not only at the callers: deep links (/c/<id>) and the
  // scanner reach this screen directly, bypassing the tab-level gates (A6-4.1).
  const [bioGranted, setBioGranted] = useState(false);
  const cardForGate = SEED_CARDS.find((c) => c.id === id);
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

  const card = SEED_CARDS.find((c) => c.id === id);
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

  // A quiet note that adapts to the kind of card (and intimate editions).
  const quietNote = isQuestion
    ? t(
        'Take your time. You can pause, skip or return to this card whenever it feels right.',
        'Lasst euch Zeit. Ihr könnt jederzeit pausieren, überspringen oder später zurückkommen.'
      )
    : t(
        'Choose what feels right for both of you. You can pause, change or stop at any time.',
        'Macht, was sich für euch beide richtig anfühlt. Ihr könnt jederzeit pausieren, ändern oder aufhören.'
      );

  function renderPreserveCTA(keyPrefix: string) {
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
            {t(
              'This stays private to your space — only you and your partner can see it.',
              'Das bleibt privat in eurem Space — nur ihr beide könnt es sehen.',
            )}
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
            <Text style={[styles.cardEdition, tone(edition.ink, 0.7)]}>
              PEAKPLANT — {edition.name.toUpperCase()}
            </Text>
            <Text style={[styles.cardKindLabel, tone(edition.ink, 0.6)]}>
              {groupLabel.toUpperCase()} · #{String(card.number).padStart(2, '0')}
            </Text>
            <Text style={[styles.cardTitle, tone(edition.ink, 1)]}>{title}</Text>
            <View
              style={[
                styles.cardDot,
                { backgroundColor: edition.ink === 'dark' ? '#1A1A1A' : '#FAF7F0' },
              ]}
            />
          </View>
        </View>

        <Text style={styles.quietNote}>{quietNote}</Text>

        {sections.map(renderSection)}

        {/* If a card has no explicit keep-the-moment section, still offer the CTA. */}
        {!hasPreserve ? renderPreserveCTA('end') : null}

      </ScrollView>
    </SafeAreaView>
  );
}

/** Foreground color for text on an edition's color, by ink + opacity. */
function tone(ink: 'dark' | 'light', opacity: number) {
  const base = ink === 'dark' ? '26,26,26' : '250,247,240';
  return { color: `rgba(${base},${opacity})` };
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
    color: Colors.textFaint,
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
    backgroundColor: Colors.accent,
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
