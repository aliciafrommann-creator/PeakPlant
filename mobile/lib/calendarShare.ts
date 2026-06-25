/**
 * Shares a PeakPlant date plan as a calendar event via the native OS share sheet.
 * The user's calendar app receives the ICS text and imports it.
 * No expo-calendar permission required.
 */

import { Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { buildICS } from './calendar';
import type { CalendarPlan } from './calendar';

export type { CalendarPlan };

/** Share an ICS calendar event via the native share sheet. */
export async function shareCalendarEvent(plan: CalendarPlan): Promise<boolean> {
  const ics = buildICS(plan);
  if (FileSystem.cacheDirectory && await Sharing.isAvailableAsync()) {
    const safeTitle = plan.title
      .toLocaleLowerCase('en-US')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 48) || 'date';
    const fileUri = `${FileSystem.cacheDirectory}peakplant-${safeTitle}.ics`;
    await FileSystem.writeAsStringAsync(fileUri, ics);
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/calendar',
      UTI: 'public.calendar-event',
      dialogTitle: plan.title,
    });
    return true;
  }
  const result = await Share.share({ message: ics, title: plan.title });
  return result.action !== 'dismissedAction';
}
