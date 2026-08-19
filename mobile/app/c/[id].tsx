import { Redirect, useLocalSearchParams } from 'expo-router';

/**
 * Universal-link landing for a card: https://peak-plant.com/c/<cardId>.
 * Mirrors the QR `/c/` form (lib/links.ts, lib/qr.ts) and forwards to the real
 * card screen so a shared link opens the prompt in-app.
 *
 * MIT `sample=1`, und das ist der Punkt: Ein geteilter Link ist kein Scan. Wer
 * ihn öffnet, hat die Karte nicht in der Hand — die Karte ist zum Lesen da,
 * nicht zum Sammeln. Ohne diesen Parameter konnte jeder über
 * `peak-plant.com/c/card-01` „1 von 20 Karten geöffnet" erzeugen, ohne je ein
 * Deck gekauft zu haben (Entscheidung 024, gefunden beim Gegenlesen).
 */
export default function CardLinkRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return <Redirect href="/(tabs)/discover" />;
  return <Redirect href={`/card/${id}?sample=1`} />;
}
