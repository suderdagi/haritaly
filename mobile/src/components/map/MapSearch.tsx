import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors, radius, screenPadding, shadow, space, type } from '@/src/theme';
import { placesAPI } from '@/src/api/places';
import { Coordinates } from '@/src/lib/geo';
import { Place } from '@/src/types';
import { AppText } from '../ui/AppText';
import { PressableScale } from '../ui/PressableScale';
import { PlaceRow } from '../place/PlaceRow';

const SEARCH_DELAY_MS = 300;

/** The search field at the top of the map, at rest. Tapping it opens the full search. */
export function SearchPill({ onPress }: { onPress: () => void }) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.98}
      accessibilityRole="search"
      accessibilityLabel="Search places"
      style={styles.pillShadow}
    >
      <View style={styles.pill}>
        <BlurView intensity={40} tint="light" style={[StyleSheet.absoluteFill, { backgroundColor: colors.glass }]} />
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <AppText variant="callout" tone="secondary" numberOfLines={1} maxFontSizeMultiplier={1.4}>
          Search places and friends’ picks
        </AppText>
      </View>
    </PressableScale>
  );
}

/**
 * Full search over the map: your places and your friends' (by name, address or favorite dish) from the
 * server, plus "go to an address" using the phone's geocoder, which works without location permission.
 */
export function SearchPanel({
  top,
  myId,
  onSelectPlace,
  onGoTo,
  onClose,
}: {
  top: number;
  myId?: number;
  onSelectPlace: (place: Place) => void;
  onGoTo: (coords: Coordinates, label: string) => void;
  onClose: () => void;
}) {
  const input = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [addressMiss, setAddressMiss] = useState(false);

  useEffect(() => {
    const q = query.trim();
    setAddressMiss(false);
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const found = await placesAPI.searchPlaces(q);
        if (active) setResults(found);
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setSearching(false);
      }
    }, SEARCH_DELAY_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const goToAddress = async () => {
    const q = query.trim();
    if (!q) return;
    setGeocoding(true);
    try {
      const [hit] = await Location.geocodeAsync(q);
      if (hit) {
        Keyboard.dismiss();
        onGoTo({ latitude: hit.latitude, longitude: hit.longitude }, q);
      } else {
        setAddressMiss(true);
      }
    } catch {
      setAddressMiss(true);
    } finally {
      setGeocoding(false);
    }
  };

  const q = query.trim();

  return (
    <View style={[StyleSheet.absoluteFill, styles.panel]}>
      <View style={[styles.header, { paddingTop: top }]}>
        <View style={styles.field}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            ref={input}
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Places, dishes, addresses"
            placeholderTextColor={colors.textTertiary}
            selectionColor={colors.accent}
            returnKeyType="search"
            onSubmitEditing={goToAddress}
            autoCorrect={false}
            clearButtonMode="while-editing"
            style={styles.input}
            accessibilityLabel="Search"
          />
          {searching && <ActivityIndicator size="small" color={colors.textSecondary} />}
        </View>
        <PressableScale onPress={onClose} hitSlop={8} accessibilityRole="button" style={styles.cancel}>
          <AppText variant="bodyMedium" tone="accent">
            Cancel
          </AppText>
        </PressableScale>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={styles.body}>
        {q.length < 2 ? (
          <View style={styles.hint}>
            <AppText variant="callout" tone="secondary">
              Search everything you and your friends saved: names, addresses, even a favorite dish.
            </AppText>
          </View>
        ) : (
          <>
            {results.length > 0 && (
              <AppText variant="overline" tone="secondary" style={styles.sectionLabel}>
                Saved places
              </AppText>
            )}
            {results.map((place) => (
              <PlaceRow
                key={place.id}
                place={place}
                isMine={place.userId === myId}
                onPress={() => {
                  Keyboard.dismiss();
                  onSelectPlace(place);
                }}
              />
            ))}
            {!searching && results.length === 0 && (
              <AppText variant="callout" tone="secondary" style={styles.noResults}>
                No saved places match “{q}”.
              </AppText>
            )}

            {Platform.OS !== 'web' && (
              <>
                <AppText variant="overline" tone="secondary" style={styles.sectionLabel}>
                  On the map
                </AppText>
                <PressableScale onPress={goToAddress} scaleTo={0.985} style={styles.goRow} accessibilityRole="button">
                  <View style={styles.goIcon}>
                    <Ionicons name="navigate-outline" size={18} color={colors.text} />
                  </View>
                  <View style={styles.goText}>
                    <AppText variant="headline" numberOfLines={1}>
                      Go to “{q}”
                    </AppText>
                    <AppText variant="footnote" tone={addressMiss ? 'danger' : 'secondary'}>
                      {addressMiss ? 'No address found. Try adding the city.' : 'Find this address or area on the map'}
                    </AppText>
                  </View>
                  {geocoding && <ActivityIndicator size="small" color={colors.textSecondary} />}
                </PressableScale>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pillShadow: {
    flex: 1,
    borderRadius: radius.pill,
    boxShadow: shadow.floating,
  },
  pill: {
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
  panel: {
    backgroundColor: colors.background,
    zIndex: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: screenPadding - 4,
    paddingBottom: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  field: {
    flex: 1,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: colors.fill,
  },
  input: {
    flex: 1,
    fontSize: type.body.fontSize,
    color: colors.text,
    paddingVertical: space.xs,
    outlineWidth: 0,
  },
  cancel: {
    paddingVertical: space.xs,
  },
  body: {
    paddingHorizontal: screenPadding,
    paddingBottom: 120,
  },
  hint: {
    paddingTop: space.lg,
  },
  sectionLabel: {
    marginTop: space.lg,
    marginBottom: space.xxs,
  },
  noResults: {
    paddingVertical: space.sm,
  },
  goRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.sm - 2,
  },
  goIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goText: {
    flex: 1,
    gap: 2,
  },
});
