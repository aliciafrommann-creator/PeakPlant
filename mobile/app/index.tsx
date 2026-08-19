import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import * as Linking from 'expo-linking';
import { View, ActivityIndicator } from 'react-native';
import { useAppStore } from '../lib/store';
import { isSupabaseConfigured } from '../lib/supabase/client';
import { getActiveUser } from '../lib/session';
import { spaceRepository } from '../lib/repositories';
import { parseCardQr, parseJoinLink } from '../lib/qr';
import { setPendingCard, consumePendingCard, setPendingJoinCode } from '../lib/pendingDestination';
import { Colors } from '../constants/colors';

function Spinner() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
      <ActivityIndicator color={Colors.accent} />
    </View>
  );
}

/**
 * The home a fully-set-up user lands on — resuming a deep-linked card if one
 * was captured before the auth/onboarding gate, otherwise the couple-space Home tab.
 */
function resumeHome(): string {
  const cardId = consumePendingCard();
  return cardId ? `/card/${cardId}` : '/(tabs)/home';
}

export default function Index() {
  const hydrated = useAppStore((s) => s.hydrated);
  const onboarded = useAppStore((s) => s.onboarded);
  const [route, setRoute] = useState<string | null>(null);

  /**
   * Kaltstart-Deep-Link auffangen, BEVOR über das Ziel entschieden wird.
   *
   * Das lag vorher in einem eigenen Effekt neben der Routen-Entscheidung —
   * beide asynchron, ohne Reihenfolge. Wer die App über einen Kartenlink
   * öffnete und schon eingeloggt war, konnte auf dem Startbildschirm landen,
   * weil `resumeHome()` lief, bevor `setPendingCard` überhaupt gesetzt hatte.
   * Ein Wettlauf, der nur manchmal verliert, ist schlimmer als einer, der
   * immer verliert: er sieht aus wie Zufall. Jetzt eine Reihenfolge.
   */
  useEffect(() => {
    let active = true;
    (async () => {
      // 1. Link lesen (best effort — ohne Link geht es normal weiter).
      let url: string | null = null;
      try {
        url = await Linking.getInitialURL();
      } catch {
        /* kein Initial-Link / nicht unterstützt */
      }
      if (!active) return;

      let joinCode: string | null = null;
      if (url) {
        const cardId = parseCardQr(url);
        if (cardId) setPendingCard(cardId);
        joinCode = parseJoinLink(url);
        if (joinCode) setPendingJoinCode(joinCode);
      }

      // 2. Lokaler Modus entscheidet ohne Server.
      if (!isSupabaseConfigured) {
        if (active) setRoute(joinCode ? '/(auth)/invite' : onboarded ? resumeHome() : '/(auth)/welcome');
        return;
      }

      // 3. Backend-Modus: echte Sitzung plus vorhandene Spaces.
      try {
        const user = await getActiveUser();
        if (!active) return;
        if (!user) {
          /**
           * Wer neu ist, sieht ZUERST, worum es geht.
           *
           * Bis zum 18.08.2026 landeten Abgemeldete direkt auf der Anmeldung.
           * Damit war `welcome.tsx` — der Eröffnungssatz der App, „collect
           * moments. grow together." — im echten Betrieb nur für Menschen
           * sichtbar, die sich bereits angemeldet hatten. Ein Bildschirm, der
           * das Produkt erklärt, und ihn sieht niemand, der es noch nicht
           * kennt.
           *
           * Instagram, Strava, BeReal und DeepL zeigen alle erst, was sie
           * sind, und fragen danach nach einem Konto. Bei uns ist die Kette
           * ohnehin so gebaut: welcome → language → intro → onboarding →
           * invite, und `invite.tsx` schickt selbst zur Anmeldung, sobald ein
           * Space entstehen soll. Genau dort hat sie auch ihren Grund („damit
           * dieser Moment mehr ist als dieses eine Handy").
           *
           * Für Rückkehrer steht auf welcome ein ruhiger Weg direkt zur
           * Anmeldung — sonst müssten sie den Einstieg noch einmal durchlaufen.
           */
          setRoute(joinCode ? '/(auth)/invite' : '/(auth)/welcome');
          return;
        }
        // Wer über einen Einladungslink kommt, will beitreten — auch mit
        // eigenem Space. Sonst landet der eingeladene Mensch in seinem eigenen
        // leeren Tagebuch, und genau das soll die Einladung ja verhindern.
        if (joinCode) {
          setRoute('/(auth)/invite');
          return;
        }
        const spaces = await spaceRepository.getAllForUser(user.id);
        // New backend users who haven't set up a space yet go through the full
        // welcome → language → onboarding → invite flow (same as local mode).
        if (active) setRoute(spaces.length > 0 ? resumeHome() : '/(auth)/welcome');
      } catch {
        if (active) setRoute('/(auth)/sign-in');
      }
    })();
    return () => {
      active = false;
    };
  }, [onboarded]);

  if (!hydrated || !route) return <Spinner />;
  return <Redirect href={route} />;
}
