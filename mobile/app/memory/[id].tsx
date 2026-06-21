import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SEED_CARDS } from '../../lib/seed';
import { localMemoryRepository } from '../../lib/repositories/local';
import { shareMemory } from '../../lib/share';
import type { Memory } from '../../lib/types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).toLowerCase();
}

export default function MemoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    localMemoryRepository.getById(id).then((m) => {
      if (active) {
        setMemory(m);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [id]);

  const card = memory ? SEED_CARDS.find((c) => c.id === memory.cardId) : undefined;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!memory) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>moment not found.</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backLink}>go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>MOMENT</Text>
        <TouchableOpacity
          onPress={() => shareMemory(memory, card).catch(() => {})}
          accessibilityRole="button"
          accessibilityLabel="Share this moment"
          style={styles.shareHit}
        >
          <Text style={styles.shareText}>SHARE</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {memory.photoUri && (
          <Image source={{ uri: memory.photoUri }} style={styles.photo} />
        )}

        <View style={styles.body}>
          {card && (
            <View style={styles.cardInfo}>
              <Text style={styles.cardLabel}>CARD {String(card.number).padStart(2, '0')}</Text>
              <Text style={styles.prompt}>{card.prompt}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.note}>{memory.note}</Text>

          <Text style={styles.date}>{formatDate(memory.createdAt)}</Text>
        </View>
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
  shareHit: { width: 60, alignItems: 'flex-end' },
  shareText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.5,
    color: Colors.accent,
  },
  photo: {
    width: '100%',
    height: 280,
    backgroundColor: Colors.backgroundCream,
  },
  body: {
    padding: Spacing.screen,
    gap: Spacing.lg,
  },
  cardInfo: {
    gap: Spacing.sm,
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.accent,
  },
  prompt: {
    fontSize: 22,
    fontWeight: '200',
    color: Colors.text,
    lineHeight: 30,
    letterSpacing: -0.2,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  note: {
    fontSize: 16,
    fontWeight: '300',
    color: Colors.text,
    lineHeight: 26,
    letterSpacing: 0.1,
  },
  date: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 1.5,
    color: Colors.textFaint,
    textTransform: 'uppercase',
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
