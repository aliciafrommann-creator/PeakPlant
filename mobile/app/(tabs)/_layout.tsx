import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { voice } from '../../lib/voice';

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
          // Bei fünf Reitern passte „GESCHICHTE" nicht in ein Fünftel der
          // Breite. Mit drei Reitern ist Platz — die Sperrung bleibt trotzdem
          // moderat, weil ein lesbares Label Funktion ist und Sperrung nur Stil.
          letterSpacing: 0.8,
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
      <Tabs.Screen
        name="editions"
        options={{
          title: t('Collection', 'Sammlung'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="layers-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Drei Reiter, drei Sätze, die ein Mensch aussprechen kann:
          „was wir behalten haben" · „was wir tun könnten" · „unsere Decks".
          (Entscheidung Alicia, 17.08.2026.)

          Ausgeblendet, aber vollständig erreichbar — nichts ist gelöscht:
          - moments  → die Momente-Wand IST jetzt der Startbildschirm; diese
                       Seite bleibt als nach Monaten gruppiertes Archiv, vom
                       Fuß der Wand aus
          - story    → ein Monatsrückblick, kein täglicher Ort; Link am Fuß
                       der Wand
          - community (Orte) → der 🗺️-Umschalter auf Entdecken
          - profile  → das Personen-Symbol im Kopf des Startbildschirms

          Zwei Reiter über denselben Daten (moments und story lesen beide
          useMemories) waren zwei Fragen an einen Menschen, der noch keine
          Antwort hat: für den einzigen real existierenden Nutzerzustand —
          eine Person, kein Moment — waren drei der fünf Reiter leer. */}
      <Tabs.Screen name="moments" options={{ href: null }} />
      <Tabs.Screen name="story" options={{ href: null }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="scan" options={{ href: null }} />
      <Tabs.Screen name="grow" options={{ href: null }} />
      <Tabs.Screen name="us" options={{ href: null }} />
    </Tabs>
  );
}
