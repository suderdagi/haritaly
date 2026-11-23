import React, { useCallback, useState } from 'react';
import { Animated, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { colors, screenPadding, space } from '@/src/theme';
import { placesAPI } from '@/src/api/places';
import { useAuth } from '@/src/store/auth';
import { useUserLocation } from '@/src/store/location';
import { distanceInMeters } from '@/src/lib/geo';
import { plural } from '@/src/lib/format';
import { Place } from '@/src/types';
import { EmptyState, LargeTitle, ScreenHeader, SkeletonRow, useScrollTitle } from '@/src/components/ui';
import { PlaceRow } from '@/src/components/place/PlaceRow';

export default function FavoritesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { status: locationStatus, coords } = useUserLocation();
  const { scrollY, onScroll } = useScrollTitle();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      setPlaces(await placesAPI.getFavorites());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const here = locationStatus === 'granted' ? coords : null;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Favorites" scrollY={scrollY} />
      <Animated.FlatList
        data={loading ? [] : places}
        keyExtractor={(item) => String(item.id)}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.textTertiary}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        ListHeaderComponent={
          <LargeTitle
            title="Favorites"
            subtitle={!loading && places.length > 0 ? `${plural(places.length, 'place')} you love` : undefined}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.skeletons}>
              {[0, 1, 2, 3].map((i) => (
                <SkeletonRow key={i} avatar={44} />
              ))}
            </View>
          ) : error ? (
            <EmptyState
              icon="cloud-offline-outline"
              title="Couldn’t load favorites"
              message="Check your connection and pull down to try again."
            />
          ) : (
            <EmptyState
              icon="heart-outline"
              tint="favorite"
              title="Nothing here yet"
              message="Tap the heart on any place, yours or a friend’s, to keep it close."
              actionLabel="Explore the map"
              onAction={() => router.navigate('/map')}
            />
          )
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <PlaceRow
              place={item}
              isMine={item.userId === user?.id}
              distance={here ? distanceInMeters(here, item) : null}
              onPress={() => router.push({ pathname: '/place-details', params: { placeId: item.id } })}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: space.xxxl,
    flexGrow: 1,
  },
  skeletons: {
    paddingHorizontal: space.xxs,
  },
  row: {
    paddingHorizontal: screenPadding,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
    marginLeft: screenPadding + 44 + space.sm,
    marginRight: screenPadding,
  },
});
