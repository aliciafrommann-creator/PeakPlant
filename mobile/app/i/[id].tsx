import { Redirect, useLocalSearchParams } from 'expo-router';

/**
 * Universal-link landing for a curated idea: https://peak-plant.com/i/<momentId>.
 * Matches lib/links.ts ideaLink() and forwards to the "together" idea screen so
 * a shared idea opens in-app.
 */
export default function IdeaLinkRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return <Redirect href="/(tabs)/discover" />;
  return <Redirect href={`/together/${id}`} />;
}
