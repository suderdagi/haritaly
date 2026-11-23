import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import MapView, { LongPressEvent, MapPressEvent } from 'react-native-maps';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, palette, radius, screenPadding, shadow, space } from '@/src/theme';
import { useAuth } from '@/src/store/auth';
import { useUserLocation } from '@/src/store/location';
import { usePlaces } from '@/src/hooks/usePlaces';
import { CATEGORIES, Category, categoryIconOutline, categoryLabel, categoryPlural } from '@/src/lib/categories';
import { Coordinates, regionAround, regionContains, regionForPoints, regionRadius } from '@/src/lib/geo';
import { haptics } from '@/src/lib/haptics';
import { clusterSpots, groupIntoSpots, Spot } from '@/src/lib/spots';
import { setPendingLocation } from '@/src/lib/pendingLocation';
import { MapRegion, Place } from '@/src/types';
import { Chip, IconButton } from '@/src/components/ui';
import { ClusterMarker, DraftMarker, SelectionLabel, SpotMarker } from '@/src/components/map/Markers';
import { SearchPanel, SearchPill } from '@/src/components/map/MapSearch';
import { PlaceSheet } from '@/src/components/map/PlaceSheet';
import { AreaSheet } from '@/src/components/map/AreaSheet';
import { DraftSheet } from '@/src/components/map/DraftSheet';

// Istanbul, until the user's location or their own places are known
const INITIAL_REGION: MapRegion = {
  latitude: 41.0369,
  longitude: 28.985,
  latitudeDelta: 0.09,
  longitudeDelta: 0.06,
};

// The nearby endpoint accepts radii between 100 m and 50 km
const MIN_RADIUS_M = 100;
const MAX_RADIUS_M = 50_000;
const REGION_DEBOUNCE_MS = 400;

const SHEET_PEEK = 96;
const SEARCH_HEIGHT = 46;
const FILTERS_HEIGHT = 36;

type OwnerFilter = 'all' | 'mine' | 'friends';

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { status: locationStatus, coords, requestLocation } = useUserLocation();
  const {
    myPlaces,
    allPlaces,
    isFavorite,
    toggleFavorite,
    loading,
    loadedOnce,
    refreshMine,
    refreshFavorites,
    fetchFriendsNear,
  } = usePlaces();

  const mapRef = useRef<MapView>(null);
  const sheetRef = useRef<BottomSheet>(null);
  const [region, setRegion] = useState<MapRegion>(INITIAL_REGION);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [owner, setOwner] = useState<OwnerFilter>('all');
  const [category, setCategory] = useState<Category | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [snapshot, setSnapshot] = useState<Spot | null>(null);
  const [foundPlaces, setFoundPlaces] = useState<Place[]>([]);
  const [draft, setDraft] = useState<Coordinates | null>(null);
  const [searching, setSearching] = useState(false);

  const topOverlay = insets.top + 6 + SEARCH_HEIGHT + space.xs + FILTERS_HEIGHT;
  const snapPoints = useMemo(() => [SHEET_PEEK, '50%', '92%'], []);

  // ── Data ────────────────────────────────────────────────────────────────

  const regionRef = useRef(region);
  regionRef.current = region;
  const lastQuery = useRef('');

  const loadFriendsInView = useCallback(
    (force = false) => {
      const r = regionRef.current;
      const radiusM = Math.round(Math.min(Math.max(regionRadius(r), MIN_RADIUS_M), MAX_RADIUS_M));
      const query = `${r.latitude.toFixed(4)},${r.longitude.toFixed(4)},${radiusM}`;
      if (!force && query === lastQuery.current) return;
      lastQuery.current = query;
      fetchFriendsNear(r.latitude, r.longitude, radiusM);
    },
    [fetchFriendsNear]
  );

  // Reload on focus, so places added or edited elsewhere show up right away
  useFocusEffect(
    useCallback(() => {
      refreshMine();
      refreshFavorites();
      loadFriendsInView(true);
    }, [refreshMine, refreshFavorites, loadFriendsInView])
  );

  // Ask the server only once the map has stopped moving
  useEffect(() => {
    const timer = setTimeout(() => loadFriendsInView(), REGION_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [region, loadFriendsInView]);

  // ── Camera ──────────────────────────────────────────────────────────────

  const moveTo = useCallback((target: MapRegion) => mapRef.current?.animateToRegion(target, 450), []);

  /** Centers a point in the part of the map the sheet leaves visible. */
  const focusOn = useCallback(
    (point: Coordinates, maxDelta = 0.03) => {
      const r = regionRef.current;
      const latitudeDelta = Math.min(r.latitudeDelta, maxDelta);
      const longitudeDelta = latitudeDelta * (r.longitudeDelta / r.latitudeDelta);
      moveTo({
        latitude: point.latitude - latitudeDelta * 0.17,
        longitude: point.longitude,
        latitudeDelta,
        longitudeDelta,
      });
    },
    [moveTo]
  );

  // First camera position: the user if we may know where they are, otherwise their own places
  const cameraSet = useRef(false);
  useEffect(() => {
    if (cameraSet.current) return;
    if (locationStatus === 'granted' && coords) {
      cameraSet.current = true;
      moveTo(regionAround(coords, 2500));
    } else if (locationStatus !== 'checking' && locationStatus !== 'granted' && loadedOnce) {
      cameraSet.current = true;
      const fit = regionForPoints(myPlaces);
      if (fit) moveTo(fit);
    }
  }, [locationStatus, coords, loadedOnce, myPlaces, moveTo]);

  // First launch: show the sheet halfway, so the user sees why Haritaly would like their location
  const explained = useRef(false);
  useEffect(() => {
    if (explained.current || locationStatus === 'checking') return;
    explained.current = true;
    if (locationStatus !== 'undetermined') return;
    // Give the sheet a moment to lay out before moving it
    const timer = setTimeout(() => sheetRef.current?.snapToIndex(1), 350);
    return () => clearTimeout(timer);
  }, [locationStatus]);

  // ── Places on the map ───────────────────────────────────────────────────

  const visiblePlaces = useMemo(() => {
    const byId = new Map<number, Place>();
    for (const place of [...allPlaces, ...foundPlaces]) byId.set(place.id, place);
    return [...byId.values()].filter((p) => {
      const mine = p.userId === user?.id;
      if (owner === 'mine' && !mine) return false;
      if (owner === 'friends' && mine) return false;
      return !category || p.category === category;
    });
  }, [allPlaces, foundPlaces, owner, category, user?.id]);

  const spots = useMemo(() => groupIntoSpots(visiblePlaces, user?.id), [visiblePlaces, user?.id]);

  const selected = useMemo(() => {
    if (selectedPlaceId === null) return null;
    return spots.find((s) => s.places.some((p) => p.id === selectedPlaceId)) ?? snapshot;
  }, [spots, selectedPlaceId, snapshot]);

  const mapItems = useMemo(
    () => clusterSpots(spots, region, mapSize, selected?.key),
    [spots, region, mapSize, selected?.key]
  );

  const spotsInView = useMemo(() => spots.filter((s) => regionContains(region, s)), [spots, region]);

  // ── Interaction ─────────────────────────────────────────────────────────

  const select = useCallback(
    (spot: Spot, { move = true } = {}) => {
      haptics.selection();
      setDraft(null);
      setSelectedPlaceId(spot.primary.id);
      setSnapshot(spot);
      sheetRef.current?.snapToIndex(1);
      if (move) focusOn(spot);
    },
    [focusOn]
  );

  const clearSelection = useCallback(() => {
    setSelectedPlaceId(null);
    setSnapshot(null);
    setDraft(null);
    sheetRef.current?.snapToIndex(0);
  }, []);

  const handleMapPress = (event: MapPressEvent) => {
    // On iOS a marker tap also reaches the map; only taps on empty map clear the selection
    if ((event.nativeEvent as { action?: string }).action === 'marker-press') return;
    if (selectedPlaceId !== null || draft) clearSelection();
  };

  const handleLongPress = (event: LongPressEvent) => {
    haptics.tap();
    setSelectedPlaceId(null);
    setSnapshot(null);
    setDraft(event.nativeEvent.coordinate);
    sheetRef.current?.snapToIndex(1);
  };

  const zoomInto = (items: Spot[]) => {
    const fit = regionForPoints(items, 1.8, 250);
    if (fit) moveTo(fit);
  };

  const locate = async () => {
    const position = await requestLocation();
    if (position) moveTo(regionAround(position, 1500));
  };

  const openAddPlace = (point?: Coordinates, address?: string | null) => {
    if (point) setPendingLocation({ ...point, address: address ?? null });
    router.push({ pathname: '/add-place', params: point ? { from: 'map' } : {} });
    if (point) clearSelection();
  };

  const openDetails = (place: Place) => router.push({ pathname: '/place-details', params: { placeId: place.id } });

  const ownerFilters: { key: OwnerFilter; label: string; dot?: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'mine', label: 'Yours', dot: colors.markerMine },
    { key: 'friends', label: 'Friends', dot: colors.markerFriend },
  ];

  // Sheet title when filters are on: "Your cafés", "Friends' places", "Parks"
  const filterLabel =
    category || owner !== 'all'
      ? (() => {
          const what = category ? categoryPlural(category) : 'places';
          if (owner === 'mine') return `Your ${what}`;
          if (owner === 'friends') return `Friends’ ${what}`;
          return what[0].toUpperCase() + what.slice(1);
        })()
      : null;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={INITIAL_REGION}
        onLayout={(e) => setMapSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        onLongPress={handleLongPress}
        // Apple's muted style keeps streets, parks and water legible while letting the markers lead
        mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
        showsPointsOfInterest={false}
        // Only after permission is granted; otherwise the map itself would trigger the system prompt
        showsUserLocation={locationStatus === 'granted'}
        showsMyLocationButton={false}
        showsCompass
        showsScale={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        // Keeps the Apple Maps logo, the legal link and the compass clear of the search bar and the sheet
        mapPadding={{ top: topOverlay + 56, right: 0, bottom: SHEET_PEEK + 4, left: 0 }}
        legalLabelInsets={{ top: 0, right: 0, bottom: SHEET_PEEK + 6, left: 12 }}
        userInterfaceStyle="light"
      >
        {mapItems.map((item) =>
          item.kind === 'cluster' ? (
            <ClusterMarker key={item.cluster.key} cluster={item.cluster} onPress={() => zoomInto(item.cluster.spots)} />
          ) : (
            <SpotMarker
              key={item.spot.key}
              spot={item.spot}
              selected={item.spot.key === selected?.key}
              favorite={isFavorite(item.spot.primary.id)}
              onPress={() => select(item.spot)}
            />
          )
        )}
        {selected && <SelectionLabel key={`label-${selected.key}`} spot={selected} />}
        {draft && <DraftMarker coordinate={draft} />}
      </MapView>

      {/* Search and filters float over the map */}
      <View style={[styles.top, { paddingTop: insets.top + 6 }]} pointerEvents="box-none">
        <View style={styles.searchRow}>
          <SearchPill onPress={() => setSearching(true)} />
          <IconButton
            icon="add"
            variant="glass"
            size={SEARCH_HEIGHT}
            iconSize={24}
            accessibilityLabel="Add a place"
            onPress={() => openAddPlace()}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          style={styles.filterScroll}
        >
          {ownerFilters.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              dotColor={f.dot}
              glass
              selected={owner === f.key}
              onPress={() => setOwner(f.key)}
            />
          ))}
          <View style={styles.filterDivider} />
          {CATEGORIES.filter((c) => c !== 'Other').map((c) => (
            <Chip
              key={c}
              label={categoryLabel(c)}
              icon={categoryIconOutline(c)}
              glass
              selected={category === c}
              onPress={() => setCategory(category === c ? null : c)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={[styles.controls, { top: topOverlay + space.sm }]} pointerEvents="box-none">
        <IconButton
          icon={locationStatus === 'granted' ? 'navigate' : 'navigate-outline'}
          variant="glass"
          size={44}
          iconSize={20}
          accessibilityLabel="Show my location"
          onPress={locate}
        />
      </View>

      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        topInset={insets.top}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handle}
        style={styles.sheet}
        accessibilityLabel="Places"
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          {draft ? (
            <DraftSheet coordinate={draft} onAdd={(address) => openAddPlace(draft, address)} onCancel={clearSelection} />
          ) : selected ? (
            <PlaceSheet
              spot={selected}
              myId={user?.id}
              userCoords={locationStatus === 'granted' ? coords : null}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onOpenDetails={openDetails}
              onClose={clearSelection}
            />
          ) : (
            <AreaSheet
              spots={spotsInView}
              totalInView={spotsInView.length}
              loading={loading}
              origin={locationStatus === 'granted' && coords ? coords : region}
              nearUser={locationStatus === 'granted' && !!coords && regionContains(region, coords)}
              locationStatus={locationStatus}
              onLocationContinue={() => (locationStatus === 'denied' ? Linking.openSettings() : locate())}
              onSelect={(spot) => select(spot)}
              isFavorite={isFavorite}
              filterLabel={filterLabel}
            />
          )}
        </BottomSheetScrollView>
      </BottomSheet>

      {searching && (
        <SearchPanel
          top={insets.top + 6}
          myId={user?.id}
          onClose={() => setSearching(false)}
          onSelectPlace={(place) => {
            setSearching(false);
            setFoundPlaces((prev) => [...prev.filter((p) => p.id !== place.id), place]);
            // Filters could hide the result, so clear them
            setOwner('all');
            setCategory(null);
            const [spot] = groupIntoSpots([place], user?.id);
            select(spot, { move: false });
            focusOn(place, 0.02);
          }}
          onGoTo={(point) => {
            setSearching(false);
            clearSelection();
            moveTo(regionAround(point, 1500));
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  top: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: screenPadding - 6,
  },
  filterScroll: {
    marginTop: space.xs,
    // Room for the chips' shadows
    overflow: 'visible',
  },
  filters: {
    gap: space.xs,
    paddingHorizontal: screenPadding - 6,
    alignItems: 'center',
    height: FILTERS_HEIGHT + 4,
  },
  filterDivider: {
    width: StyleSheet.hairlineWidth,
    height: 20,
    backgroundColor: 'rgba(41, 45, 43, 0.25)',
    marginHorizontal: 2,
  },
  controls: {
    position: 'absolute',
    right: screenPadding - 6,
  },
  sheet: {
    boxShadow: shadow.sheet,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
  },
  sheetBackground: {
    backgroundColor: colors.surface,
    borderRadius: radius.sheet,
  },
  handle: {
    backgroundColor: palette.stoneDeep,
    width: 38,
    height: 5,
  },
  sheetContent: {
    paddingHorizontal: screenPadding,
    paddingTop: space.xxs,
    paddingBottom: space.xxxl,
  },
});
