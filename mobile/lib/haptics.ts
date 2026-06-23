import * as Haptics from 'expo-haptics';

async function safely(run: () => Promise<void>): Promise<void> {
  try {
    await run();
  } catch {
    // Haptics are polish, never a requirement for completing an action.
  }
}

export function acknowledgeSelection(): Promise<void> {
  return safely(() => Haptics.selectionAsync());
}

export function confirmSuccess(): Promise<void> {
  return safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}
