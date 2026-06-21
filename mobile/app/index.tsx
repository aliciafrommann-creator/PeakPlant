import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAppStore } from '../lib/store';
import { isSupabaseConfigured } from '../lib/supabase/client';
import { getActiveUser } from '../lib/session';
import { spaceRepository } from '../lib/repositories';
import { Colors } from '../constants/colors';

function Spinner() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
      <ActivityIndicator color={Colors.accent} />
    </View>
  );
}

export default function Index() {
  const hydrated = useAppStore((s) => s.hydrated);
  const onboarded = useAppStore((s) => s.onboarded);
  const [route, setRoute] = useState<string | null>(null);

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
        if (active) setRoute(spaces.length > 0 ? '/(tabs)/us' : '/(auth)/onboarding');
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
    return <Redirect href={onboarded ? '/(tabs)/us' : '/(auth)/welcome'} />;
  }

  if (!route) return <Spinner />;
  return <Redirect href={route} />;
}
