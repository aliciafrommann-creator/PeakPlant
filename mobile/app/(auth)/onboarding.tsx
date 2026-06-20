import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { ONBOARDING_GOALS } from '../../lib/seed';
import { useAppStore } from '../../lib/store';

export default function OnboardingScreen() {
  const storeGoals = useAppStore((s) => s.goals);
  const setGoals = useAppStore((s) => s.setGoals);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(storeGoals);

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
          <Text style={styles.label}>GETTING STARTED</Text>
          <Text style={styles.title}>what are you{'\n'}growing toward?</Text>
          <Text style={styles.subtitle}>
            choose what feels true. you can always change this.
          </Text>
        </View>

        <View style={styles.goals}>
          {ONBOARDING_GOALS.map((goal) => {
            const selected = selectedGoals.includes(goal.id);
            return (
              <TouchableOpacity
                key={goal.id}
                style={[styles.goalItem, selected && styles.goalSelected]}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.goalLabel, selected && styles.goalLabelSelected]}>
                  {goal.label}
                </Text>
                <Text style={[styles.goalDesc, selected && styles.goalDescSelected]}>
                  {goal.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.continueButton} onPress={goNext} activeOpacity={0.8}>
            <Text style={styles.continueText}>CONTINUE</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goNext} activeOpacity={0.7}>
            <Text style={styles.skip}>skip for now</Text>
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
    color: Colors.accent,
  },
  title: {
    fontSize: 34,
    fontWeight: '200',
    color: Colors.text,
    lineHeight: 40,
    letterSpacing: -0.5,
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
