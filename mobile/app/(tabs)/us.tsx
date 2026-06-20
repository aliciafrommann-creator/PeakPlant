import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Logo } from '../../components/ui/Logo';
import { useMemories } from '../../lib/hooks/useMemories';
import { useCouple } from '../../lib/hooks/useCouple';
import { SEED_CARDS } from '../../lib/seed';

export default function UsScreen() {
  const { couple } = useCouple();
  const { memories } = useMemories();

  const latestMemory = memories[0];
  const latestCard = latestMemory
    ? SEED_CARDS.find((c) => c.id === latestMemory.cardId)
    : undefined;

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toLowerCase();
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Logo size="sm" />
          <Text style={styles.coupleName}>{couple.name.toLowerCase()}</Text>
        </View>

        {/* Partner note */}
        <View style={styles.partnerNote}>
          <Text style={styles.partnerLabel}>PARTNER NOTE</Text>
          <Text style={styles.partnerText}>
            "thinking about our walk last week. want to do it again soon."
          </Text>
        </View>

        {/* Suggestion */}
        <View style={styles.suggestion}>
          <Text style={styles.suggestionLabel}>THIS WEEK</Text>
          <Text style={styles.suggestionTitle}>grow together</Text>
          <Text style={styles.suggestionCard}>Card 04 — "what makes our relationship feel warm?"</Text>
          <Text style={styles.suggestionNote}>
            no pressure. choose what feels right.
          </Text>
          <TouchableOpacity
            style={styles.suggestionButton}
            onPress={() => router.push('/card/card-04')}
            activeOpacity={0.8}
          >
            <Text style={styles.suggestionButtonText}>EXPLORE CARD</Text>
          </TouchableOpacity>
        </View>

        {/* Latest memory */}
        {latestMemory && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>MOST RECENT MOMENT</Text>
            <TouchableOpacity
              style={styles.memoryPreview}
              onPress={() => router.push(`/memory/${latestMemory.id}`)}
              activeOpacity={0.85}
            >
              {latestCard && (
                <Text style={styles.memoryCardNum}>
                  CARD {String(latestCard.number).padStart(2, '0')}
                </Text>
              )}
              {latestCard && (
                <Text style={styles.memoryPrompt}>{latestCard.prompt}</Text>
              )}
              <Text style={styles.memoryNote} numberOfLines={3}>
                {latestMemory.note}
              </Text>
              <Text style={styles.memoryDate}>{formatDate(latestMemory.createdAt)}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tagline */}
        <View style={styles.taglineSection}>
          <Text style={styles.tagline}>
            your relationship is not something to optimise.{'\n'}it is something to notice.
          </Text>
        </View>

        <View style={styles.spacer} />
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  coupleName: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 2,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  partnerNote: {
    backgroundColor: Colors.backgroundCream,
    padding: Spacing.lg,
    margin: Spacing.screen,
    gap: Spacing.sm,
  },
  partnerLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2.5,
    color: Colors.accent,
  },
  partnerText: {
    fontSize: 15,
    fontWeight: '300',
    color: Colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  suggestion: {
    backgroundColor: Colors.backgroundDark,
    padding: Spacing.xl,
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  suggestionLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.accent,
  },
  suggestionTitle: {
    fontSize: 28,
    fontWeight: '200',
    color: Colors.white,
    letterSpacing: -0.3,
  },
  suggestionCard: {
    fontSize: 13,
    fontWeight: '300',
    color: Colors.textSubtle,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  suggestionNote: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textFaint,
    letterSpacing: 0.5,
    marginTop: Spacing.sm,
  },
  suggestionButton: {
    marginTop: Spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionButtonText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2.5,
    color: Colors.white,
  },
  section: {
    paddingHorizontal: Spacing.screen,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.textFaint,
  },
  memoryPreview: {
    backgroundColor: Colors.backgroundWarm,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  memoryCardNum: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2.5,
    color: Colors.accent,
  },
  memoryPrompt: {
    fontSize: 13,
    fontWeight: '300',
    color: Colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  memoryNote: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.text,
    lineHeight: 20,
  },
  memoryDate: {
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 1.5,
    color: Colors.textFaint,
    textTransform: 'uppercase',
  },
  taglineSection: {
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '200',
    color: Colors.textMuted,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  spacer: {
    height: Spacing.xl,
  },
});
