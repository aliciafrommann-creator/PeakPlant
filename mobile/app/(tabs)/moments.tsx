/**
 * Redirects to the new Home tab. Kept so any existing deep-link or bookmark
 * to /(tabs)/moments continues to work.
 */
import { Redirect } from 'expo-router';

export default function MomentsRedirect() {
  return <Redirect href="/(tabs)/home" />;
}
