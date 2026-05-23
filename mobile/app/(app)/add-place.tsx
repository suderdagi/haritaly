import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { placesAPI } from '@/src/api/places';
import { useLocation } from '@/src/hooks/useLocation';

interface AddPlaceForm {
  name: string;
  category: string;
  address: string;
  rating: string;
  favoriteFood: string;
  favoriteDrink: string;
  notes: string;
}

const CATEGORIES = [
  'Restaurant',
  'Cafe',
  'Bar',
  'Park',
  'Museum',
  'Shop',
  'Hotel',
  'Attraction',
  'Other',
];

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

  // Pre-fill location if passed from map
  React.useEffect(() => {
    if (params.latitude && params.longitude) {
      // Could reverse geocode here to get address
      console.log('Location from map:', params.latitude, params.longitude);
    }
  }, [params]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5, // Max 5 photos
    });

    if (!result.canceled) {
      setPhotos(prev => [...prev, ...result.assets]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos(prev => [...prev, ...result.assets]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Please enter a place name');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location not available. Please enable location services.');
      return;
    }

    setLoading(true);
    try {
      // Create the place
      const placeData = {
        name: form.name.trim(),
        category: form.category || undefined,
        latitude: location.latitude,
        longitude: location.longitude,
        address: form.address.trim() || undefined,
        rating: form.rating ? parseFloat(form.rating) : undefined,
        favoriteFood: form.favoriteFood.trim() || undefined,
        favoriteDrink: form.favoriteDrink.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };

      const newPlace = await placesAPI.createPlace(placeData);
      if (!newPlace) {
        throw new Error('Place creation returned no data');
      }

      // Upload photos if any
      if (photos.length > 0) {
        const photoFiles = photos.map(photo => ({
          uri: photo.uri,
          type: 'image/jpeg',
          name: `photo-${Date.now()}.jpg`,
        })) as any;

        await placesAPI.uploadPhotos(newPlace.id, photoFiles);
      }

      Alert.alert('Success', 'Place added successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error adding place:', error);
      Alert.alert('Error', 'Failed to add place. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: keyof AddPlaceForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Add Place',
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

          <TextInput
            style={styles.input}
            placeholder="Category (Restaurant, Cafe, Park, etc.)"
            value={form.category}
            onChangeText={(value) => updateForm('category', value)}
          />

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
        {location && (
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
    backgroundColor: '#007AFF',
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
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
