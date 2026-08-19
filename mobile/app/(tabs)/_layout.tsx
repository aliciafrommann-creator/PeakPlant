import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { voice } from '../../lib/voice';
import { View, StyleSheet } from 'react-native';
import { Colors as C } from '../../constants/colors';

export default function TabsLayout() {
  const { t } = useLanguage();
  // Der Name des ersten Reiters ist die erste Anrede, die jemand sieht.
  // „Zusammen" über einem Solo-Space ist genau die Behauptung, gegen die
  // `lib/voice.ts` gebaut wurde.
  const { activeSpace } = useSpaces();
  const v = voice(activeSpace?.type);
  // A hard-coded 60px bar crowds the home indicator on gesture-nav devices —
  // grow the bar by the bottom inset so icons/labels keep their breathing room.
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
        },
        tabBarActiveTintColor: Colors.text,
        // Nicht textFaint: die leiseste Stufe besteht AA nur für großen Text,
        // und ein Reiter-Label ist 12 pt. Ein Reiter, den man nicht lesen kann,
        // ist kein zurückhaltender Reiter, sondern ein fehlender.
        tabBarInactiveTintColor: Colors.textSubtle,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          // Bei fünf Reitern ist die Breite knapp. Die Namen sind deshalb
          // kurz (ein Wort), die Sperrung minimal — ein lesbares Label ist
          // Funktion, Sperrung nur Stil.
          letterSpacing: 0.3,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t(v.homeTabTitle.en, v.homeTabTitle.de),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: t('Discover', 'Entdecken'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Die Haupthandlung sitzt in der Mitte der Leiste, wie bei Instagram.
          `keep` ist KEIN Bildschirm — der Reiter fängt den Tipp ab und öffnet
          das Festhalten als Modal. Ohne `preventDefault` würde expo-router
          zusätzlich auf eine leere Route wechseln. */}
      <Tabs.Screen
        name="keep"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.mitte, focused && styles.mitteAktiv]}>
              <Ionicons name="add" size={26} color={C.background} />
            </View>
          ),
          tabBarAccessibilityLabel: t('Keep a moment', 'Einen Moment festhalten'),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/memory/create');
          },
        }}
      />
      <Tabs.Screen
        name="editions"
        options={{
          title: t('Collection', 'Sammlung'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="layers-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('You', 'Du'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      {/* FÜNF REITER — die Rücknahme von Entscheidung 021 (Alicia, 19.08.2026).
          Damals wurden fünf zu drei, weil drei davon für den einzigen real
          existierenden Nutzerzustand leer waren. Das war richtig gerechnet und
          im Ergebnis falsch: Alicia auf dem Gerät — „unten sind nur noch drei
          Reiter, die Übersicht ist eher schlechter geworden ... nirgends sehe
          ich unten in der Bar my spaces, es gibt keine Auswahlmöglichkeiten
          gegenüber Insta und Strava."

          Der Fehler steckte nicht in der Zahl, sondern darin, WAS gestrichen
          wurde. „Du" ist kein leerer Reiter, sondern der Ort, an dem der
          Space-Wechsel, das Konto und die Einstellungen liegen — und genau
          den hatte niemand mehr gefunden, weil er hinter einem kleinen Symbol
          im Kopf des Startbildschirms hing. Ein Weg, den man nicht sieht,
          existiert nicht.

          Ausgeblendet, aber vollständig erreichbar — nichts ist gelöscht:
          - moments  → das nach Monaten gruppierte Archiv, vom Fuß der Wand
          - story    → ein Monatsrückblick, Link am Fuß der Wand
          - community (Orte) → der 🗺️-Umschalter auf Entdecken */}
      <Tabs.Screen name="moments" options={{ href: null }} />
      <Tabs.Screen name="story" options={{ href: null }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="scan" options={{ href: null }} />
      <Tabs.Screen name="grow" options={{ href: null }} />
      <Tabs.Screen name="us" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  /** Der Moment-Knopf in der Mitte: ein gefüllter Kreis, kein Umriss. */
  mitte: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.accentInk,
    marginTop: 2,
  },
  mitteAktiv: { backgroundColor: C.text },
});
