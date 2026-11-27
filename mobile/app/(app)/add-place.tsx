import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { usePreventRemove } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, screenPadding, space } from '@/src/theme';
import { placesAPI } from '@/src/api/places';
import { assetUrl, getErrorMessage } from '@/src/api/client';
import { useUserLocation } from '@/src/store/location';
import { CATEGORIES, categoryIconOutline, categoryLabel } from '@/src/lib/categories';
import { describeLocation } from '@/src/lib/address';
import { haptics } from '@/src/lib/haptics';
import { PendingLocation, takePendingLocation } from '@/src/lib/pendingLocation';
import { getDefaultVisibility } from '@/src/lib/preferences';
import { preparePhoto } from '@/src/utils/preparePhoto';
import { chooseOption } from '@/src/utils/chooseOption';
import { Photo, Place } from '@/src/types';
import { AppText, Button, Chip, PressableScale, RatingInput, Segmented, TextField } from '@/src/components/ui';
import { LocationPreview } from '@/src/components/place/LocationPreview';

const MAX_PHOTOS = 5;

interface Form {
  name: string;
  category: string;
  address: string;
  rating: number;
  favoriteFood: string;
  favoriteDrink: string;
  notes: string;
  isPrivate: boolean;
}

const EMPTY: Form = {
  name: '',
  category: '',
  address: '',
  rating: 0,
  favoriteFood: '',
  favoriteDrink: '',
  notes: '',
  isPrivate: false,
};

/** Adding a place, and editing one (when a placeId is passed). */
export default function AddPlaceScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const params = useLocalSearchParams<{ placeId?: string; from?: string }>();
  const editingId = params.placeId ? Number(params.placeId) : null;
  const { status: locationStatus, requestLocation } = useUserLocation();

  const [form, setForm] = useState<Form>(EMPTY);
  const [initial, setInitial] = useState<Form>(EMPTY);
  const [location, setLocation] = useState<PendingLocation | null>(null);
  const [initialLocation, setInitialLocation] = useState<PendingLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState<Photo[]>([]);
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [loadingPlace, setLoadingPlace] = useState(editingId !== null);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const addressTouched = useRef(false);

  const update = <K extends keyof Form>(key: K, value: Form[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  /** A new point: show it, and fill in its address unless the user already typed one. */
  const applyLocation = useCallback(async (point: PendingLocation) => {
    setLocation(point);
    if (addressTouched.current) return;
    const address = point.address ?? (await describeLocation(point));
    if (address && !addressTouched.current) setForm((prev) => ({ ...prev, address }));
  }, []);

  const useCurrentLocation = useCallback(async () => {
    setLocating(true);
    const position = await requestLocation();
    setLocating(false);
    if (position) applyLocation({ ...position, address: null });
  }, [requestLocation, applyLocation]);

  // Editing: load the place
  useEffect(() => {
    if (!editingId) return;
    placesAPI
      .getPlaceDetails(editingId)
      .then((place: Place) => {
        const loaded: Form = {
          name: place.name,
          category: place.category ?? '',
          address: place.address ?? '',
          rating: Number(place.rating ?? 0),
          favoriteFood: place.favoriteFood ?? '',
          favoriteDrink: place.favoriteDrink ?? '',
          notes: place.notes ?? '',
          isPrivate: !!place.isPrivate,
        };
        const point = { latitude: place.latitude, longitude: place.longitude, address: place.address ?? null };
        addressTouched.current = !!place.address;
        setForm(loaded);
        setInitial(loaded);
        setLocation(point);
        setInitialLocation(point);
        setExistingPhotos(place.photos ?? []);
      })
      .catch((error) => {
        Alert.alert('Could not open this place', getErrorMessage(error, 'Please try again.'));
        router.back();
      })
      .finally(() => setLoadingPlace(false));
  }, [editingId, router]);

  // A new place starts with the visibility chosen in Privacy
  useEffect(() => {
    if (editingId) return;
    getDefaultVisibility().then((v) => {
      if (v === 'private') {
        setForm((prev) => ({ ...prev, isPrivate: true }));
        setInitial((prev) => ({ ...prev, isPrivate: true }));
      }
    });
  }, [editingId]);

  // A new place starts where the user is, but only if they already allowed location.
  // Otherwise nothing is asked until they choose "Use my location".
  const started = useRef(false);
  useEffect(() => {
    if (editingId || started.current || locationStatus === 'checking') return;
    started.current = true;
    if (params.from === 'map') return; // the dropped pin arrives through the pending location
    if (locationStatus === 'granted') useCurrentLocation();
  }, [editingId, locationStatus, params.from, useCurrentLocation]);

  // A location chosen on the map or in the picker
  useFocusEffect(
    useCallback(() => {
      const picked = takePendingLocation();
      if (picked) applyLocation(picked);
    }, [applyLocation])
  );

  // Leaving with unsaved changes asks first. An address filled in automatically does not count.
  const { address: address, ...typed } = form;
  const { address: initialAddress, ...initialTyped } = initial;
  const dirty =
    JSON.stringify(typed) !== JSON.stringify(initialTyped) ||
    photos.length > 0 ||
    (addressTouched.current && address !== initialAddress) ||
    (editingId !== null && location !== initialLocation);
  usePreventRemove(dirty && !saving, ({ data }) => {
    Alert.alert(editingId ? 'Discard your changes?' : 'Discard this place?', undefined, [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(data.action) },
    ]);
  });

  const openPicker = () => {
    router.push({
      pathname: '/pick-location',
      params: location ? { lat: String(location.latitude), lng: String(location.longitude) } : {},
    });
  };

  // ── Photos ──────────────────────────────────────────────────────────────

  const roomLeft = MAX_PHOTOS - photos.length;

  const pickFromLibrary = async () => {
    // The system photo picker only shares the photos the user selects, so it needs no library permission
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: roomLeft,
    });
    if (!result.canceled) setPhotos((prev) => [...prev, ...result.assets].slice(0, MAX_PHOTOS));
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera access is off', 'Allow camera access in Settings to take photos of places.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) setPhotos((prev) => [...prev, ...result.assets].slice(0, MAX_PHOTOS));
  };

  const addPhotos = () => {
    if (roomLeft <= 0) {
      Alert.alert('That’s the limit', `You can add up to ${MAX_PHOTOS} photos at a time.`);
      return;
    }
    chooseOption('Add photos', [
      { label: 'Take Photo', onPress: takePhoto },
      { label: 'Choose from Library', onPress: pickFromLibrary },
    ]);
  };

  // ── Save ────────────────────────────────────────────────────────────────

  const save = async () => {
    const name = form.name.trim();
    if (!name) {
      setNameError('Give the place a name');
      haptics.warning();
      return;
    }
    if (!location) {
      haptics.warning();
      Alert.alert('Where is it?', 'Choose the location of this place first.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Choose on Map', onPress: openPicker },
      ]);
      return;
    }

    const details = {
      name,
      category: form.category || undefined,
      address: form.address.trim() || undefined,
      rating: form.rating > 0 ? form.rating : undefined,
      favoriteFood: form.favoriteFood.trim() || undefined,
      favoriteDrink: form.favoriteDrink.trim() || undefined,
      notes: form.notes.trim() || undefined,
      isPrivate: form.isPrivate,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    setSaving(true);
    let place: Place;
    try {
      place = editingId ? await placesAPI.updatePlace(editingId, details) : await placesAPI.createPlace(details);
    } catch (error) {
      setSaving(false);
      Alert.alert('Could not save', getErrorMessage(error, 'Please try again.'));
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

    haptics.success();
    // `saving` stays on, so leaving does not ask about unsaved changes
    router.back();
  };

  if (loadingPlace) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.textSecondary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
    >
      <Stack.Screen options={{ title: editingId ? 'Edit place' : 'New place' }} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 120 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        {/* Where */}
        <Section title="Location">
          {location ? (
            <View>
              <PressableScale onPress={openPicker} scaleTo={0.985} accessibilityRole="button" accessibilityLabel="Change location">
                <LocationPreview point={location} />
                <View style={styles.changeBadge}>
                  <Ionicons name="move-outline" size={14} color={colors.text} />
                  <AppText variant="caption">Adjust</AppText>
                </View>
              </PressableScale>
              <TextField
                icon="location-outline"
                placeholder="Address (optional)"
                value={form.address}
                onChangeText={(value) => {
                  addressTouched.current = true;
                  update('address', value);
                }}
                maxLength={200}
                containerStyle={styles.gapTop}
              />
            </View>
          ) : (
            <View style={styles.whereCard}>
              <View style={styles.whereIcon}>
                {locating ? (
                  <ActivityIndicator color={colors.accent} />
                ) : (
                  <Ionicons name="location-outline" size={22} color={colors.accent} />
                )}
              </View>
              <AppText variant="headline" align="center">
                {locating ? 'Finding where you are…' : 'Where is it?'}
              </AppText>
              <AppText variant="footnote" tone="secondary" align="center" style={styles.whereText}>
                Search for an address or move a pin on the map. You can also use where you are now.
              </AppText>
              <View style={styles.whereButtons}>
                <Button title="Choose on Map" icon="map-outline" size="md" onPress={openPicker} />
                {locationStatus !== 'denied' && (
                  <Button title="Use My Location" icon="navigate-outline" size="md" variant="secondary" onPress={useCurrentLocation} />
                )}
              </View>
            </View>
          )}
        </Section>

        {/* What */}
        <Section title="About">
          <TextField
            placeholder="Name of the place"
            value={form.name}
            onChangeText={(value) => {
              setNameError(null);
              update('name', value);
            }}
            error={nameError}
            maxLength={100}
            autoCapitalize="words"
            returnKeyType="done"
            accessibilityLabel="Name"
            style={styles.nameInput}
          />
          <View style={styles.chips}>
            {CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={categoryLabel(c)}
                icon={categoryIconOutline(c)}
                size="sm"
                selected={form.category === c}
                onPress={() => update('category', form.category === c ? '' : c)}
              />
            ))}
          </View>
        </Section>

        <Section title="Your rating">
          <RatingInput value={form.rating} onChange={(value) => update('rating', value)} />
        </Section>

        <Section title="What to order">
          <TextField
            icon="restaurant-outline"
            placeholder="Favorite dish"
            value={form.favoriteFood}
            onChangeText={(value) => update('favoriteFood', value)}
            maxLength={100}
          />
          <TextField
            icon="cafe-outline"
            placeholder="Favorite drink"
            value={form.favoriteDrink}
            onChangeText={(value) => update('favoriteDrink', value)}
            maxLength={100}
            containerStyle={styles.gapTop}
          />
        </Section>

        <Section title="Notes">
          <TextField
            placeholder="What should a friend know before going?"
            value={form.notes}
            onChangeText={(value) => update('notes', value)}
            multiline
            maxLength={1000}
            showCount
          />
        </Section>

        <Section title="Photos">
          <View style={styles.photos}>
            {existingPhotos.map((photo) => (
              <Image key={`old-${photo.id}`} source={{ uri: assetUrl(photo.url) }} style={styles.photo} />
            ))}
            {photos.map((photo, index) => (
              <View key={photo.uri} style={styles.photoWrap}>
                <Image source={{ uri: photo.uri }} style={styles.photo} />
                <PressableScale
                  onPress={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove photo ${index + 1}`}
                  style={styles.removePhoto}
                >
                  <Ionicons name="close" size={14} color={colors.textInverse} />
                </PressableScale>
              </View>
            ))}
            {roomLeft > 0 && (
              <PressableScale onPress={addPhotos} scaleTo={0.96} style={[styles.photo, styles.addPhoto]} accessibilityRole="button" accessibilityLabel="Add photos">
                <Ionicons name="camera-outline" size={22} color={colors.textSecondary} />
                <AppText variant="caption" tone="secondary">
                  Add
                </AppText>
              </PressableScale>
            )}
          </View>
        </Section>

        <Section title="Who can see it">
          <Segmented
            accessibilityLabel="Who can see this place"
            value={form.isPrivate ? 'private' : 'friends'}
            onChange={(v) => update('isPrivate', v === 'private')}
            options={[
              { value: 'friends', label: 'Friends', icon: 'people-outline' },
              { value: 'private', label: 'Only me', icon: 'lock-closed-outline' },
            ]}
          />
          <AppText variant="footnote" tone="secondary" style={styles.visibilityNote}>
            {form.isPrivate
              ? 'Only you can see this place. It stays off your friends’ maps, searches and favorites.'
              : 'Your friends can see this place with your rating, notes and photos. Your own location is never shared.'}{' '}
            <AppText variant="footnote" tone="accent" style={styles.link} onPress={() => router.push('/privacy')} accessibilityRole="link">
              Privacy settings
            </AppText>
          </AppText>
        </Section>
      </ScrollView>

      {/* The save button stays reachable above the keyboard and the home indicator */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <BlurView intensity={30} tint="light" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(247, 245, 240, 0.86)' }]} />
        <Button
          title={editingId ? 'Save changes' : 'Save place'}
          onPress={save}
          loading={saving}
          fullWidth
          haptic
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="overline" tone="secondary" style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </AppText>
      {children}
    </View>
  );
}

const PHOTO = 92;

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
  scroll: {
    paddingHorizontal: screenPadding,
    paddingTop: space.xs,
  },
  section: {
    marginTop: space.xl,
  },
  sectionTitle: {
    marginBottom: space.sm,
    marginLeft: space.xxs,
  },
  gapTop: {
    marginTop: space.sm,
  },
  changeBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    boxShadow: '0px 1px 3px rgba(41, 45, 43, 0.15)',
  },
  whereCard: {
    alignItems: 'center',
    padding: space.lg,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  whereIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  whereText: {
    marginTop: space.xxs,
    maxWidth: 280,
  },
  whereButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.xs,
    marginTop: space.md,
  },
  nameInput: {
    fontSize: 19,
    fontWeight: '500',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
    marginTop: space.md,
  },
  photos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  photoWrap: {
    position: 'relative',
  },
  photo: {
    width: PHOTO,
    height: PHOTO,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    backgroundColor: colors.fill,
  },
  addPhoto: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textTertiary,
    backgroundColor: 'transparent',
  },
  removePhoto: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(41, 45, 43, 0.72)',
  },
  link: {
    textDecorationLine: 'underline',
  },
  visibilityNote: {
    marginTop: space.sm,
    marginHorizontal: space.xxs,
  },
  footer: {
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
});
