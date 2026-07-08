import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Colors, Sections } from '../../constants/colors';
import { Spacing, Radii, Shadows, Opacity } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { feedbackRepository, publicPlaceFeedbackRepository, savedDateRepository } from '../../lib/repositories';
import {
  LOCAL_PLACES,
  TOGETHER_MOMENTS,
  type LocalPlace,
} from '../../lib/together';
import { aggregateRatings } from '../../lib/discovery/ratings';
import { buildPlaceMapHtml, directionsUrl } from '../../lib/discovery/placeMap';
import { requestCurrentForegroundLocation } from '../../lib/location';
import {
  resetLivePlaceSearchUsage,
  searchLivePlacesNear,
  type LivePlaceSearchFailure,
} from '../../lib/discovery/livePlaceSearch';
import {
  DEFAULT_LIVE_PLACE_RADIUS_KM,
  PILOT_CITIES,
  publicSpotToLocalPlace,
  livePlaceToLocalPlace,
  type PilotCity,
} from '../../lib/discovery/livePlaces';
import type { LivePlace } from '../../lib/discovery/providers/interface';
import { acknowledgeSelection, confirmSuccess } from '../../lib/haptics';
import type { DateFeedback, PublicPlaceFeedback, PublicPlaceSpot, SavedDate } from '../../lib/types';

const PLACES = Sections.community; // raspberry blossom — shared, social, a little playful

type MapMessage =
  | { type: 'map-ready' }
  | { type: 'map-failed' }
  | { type: 'select-place'; id: string };

type LiveStatus =
  | { kind: 'idle'; message: string }
  | { kind: 'live' | 'cached'; message: string; remaining: number; limit: number }
  | { kind: 'error'; message: string; remaining?: number; limit?: number };

function placeMomentId(placeId: string): string {
  return `place:${placeId}`;
}

function aggregatePublicFeedback(rows: PublicPlaceFeedback[]) {
  if (rows.length === 0) return { count: 0, average: 0 };
  const sorted = [...rows].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const average = Math.round((rows.reduce((sum, row) => sum + row.rating, 0) / rows.length) * 10) / 10;
  return { count: rows.length, average, latestTip: sorted.find((row) => row.tip)?.tip };
}

function uniquePlaces(places: LocalPlace[]): LocalPlace[] {
  const byId = new Map<string, LocalPlace>();
  for (const place of places) byId.set(place.id, place);
  return [...byId.values()];
}

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
  const [publicFeedback, setPublicFeedback] = useState<PublicPlaceFeedback[]>([]);
  const [publicSpots, setPublicSpots] = useState<PublicPlaceSpot[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const [livePlaces, setLivePlaces] = useState<LivePlace[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [ratingVisible, setRatingVisible] = useState(false);
  const [publicRating, setPublicRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [publicTip, setPublicTip] = useState('');
  const [publicSharing, setPublicSharing] = useState(false);
  const [savedForSpace, setSavedForSpace] = useState<SavedDate[]>([]);
  const [liveStatus, setLiveStatus] = useState<LiveStatus>({
    kind: 'idle',
    message: '',
  });

  // The space's saved/planned/done places — powers the on-map loop status so
  // find → plan → done → rate reads as one journey without leaving the map.
  const reloadSaved = useCallback(async () => {
    if (!activeSpace) {
      setSavedForSpace([]);
      return;
    }
    try {
      setSavedForSpace(await savedDateRepository.getAll(activeSpace.id));
    } catch {
      /* best-effort: the map still works without loop status */
    }
  }, [activeSpace]);

  useFocusEffect(
    useCallback(() => {
      void reloadSaved();
    }, [reloadSaved]),
  );

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

  useEffect(() => {
    let alive = true;
    publicPlaceFeedbackRepository
      .getSpots()
      .then((spots) => {
        if (alive) setPublicSpots(spots);
      })
      .catch(() => {
        if (alive) setPublicSpots([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const displayPlaces = useMemo(
    () => uniquePlaces([
      ...LOCAL_PLACES,
      ...publicSpots.map(publicSpotToLocalPlace),
      ...livePlaces.map(livePlaceToLocalPlace),
    ]),
    [livePlaces, publicSpots],
  );

  useEffect(() => {
    let alive = true;
    publicPlaceFeedbackRepository
      .getByPlaceIds(displayPlaces.map((place) => place.id))
      .then((rows) => {
        if (alive) setPublicFeedback(rows);
      })
      .catch(() => {
        if (alive) setPublicFeedback([]);
      });
    return () => {
      alive = false;
    };
  }, [displayPlaces]);

  const selected = displayPlaces.find((place) => place.id === selectedId) ?? displayPlaces[0];
  const selectedLivePlace = livePlaces.find((place) => place.id === selected?.id);
  const linkedMoments = useMemo(
    () => TOGETHER_MOMENTS.filter((moment) => moment.placeId === selected?.id),
    [selected?.id],
  );
  const ownSummary = useMemo(() => {
    const momentIds = new Set(linkedMoments.map((moment) => moment.id));
    if (selected?.id) momentIds.add(placeMomentId(selected.id));
    return aggregateRatings(feedback.filter((row) => momentIds.has(row.momentId)));
  }, [feedback, linkedMoments, selected?.id]);
  const publicSummary = useMemo(
    () => aggregatePublicFeedback(publicFeedback.filter((row) => row.placeId === selected?.id)),
    [publicFeedback, selected?.id],
  );
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
      } else if (message.type === 'map-failed') {
        // Leaflet blocked or both tile providers down — show the honest
        // connection message immediately instead of waiting out the timer.
        setMapUnavailable(true);
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

  const publicSpotForPlace = useCallback((place: LocalPlace | undefined): Omit<PublicPlaceSpot, 'createdAt'> | null => {
    if (!place || typeof place.lat !== 'number' || typeof place.lng !== 'number') return null;
    const live = livePlaces.find((item) => item.id === place.id);
    const existing = publicSpots.find((item) => item.id === place.id);
    return {
      id: place.id,
      name: place.name,
      address: place.area,
      lat: place.lat,
      lng: place.lng,
      category: place.category,
      mapsUrl: live?.mapsUrl ?? existing?.mapsUrl,
      sourceId: live?.sourceId ?? existing?.sourceId ?? 'peakplant-community',
    };
  }, [livePlaces, publicSpots]);

  const searchAtCoords = useCallback(async ({
    coords,
    query,
    label,
  }: {
    coords: PilotCity['coords'];
    query?: string;
    label: string;
  }) => {
    setLiveLoading(true);
    setLiveStatus({
      kind: 'idle',
      message: t(`searching live places for ${label}…`, `Suche Live-Orte für ${label}…`),
    });
    try {
      let usedBroaderFallback = false;
      let result = await searchLivePlacesNear({
        query,
        near: coords,
        radiusKm: DEFAULT_LIVE_PLACE_RADIUS_KM,
        scopeId: activeSpace?.id,
      });
      // A very specific query (e.g. "workshop innsbruck") can match nothing.
      // No-results don't burn the allowance, so retry once broader before giving up.
      if (!result.ok && result.reason === 'no_results' && query) {
        usedBroaderFallback = true;
        result = await searchLivePlacesNear({
          near: coords,
          radiusKm: DEFAULT_LIVE_PLACE_RADIUS_KM,
          scopeId: activeSpace?.id,
        });
      }
      if (result.ok) {
        setLivePlaces(result.places);
        if (result.places[0]) setSelectedId(result.places[0].id);
        setLiveStatus({
          kind: result.source,
          remaining: result.remaining,
          limit: result.limit,
          message: usedBroaderFallback
            ? t(
                `nothing exact, so I broadened it and found ${result.places.length} places for ${label}.`,
                `Exakt dazu kam nichts, deshalb breiter gesucht: ${result.places.length} Orte für ${label} gefunden.`,
              )
            : result.source === 'cached'
              ? t(
                  `using ${result.places.length} cached places for ${label} — no new Google request.`,
                  `${result.places.length} gespeicherte Orte für ${label} — keine neue Google-Anfrage.`,
                )
              : t(
                  `found ${result.places.length} live places for ${label}.`,
                  `${result.places.length} Live-Orte für ${label} gefunden.`,
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
  }, [activeSpace?.id, t]);

  const findNearby = useCallback(async (query?: string) => {
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
              'no worries — without location, use a pilot city or try again later.',
              'Alles gut — ohne Standort nutze eine Pilotstadt oder versuch es später erneut.',
            )
          : t(
              'could not read your current location. pilot-city live search still works.',
              'Aktueller Standort konnte nicht gelesen werden. Pilotstadt-Live-Suche funktioniert weiter.',
            );
        setLiveStatus({ kind: 'error', message });
        if (location.reason === 'permission_denied') {
          Alert.alert(t('Location not allowed', 'Standort nicht erlaubt'), message);
        }
        return;
      }
      await searchAtCoords({ coords: location.coords, query, label: t('near you', 'in deiner Nähe') });
    } finally {
      setLiveLoading(false);
    }
  }, [searchAtCoords, t]);

  const searchPilotCity = useCallback(async (city: PilotCity, query?: string) => {
    await searchAtCoords({ coords: city.coords, query, label: city.label });
  }, [searchAtCoords]);

  // An old build could leave a per-device counter stuck at 0. Let the couple
  // clear this space's local counter so a stale value never blocks them.
  const resetLiveSearchCounter = useCallback(async () => {
    try {
      await resetLivePlaceSearchUsage(activeSpace?.id);
      setLiveStatus({
        kind: 'idle',
        message: t(
          'local live-search counter reset for this space. try a broader search again.',
          'Lokales Live-Suchkontingent für diesen Space zurückgesetzt. Versuch eine breitere Suche nochmal.',
        ),
      });
      await confirmSuccess();
    } catch {
      Alert.alert(
        t('Could not reset counter', 'Kontingent konnte nicht zurückgesetzt werden'),
        t('Please try again in a moment.', 'Bitte versuche es gleich noch einmal.'),
      );
    }
  }, [activeSpace?.id, t]);

  const planSelectedPlace = useCallback(async () => {
    if (!activeSpace || !selected) {
      Alert.alert(
        t('Create a space first', 'Erstelle zuerst einen Space'),
        t('Plans need a shared space so they can become memories later.', 'Pläne brauchen einen gemeinsamen Space, damit daraus später Momente werden.'),
      );
      return;
    }
    const linkedMoment = linkedMoments[0];
    const spot = publicSpotForPlace(selected);
    try {
      const saved = await savedDateRepository.save({
        spaceId: activeSpace.id,
        momentId: linkedMoment?.id ?? placeMomentId(selected.id),
        title: linkedMoment?.title ?? t(`visit ${selected.name}`, `${selected.name} besuchen`),
        concept: linkedMoment?.idea ?? t(
          `Turn ${selected.name} into a tiny PeakPlant date: go there, choose one real question, then preserve what happened.`,
          `Macht aus ${selected.name} ein kleines PeakPlant-Date: hingehen, eine echte Frage wählen und danach festhalten, was passiert ist.`,
        ),
        priceBand: linkedMoment?.priceBand ?? selected.priceBand,
        estDurationMin: linkedMoment?.avgDurationMin ?? 75,
        status: 'saved',
        placeId: spot?.id,
        // Curated prompts have no real spot (no lat/lng) — still key the plan
        // by the visible name so the map's planned/done loop status matches.
        placeName: spot?.name ?? selected.name,
        placeAddress: spot?.address,
        placeLat: spot?.lat,
        placeLng: spot?.lng,
        placeCategory: spot?.category,
        placeMapsUrl: spot?.mapsUrl,
      });
      await confirmSuccess();
      await reloadSaved();
      router.push({ pathname: '/discover/saved', params: { plan: saved.id } });
    } catch {
      Alert.alert(
        t('Could not save this plan', 'Plan konnte nicht gespeichert werden'),
        t('Please try again in a moment.', 'Bitte versuche es gleich noch einmal.'),
      );
    }
  }, [activeSpace, linkedMoments, publicSpotForPlace, selected, t, reloadSaved]);

  const openPublicRating = useCallback(() => {
    const spot = publicSpotForPlace(selected);
    if (!spot) {
      Alert.alert(
        t('Find a real place first', 'Finde zuerst einen echten Ort'),
        t('Search live places or pick a community spot, then you can add a rating to the map.', 'Suche Live-Orte oder wähle einen Community-Spot, dann kannst du eine Bewertung zur Karte hinzufügen.'),
      );
      return;
    }
    setPublicRating(null);
    setPublicTip('');
    setRatingVisible(true);
  }, [publicSpotForPlace, selected, t]);

  const submitPublicRating = useCallback(async () => {
    const spot = publicSpotForPlace(selected);
    if (!spot || !publicRating || publicSharing) return;
    setPublicSharing(true);
    try {
      await publicPlaceFeedbackRepository.saveSpot(spot);
      await publicPlaceFeedbackRepository.save({
        placeId: spot.id,
        rating: publicRating,
        tip: publicTip.trim() || undefined,
      });
      const [spots, rows] = await Promise.all([
        publicPlaceFeedbackRepository.getSpots(),
        publicPlaceFeedbackRepository.getByPlaceIds([...displayPlaces.map((place) => place.id), spot.id]),
      ]);
      setPublicSpots(spots);
      setPublicFeedback(rows);
      setRatingVisible(false);
      setPublicRating(null);
      setPublicTip('');
      await confirmSuccess();
    } catch {
      Alert.alert(
        t('Could not share this spot', 'Spot konnte nicht geteilt werden'),
        t('Please try again in a moment.', 'Bitte versuche es gleich noch einmal.'),
      );
    } finally {
      setPublicSharing(false);
    }
  }, [displayPlaces, publicRating, publicSharing, publicSpotForPlace, publicTip, selected, t]);

  // Where this place sits in the loop for the active space (matched by name).
  // Declared before the early return below so hook order stays stable.
  const selectedSaved = useMemo(
    () =>
      selected
        ? savedForSpace.find(
            (d) =>
              d.status !== 'dismissed' &&
              d.placeName != null &&
              d.placeName.toLowerCase() === selected.name.toLowerCase(),
          )
        : undefined,
    [savedForSpace, selected],
  );

  // Step 4a: turn this place into a private diary memory (notes/photos stay
  // private to the space — never public). Prefilled from the planned place.
  const createMemoryForSelected = useCallback(() => {
    if (!selected) return;
    const spot = publicSpotForPlace(selected);
    router.push({
      pathname: '/memory/create',
      params: {
        prefillNote: t(`our moment at ${selected.name}`, `unser Moment bei ${selected.name}`),
        ...(selectedSaved
          ? {
              savedDateId: selectedSaved.id,
              savedDateTitle: selectedSaved.title,
              savedDateMomentId: selectedSaved.momentId,
            }
          : {}),
        placeName: selectedSaved?.placeName ?? spot?.name ?? selected.name,
        ...(selectedSaved?.placeId ?? spot?.id ? { placeId: selectedSaved?.placeId ?? spot?.id } : {}),
        ...(selectedSaved?.placeAddress ?? spot?.address
          ? { placeAddress: selectedSaved?.placeAddress ?? spot?.address }
          : {}),
        ...(selectedSaved?.placeMapsUrl ?? spot?.mapsUrl
          ? { placeMapsUrl: selectedSaved?.placeMapsUrl ?? spot?.mapsUrl }
          : {}),
      },
    });
  }, [selected, selectedSaved, publicSpotForPlace, t]);

  const markSelectedDone = useCallback(async () => {
    if (!selectedSaved) return;
    try {
      await savedDateRepository.update(selectedSaved.id, {
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
      await confirmSuccess();
      await reloadSaved();
      // Cleanly ask what's next — keep a private memory, or share an anonymous
      // tip. The copy makes clear notes/photos never become public.
      const canShare = !!(selected && publicSpotForPlace(selected));
      Alert.alert(
        t('lovely — done together ♥', 'schön — zusammen erlebt ♥'),
        t(
          'Keep it as a private memory, or leave an anonymous tip on the map? Your notes and photos always stay private to your space.',
          'Als private Erinnerung behalten oder einen anonymen Tipp auf der Karte lassen? Eure Notizen und Fotos bleiben immer privat in eurem Space.',
        ),
        [
          { text: t('Create memory', 'Erinnerung anlegen'), onPress: () => createMemoryForSelected() },
          ...(canShare
            ? [{ text: t('Rate anonymously', 'Anonym bewerten'), onPress: () => openPublicRating() }]
            : []),
          { text: t('Later', 'Später'), style: 'cancel' as const },
        ],
      );
    } catch {
      Alert.alert(
        t('Could not update this plan', 'Plan konnte nicht aktualisiert werden'),
        t('Please try again in a moment.', 'Bitte versuche es gleich noch einmal.'),
      );
    }
  }, [selectedSaved, reloadSaved, selected, publicSpotForPlace, openPublicRating, createMemoryForSelected, t]);

  if (!selected) return null;
  const selectedHasDirections = Boolean(selectedLivePlace?.mapsUrl ?? directionsUrl(selected));
  const selectedIsSearchPrompt = !selectedLivePlace && selected.provenance === 'needs-confirmation';
  const selectedCanBeShared = Boolean(publicSpotForPlace(selected));
  const selectedIsPlanned = !!selectedSaved && selectedSaved.status !== 'completed';
  const selectedIsDone = selectedSaved?.status === 'completed';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{t('LIVE PLACE DISCOVERY', 'LIVE-ORTE FINDEN')}</Text>
          <Text style={styles.title}>{t('find a real place', 'findet einen echten Ort')}</Text>
          <Text style={styles.subtitle}>
            {t(
              'no fake partner venues. choose a vibe, then pull current places near you or in a pilot city.',
              'Keine behaupteten Partnerorte. Wählt eine Stimmung, dann werden aktuelle Orte in deiner Nähe oder einer Pilotstadt gezogen.',
            )}
          </Text>
        </View>

        <View style={styles.livePanel}>
          <View style={styles.liveCopy}>
            <Text style={styles.liveKicker}>{t('OPTIONAL LIVE SEARCH', 'OPTIONALE LIVE-SUCHE')}</Text>
            <Text style={styles.liveText}>
              {t(
                'PeakPlant asks for location only when you tap. Supabase checks Google Places; AI may only sort real returned places.',
                'PeakPlant fragt Standort nur, wenn du tippst. Supabase prüft Google Places; AI darf nur echte gefundene Orte sortieren.',
              )}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.liveButton, liveLoading && styles.liveButtonDisabled]}
            onPress={() => void findNearby(selected.liveQuery)}
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
          <TouchableOpacity
            style={styles.askMapButton}
            onPress={() => router.push('/ask')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t(
              'Ask PeakPlant for a specific place idea',
              'PeakPlant nach einer spezifischen Orte-Idee fragen',
            )}
          >
            <Text style={styles.askMapButtonText}>
              {t('ASK PEAKPLANT FOR A FITTED DATE IDEA', 'PEAKPLANT NACH PASSENDER DATE-IDEE FRAGEN')}
            </Text>
          </TouchableOpacity>
          <View style={styles.pilotCities}>
            {PILOT_CITIES.map((city) => (
              <TouchableOpacity
                key={city.id}
                style={styles.pilotCity}
                onPress={() => void searchPilotCity(city, selected.liveQuery)}
                disabled={liveLoading}
                accessibilityRole="button"
                accessibilityLabel={t(`Search live places in ${city.label}`, `Live-Orte in ${city.label} suchen`)}
              >
                <Text style={styles.pilotCityText}>{city.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {liveStatus.message ? (
            <>
              <Text style={[
                styles.liveStatus,
                liveStatus.kind === 'error' && styles.liveStatusError,
              ]}>
                {liveStatus.message}
                {'remaining' in liveStatus && liveStatus.limit != null
                  ? ` ${t('left for this space:', 'übrig für diesen Space:')} ${liveStatus.remaining}/${liveStatus.limit}`
                  : ''}
              </Text>
              {'remaining' in liveStatus && liveStatus.remaining === 0 ? (
                <TouchableOpacity
                  style={styles.resetCounterButton}
                  onPress={() => void resetLiveSearchCounter()}
                  accessibilityRole="button"
                  accessibilityLabel={t('Reset local live search counter', 'Lokales Live-Suchkontingent zurücksetzen')}
                >
                  <Text style={styles.resetCounterText}>
                    {t('RESET LOCAL COUNTER', 'LOKALEN ZÄHLER ZURÜCKSETZEN')}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : (
            <Text style={styles.liveStatus}>
              {t(
                'default beta limit: 6 useful fresh live searches per space/month; cached repeats and no-results are free.',
                'Beta-Default: 6 nützliche frische Live-Suchen pro Space/Monat; Cache-Wiederholungen und Null-Treffer sind gratis.',
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
              || url.startsWith('https://a.basemaps.cartocdn.com')
              || url.startsWith('https://b.basemaps.cartocdn.com')
              || url.startsWith('https://c.basemaps.cartocdn.com')
              || url.startsWith('https://d.basemaps.cartocdn.com')
            )}
            javaScriptEnabled
            scrollEnabled
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
            {selected.category} · {selected.priceBand} · {selectedIsSearchPrompt
              ? t('live search prompt', 'Live-Suchvorlage')
              : `${selected.provenance} · ${selected.lastVerifiedAt}`}
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

          {selectedIsSearchPrompt ? (
            <Text style={styles.emptyFeedback}>
              {t(
                'this is not a venue claim. tap live search to pull current real places for this vibe.',
                'Das ist kein behaupteter Ort. Tippe Live-Suche, um aktuelle echte Orte für diese Stimmung zu ziehen.',
              )}
            </Text>
          ) : selectedLivePlace ? (
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

          {publicSummary.count > 0 ? (
            <View style={styles.feedbackBlock}>
              <Text style={styles.feedbackLabel}>
                {t('ANONYMOUS PLACE TIPS', 'ANONYME ORTE-TIPPS')}
              </Text>
              <Text style={styles.stars}>
                {'★'.repeat(Math.round(publicSummary.average))}
                {'☆'.repeat(5 - Math.round(publicSummary.average))}
              </Text>
              <Text style={styles.feedbackMeta}>
                {publicSummary.average} · {publicSummary.count === 1
                  ? t('one public tip', 'ein öffentlicher Tipp')
                  : t(`${publicSummary.count} public tips`, `${publicSummary.count} öffentliche Tipps`)}
              </Text>
              {publicSummary.latestTip ? (
                <Text style={styles.feedbackTip}>“{publicSummary.latestTip}”</Text>
              ) : null}
            </View>
          ) : null}

          {/* Loop status: find → plan → done → rate, shown right on the place. */}
          {(selectedIsPlanned || selectedIsDone) && (
            <View style={[styles.loopStatus, selectedIsDone && styles.loopStatusDone]}>
              <Text style={[styles.loopStatusText, selectedIsDone && styles.loopStatusTextDone]}>
                {selectedIsDone
                  ? t('✓ you’ve done this together', '✓ ihr habt das zusammen gemacht')
                  : t('◷ planned for your space', '◷ für euren Space geplant')}
              </Text>
            </View>
          )}

          <View style={styles.placeActions}>
            {selectedHasDirections ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => void openDirections(selected)}
                accessibilityRole="button"
                accessibilityLabel={t(`Directions to ${selected.name}`, `Route zu ${selected.name}`)}
              >
                <Text style={styles.primaryButtonText}>{t('OPEN DIRECTIONS', 'ROUTE ÖFFNEN')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, liveLoading && styles.liveButtonDisabled]}
                onPress={() => void findNearby(selected.liveQuery)}
                disabled={liveLoading}
                accessibilityRole="button"
                accessibilityLabel={t('Find live matches for this vibe', 'Live-Treffer für diese Stimmung finden')}
              >
                <Text style={styles.primaryButtonText}>
                  {liveLoading ? t('SEARCHING…', 'SUCHE…') : t('FIND LIVE MATCHES', 'LIVE-TREFFER FINDEN')}
                </Text>
              </TouchableOpacity>
            )}
            {/* Step 2: plan — hidden once it's already planned/done. */}
            {!selectedSaved && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => void planSelectedPlace()}
                accessibilityRole="button"
                accessibilityLabel={t(`Plan ${selected.name}`, `${selected.name} planen`)}
              >
                <Text style={styles.secondaryButtonText}>
                  {selectedLivePlace ? t('PLAN A DATE HERE', 'HIER EIN DATE PLANEN') : t('PLAN THIS DATE', 'DIESES DATE PLANEN')}
                </Text>
              </TouchableOpacity>
            )}
            {/* Step 3: complete — once planned, finish it right here. */}
            {selectedIsPlanned && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => void markSelectedDone()}
                accessibilityRole="button"
                accessibilityLabel={t(`Mark ${selected.name} as done`, `${selected.name} als erledigt markieren`)}
              >
                <Text style={styles.secondaryButtonText}>{t('WE DID THIS HERE', 'DAS HABEN WIR ERLEBT')}</Text>
              </TouchableOpacity>
            )}
            {/* Step 4a: keep it as a private memory (notes/photos stay private). */}
            {selectedIsDone && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={createMemoryForSelected}
                accessibilityRole="button"
                accessibilityLabel={t(`Create a memory of ${selected.name}`, `Erinnerung an ${selected.name} anlegen`)}
              >
                <Text style={styles.secondaryButtonText}>{t('KEEP THE MEMORY', 'ERINNERUNG FESTHALTEN')}</Text>
              </TouchableOpacity>
            )}
            {/* Step 4b: anonymous rating — the only thing that ever goes public. */}
            {selectedCanBeShared ? (
              <TouchableOpacity
                style={styles.tertiaryButton}
                onPress={openPublicRating}
                accessibilityRole="button"
                accessibilityLabel={t(`Rate ${selected.name} anonymously`, `${selected.name} anonym bewerten`)}
              >
                <Text style={styles.tertiaryButtonText}>
                  {publicSummary.count > 0
                    ? t('ADD ANONYMOUS RATING', 'ANONYME BEWERTUNG HINZUFÜGEN')
                    : t('SHARE ONLY THE SPOT', 'NUR DEN ORT TEILEN')}
                </Text>
              </TouchableOpacity>
            ) : null}
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
            'live places come from providers, not PeakPlant imagination. place tips become public only after explicit anonymous sharing; diary memories stay private.',
            'Live-Orte kommen von Providern, nicht aus PeakPlant-Fantasie. Orte-Tipps werden nur nach aktivem anonymem Teilen öffentlich; Tagebuchmomente bleiben privat.',
          )}
        </Text>
      </ScrollView>

      <Modal
        visible={ratingVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRatingVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setRatingVisible(false)}
            accessibilityLabel={t('Close', 'Schließen')}
          />
          <View style={styles.sheet}>
            <Text style={styles.sheetKicker}>{t('ANONYMOUS MAP TIP', 'ANONYMER MAP-TIPP')}</Text>
            <Text style={styles.sheetTitle}>{selected.name.toLowerCase()}</Text>
            <Text style={styles.sheetNote}>
              {t(
                'Only this spot, stars and optional practical tip become public. Your space, memory and identity stay private.',
                'Nur dieser Spot, Sterne und optionaler praktischer Tipp werden öffentlich. Space, Erinnerung und Identität bleiben privat.',
              )}
            </Text>
            <View style={styles.sheetStars}>
              {([1, 2, 3, 4, 5] as const).map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setPublicRating(star)}
                  accessibilityRole="button"
                  accessibilityLabel={t(`${star} stars`, `${star} Sterne`)}
                >
                  <Text style={[styles.sheetStar, publicRating != null && star <= publicRating && styles.sheetStarOn]}>
                    {publicRating != null && star <= publicRating ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.sheetInput}
              value={publicTip}
              onChangeText={setPublicTip}
              maxLength={280}
              multiline
              placeholder={t('tiny practical tip…', 'kleiner praktischer Tipp…')}
              placeholderTextColor={Colors.textFaint}
            />
            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={styles.sheetCancel}
                onPress={() => setRatingVisible(false)}
                accessibilityRole="button"
              >
                <Text style={styles.sheetCancelText}>{t('CANCEL', 'ABBRECHEN')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetConfirm, (!publicRating || publicSharing) && styles.sheetConfirmDisabled]}
                onPress={() => void submitPublicRating()}
                disabled={!publicRating || publicSharing}
                accessibilityRole="button"
              >
                {publicSharing ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.sheetConfirmText}>{t('SHARE ANONYMOUSLY', 'ANONYM TEILEN')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  askMapButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    borderRadius: Radii.pill,
  },
  askMapButtonText: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2,
    color: Colors.text,
    textAlign: 'center',
  },
  pilotCities: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  pilotCity: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pilotCityText: { fontSize: 10, fontWeight: '500', letterSpacing: 1.5, color: Colors.textMuted },
  liveStatus: { fontSize: 10, fontWeight: '400', color: Colors.textSubtle, lineHeight: 15 },
  liveStatusError: { color: Colors.textMuted },
  resetCounterButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.pill,
  },
  resetCounterText: { fontSize: 9, fontWeight: '500', letterSpacing: 2, color: Colors.textMuted },
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
  loopStatus: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    backgroundColor: Colors.backgroundCream,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loopStatusDone: { backgroundColor: Colors.text, borderColor: Colors.text },
  loopStatusText: { fontSize: 10, fontWeight: '600', letterSpacing: 1, color: Colors.textMuted },
  loopStatusTextDone: { color: Colors.white },
  placeActions: { paddingTop: Spacing.sm, gap: Spacing.sm },
  primaryButton: {
    minHeight: 48,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  primaryButtonText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.white },
  secondaryButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  secondaryButtonText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.text },
  tertiaryButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tertiaryButtonText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.textMuted },
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
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  sheetKicker: { fontSize: 9, fontWeight: '500', letterSpacing: 2.5, color: Colors.textSubtle },
  sheetTitle: { fontSize: 24, fontWeight: '200', color: Colors.text, letterSpacing: -0.3 },
  sheetNote: { fontSize: 12, fontWeight: '300', color: Colors.textMuted, lineHeight: 18 },
  sheetStars: { flexDirection: 'row', gap: Spacing.md },
  sheetStar: { fontSize: 34, color: Colors.border },
  sheetStarOn: { color: Colors.accent },
  sheetInput: {
    fontSize: 15,
    fontWeight: '300',
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  sheetActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  sheetCancel: {
    height: 44,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetCancelText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.textMuted },
  sheetConfirm: {
    height: 44,
    flex: 1,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  sheetConfirmDisabled: { opacity: Opacity.disabled },
  sheetConfirmText: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.white },
});
