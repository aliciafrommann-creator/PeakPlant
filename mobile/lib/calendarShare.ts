/**
 * Shares a PeakPlant date plan as a calendar event via the native OS share sheet.
 * The user's calendar app receives the ICS text and imports it.
 * No expo-calendar permission required.
 */

import { Share } from 'react-native';
import { buildICS } from './calendar';
import type { CalendarPlan } from './calendar';

export type { CalendarPlan };

/** Share an ICS calendar event via the native share sheet. */
export async function shareCalendarEvent(plan: CalendarPlan): Promise<boolean> {
  const ics = buildICS(plan);
  const result = await Share.share({ message: ics, title: plan.title });
  return result.action !== 'dismissedAction';
}
