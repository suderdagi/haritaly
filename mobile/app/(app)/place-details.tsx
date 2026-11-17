import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
  Share,
} from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { placesAPI } from '@/src/api/places';
import { assetUrl, getErrorMessage } from '@/src/api/client';
import { useAuth } from '@/src/store/auth';
import { displayName, Place } from '@/src/types';

const mapsLink = (place: Place) =>
  `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;

export default function PlaceDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ placeId: string }>();
  const placeId = Number(params.placeId);
  const { user: currentUser } = useAuth();

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingFavorite, setSavingFavorite] = useState(false);

  const isOwner = place !== null && place.userId === currentUser?.id;
  const photos = place?.photos ?? [];

  // Reload whenever the screen gets focus, e.g. after coming back from editing
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
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

  const handleEdit = () => {
    router.push({ pathname: '/add-place', params: { placeId } });
  };

  const handleDelete = () => {
    Alert.alert('Delete place', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await placesAPI.deletePlace(placeId);
            router.back();
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err, 'Failed to delete place'));
          }
        },
      },
    ]);
  };

  const handleOpenInMaps = () => {
    if (!place) return;
    const label = encodeURIComponent(place.name);
    const nativeUrl = Platform.select({
      ios: `maps:0,0?q=${label}@${place.latitude},${place.longitude}`,
      android: `geo:0,0?q=${place.latitude},${place.longitude}(${label})`,
    });

    Linking.openURL(nativeUrl ?? mapsLink(place)).catch(() => Linking.openURL(mapsLink(place)));
  };

  const handleToggleFavorite = async () => {
    if (!place || savingFavorite) return;
    const next = !place.isFavorite;

    // Optimistic update, rolled back if the request fails
    setPlace({ ...place, isFavorite: next });
    setSavingFavorite(true);
    try {
      if (next) await placesAPI.addFavorite(place.id);
      else await placesAPI.removeFavorite(place.id);
    } catch (err) {
      setPlace({ ...place, isFavorite: !next });
      Alert.alert('Error', getErrorMessage(err, 'Could not update favorites'));
    } finally {
      setSavingFavorite(false);
    }
  };

  const handleShare = async () => {
    if (!place) return;
    await Share.share({
      title: place.name,
      message: [place.name, place.address, mapsLink(place)].filter(Boolean).join('\n'),
    });
  };

  const renderStars = (rating?: number | string | null) => {
    const ratingValue = Number(rating ?? 0);
    if (!Number.isFinite(ratingValue) || ratingValue === 0) return null;

    const stars = [];
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <MaterialCommunityIcons key={i} name="star" size={16} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <MaterialCommunityIcons
          key="half"
          name="star-half-full"
          size={16}
          color="#FFD700"
        />
      );
    }

    const emptyStars = 5 - Math.ceil(ratingValue);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <MaterialCommunityIcons
          key={`empty-${i}`}
          name="star-outline"
          size={16}
          color="#FFD700"
        />
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!place) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error ?? 'Place not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: place.name,
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Photos */}
        {photos.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photosContainer}
          >
            {photos.map((photo) => (
              <Image
                key={photo.id}
                source={{ uri: assetUrl(photo.url) }}
                style={styles.photo}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        {/* Header / Basic Info */}
        <View style={[styles.section, styles.headerSection]}>
          <View style={styles.headerRow}>
            <View style={styles.titleCol}>
              <Text style={styles.name}>{place.name}</Text>
                <View style={styles.metaRow}>
                  {place.category ? (
                    <View style={styles.badge}><Text style={styles.badgeText}>{place.category}</Text></View>
                  ) : null}
                  <MaterialCommunityIcons name="map-marker" size={16} color="#ec4899" style={{ marginLeft: 8 }} />
                  <Text style={styles.smallMuted}>{place.address ? place.address.split(',')[place.address.split(',').length-1].trim() : ''}</Text>
                </View>
                {/* Recommendation info */}
                {!isOwner && place.user ? (
                  <Text style={styles.recommendedText}>Recommended by {displayName(place.user)}</Text>
                ) : null}
            </View>

            <View style={styles.actionsCol}>
              <TouchableOpacity
                onPress={handleToggleFavorite}
                style={[styles.iconButton, place.isFavorite && styles.iconButtonActive]}
                accessibilityLabel={place.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <MaterialCommunityIcons
                  name={place.isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={place.isFavorite ? '#fff' : '#ec4899'}
                />
              </TouchableOpacity>
              {isOwner && (
                <>
                  <TouchableOpacity onPress={handleEdit} style={styles.iconButton} accessibilityLabel="Edit place">
                    <MaterialCommunityIcons name="pencil" size={20} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDelete} style={styles.iconButtonDanger} accessibilityLabel="Delete place">
                    <MaterialCommunityIcons name="delete" size={20} color="#fff" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleOpenInMaps}>
              <MaterialCommunityIcons name="map" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Open in Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnOutline} onPress={handleShare}>
              <MaterialCommunityIcons name="share-variant" size={18} color="#6b7280" />
              <Text style={styles.actionBtnOutlineText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Favorites */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorites</Text>
          {place.favoriteFood ? (
            <View style={styles.favoriteRow}>
              <MaterialCommunityIcons name="food" size={20} color="#FF6B35" />
              <Text style={styles.favoriteText}>{place.favoriteFood}</Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>No favorite food listed.</Text>
          )}

          {place.favoriteDrink ? (
            <View style={styles.favoriteRow}>
              <MaterialCommunityIcons name="cup" size={20} color="#4A90E2" />
              <Text style={styles.favoriteText}>{place.favoriteDrink}</Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>No favorite drink listed.</Text>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          {place.notes ? (
            <Text style={styles.notes}>{place.notes}</Text>
          ) : (
            <Text style={styles.emptyText}>No description yet.</Text>
          )}
        </View>

        {/* Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Added:</Text>
            <Text style={styles.metadataValue}>
              {new Date(place.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Address:</Text>
            <Text style={styles.metadataValue}>{place.address || 'No address added.'}</Text>
          </View>

          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Coordinates:</Text>
            <Text style={styles.metadataValue}>{place.latitude.toFixed(6)} · {place.longitude.toFixed(6)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  photosContainer: {
    height: 200,
    marginBottom: 16,
  },
  photo: {
    width: 300,
    height: 200,
    marginRight: 8,
    borderRadius: 12,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  address: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  favoriteText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  notes: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  metadataLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  metadataValue: {
    fontSize: 14,
    color: '#333',
  },
  /* New header & action styles */
  headerSection: {
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleCol: {
    flex: 1,
    paddingRight: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  smallMuted: {
    color: '#9CA3AF',
    fontSize: 13,
    marginLeft: 6,
  },
  actionsCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 8,
    borderRadius: 10,
    marginLeft: 8,
  },
  iconButtonActive: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
  },
  iconButtonDanger: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 10,
    marginLeft: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ec4899',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionBtnOutlineText: {
    color: '#6b7280',
    marginLeft: 8,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: '#9f1239',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  recommendedText: {
    marginTop: 6,
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
});
