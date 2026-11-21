import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { placesAPI } from '@/src/api/places';
import { getErrorMessage } from '@/src/api/client';
import { useLocation } from '@/src/hooks/useLocation';
import { preparePhoto } from '@/src/utils/preparePhoto';
import { Place } from '@/src/types';

interface AddPlaceForm {
  name: string;
  category: string;
  address: string;
  rating: string;
  favoriteFood: string;
  favoriteDrink: string;
  notes: string;
}

// Must match PLACE_CATEGORIES in the backend validators
const CATEGORIES = ['Restaurant', 'Cafe', 'Bar', 'Park', 'Museum', 'Shop', 'Hotel', 'Attraction', 'Other'];

const MAX_PHOTOS = 5;

export default function AddPlaceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { location } = useLocation();

  const [form, setForm] = useState<AddPlaceForm>({
    name: '',
    category: '',
    address: '',
    rating: '',
    favoriteFood: '',
    favoriteDrink: '',
    notes: '',
  });

  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [loading, setLoading] = useState(false);

  // The same screen is used for editing when a placeId is passed
  const editingId = params.placeId ? Number(params.placeId) : null;
  const [loadingPlace, setLoadingPlace] = useState(editingId !== null);

  useEffect(() => {
    if (!editingId) return;
    placesAPI
      .getPlaceDetails(editingId)
      .then((place) =>
        setForm({
          name: place.name,
          category: place.category ?? '',
          address: place.address ?? '',
          rating: place.rating != null ? String(place.rating) : '',
          favoriteFood: place.favoriteFood ?? '',
          favoriteDrink: place.favoriteDrink ?? '',
          notes: place.notes ?? '',
        })
      )
      .catch((error) => {
        Alert.alert('Error', getErrorMessage(error, 'Could not load this place'));
        router.back();
      })
      .finally(() => setLoadingPlace(false));
  }, [editingId]);

  const hasRoomForPhotos = () => {
    if (photos.length < MAX_PHOTOS) return true;
    Alert.alert('Photo limit', `You can add up to ${MAX_PHOTOS} photos at a time.`);
    return false;
  };

  // The system photo picker only shares the photos the user selects, so it needs no library permission
  const pickImage = async () => {
    if (!hasRoomForPhotos()) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: MAX_PHOTOS - photos.length,
    });

    if (!result.canceled) {
      setPhotos(prev => [...prev, ...result.assets].slice(0, MAX_PHOTOS));
    }
  };

  const takePhoto = async () => {
    if (!hasRoomForPhotos()) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera access needed', 'Allow camera access in Settings to take photos of places.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos(prev => [...prev, ...result.assets].slice(0, MAX_PHOTOS));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Alert.alert('Missing name', 'Please enter a place name');
      return;
    }

    const rating = form.rating ? Number(form.rating.replace(',', '.')) : undefined;
    if (rating !== undefined && (!Number.isFinite(rating) || rating < 0 || rating > 5)) {
      Alert.alert('Invalid rating', 'Rating must be a number between 0 and 5');
      return;
    }

    if (!editingId && !location) {
      Alert.alert(
        'Location unavailable',
        'Haritaly saves a place at your current location. Allow location access in Settings to save places.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    const details = {
      name: form.name.trim(),
      category: form.category || undefined,
      address: form.address.trim() || undefined,
      rating,
      favoriteFood: form.favoriteFood.trim() || undefined,
      favoriteDrink: form.favoriteDrink.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    setLoading(true);
    let place: Place;
    try {
      place = editingId
        ? await placesAPI.updatePlace(editingId, details)
        : await placesAPI.createPlace({
            ...details,
            latitude: location!.latitude,
            longitude: location!.longitude,
          });
    } catch (error) {
      Alert.alert('Could not save', getErrorMessage(error, 'Please try again.'));
      setLoading(false);
      return;
    }

    // The place is saved at this point. Photos go up one per request so each request stays small;
    // if one fails, the user is told instead of being asked to save (and duplicate) the place again.
    try {
      for (const [index, photo] of photos.entries()) {
        await placesAPI.uploadPhotos(place.id, [await preparePhoto(photo, index)]);
      }
    } catch (error) {
      Alert.alert(
        'Place saved',
        `Some photos could not be uploaded (${getErrorMessage(error, 'unknown error')}). You can add them again by editing the place.`
      );
    }

    setLoading(false);
    router.back();
  };

  const updateForm = (field: keyof AddPlaceForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (loadingPlace) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: editingId ? 'Edit Place' : 'Add Place',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <TextInput
            style={styles.input}
            placeholder="Place name *"
            value={form.name}
            onChangeText={(value) => updateForm('name', value)}
          />

          <View style={styles.categories}>
            {CATEGORIES.map((category) => {
              const selected = form.category === category;
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                  onPress={() => updateForm('category', selected ? '' : category)}
                >
                  <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Address"
            value={form.address}
            onChangeText={(value) => updateForm('address', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Rating (0-5)"
            value={form.rating}
            onChangeText={(value) => updateForm('rating', value)}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>

        {/* Favorites */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorites</Text>

          <TextInput
            style={styles.input}
            placeholder="Favorite food"
            value={form.favoriteFood}
            onChangeText={(value) => updateForm('favoriteFood', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Favorite drink"
            value={form.favoriteDrink}
            onChangeText={(value) => updateForm('favoriteDrink', value)}
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Additional notes about this place..."
            value={form.notes}
            onChangeText={(value) => updateForm('notes', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>

          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <Text style={styles.photoButtonText}>📸 Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <Text style={styles.photoButtonText}>📷 Take Photo</Text>
            </TouchableOpacity>
          </View>

          {photos.length > 0 && (
            <View style={styles.photosContainer}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoWrapper}>
                  <Image source={{ uri: photo.uri }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Text style={styles.removePhotoText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Location Info */}
        {!editingId && location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.locationText}>
              Lat: {location.latitude.toFixed(6)}
            </Text>
            <Text style={styles.locationText}>
              Lng: {location.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  categoryChipSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryText: {
    fontSize: 13,
    color: '#4b5563',
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  photoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  saveButton: {
    marginRight: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6366f1',
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
