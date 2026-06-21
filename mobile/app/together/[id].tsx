import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useAppStore } from '../../lib/store';
import { momentById, placeById } from '../../lib/together';

export default function TogetherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const placesEnabled = useAppStore((s) => s.features.localShops);
  const moment = momentById(id);
  const place = placesEnabled ? placeById(moment?.placeId) : undefined;

  if (!moment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>idea not found.</Text>
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
        <Text style={styles.headerLabel}>TO DO TOGETHER</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.category}>{moment.category.toUpperCase()}</Text>
        <Text style={styles.title}>{moment.title}</Text>
        <Text style={styles.idea}>{moment.idea}</Text>

        {place && (
          <View style={styles.placeCard}>
            <Text style={styles.placeLabel}>A PLACE FOR IT</Text>
            <View style={styles.placeHead}>
              <Text style={styles.placeName}>{place.name.toLowerCase()}</Text>
              {place.isPartner && <Text style={styles.partner}>PARTNER</Text>}
            </View>
            <Text style={styles.placeArea}>{place.area}</Text>
            {place.perk && <Text style={styles.perk}>🌶️ {place.perk}</Text>}
          </View>
        )}

        <Text style={styles.invite}>
          when you've done it, preserve it as a moment in your diary.
        </Text>

        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.push('/(tabs)/grow')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Open your cards to preserve a moment"
        >
          <Text style={styles.ctaText}>OPEN YOUR CARDS</Text>
        </TouchableOpacity>

        <Text style={styles.noPressure}>no pressure. only if it feels right.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backText: { fontSize: 10, fontWeight: '400', letterSpacing: 1.5, color: Colors.textMuted, width: 60 },
  headerLabel: { fontSize: 10, fontWeight: '500', letterSpacing: 3, color: Colors.text },
  content: { padding: Spacing.screen, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  category: { fontSize: 9, fontWeight: '500', letterSpacing: 3, color: Colors.accent },
  title: { fontSize: 30, fontWeight: '200', color: Colors.text, letterSpacing: -0.4, lineHeight: 36 },
  idea: { fontSize: 16, fontWeight: '300', color: Colors.textMuted, lineHeight: 24 },
  placeCard: {
    backgroundColor: Colors.backgroundCream,
    padding: Spacing.lg,
    gap: 4,
    marginTop: Spacing.md,
  },
  placeLabel: { fontSize: 9, fontWeight: '500', letterSpacing: 2.5, color: Colors.accent },
  placeHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  placeName: { fontSize: 18, fontWeight: '200', color: Colors.text },
  partner: {
    fontSize: 7,
    fontWeight: '500',
    letterSpacing: 2,
    color: Colors.accent,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  placeArea: { fontSize: 11, fontWeight: '300', color: Colors.textFaint, letterSpacing: 0.5 },
  perk: { fontSize: 13, fontWeight: '300', color: Colors.accent, marginTop: 2 },
  invite: {
    fontSize: 16,
    fontWeight: '200',
    color: Colors.text,
    fontStyle: 'italic',
    marginTop: Spacing.md,
    lineHeight: 24,
  },
  cta: {
    height: 56,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  ctaText: { fontSize: 11, fontWeight: '500', letterSpacing: 3, color: Colors.white },
  noPressure: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textFaint,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  notFoundText: { fontSize: 16, fontWeight: '200', color: Colors.textMuted },
  backLink: { fontSize: 12, fontWeight: '300', color: Colors.accent, letterSpacing: 0.5 },
});
