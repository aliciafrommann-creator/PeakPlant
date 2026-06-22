import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import * as Linking from 'expo-linking';
import { View, ActivityIndicator } from 'react-native';
import { useAppStore } from '../lib/store';
import { isSupabaseConfigured } from '../lib/supabase/client';
import { getActiveUser } from '../lib/session';
import { spaceRepository } from '../lib/repositories';
import { parseCardQr } from '../lib/qr';
import { setPendingCard, consumePendingCard } from '../lib/pendingDestination';
import { Colors } from '../constants/colors';

function Spinner() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
      <ActivityIndicator color={Colors.accent} />
    </View>
  );
}

/**
 * The home a fully-set-up user lands on — resuming a deep-linked card if one
 * was captured before the auth/onboarding gate, otherwise the Discover tab.
 */
function resumeHome(): string {
  const cardId = consumePendingCard();
  return cardId ? `/card/${cardId}` : '/(tabs)/discover';
}

export default function Index() {
  const hydrated = useAppStore((s) => s.hydrated);
  const onboarded = useAppStore((s) => s.onboarded);
  const [route, setRoute] = useState<string | null>(null);

  // Capture a cold-start deep link (peakplant://card/... or https .../c/...) so
  // its destination survives the trip through sign-in / onboarding.
  useEffect(() => {
    let active = true;
    void Linking.getInitialURL()
      .then((url) => {
        if (!active || !url) return;
        const cardId = parseCardQr(url);
        if (cardId) setPendingCard(cardId);
      })
      .catch(() => { /* no initial url / unsupported — nothing to resume */ });
    return () => { active = false; };
  }, []);

  // Backend mode: decide based on real session + whether the user has any space.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    (async () => {
      try {
        const user = await getActiveUser();
        if (!user) {
          if (active) setRoute('/(auth)/sign-in');
          return;
        }
        const spaces = await spaceRepository.getAllForUser(user.id);
        // New backend users who haven't set up a space yet go through the full
        // welcome → language → onboarding → invite flow (same as local mode).
        if (active) setRoute(spaces.length > 0 ? resumeHome() : '/(auth)/welcome');
      } catch {
        if (active) setRoute('/(auth)/sign-in');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!hydrated) return <Spinner />;

  // Local-first mode (no Supabase keys): unchanged behavior.
  if (!isSupabaseConfigured) {
    return <Redirect href={onboarded ? resumeHome() : '/(auth)/welcome'} />;
  }

  if (!route) return <Spinner />;
  return <Redirect href={route} />;
}
