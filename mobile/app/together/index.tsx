import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { TogetherCard } from '../../components/together/TogetherCard';
import { PlaceItem } from '../../components/together/PlaceItem';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { useAppStore } from '../../lib/store';
import { ai } from '../../lib/ai';
import { momentsForSpaceType, momentById, LOCAL_PLACES } from '../../lib/together';
import type { MomentSuggestion } from '../../lib/ai';

export default function TogetherScreen() {
  const { activeSpace } = useSpaces();
  const goals = useAppStore((s) => s.goals);
  const placesEnabled = useAppStore((s) => s.features.localShops);

  const candidates = activeSpace ? momentsForSpaceType(activeSpace.type) : [];
  const [suggestion, setSuggestion] = useState<MomentSuggestion | null>(null);

  useEffect(() => {
    if (candidates.length === 0) return;
    const context = {
      goals,
      activatedCardIds: [],
      edition: 'edition-01',
      sealedCardCount: 0,
      totalMemories: 0,
    };
    ai.suggestMoment(context, candidates).then(setSuggestion).catch(() => setSuggestion(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSpace?.id, goals.join(',')]);

  const suggested = suggestion ? momentById(suggestion.momentId) : undefined;
  const rest = candidates.filter((m) => m.id !== suggested?.id);
  const partnerPlaces = [...LOCAL_PLACES].sort((a, b) => Number(b.isPartner) - Number(a.isPartner));

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
        <Text style={styles.intro}>
          small things to do together — out in the world, then preserve them as moments.
          never a must.
        </Text>

        {suggested && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SUGGESTED FOR YOU</Text>
            <TogetherCard
              moment={suggested}
              onPress={() => router.push(`/together/${suggested.id}`)}
            />
            {suggestion?.rationale ? (
              <Text style={styles.rationale}>{suggestion.rationale}</Text>
            ) : null}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MORE IDEAS</Text>
          <View style={styles.list}>
            {rest.map((m) => (
              <TogetherCard
                key={m.id}
                moment={m}
                onPress={() => router.push(`/together/${m.id}`)}
              />
            ))}
          </View>
        </View>

        {placesEnabled && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>LOCAL PLACES</Text>
            <View>
              {partnerPlaces.map((p) => (
                <PlaceItem key={p.id} place={p} />
              ))}
            </View>
            <Text style={styles.placesNote}>
              partner places offer a small perk. you never have to buy anything to share a moment.
            </Text>
          </View>
        )}
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
  content: { padding: Spacing.screen, gap: Spacing.xl, paddingBottom: Spacing.xxxl },
  intro: { fontSize: 14, fontWeight: '300', color: Colors.textMuted, lineHeight: 21 },
  section: { gap: Spacing.md },
  sectionLabel: { fontSize: 9, fontWeight: '500', letterSpacing: 3, color: Colors.textFaint },
  list: { gap: Spacing.md },
  rationale: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Colors.accent,
  },
  placesNote: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textFaint,
    lineHeight: 17,
    fontStyle: 'italic',
  },
});
