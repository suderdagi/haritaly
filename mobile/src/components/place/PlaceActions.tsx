import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, palette, radius, space } from '@/src/theme';
import { haptics } from '@/src/lib/haptics';
import { openDirections } from '@/src/lib/maps';
import { Place } from '@/src/types';
import { AppText } from '../ui/AppText';
import { PressableScale } from '../ui/PressableScale';

/** The main action of a place: directions in Apple Maps, with how far it is. */
export function DirectionsButton({
  place,
  distance,
  style,
}: {
  place: Pick<Place, 'name' | 'latitude' | 'longitude' | 'address'>;
  distance?: string | null;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <PressableScale
      onPress={() => {
        haptics.tap();
        openDirections(place);
      }}
      accessibilityRole="button"
      accessibilityLabel={distance ? `Directions, ${distance} away` : 'Directions'}
      accessibilityHint="Opens Apple Maps"
      style={[styles.directions, style]}
    >
      <Ionicons name="navigate" size={18} color={palette.white} />
      <AppText variant="headline" style={styles.directionsText} maxFontSizeMultiplier={1.5} numberOfLines={1}>
        Directions
      </AppText>
      {distance ? (
        <>
          <View style={styles.divider} />
          <AppText variant="subheadMedium" style={styles.distance} maxFontSizeMultiplier={1.5} numberOfLines={1}>
            {distance}
          </AppText>
        </>
      ) : null}
    </PressableScale>
  );
}

/** Heart that fills with rose and gives a small pop when a place becomes a favorite. */
export function FavoriteButton({
  active,
  onPress,
  size = 52,
}: {
  active: boolean;
  onPress: () => void;
  size?: number;
}) {
  const pop = useRef(new Animated.Value(1)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!active) return;
    pop.setValue(0.7);
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 16 }).start();
  }, [active, pop]);

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.9}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Remove from favorites' : 'Add to favorites'}
      accessibilityState={{ selected: active }}
      style={[
        styles.round,
        { width: size, height: size, borderRadius: size / 2 },
        active ? styles.favoriteOn : styles.favoriteOff,
      ]}
    >
      <Animated.View style={{ transform: [{ scale: pop }] }}>
        <Ionicons name={active ? 'heart' : 'heart-outline'} size={size * 0.44} color={active ? colors.favorite : colors.text} />
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  directions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    minHeight: 52,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  directionsText: {
    color: palette.white,
  },
  divider: {
    width: 1,
    height: 16,
    marginHorizontal: 2,
    backgroundColor: 'rgba(253, 252, 249, 0.35)',
  },
  distance: {
    color: 'rgba(253, 252, 249, 0.8)',
  },
  round: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteOff: {
    backgroundColor: colors.fill,
  },
  favoriteOn: {
    backgroundColor: colors.favoriteSoft,
  },
});
