/**
 * Ein Platzhalter-Bildschirm, der nie erscheint.
 *
 * `expo-router` braucht für jeden Reiter eine Datei. Der mittlere Reiter ist
 * aber kein Ort, sondern eine Handlung: Sein `tabPress` wird in
 * `_layout.tsx` abgefangen und öffnet stattdessen `/memory/create`.
 *
 * Wer hier je Inhalt hineinschreibt, baut einen Bildschirm, den niemand
 * erreichen kann — der Abfang steht eine Datei weiter.
 */
export default function KeepTabPlaceholder() {
  return null;
}
