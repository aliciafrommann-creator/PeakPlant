/**
 * Legacy route — the Us tab has been replaced by Discover (PP-028).
 * Any deep link or bookmark pointing here redirects transparently.
 */
import { Redirect } from 'expo-router';

export default function UsRedirect() {
  return <Redirect href="/(tabs)/discover" />;
}
