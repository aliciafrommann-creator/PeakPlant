/**
 * Redirects to the Editions tab. `grow` was an earlier near-duplicate of the
 * editions/collections screen; kept as a redirect so any deep-link or bookmark
 * to /(tabs)/grow still resolves. (Mirrors moments.tsx / us.tsx.)
 */
import { Redirect } from 'expo-router';

export default function GrowRedirect() {
  return <Redirect href="/(tabs)/editions" />;
}
