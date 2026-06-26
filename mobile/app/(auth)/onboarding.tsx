import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { ONBOARDING_GOALS } from '../../lib/seed';
import { useAppStore } from '../../lib/store';
import { useLanguage } from '../../lib/hooks/useLanguage';

export default function OnboardingScreen() {
  const storeGoals = useAppStore((s) => s.goals);
  const setGoals = useAppStore((s) => s.setGoals);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(storeGoals);
  const { t } = useLanguage();

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const goNext = () => {
    setGoals(selectedGoals);
    router.push('/(auth)/invite');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.label}>{t('GETTING STARTED', 'ERSTE SCHRITTE')}</Text>
          <Text style={styles.title}>
            {t('what are you\ngrowing toward?', 'worauf wollt\nihr hinwachsen?')}
          </Text>
          <Text style={styles.subtitle}>
            {t(
              'choose what feels true. you can always change this.',
              'wahlt, was sich richtig anfuhlt. ihr konnt es jederzeit andern.',
            )}
          </Text>
        </View>

        <View style={styles.goals}>
          {ONBOARDING_GOALS.map((goal) => {
            const selected = selectedGoals.includes(goal.id);
            const label = t(goal.label, goal.labelDe);
            const description = t(goal.description, goal.descriptionDe);
            return (
              <TouchableOpacity
                key={goal.id}
                style={[styles.goalItem, selected && styles.goalSelected]}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.8}
                accessibilityRole="checkbox"
                accessibilityLabel={`${label}: ${description}`}
                accessibilityState={{ checked: selected }}
              >
                <Text style={[styles.goalLabel, selected && styles.goalLabelSelected]}>
                  {label}
                </Text>
                <Text style={[styles.goalDesc, selected && styles.goalDescSelected]}>
                  {description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={goNext}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('Continue', 'Weiter')}
          >
            <Text style={styles.continueText}>{t('CONTINUE', 'WEITER')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={goNext}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('Skip for now', 'Vorerst uberspringen')}
          >
            <Text style={styles.skip}>{t('skip for now', 'vorerst uberspringen')}</Text>
          </TouchableOpacity>
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
  scroll: {
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.xl,
    gap: Spacing.xl,
  },
  header: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.textSubtle,
  },
  title: {
    ...Typography.editorial,
    fontSize: 34,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.textMuted,
    lineHeight: 20,
  },
  goals: {
    gap: Spacing.sm,
  },
  goalItem: {
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    gap: 4,
    borderRadius: Radii.sm,
  },
  goalSelected: {
    borderColor: Colors.text,
    backgroundColor: Colors.text,
  },
  goalLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.text,
    letterSpacing: 0.1,
  },
  goalLabelSelected: {
    color: Colors.white,
  },
  goalDesc: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.textMuted,
  },
  goalDescSelected: {
    color: Colors.textFaint,
  },
  actions: {
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  continueButton: {
    height: 52,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  continueText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.white,
  },
  skip: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
});
