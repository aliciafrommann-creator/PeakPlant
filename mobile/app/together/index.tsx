/**
 * Alt-Route — „to do together" ist in Entdecken aufgegangen.
 *
 * Dieser Bildschirm war ein Vorgänger von Discover: ein Vorschlag oben, eine
 * Liste darunter, Orte am Ende. Discover kann dasselbe und mehr (Filter, echtes
 * Wetter, gelernte Vorlieben) — die 162 Zeilen hier waren seit dem Umstieg von
 * keiner Stelle der App aus erreichbar und liefen trotzdem bei jedem Bundle mit.
 *
 * Als Weiterleitung erhalten, nicht gelöscht: `/together/<id>` (die einzelne
 * Idee) ist eine echte, geteilte Adresse — lib/links.ts baut sie, und
 * app/i/[id].tsx leitet dorthin. Wer die Adresse von Hand kürzt, soll bei den
 * Ideen landen und nicht im Nichts. (Gleiches Muster wie us.tsx und grow.tsx.)
 */
import { Redirect } from 'expo-router';

export default function TogetherIndexRedirect() {
  return <Redirect href="/(tabs)/discover" />;
}
