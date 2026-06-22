import { Redirect, useLocalSearchParams } from 'expo-router';

/**
 * Universal-link landing for a card: https://peak-plant.com/c/<cardId>.
 * Mirrors the QR `/c/` form (lib/links.ts, lib/qr.ts) and forwards to the real
 * card screen so a shared link opens the prompt in-app.
 */
export default function CardLinkRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return <Redirect href="/(tabs)/discover" />;
  return <Redirect href={`/card/${id}`} />;
}
