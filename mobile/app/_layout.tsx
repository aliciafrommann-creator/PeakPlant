import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from '../lib/store';
import { Colors } from '../constants/colors';

const queryClient = new QueryClient();

export default function RootLayout() {
  const hydrate = useAppStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="card/[id]"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="memory/create"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="memory/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="together/index" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="together/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="challenges/index" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="challenges/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen
            name="space/new"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="customize"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
