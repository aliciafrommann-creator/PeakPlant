# Datenfreigabe für PeakPlant — die drei Körbe und die sechs Verträge

> Stand 19.08.2026. Entstanden aus Alicias eigenem Kursbaustein „Bevor echte
> Daten hineingehen: Vertrag und Freigabe", angewendet auf PeakPlant.
>
> **Was dieses Dokument ist:** eine Arbeitsliste mit geprüftem Ist-Stand.
> **Was es nicht ist:** Rechtsberatung. Die acht Punkte unter „Legal Review
> Required" in `PEAKPLANT_SECURITY_PRIVACY.md` bleiben Anwaltssache — dieses
> Dokument räumt nur das ab, was Alicia selbst erledigen kann.

## Warum das hier steht und nicht nur im Kurs

Der Kursbaustein sagt den Satz, an dem alles hängt: *„Er muss abgeschlossen
sein, bevor die Daten fließen, nicht danach."* Bei PeakPlant fließen sie
bereits — Fotos, Notizen, E-Mail-Adressen liegen in Supabase. Der Kurs ist
damit für dieses Produkt keine Theorie mehr, sondern ein Rückstand.

## Die drei Körbe

| Korb | Was das bei PeakPlant ist | Regel |
|---|---|---|
| **1 — unkritisch** | Kartentexte, Ideen-Katalog, Editionsdaten, alles im App-Bundle | darf überall hin |
| **2 — vertraulich** | E-Mail-Adressen, Space-Namen, Notizen, gemerkte Ideen, Orte | nur zu Anbietern mit AVV |
| **3 — besonders geschützt** | **Fotos** und die Inhalte von **Edition 02** (Intimität) | AVV reicht nicht — Art.-9-Frage, siehe unten |

**Korb 3 ist der Punkt, an dem PeakPlant sich von einem normalen Betrieb
unterscheidet.** Fotos aus einem Paar-Tagebuch und die Inhalte einer Edition
über Intimität können besondere Kategorien personenbezogener Daten nach
Artikel 9 DSGVO berühren. Dafür reicht ein Auftragsverarbeitungsvertrag
ausdrücklich NICHT — es braucht eine eigene Rechtsgrundlage und
möglicherweise eine Datenschutz-Folgenabschätzung. Das ist der eine Punkt in
diesem Dokument, der zur Fachperson gehört, und er steht deshalb hier oben
und nicht am Ende.

## Die sechs Verträge — Ist-Stand und Klickweg

Alle sechs verarbeiten Daten aus Korb 2. Für jeden gilt: Firmenkonto, nicht
privat — nur dort liegen die Unterlagen.

| Anbieter | Wofür | Korb | Wo der AVV liegt |
|---|---|---|---|
| **Supabase** | Datenbank, Auth, Storage, Edge Functions | 2 **und 3** (Fotos!) | Dashboard → Organization Settings → Legal Documents → DPA |
| **Vercel** | Website-Hosting, Logs | 2 | Dashboard → Team Settings → Legal → DPA |
| **Anthropic** | die `discover`-Funktion | 2 | Console → Settings → Legal, oder über den Vertrieb |
| **Stripe** | Checkout, Rechnungen | 2 | Dashboard → Settings → Legal & Compliance → DPA |
| **Resend / Brevo** | Transaktions- und Newsletter-Mails | 2 | Konto-Einstellungen → Legal / Compliance |
| **Google** | Places (Orte), Business-Profil | 2 | Cloud Console → Data Processing Terms akzeptieren |

**Supabase ist der wichtigste**, weil dort als einziger auch Korb 3 liegt.
Wenn du nur einen machst, dann diesen.

Beim selben Besuch je Anbieter die drei Einstellungen prüfen, die der
Kursbaustein nennt:

1. **Wird mit unseren Eingaben trainiert?** Für Anthropic ist das die
   wichtigste; die Antwort gehört schriftlich, nicht aus der Erinnerung.
2. **Wie lange wird gespeichert?** (Retention)
3. **In welcher Region liegen die Daten?** Supabase steht auf `eu-central-1`
   — das ist geprüft und im Sicherheitsdokument vermerkt.

## Der Freigabeweg für das nächste Werkzeug

Damit das nicht jedes Mal von vorn anfängt — fünf Fragen, dieselben wie im
Kurs, hier auf PeakPlant zugeschnitten:

1. Welcher Korb geht da hinein? Bei Korb 3: sofort stoppen und fragen.
2. Gibt es einen AVV, und ist er abgeschlossen — vor dem ersten Datensatz?
3. Wird mit unseren Daten trainiert, und lässt sich das abschalten?
4. Wo liegen die Daten, und gibt es einen Drittlandtransfer?
5. Wie kommen wir wieder heraus, wenn der Anbieter einstellt?

**Wer freigibt:** Alicia. Es gibt niemanden sonst — und genau deshalb gehört
das aufgeschrieben, statt im Kopf zu bleiben.

## Was die App selbst schon hält

Nicht alles ist Papier. Geprüft am 19.08.2026 gegen die Produktionsdatenbank:

- **Alle Migrationen bis 0024 sind angewendet.** Die drei hoch eingestuften
  Sicherheitsfunde des Audits (H1 Pin-Manipulation, H2 Rate-Limit, H3
  `dev-secret`) sind behoben und in Produktion.
- **Löschen** gibt es seit `delete_account` (Art. 17).
- **Auskunft und Mitnahme** gibt es seit heute (Art. 15 und 20) — der Weg
  steht im Konto-Bildschirm und baut die Datei auf dem GERÄT, ohne sie
  vorher irgendwohin zu schicken.
- Die Sicherheits-Advisors melden aktuell **keinen** ERROR. Die drei
  INFO-Hinweise („RLS an, keine Policy") betreffen `api_rate_limits`,
  `orders` und `push_deliveries` — das sind reine Server-Tabellen, und
  „kein Zugriff für niemanden" ist dort der richtige Zustand, nicht ein
  Versäumnis.

## Was nur Alicia tun kann

1. **Leaked Password Protection einschalten.** Supabase Dashboard →
   Authentication → Policies. Ein Schalter, dreißig Sekunden. Der Advisor
   meldet ihn als einzige offene WARNUNG, die wirklich eine ist.
2. **Die sechs AVVs holen** (Tabelle oben). Ein Nachmittag.
3. **Die Art.-9-Frage stellen** (Fotos, Edition 02). Fachperson.
4. **Die Datenschutzerklärung nachziehen**, sobald 2 und 3 beantwortet sind.

Punkt 1 und 2 kannst du heute machen. Punkt 3 entscheidet, ob PeakPlant mit
echten Menschen live gehen darf — und er ist der einzige, bei dem „wir
schauen mal" die falsche Antwort ist.
