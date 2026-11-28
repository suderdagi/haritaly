import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, screenPadding, space } from '@/src/theme';
import { placesAPI } from '@/src/api/places';
import { getErrorMessage } from '@/src/api/client';
import { useAuth } from '@/src/store/auth';
import { useUserLocation } from '@/src/store/location';
import { categoryIcon, categoryLabel } from '@/src/lib/categories';
import { distanceInMeters, regionAround } from '@/src/lib/geo';
import { formatDistance } from '@/src/lib/format';
import { haptics } from '@/src/lib/haptics';
import { openInMaps, sharePlace } from '@/src/lib/maps';
import { groupIntoSpots } from '@/src/lib/spots';
import { useLargeText } from '@/src/lib/textScale';
import { chooseOption } from '@/src/utils/chooseOption';
import { confirmBlock, reportPlace } from '@/src/utils/safety';
import { displayName, Place } from '@/src/types';
import { AppText, EmptyState, PressableScale, Tag } from '@/src/components/ui';
import { PhotoCarousel } from '@/src/components/place/PhotoGallery';
import { AISummaryCard } from '@/src/components/AISummaryCard/AISummaryCard';
import { SpotMarker } from '@/src/components/map/Markers';
import { RecommendationCard } from '@/src/components/place/Recommendation';
import { DirectionsButton } from '@/src/components/place/PlaceActions';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PlaceDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ placeId: string }>();
  const placeId = Number(params.placeId);
  const { user: me } = useAuth();
  const { status: locationStatus, coords } = useUserLocation();
  const insets = useSafeAreaInsets();
  const largeText = useLargeText();

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingFavorite, setSavingFavorite] = useState(false);

  // Reload whenever the screen gets focus, e.g. after coming back from editing
  useFocusEffect(
    useCallback(() => {
      let active = true;
      placesAPI
        .getPlaceDetails(placeId)
        .then((data) => {
          if (active) {
            setPlace(data);
            setError(null);
          }
        })
        .catch((err) => active && setError(getErrorMessage(err, 'Could not load this place')))
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
    }, [placeId])
  );

  const isOwner = place !== null && place.userId === me?.id;

  const toggleFavorite = async () => {
    if (!place || savingFavorite) return;
    const next = !place.isFavorite;
    haptics.selection();
    // Optimistic, rolled back if the request fails
    setPlace({ ...place, isFavorite: next });
    setSavingFavorite(true);
    try {
      if (next) await placesAPI.addFavorite(place.id);
      else await placesAPI.removeFavorite(place.id);
    } catch (err) {
      setPlace({ ...place, isFavorite: !next });
      Alert.alert('Could not update favorites', getErrorMessage(err, 'Please try again.'));
    } finally {
      setSavingFavorite(false);
    }
  };

  const confirmDelete = () => {
    if (!place) return;
    Alert.alert(`Delete ${place.name}?`, 'The place and its photos are removed for you and your friends. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await placesAPI.deletePlace(place.id);
            haptics.success();
            router.back();
          } catch (err) {
            Alert.alert('Could not delete', getErrorMessage(err, 'Please try again.'));
          }
        },
      },
    ]);
  };

  // Your own place: edit or delete. A friend's place: report it, or block the friend.
  const showMenu = () => {
    if (!place) return;
    if (isOwner) {
      chooseOption(place.name, [
        { label: 'Edit place', onPress: () => router.push({ pathname: '/add-place', params: { placeId: place.id } }) },
        { label: 'Delete place', destructive: true, onPress: confirmDelete },
      ]);
      return;
    }
    const owner = place.user;
    chooseOption(place.name, [
      { label: 'Report this place', onPress: () => reportPlace(place.id) },
      ...(owner
        ? [{ label: `Block ${displayName(owner)}`, destructive: true, onPress: () => confirmBlock(owner, () => router.back()) }]
        : []),
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.textSecondary} />
      </View>
    );
  }

  if (!place) {
    return (
      <View style={styles.center}>
        <EmptyState
          icon="location-outline"
          title="This place isn’t available"
          message={error ?? 'It may have been deleted or made private.'}
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const photos = place.photos ?? [];
  const distance = locationStatus === 'granted' && coords ? formatDistance(distanceInMeters(coords, place)) : null;
  const district = place.address?.split(',').map((s) => s.trim()).filter(Boolean).pop();
  const [spot] = groupIntoSpots([place], me?.id);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Pressable
                onPress={() => sharePlace(place)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Share"
                style={styles.headerButton}
              >
                <Ionicons name="share-outline" size={21} color={colors.text} />
              </Pressable>
              <Pressable
                onPress={toggleFavorite}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={place.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                accessibilityState={{ selected: !!place.isFavorite }}
                style={styles.headerButton}
              >
                <Ionicons
                  name={place.isFavorite ? 'heart' : 'heart-outline'}
                  size={22}
                  color={place.isFavorite ? colors.favorite : colors.text}
                />
              </Pressable>
              <Pressable
                onPress={showMenu}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={isOwner ? 'Edit or delete' : 'Report or block'}
                style={styles.headerButton}
              >
                <Ionicons name="ellipsis-horizontal" size={22} color={colors.text} />
              </Pressable>
            </View>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero: the photos, or a quiet map of where it is */}
        {photos.length > 0 ? (
          <PhotoCarousel photos={photos} />
        ) : (
          <Pressable
            onPress={() => openInMaps(place)}
            accessibilityRole="button"
            accessibilityLabel={`Map of ${place.name}. Opens in Maps`}
          >
            <MapView
              style={styles.mapHero}
              initialRegion={regionAround(place, 900)}
              mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              showsPointsOfInterest={false}
              toolbarEnabled={false}
              liteMode
              pointerEvents="none"
              mapPadding={{ top: 0, right: 0, bottom: HERO_OVERLAP + 4, left: 0 }}
              legalLabelInsets={{ top: 0, right: 0, bottom: HERO_OVERLAP + 6, left: 14 }}
            >
              <SpotMarker spot={spot} selected favorite={false} onPress={() => {}} />
            </MapView>
          </Pressable>
        )}

        <View style={styles.body}>
          {/* Title block */}
          <View style={styles.kicker}>
            <Ionicons name={categoryIcon(place.category)} size={13} color={colors.textSecondary} />
            <AppText variant="overline" tone="secondary">
              {[categoryLabel(place.category), district].filter(Boolean).join('  ·  ')}
            </AppText>
          </View>
          <AppText variant="largeTitle" style={styles.title} accessibilityRole="header">
            {place.name}
          </AppText>

          {(distance || (isOwner && place.isPrivate)) && (
            <View style={styles.metaRow}>
              {distance && (
                <AppText variant="subhead" tone="secondary">
                  {distance} away
                </AppText>
              )}
              {isOwner && place.isPrivate ? <Tag label="Only you" icon="lock-closed" /> : null}
            </View>
          )}

          {/* Who recommends it, in their words */}
          <View style={styles.recommendation}>
            <RecommendationCard
              place={place}
              isMine={isOwner}
              onPressPerson={
                !isOwner && place.user ? () => router.push({ pathname: '/friend', params: { userId: place.user!.id } }) : undefined
              }
            />
          </View>

          <AISummaryCard placeId={place.id} />

          {/* Where it is */}
          <View style={styles.section}>
            <AppText variant="overline" tone="secondary" style={styles.sectionTitle}>
              Location
            </AppText>
            <PressableScale onPress={() => openInMaps(place)} scaleTo={0.985} style={styles.locationCard} accessibilityRole="button">
              <View style={styles.locationIcon}>
                <Ionicons name="location-outline" size={18} color={colors.text} />
              </View>
              <View style={styles.locationText}>
                <AppText variant="body">{place.address || 'Pinned on the map'}</AppText>
                <AppText variant="footnote" tone="tertiary" selectable>
                  {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
                </AppText>
                {/* With large text there is no room beside the address, so the link goes under it */}
                {largeText && (
                  <AppText variant="subheadMedium" tone="accent" style={styles.openInMapsStacked}>
                    Open in Maps
                  </AppText>
                )}
              </View>
              {!largeText && (
                <AppText variant="subheadMedium" tone="accent">
                  Open in Maps
                </AppText>
              )}
            </PressableScale>
          </View>

          {!isOwner && (
            <PressableScale onPress={showMenu} style={styles.report} accessibilityRole="button">
              <Ionicons name="flag-outline" size={14} color={colors.textTertiary} />
              <AppText variant="footnote" tone="tertiary">
                Report this place or block {place.user ? displayName(place.user) : 'the person who saved it'}
              </AppText>
            </PressableScale>
          )}
        </View>
      </ScrollView>

      {/* The main action stays in reach while reading */}
      <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <BlurView intensity={30} tint="light" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(247, 245, 240, 0.88)' }]} />
        <DirectionsButton place={place} distance={distance} />
      </View>
    </View>
  );
}

const HERO_OVERLAP = 26;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingBottom: 120,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  recommendation: {
    marginTop: space.lg,
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: space.sm,
    paddingHorizontal: screenPadding,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    overflow: 'hidden',
  },
  mapHero: {
    height: 230,
  },
  body: {
    marginTop: -HERO_OVERLAP,
    paddingTop: space.xl,
    paddingHorizontal: screenPadding,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    backgroundColor: colors.background,
  },
  kicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    marginTop: space.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space.xs,
    marginTop: space.sm,
  },
  section: {
    marginTop: space.xxl,
  },
  sectionTitle: {
    marginBottom: space.sm,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: {
    flex: 1,
    gap: 2,
  },
  openInMapsStacked: {
    marginTop: space.xxs,
  },
  report: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: space.xxl,
    paddingVertical: space.sm,
  },
});
