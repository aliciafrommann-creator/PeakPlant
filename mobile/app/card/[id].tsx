import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SEED_CARDS, getEdition, SEED_EDITION } from '../../lib/seed';
import { useLanguage } from '../../lib/hooks/useLanguage';
import type { CardKind } from '../../lib/types';

const KIND_LABEL: Record<CardKind, [string, string]> = {
  'grow-date':        ['GROW DATE', 'GROW DATE'],
  'small-act':        ['SMALL ACT', 'KLEINER WACHSTUMSAKT'],
  'growing-question': ['GROWING QUESTION', 'WACHSTUMSFRAGE'],
};

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();

  const card = SEED_CARDS.find((c) => c.id === id);
  const edition = card ? (getEdition(card.edition) ?? SEED_EDITION) : SEED_EDITION;

  if (!card) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>card not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>{t('go back', 'zurück')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { content, kind } = card;
  const kindLabels = kind ? KIND_LABEL[kind] : ['CARD', 'KARTE'];
  const kindLabel = t(kindLabels[0], kindLabels[1]);

  const title = content ? t(content.title, content.titleDe) : card.prompt;
  const before = content ? t(content.before, content.beforeDe) : null;
  const tryThis = content ? t(content.tryThis, content.tryThisDe) : null;
  const talkAboutIt = content ? t(content.talkAboutIt, content.talkAboutItDe) : null;
  const keepNote = content?.keepNote ? t(content.keepNote, content.keepNoteDe ?? content.keepNote) : null;
  const comeBack = content?.comeBack ? t(content.comeBack, content.comeBackDe ?? content.comeBack) : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← {t('BACK', 'ZURÜCK')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>{kindLabel}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Card visual — mimics the physical card */}
        <View style={styles.cardVisual}>
          <View style={styles.cardInner}>
            <Text style={styles.cardEdition}>PEAKPLANT — {edition.name.toUpperCase()}</Text>
            <Text style={styles.cardKindLabel}>{kindLabel} · #{String(card.number).padStart(2, '0')}</Text>
            <Text style={styles.cardTitle}>{title}</Text>
            <View style={styles.cardDot} />
          </View>
        </View>

        {/* Before you begin */}
        {before && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('BEFORE YOU BEGIN', 'BEVOR IHR ANFANGT')}</Text>
            <Text style={styles.sectionText}>{before}</Text>
          </View>
        )}

        {/* Try this */}
        {tryThis && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('TRY THIS', 'PROBIERT DAS')}</Text>
            <Text style={styles.sectionText}>{tryThis}</Text>
          </View>
        )}

        {/* Talk about it */}
        {talkAboutIt && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('TALK ABOUT IT', 'SPRECHT DARÜBER')}</Text>
            <Text style={styles.sectionTextAccent}>{talkAboutIt}</Text>
          </View>
        )}

        {/* Keep the moment — CTA */}
        <View style={styles.preserveSection}>
          <Text style={styles.sectionLabel}>{t('KEEP THE MOMENT', 'HALTET DEN MOMENT FEST')}</Text>
          {keepNote && (
            <Text style={styles.keepNoteHint}>{keepNote}</Text>
          )}
          <TouchableOpacity
            style={styles.preserveButton}
            onPress={() => router.push({ pathname: '/memory/create', params: { cardId: card.id } })}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('Preserve this moment', 'Diesen Moment festhalten')}
          >
            <Text style={styles.preserveText}>
              {t('PRESERVE THIS MOMENT', 'MOMENT FESTHALTEN')}
            </Text>
          </TouchableOpacity>
          <Text style={styles.noPressure}>
            {t('no pressure. choose what feels right.', 'kein druck. macht, was sich richtig anfühlt.')}
          </Text>
        </View>

        {/* Come back later */}
        {comeBack && (
          <View style={styles.comeBackSection}>
            <Text style={styles.sectionLabel}>{t('COME BACK LATER', 'KOMMT SPÄTER NOCHMAL')}</Text>
            <Text style={styles.comeBackText}>{comeBack}</Text>
          </View>
        )}

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
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 1.5,
    color: Colors.textMuted,
    width: 60,
  },
  headerLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2.5,
    color: Colors.text,
    textAlign: 'center',
    flex: 1,
  },
  content: {
    padding: Spacing.screen,
    gap: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  cardVisual: {
    backgroundColor: Colors.backgroundDark,
    padding: 2,
  },
  cardInner: {
    backgroundColor: Colors.backgroundDark,
    padding: Spacing.xl,
    aspectRatio: 0.65,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  cardEdition: {
    fontSize: 8,
    fontWeight: '500',
    letterSpacing: 2.5,
    color: Colors.accent,
  },
  cardKindLabel: {
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 2,
    color: Colors.textSubtle,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '200',
    color: Colors.white,
    lineHeight: 30,
    letterSpacing: -0.3,
    flex: 1,
    paddingVertical: Spacing.xl,
  },
  cardDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.textFaint,
  },
  sectionText: {
    fontSize: 15,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  sectionTextAccent: {
    fontSize: 16,
    fontWeight: '200',
    color: Colors.text,
    lineHeight: 26,
    letterSpacing: -0.1,
    fontStyle: 'italic',
  },
  preserveSection: {
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.lg,
  },
  keepNoteHint: {
    fontSize: 13,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  preserveButton: {
    height: 56,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  preserveText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.white,
  },
  noPressure: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textFaint,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  comeBackSection: {
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.lg,
  },
  comeBackText: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 22,
    letterSpacing: 0.1,
    fontStyle: 'italic',
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
    color: Colors.accent,
    letterSpacing: 0.5,
  },
});
