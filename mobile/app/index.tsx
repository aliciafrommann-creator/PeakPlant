import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAppStore } from '../lib/store';
import { Colors } from '../constants/colors';

export default function Index() {
  const hydrated = useAppStore((s) => s.hydrated);
  const onboarded = useAppStore((s) => s.onboarded);

  // Wait until persisted state is loaded before deciding where to go.
  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  // Returning couples skip onboarding and land in their shared space.
  return <Redirect href={onboarded ? '/(tabs)/us' : '/(auth)/welcome'} />;
}
