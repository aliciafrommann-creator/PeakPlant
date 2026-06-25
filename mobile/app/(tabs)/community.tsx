import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Sections } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { feedbackRepository } from '../../lib/repositories';
import {
  LOCAL_PLACES,
  TOGETHER_MOMENTS,
  type LocalPlace,
} from '../../lib/together';
import { aggregateRatings } from '../../lib/discovery/ratings';
import { buildPlaceMapHtml, directionsUrl } from '../../lib/discovery/placeMap';
import { requestCurrentForegroundLocation } from '../../lib/location';
import { searchLivePlacesNear, type LivePlaceSearchFailure } from '../../lib/discovery/livePlaceSearch';
import { DEFAULT_LIVE_PLACE_RADIUS_KM, livePlaceToLocalPlace } from '../../lib/discovery/livePlaces';
import type { LivePlace } from '../../lib/discovery/providers/interface';
import { acknowledgeSelection, confirmSuccess } from '../../lib/haptics';
import type { DateFeedback } from '../../lib/types';

const PLACES = Sections.community; // lilac — shared, social, a little playful

type MapMessage =
  | { type: 'map-ready' }
  | { type: 'select-place'; id: string };

type LiveStatus =
  | { kind: 'idle'; message: string }
  | { kind: 'live' | 'cached'; message: string; remaining: number; limit: number }
  | { kind: 'error'; message: string; remaining?: number; limit?: number };

function liveFailureMessage(
  reason: LivePlaceSearchFailure,
  t: (en: string, de: string) => string,
): string {
  switch (reason) {
    case 'not_configured':
      return t(
        'live places are wired, but GOOGLE_PLACES_API_KEY is not set in Supabase yet.',
        'Live-Orte sind eingebaut, aber GOOGLE_PLACES_API_KEY ist in Supabase noch nicht gesetzt.',
      );
    case 'monthly_limit':
      return t(
        'monthly live-search limit reached on this device. curated places still work.',
        'Monatslimit fuer Live-Suchen auf diesem Geraet erreicht. Kuratierte Orte funktionieren weiter.',
      );
    case 'rate_limited':
      return t(
        'Google is rate-limiting live places right now. try again later.',
        'Google limitiert Live-Orte gerade. Versuch es spaeter nochmal.',
      );
    case 'no_results':
      return t(
        'no nearby live places matched. try again somewhere else.',
        'Keine passenden Live-Orte in der Naehe gefunden. Versuch es an einem anderen Ort nochmal.',
      );
    case 'storage_unavailable':
      return t(
        'live search is paused because the local cost limit could not be saved.',
        'Live-Suche ist pausiert, weil das lokale Kostenlimit nicht gespeichert werden konnte.',
      );
    case 'network_error':
    default:
      return t(
        'live places need a connection. curated places still work below.',
        'Live-Orte brauchen Verbindung. Kuratierte Orte funktionieren unten weiter.',
      );
  }
}

export default function PlacesScreen() {
  const { place: initialPlaceId } = useLocalSearchParams<{ place?: string }>();
  const { activeSpace } = useSpaces();
  const { t } = useLanguage();
  const firstPlaceId = LOCAL_PLACES.some((place) => place.id === initialPlaceId)
    ? initialPlaceId!
    : LOCAL_PLACES[0]?.id;
  const [selectedId, setSelectedId] = useState(firstPlaceId);
  const [feedback, setFeedback] = useState<DateFeedback[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const [livePlaces, setLivePlaces] = useState<LivePlace[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState<LiveStatus>({
    kind: 'idle',
    message: '',
  });

  useEffect(() => {
    if (initialPlaceId && LOCAL_PLACES.some((place) => place.id === initialPlaceId)) {
      setSelectedId(initialPlaceId);
    }
  }, [initialPlaceId]);

  useEffect(() => {
    if (!activeSpace) {
      setFeedback([]);
      return;
    }
    let alive = true;
    feedbackRepository
      .getAll(activeSpace.id)
      .then((rows) => {
        if (alive) setFeedback(rows);
      })
      .catch(() => {
        if (alive) setFeedback([]);
      });
    return () => {
      alive = false;
    };
  }, [activeSpace]);

  useEffect(() => {
    setMapReady(false);
    setMapUnavailable(false);
    const timer = setTimeout(() => setMapUnavailable(true), 8_000);
    return () => clearTimeout(timer);
  }, [selectedId]);

  const displayPlaces = useMemo(
    () => [...LOCAL_PLACES, ...livePlaces.map(livePlaceToLocalPlace)],
    [livePlaces],
  );
  const selected = displayPlaces.find((place) => place.id === selectedId) ?? displayPlaces[0];
  const selectedLivePlace = livePlaces.find((place) => place.id === selected?.id);
  const linkedMoments = useMemo(
    () => TOGETHER_MOMENTS.filter((moment) => moment.placeId === selected?.id),
    [selected?.id],
  );
  const ownSummary = useMemo(() => {
    const momentIds = new Set(linkedMoments.map((moment) => moment.id));
    return aggregateRatings(feedback.filter((row) => momentIds.has(row.momentId)));
  }, [feedback, linkedMoments]);
  const mapHtml = useMemo(
    () => buildPlaceMapHtml(displayPlaces, selected?.id),
    [displayPlaces, selected?.id],
  );
  const mapSource = useMemo(
    () => ({ html: mapHtml, baseUrl: 'https://peakplant.local' }),
    [mapHtml],
  );

  const selectPlace = useCallback((id: string) => {
    if (!displayPlaces.some((place) => place.id === id)) return;
    setSelectedId(id);
    void acknowledgeSelection();
  }, [displayPlaces]);

  const onMapMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as MapMessage;
      if (message.type === 'map-ready') {
        setMapReady(true);
        setMapUnavailable(false);
      } else if (message.type === 'select-place') {
        selectPlace(message.id);
      }
    } catch {
      // Ignore malformed messages from the embedded map.
    }
  }, [selectPlace]);

  const openDirections = useCallback(async (place: LocalPlace) => {
    const url = livePlaces.find((live) => live.id === place.id)?.mapsUrl ?? directionsUrl(place);
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        t('Could not open directions', 'Route konnte nicht geöffnet werden'),
        t('Please try again in a moment.', 'Bitte versuche es gleich noch einmal.'),
      );
    }
  }, [livePlaces, t]);

  const findNearby = useCallback(async () => {
    setLiveLoading(true);
    setLiveStatus({
      kind: 'idle',
      message: t(
        'asking for your location once — no background tracking.',
        'Standort wird einmalig abgefragt — kein Hintergrund-Tracking.',
      ),
    });
    try {
      const location = await requestCurrentForegroundLocation();
      if (!location.ok) {
        const message = location.reason === 'permission_denied'
          ? t(
              'no worries — without location, curated places still work.',
              'Alles gut — ohne Standort funktionieren kuratierte Orte weiter.',
            )
          : t(
              'could not read your current location. curated places still work.',
              'Aktueller Standort konnte nicht gelesen werden. Kuratierte Orte funktionieren weiter.',
            );
        setLiveStatus({ kind: 'error', message });
        if (location.reason === 'permission_denied') {
          Alert.alert(t('Location not allowed', 'Standort nicht erlaubt'), message);
        }
        return;
      }

      const result = await searchLivePlacesNear({
        near: location.coords,
        radiusKm: DEFAULT_LIVE_PLACE_RADIUS_KM,
      });
      if (result.ok) {
        setLivePlaces(result.places);
        if (result.places[0]) setSelectedId(result.places[0].id);
        setLiveStatus({
          kind: result.source,
          remaining: result.remaining,
          limit: result.limit,
          message: result.source === 'cached'
            ? t(
                `using ${result.places.length} cached nearby places — no new Google request.`,
                `${result.places.length} gespeicherte Orte in der Naehe — keine neue Google-Anfrage.`,
              )
            : t(
                `found ${result.places.length} live places nearby.`,
                `${result.places.length} Live-Orte in der Naehe gefunden.`,
              ),
        });
        await confirmSuccess();
      } else {
        setLiveStatus({
          kind: 'error',
          message: liveFailureMessage(result.reason, t),
          remaining: result.remaining,
          limit: result.limit,
        });
      }
    } finally {
      setLiveLoading(false);
    }
  }, [t]);

  if (!selected) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{t('CURATED IN INNSBRUCK', 'KURATIERT IN INNSBRUCK')}</Text>
          <Text style={styles.title}>{t('places worth sharing', 'Orte, die ihr teilen wollt')}</Text>
          <Text style={styles.subtitle}>
            {t(
              'curated places first. live nearby places only when you ask — cached, limited, and never invented by AI.',
              'Kuratierte Orte zuerst. Live-Orte nur wenn du fragst — gecacht, limitiert und nie von AI erfunden.',
            )}
          </Text>
        </View>

        <View style={styles.livePanel}>
          <View style={styles.liveCopy}>
            <Text style={styles.liveKicker}>{t('OPTIONAL LIVE SEARCH', 'OPTIONALE LIVE-SUCHE')}</Text>
            <Text style={styles.liveText}>
              {t(
                'PeakPlant asks for location once, then Supabase checks Google Places. AI may only sort real returned places.',
                'PeakPlant fragt einmal nach Standort, dann prüft Supabase Google Places. AI darf nur echte gefundene Orte sortieren.',
              )}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.liveButton, liveLoading && styles.liveButtonDisabled]}
            onPress={() => void findNearby()}
            disabled={liveLoading}
            accessibilityRole="button"
            accessibilityLabel={t('Find live places near me', 'Live-Orte in meiner Nähe finden')}
          >
            {liveLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.liveButtonText}>{t('FIND NEAR ME', 'IN DER NÄHE')}</Text>
            )}
          </TouchableOpacity>
          {liveStatus.message ? (
            <Text style={[
              styles.liveStatus,
              liveStatus.kind === 'error' && styles.liveStatusError,
            ]}>
              {liveStatus.message}
              {'remaining' in liveStatus && liveStatus.limit != null
                ? ` ${t('left this month:', 'übrig diesen Monat:')} ${liveStatus.remaining}/${liveStatus.limit}`
                : ''}
            </Text>
          ) : (
            <Text style={styles.liveStatus}>
              {t(
                'default beta limit: 12 fresh live searches per device/month; cached repeats are free.',
                'Beta-Default: 12 frische Live-Suchen pro Gerät/Monat; Cache-Wiederholungen sind gratis.',
              )}
            </Text>
          )}
        </View>

        <View style={styles.mapFrame}>
          <WebView
            source={mapSource}
            onMessage={onMapMessage}
            onError={() => setMapUnavailable(true)}
            onHttpError={() => setMapUnavailable(true)}
            originWhitelist={['*']}
            onShouldStartLoadWithRequest={({ url }) => (
              url.startsWith('about:')
              || url.startsWith('data:')
              || url.startsWith('https://peakplant.local')
              || url.startsWith('https://unpkg.com')
              || url.startsWith('https://tile.openstreetmap.org')
            )}
            javaScriptEnabled
            scrollEnabled={false}
            style={styles.map}
            accessibilityLabel={t('Map of curated places', 'Karte der kuratierten Orte')}
          />
          {!mapReady && (
            <View style={styles.mapLoading} pointerEvents="none">
              {mapUnavailable ? (
                <Text style={styles.mapLoadingText}>
                  {t(
                    'map tiles need a connection — every place still works below.',
                    'Die Karte braucht eine Verbindung – alle Orte funktionieren unten weiter.',
                  )}
                </Text>
              ) : (
                <ActivityIndicator color={Colors.accent} />
              )}
            </View>
          )}
        </View>
        <Text style={styles.attribution}>
          {t('map © OpenStreetMap · CARTO Voyager', 'Karte © OpenStreetMap · CARTO Voyager')}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.placeChips}
        >
          {displayPlaces.map((place) => {
            const active = place.id === selected.id;
            return (
              <TouchableOpacity
                key={place.id}
                style={[styles.placeChip, active && styles.placeChipActive]}
                onPress={() => selectPlace(place.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={place.name}
              >
                <Text style={[styles.placeChipText, active && styles.placeChipTextActive]}>
                  {place.provenance === 'verified-live' ? `✦ ${place.name}` : place.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.placeCard}>
          <View style={styles.placeHead}>
            <View style={styles.placeTitleBlock}>
              <Text style={styles.placeName}>{selected.name.toLowerCase()}</Text>
              <Text style={styles.placeArea}>{selected.area}</Text>
            </View>
            {selected.isPartner && <Text style={styles.partner}>PARTNER</Text>}
            {selectedLivePlace && <Text style={styles.liveBadge}>LIVE</Text>}
          </View>
          <Text style={styles.placeMeta}>
            {selected.category} · {selected.priceBand} · {selected.provenance} · {selected.lastVerifiedAt}
          </Text>
          {selected.perk ? <Text style={styles.perk}>{selected.perk}</Text> : null}
          {selectedLivePlace?.aiWhy ? (
            <View style={styles.aiWhy}>
              <Text style={styles.feedbackLabel}>{t('WHY IT MAY FIT', 'WARUM ES PASSEN KÖNNTE')}</Text>
              <Text style={styles.feedbackTip}>{selectedLivePlace.aiWhy}</Text>
              <Text style={styles.privateNote}>
                {t(
                  'AI only sorted places Google returned; it did not invent this venue.',
                  'AI hat nur Orte sortiert, die Google geliefert hat; dieser Ort wurde nicht erfunden.',
                )}
              </Text>
            </View>
          ) : null}

          {selectedLivePlace ? (
            <Text style={styles.emptyFeedback}>
              {t(
                'live provider result — check opening hours/details in Maps before you go. cached for 24h to keep costs calm.',
                'Live-Provider-Ergebnis — Öffnungszeiten/Details vor dem Losgehen in Maps prüfen. 24h gecacht, damit Kosten ruhig bleiben.',
              )}
            </Text>
          ) : ownSummary.count > 0 ? (
            <View style={styles.feedbackBlock}>
              <Text style={styles.feedbackLabel}>
                {t('YOUR SPACE RECOMMENDS THIS', 'EUER SPACE EMPFIEHLT DIESEN ORT')}
              </Text>
              <Text style={styles.stars}>
                {'★'.repeat(Math.round(ownSummary.average))}
                {'☆'.repeat(5 - Math.round(ownSummary.average))}
              </Text>
              <Text style={styles.feedbackMeta}>
                {ownSummary.average} · {ownSummary.count === 1
                  ? t('one shared experience', 'ein gemeinsames Erlebnis')
                  : t(`${ownSummary.count} shared experiences`, `${ownSummary.count} gemeinsame Erlebnisse`)}
              </Text>
              {ownSummary.latestTip ? (
                <Text style={styles.feedbackTip}>“{ownSummary.latestTip}”</Text>
              ) : null}
              <Text style={styles.privateNote}>
                {t(
                  'from your own private feedback on this device — not a public community rating.',
                  'Aus eurem privaten Feedback auf diesem Gerät – keine öffentliche Community-Bewertung.',
                )}
              </Text>
            </View>
          ) : (
            <Text style={styles.emptyFeedback}>
              {t(
                'after you complete an idea here, your rating and practical tip will appear privately on this device.',
                'Wenn ihr hier eine Idee erlebt habt, erscheinen eure Bewertung und euer praktischer Tipp privat auf diesem Gerät.',
              )}
            </Text>
          )}

          <View style={styles.placeActions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => void openDirections(selected)}
              accessibilityRole="button"
              accessibilityLabel={t(`Directions to ${selected.name}`, `Route zu ${selected.name}`)}
            >
              <Text style={styles.primaryButtonText}>{t('OPEN DIRECTIONS', 'ROUTE ÖFFNEN')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.ideas}>
          <Text style={styles.sectionLabel}>{t('IDEAS FOR THIS PLACE', 'IDEEN FÜR DIESEN ORT')}</Text>
          {linkedMoments.map((moment) => (
            <TouchableOpacity
              key={moment.id}
              style={styles.ideaRow}
              onPress={() => router.push(`/together/${moment.id}`)}
              accessibilityRole="button"
              accessibilityLabel={moment.title}
            >
              <View style={styles.ideaText}>
                <Text style={styles.ideaTitle}>{moment.title}</Text>
                <Text style={styles.ideaBody}>{moment.idea}</Text>
              </View>
              <Text style={styles.arrow}>{'→'}</Text>
            </TouchableOpacity>
          ))}
          {selectedLivePlace && linkedMoments.length === 0 ? (
            <TouchableOpacity
              style={styles.ideaRow}
              onPress={() => router.push('/(tabs)/discover')}
              accessibilityRole="button"
              accessibilityLabel={t('Generate a PeakPlant idea for this place', 'PeakPlant-Idee für diesen Ort generieren')}
            >
              <View style={styles.ideaText}>
                <Text style={styles.ideaTitle}>{t('pair it with a PeakPlant idea', 'mit einer PeakPlant-Idee verbinden')}</Text>
                <Text style={styles.ideaBody}>
                  {t(
                    'go back to the generator and pick a moment that fits the place.',
                    'Zurück zum Generator und einen Moment wählen, der zum Ort passt.',
                  )}
                </Text>
              </View>
              <Text style={styles.arrow}>{'→'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.communityNote}>
          {t(
            'public recommendations can come later, once moderation and consent are ready. live places are facts from providers; feedback stays private for now.',
            'Öffentliche Empfehlungen können später kommen, sobald Moderation und Zustimmung bereit sind. Live-Orte sind Provider-Fakten; Feedback bleibt vorerst privat.',
          )}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxxl },
  header: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  kicker: { fontSize: 10, fontWeight: '500', letterSpacing: 3, color: PLACES },
  title: { ...Typography.editorial, fontSize: 32, lineHeight: 38 },
  subtitle: { fontSize: 14, fontWeight: '300', color: Colors.textMuted, lineHeight: 21 },
  livePanel: {
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: Colors.backgroundCream,
    borderRadius: Radii.md,
    ...Shadows.subtle,
  },
  liveCopy: { gap: Spacing.xs },
  liveKicker: { fontSize: 9, fontWeight: '500', letterSpacing: 2.5, color: PLACES },
  liveText: { fontSize: 12, fontWeight: '300', color: Colors.textMuted, lineHeight: 18 },
  liveButton: {
    minHeight: 48,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  liveButtonDisabled: { opacity: 0.7 },
  liveButtonText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.white },
  liveStatus: { fontSize: 10, fontWeight: '400', color: Colors.textSubtle, lineHeight: 15 },
  liveStatusError: { color: Colors.textMuted },
  mapFrame: {
    height: 310,
    marginHorizontal: Spacing.screen,
    backgroundColor: Colors.backgroundCream,
    overflow: 'hidden',
    borderRadius: Radii.lg,
    ...Shadows.card,
  },
  map: { flex: 1, backgroundColor: Colors.backgroundCream },
  mapLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.backgroundCream,
  },
  mapLoadingText: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textMuted,
    lineHeight: 18,
    textAlign: 'center',
  },
  attribution: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xs,
    fontSize: 9,
    fontWeight: '400',
    color: Colors.textSubtle,
  },
  placeChips: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.lg,
  },
  placeChip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.pill,
  },
  placeChipActive: { backgroundColor: Colors.text, borderColor: Colors.text },
  placeChipText: { fontSize: 12, fontWeight: '400', color: Colors.textMuted },
  placeChipTextActive: { color: Colors.white },
  placeCard: {
    marginHorizontal: Spacing.screen,
    padding: Spacing.lg,
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundCream,
    borderRadius: Radii.md,
    ...Shadows.subtle,
  },
  placeHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  placeTitleBlock: { flex: 1, gap: 2 },
  placeName: { ...Typography.editorial, fontSize: 23, lineHeight: 28 },
  placeArea: { fontSize: 12, fontWeight: '400', color: Colors.textMuted },
  partner: {
    fontSize: 8,
    fontWeight: '500',
    letterSpacing: 2,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 3,
  },
  liveBadge: {
    fontSize: 8,
    fontWeight: '500',
    letterSpacing: 2,
    color: Colors.white,
    backgroundColor: Colors.text,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
  },
  placeMeta: { fontSize: 10, fontWeight: '400', color: Colors.textSubtle },
  perk: { fontSize: 13, fontWeight: '400', color: Colors.text, lineHeight: 19 },
  aiWhy: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
    gap: Spacing.xs,
  },
  feedbackBlock: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
    gap: Spacing.xs,
  },
  feedbackLabel: { fontSize: 9, fontWeight: '500', letterSpacing: 2, color: Colors.textSubtle },
  stars: { fontSize: 20, color: Colors.accent, letterSpacing: 2 },
  feedbackMeta: { fontSize: 12, fontWeight: '400', color: Colors.textMuted },
  feedbackTip: { fontSize: 13, fontWeight: '300', color: Colors.text, lineHeight: 19 },
  privateNote: { fontSize: 10, fontWeight: '400', color: Colors.textSubtle, lineHeight: 15 },
  emptyFeedback: { fontSize: 12, fontWeight: '400', color: Colors.textMuted, lineHeight: 18 },
  placeActions: { paddingTop: Spacing.sm },
  primaryButton: {
    minHeight: 48,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  primaryButtonText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.white },
  ideas: {
    marginTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionLabel: {
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2.5,
    color: Colors.textSubtle,
  },
  ideaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 76,
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ideaText: { flex: 1, gap: 3 },
  ideaTitle: { fontSize: 15, fontWeight: '400', color: Colors.text },
  ideaBody: { fontSize: 12, fontWeight: '300', color: Colors.textMuted, lineHeight: 18 },
  arrow: { fontSize: 20, fontWeight: '300', color: Colors.textMuted },
  communityNote: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xl,
    fontSize: 11,
    fontWeight: '400',
    color: Colors.textSubtle,
    lineHeight: 17,
  },
});
