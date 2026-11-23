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
import { categoryIcon, categoryLabel, IconName } from '@/src/lib/categories';
import { distanceInMeters, regionAround } from '@/src/lib/geo';
import { formatDate, formatDistance } from '@/src/lib/format';
import { haptics } from '@/src/lib/haptics';
import { openDirections, openInMaps, sharePlace } from '@/src/lib/maps';
import { groupIntoSpots } from '@/src/lib/spots';
import { chooseOption } from '@/src/utils/chooseOption';
import { confirmBlock, reportPlace } from '@/src/utils/safety';
import { displayName, Place } from '@/src/types';
import { AppText, Avatar, Button, EmptyState, IconButton, PressableScale, RatingStars, Tag } from '@/src/components/ui';
import { PhotoCarousel } from '@/src/components/place/PhotoGallery';
import { AISummaryCard } from '@/src/components/AISummaryCard/AISummaryCard';
import { SpotMarker } from '@/src/components/map/Markers';

export default function PlaceDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ placeId: string }>();
  const placeId = Number(params.placeId);
  const { user: me } = useAuth();
  const { status: locationStatus, coords } = useUserLocation();

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
            <Pressable
              onPress={showMenu}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={isOwner ? 'Edit or delete' : 'Report or block'}
              style={styles.headerButton}
            >
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.text} />
            </Pressable>
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

          <View style={styles.metaRow}>
            <RatingStars value={place.rating} size={15} />
            {distance && (
              <AppText variant="subhead" tone="secondary">
                {Number(place.rating) > 0 ? '·  ' : ''}
                {distance} away
              </AppText>
            )}
            {isOwner && place.isPrivate ? <Tag label="Only you" icon="lock-closed" /> : null}
          </View>

          {/* Who it comes from */}
          <PressableScale
            disabled={isOwner || !place.user}
            onPress={() => place.user && router.push({ pathname: '/friend', params: { userId: place.user.id } })}
            scaleTo={0.985}
            style={styles.byline}
            accessibilityRole={isOwner ? undefined : 'button'}
          >
            {place.user && <Avatar user={place.user} size={36} />}
            <View style={styles.bylineText}>
              <AppText variant="subheadMedium">
                {isOwner ? 'Saved by you' : `Recommended by ${place.user ? displayName(place.user) : 'a friend'}`}
              </AppText>
              <AppText variant="footnote" tone="tertiary">
                {formatDate(place.createdAt)}
              </AppText>
            </View>
            {!isOwner && <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />}
          </PressableScale>

          {/* Actions */}
          <View style={styles.actions}>
            <Button title="Directions" icon="navigate" onPress={() => openDirections(place)} style={styles.directions} haptic />
            <IconButton
              icon={place.isFavorite ? 'heart' : 'heart-outline'}
              accessibilityLabel={place.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              onPress={toggleFavorite}
              size={54}
              iconSize={23}
              color={place.isFavorite ? colors.favorite : colors.text}
              background={place.isFavorite ? colors.favoriteSoft : undefined}
            />
            <IconButton icon="share-outline" accessibilityLabel="Share" onPress={() => sharePlace(place)} size={54} iconSize={22} />
          </View>

          {/* Notes */}
          {place.notes ? (
            <View style={styles.section}>
              <AppText variant="overline" tone="secondary" style={styles.sectionTitle}>
                {isOwner ? 'Your notes' : 'Notes'}
              </AppText>
              <View style={styles.quote}>
                <AppText variant="body" style={styles.quoteText}>
                  {place.notes}
                </AppText>
              </View>
            </View>
          ) : null}

          {/* What to order */}
          {place.favoriteFood || place.favoriteDrink ? (
            <View style={styles.section}>
              <AppText variant="overline" tone="secondary" style={styles.sectionTitle}>
                What to order
              </AppText>
              <View style={styles.orderRow}>
                {place.favoriteFood ? <OrderCard icon="restaurant-outline" label="Dish" value={place.favoriteFood} /> : null}
                {place.favoriteDrink ? <OrderCard icon="cafe-outline" label="Drink" value={place.favoriteDrink} /> : null}
              </View>
            </View>
          ) : null}

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
              </View>
              <AppText variant="subheadMedium" tone="accent">
                Open in Maps
              </AppText>
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
    </View>
  );
}

function OrderCard({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.orderCard}>
      <Ionicons name={icon} size={18} color={colors.rating} />
      <AppText variant="caption" tone="tertiary" style={styles.orderLabel}>
        {label}
      </AppText>
      <AppText variant="headline">{value}</AppText>
    </View>
  );
}

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
    paddingBottom: space.xxxl,
  },
  mapHero: {
    height: 230,
  },
  body: {
    marginTop: -26,
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
  byline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.lg,
    paddingVertical: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  bylineText: {
    flex: 1,
    gap: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.lg,
  },
  directions: {
    flex: 1,
  },
  section: {
    marginTop: space.xxl,
  },
  sectionTitle: {
    marginBottom: space.sm,
  },
  quote: {
    paddingLeft: space.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.rating,
  },
  quoteText: {
    fontSize: 17,
    lineHeight: 26,
  },
  orderRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  orderCard: {
    flex: 1,
    padding: space.md,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    gap: 2,
  },
  orderLabel: {
    marginTop: space.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
  report: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: space.xxl,
    paddingVertical: space.sm,
  },
});
