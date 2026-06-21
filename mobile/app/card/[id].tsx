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

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const card = SEED_CARDS.find((c) => c.id === id);
  const edition = card ? (getEdition(card.edition) ?? SEED_EDITION) : SEED_EDITION;

  if (!card) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>card not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isAction = card.type === 'action';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>CARD {String(card.number).padStart(2, '0')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card visual */}
        <View style={styles.cardVisual}>
          <View style={styles.cardInner}>
            <Text style={styles.cardEdition}>PEAKPLANT — {edition.name.toUpperCase()}</Text>
            <Text style={styles.cardTypeLabel}>
              {isAction ? 'MOMENT' : 'QUESTION'} — #{String(card.number).padStart(2, '0')}
            </Text>
            <Text style={styles.cardPrompt}>{card.prompt}</Text>
            <View style={styles.cardDot} />
          </View>
        </View>

        {/* Guidance */}
        <View style={styles.guidance}>
          <Text style={styles.guidanceLabel}>HOW TO USE THIS CARD</Text>
          {isAction ? (
            <Text style={styles.guidanceText}>
              do this together. when you're done, preserve the moment in your diary.
              it doesn't have to be perfect. it just has to be real.
            </Text>
          ) : (
            <Text style={styles.guidanceText}>
              ask each other this question. there's no right answer.
              listen more than you speak. then preserve what came up.
            </Text>
          )}
        </View>

        <Text style={styles.invite}>what is growing between you?</Text>

        {/* CTA */}
        <TouchableOpacity
          style={styles.preserveButton}
          onPress={() => router.push({ pathname: '/memory/create', params: { cardId: card.id } })}
          activeOpacity={0.8}
        >
          <Text style={styles.preserveText}>PRESERVE THIS MOMENT</Text>
        </TouchableOpacity>

        <Text style={styles.noPressure}>
          no pressure. choose what feels right.
        </Text>
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
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.text,
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
  cardTypeLabel: {
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 2,
    color: Colors.textSubtle,
  },
  cardPrompt: {
    fontSize: 24,
    fontWeight: '200',
    color: Colors.white,
    lineHeight: 34,
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
  guidance: {
    gap: Spacing.sm,
  },
  guidanceLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.textFaint,
  },
  guidanceText: {
    fontSize: 15,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  invite: {
    fontSize: 18,
    fontWeight: '200',
    color: Colors.text,
    fontStyle: 'italic',
    letterSpacing: -0.2,
  },
  preserveButton: {
    height: 56,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
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
