import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { placesAPI } from '@/src/api/places';
import { useAuth } from '@/src/store/auth';
import { displayName, Place } from '@/src/types';

export default function FavoritesScreen() {
  const router = useRouter();
  const { user } = useAuth();
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

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 48 }} size="large" color="#6366f1" />;
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={places.length === 0 && styles.emptyContainer}
      data={places}
      keyExtractor={(item) => String(item.id)}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
        />
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <MaterialCommunityIcons name={error ? 'wifi-off' : 'heart-outline'} size={48} color="#d1d5db" />
          <Text style={styles.emptyTitle}>{error ? 'Could not load favorites' : 'No favorites yet'}</Text>
          <Text style={styles.emptyText}>
            {error ? 'Pull down to try again.' : 'Tap the heart on any place to keep it here.'}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push({ pathname: '/place-details', params: { placeId: item.id } })}
        >
          <View style={styles.icon}>
            <MaterialCommunityIcons name="map-marker" size={22} color="#ec4899" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta} numberOfLines={1}>
              {[item.category, item.user && item.userId !== user?.id ? `by ${displayName(item.user)}` : null]
                .filter(Boolean)
                .join(' · ') || item.address || 'Saved place'}
            </Text>
          </View>
          {item.rating ? (
            <View style={styles.rating}>
              <MaterialCommunityIcons name="star" size={14} color="#f59e0b" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingTop: 12,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fdf2f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  meta: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
});
