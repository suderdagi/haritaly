import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Keyboard, Platform, StyleSheet, TextInput, View } from 'react-native';
import MapView from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, screenPadding, shadow, space, type } from '@/src/theme';
import { useUserLocation } from '@/src/store/location';
import { describeLocation } from '@/src/lib/address';
import { Coordinates, regionAround } from '@/src/lib/geo';
import { setPendingLocation } from '@/src/lib/pendingLocation';
import { MapRegion } from '@/src/types';
import { AppText, Button, IconButton } from '@/src/components/ui';
import { MarkerArt, TIP_OFFSET } from '@/src/components/map/MarkerArt';

const ISTANBUL = { latitude: 41.0369, longitude: 28.985 };

/**
 * Choosing where a place is: move the map under the pin, search for an address, or jump to where you are.
 * Searching uses the phone's geocoder, which needs no location permission.
 */
export default function PickLocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ lat?: string; lng?: string }>();
  const { status: locationStatus, coords, requestLocation } = useUserLocation();

  const start: Coordinates =
    params.lat && params.lng
      ? { latitude: Number(params.lat), longitude: Number(params.lng) }
      : locationStatus === 'granted' && coords
        ? coords
        : ISTANBUL;

  const mapRef = useRef<MapView>(null);
  const [center, setCenter] = useState<Coordinates>(start);
  const [address, setAddress] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const lift = useRef(new Animated.Value(0)).current;

  // The pin lifts while the map moves and drops when it stops
  const setMoving = (moving: boolean) =>
    Animated.spring(lift, { toValue: moving ? 1 : 0, useNativeDriver: true, speed: 30, bounciness: moving ? 0 : 10 }).start();

  // Address of the point under the pin, once the map rests
  useEffect(() => {
    let active = true;
    setResolving(true);
    const timer = setTimeout(async () => {
      const text = await describeLocation(center);
      if (active) {
        setAddress(text);
        setResolving(false);
      }
    }, 350);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [center]);

  const goTo = (point: Coordinates, meters = 600) => mapRef.current?.animateToRegion(regionAround(point, meters), 450);

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setNotFound(false);
    try {
      const [hit] = await Location.geocodeAsync(q);
      if (hit) {
        Keyboard.dismiss();
        goTo({ latitude: hit.latitude, longitude: hit.longitude });
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  const locate = async () => {
    const position = await requestLocation();
    if (position) goTo(position, 400);
  };

  const confirm = () => {
    setPendingLocation({ ...center, address });
    router.back();
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={regionAround(start, 600)}
        mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
        showsUserLocation={locationStatus === 'granted'}
        showsPointsOfInterest
        pitchEnabled={false}
        toolbarEnabled={false}
        onRegionChange={() => setMoving(true)}
        onRegionChangeComplete={(region: MapRegion) => {
          setMoving(false);
          setCenter({ latitude: region.latitude, longitude: region.longitude });
        }}
        mapPadding={{ top: insets.top + 64, right: 0, bottom: 190 + insets.bottom, left: 0 }}
      />

      {/* The pin stays in the middle; the map moves under it */}
      <View style={styles.pinLayer} pointerEvents="none">
        <Animated.View
          style={[styles.pinGroup, { transform: [{ translateY: lift.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }] }]}
        >
          {/* The same marker as a new place on the map */}
          <MarkerArt kind="mine" icon="add" selected />
        </Animated.View>
        <View style={styles.dot} />
      </View>

      {/* Search */}
      <View style={[styles.top, { paddingTop: insets.top + 6 }]}>
        <View style={styles.searchShadow}>
          <View style={styles.search}>
            <BlurView intensity={40} tint="light" style={[StyleSheet.absoluteFill, { backgroundColor: colors.glass }]} />
            <Ionicons name="search" size={18} color={colors.textSecondary} />
            <TextInput
              value={query}
              onChangeText={(value) => {
                setQuery(value);
                setNotFound(false);
              }}
              placeholder="Search for an address"
              placeholderTextColor={colors.textTertiary}
              selectionColor={colors.accent}
              returnKeyType="search"
              onSubmitEditing={search}
              autoCorrect={false}
              clearButtonMode="while-editing"
              style={styles.searchInput}
              accessibilityLabel="Search for an address"
            />
            {searching && <ActivityIndicator size="small" color={colors.textSecondary} />}
          </View>
        </View>
        <IconButton icon="close" variant="glass" size={46} iconSize={22} accessibilityLabel="Cancel" onPress={() => router.back()} />
      </View>
      {notFound && (
        <View style={[styles.notice, { top: insets.top + 60 }]}>
          <AppText variant="footnote">No address found for “{query.trim()}”. Try adding the city.</AppText>
        </View>
      )}

      <IconButton
        icon={locationStatus === 'granted' ? 'navigate' : 'navigate-outline'}
        variant="glass"
        size={44}
        iconSize={20}
        accessibilityLabel="Go to my location"
        onPress={locate}
        style={[styles.locate, { bottom: 196 + insets.bottom }]}
      />

      {/* Confirm */}
      <View style={[styles.card, { paddingBottom: Math.max(insets.bottom, space.md) + space.xs }]}>
        <AppText variant="overline" tone="secondary">
          Place it here
        </AppText>
        <View style={styles.addressRow}>
          <AppText variant="headline" numberOfLines={2} style={styles.address}>
            {address ?? (resolving ? 'Finding the address…' : 'Dropped pin')}
          </AppText>
        </View>
        <AppText variant="footnote" tone="tertiary">
          {center.latitude.toFixed(5)}, {center.longitude.toFixed(5)}
        </AppText>
        <Button title="Use This Location" onPress={confirm} fullWidth haptic style={styles.confirm} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pinLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinGroup: {
    alignItems: 'center',
    // The marker's tail tip sits on the center of the screen
    marginBottom: -2 * TIP_OFFSET.y,
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(41, 45, 43, 0.35)',
  },
  top: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: screenPadding - 6,
  },
  searchShadow: {
    flex: 1,
    borderRadius: radius.pill,
    boxShadow: shadow.floating,
  },
  search: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(41, 45, 43, 0.10)',
  },
  searchInput: {
    flex: 1,
    // Keeps the text above the blur layer in browsers, where inputs are not positioned by default
    position: 'relative',
    fontSize: type.body.fontSize,
    color: colors.text,
    outlineWidth: 0,
  },
  notice: {
    position: 'absolute',
    left: screenPadding,
    right: screenPadding,
    padding: space.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    boxShadow: shadow.floating,
  },
  locate: {
    position: 'absolute',
    right: screenPadding - 6,
  },
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: space.lg,
    paddingHorizontal: screenPadding,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    backgroundColor: colors.surface,
    boxShadow: shadow.sheet,
  },
  addressRow: {
    marginTop: space.xs,
  },
  address: {
    fontSize: 18,
    lineHeight: 24,
  },
  confirm: {
    marginTop: space.md,
  },
});
