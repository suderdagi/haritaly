import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { placesAPI } from '@/src/api/places';
import { Place, Photo } from '@/src/types';

export default function PlaceDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const placeId = parseInt(params.placeId as string);

  const [place, setPlace] = useState<Place | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [photosLoading, setPhotosLoading] = useState(false);

  useEffect(() => {
    if (placeId) {
      loadPlaceDetails();
    }
  }, [placeId]);

  const loadPlaceDetails = async () => {
    try {
      setLoading(true);
      const placeData = await placesAPI.getPlaceDetails(placeId);
      if (!placeData) {
        throw new Error('Place not found');
      }
      setPlace(placeData);

      // Load photos
      setPhotosLoading(true);
      const photosData = await placesAPI.getPlacePhotos(placeId);
      setPhotos(photosData);
    } catch (error) {
      console.error('Error loading place details:', error);
      Alert.alert('Error', 'Failed to load place details');
      router.back();
    } finally {
      setLoading(false);
      setPhotosLoading(false);
    }
  };

  const handleEdit = () => {
    // TODO: Navigate to edit place screen
    Alert.alert('Coming Soon', 'Edit place functionality will be available soon!');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Place',
      'Are you sure you want to delete this place? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await placesAPI.deletePlace(placeId);
              Alert.alert('Success', 'Place deleted successfully');
              router.back();
            } catch (error) {
              console.error('Error deleting place:', error);
              Alert.alert('Error', 'Failed to delete place');
            }
          },
        },
      ]
    );
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
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!place) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Place not found</Text>
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
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
                <MaterialCommunityIcons name="pencil" size={24} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
                <MaterialCommunityIcons name="delete" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ),
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
                source={{ uri: photo.url }}
                style={styles.photo}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        {/* Basic Info */}
        <View style={styles.section}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.name}>{place.name}</Text>
              {place.category && (
                <Text style={styles.category}>{place.category}</Text>
              )}
            </View>
            {Number.isFinite(Number(place.rating ?? 0)) && Number(place.rating ?? 0) > 0 && (
              <View style={styles.ratingContainer}>
                {renderStars(place.rating)}
                <Text style={styles.ratingText}>{Number(place.rating ?? 0).toFixed(1)}/5</Text>
              </View>
            )}
          </View>

          {place.address && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
              <Text style={styles.address}>{place.address}</Text>
            </View>
          )}
        </View>

        {/* Favorites */}
        {(place.favoriteFood || place.favoriteDrink) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorites</Text>

            {place.favoriteFood && (
              <View style={styles.favoriteRow}>
                <MaterialCommunityIcons name="food" size={20} color="#FF6B35" />
                <Text style={styles.favoriteText}>{place.favoriteFood}</Text>
              </View>
            )}

            {place.favoriteDrink && (
              <View style={styles.favoriteRow}>
                <MaterialCommunityIcons name="cup" size={20} color="#4A90E2" />
                <Text style={styles.favoriteText}>{place.favoriteDrink}</Text>
              </View>
            )}
          </View>
        )}

        {/* Notes */}
        {place.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{place.notes}</Text>
          </View>
        )}

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
            <Text style={styles.metadataLabel}>Location:</Text>
            <Text style={styles.metadataValue}>
              {place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}
            </Text>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 8,
  },
});
