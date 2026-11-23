import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { colors, palette, shadow } from '@/src/theme';
import { categoryIcon } from '@/src/lib/categories';
import { Cluster, Spot } from '@/src/lib/spots';
import { AppText } from '../ui/AppText';

/**
 * Map marker system
 *
 *   ● eucalyptus circle   a place you saved
 *   ● lavender circle     a friend's place
 *   the icon inside       the category (cafe, park, …)
 *   number badge          how many people saved the same place
 *   heart badge           one of your favorites
 *   charcoal, larger      the selected place, with its name above it
 *   paper circle + count  several places close together; tap to zoom in
 *
 * Names are not printed under every marker: the map stays calm, and the name appears on selection.
 * Each marker sits in a fixed-size box so selecting it never shifts its position.
 */

const BOX = 58;
const PIN = 36;
const SELECTED_SCALE = 1.25;

function useSelectionScale(selected: boolean) {
  const scale = useRef(new Animated.Value(selected ? SELECTED_SCALE : 1)).current;
  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? SELECTED_SCALE : 1,
      useNativeDriver: true,
      speed: 18,
      bounciness: 8,
    }).start();
  }, [selected, scale]);
  return scale;
}

export function SpotMarker({
  spot,
  selected,
  favorite,
  onPress,
}: {
  spot: Spot;
  selected: boolean;
  favorite: boolean;
  onPress: () => void;
}) {
  const scale = useSelectionScale(selected);
  const fill = selected ? colors.markerSelected : spot.hasMine ? colors.markerMine : colors.markerFriend;
  const owner = spot.hasMine ? 'Your place' : "Friend's place";

  return (
    <Marker
      coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
      onPress={onPress}
      zIndex={selected ? 100 : spot.hasMine ? 3 : 2}
      tracksViewChanges={false}
    >
      <View
        style={styles.box}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${spot.primary.name}, ${owner}${spot.people > 1 ? `, saved by ${spot.people} people` : ''}`}
      >
        <Animated.View style={[styles.pin, { backgroundColor: fill, transform: [{ scale }] }]}>
          <Ionicons name={categoryIcon(spot.primary.category)} size={17} color={palette.white} />
          {spot.people > 1 ? (
            <View style={[styles.badge, styles.countBadge]}>
              <AppText style={styles.badgeText} maxFontSizeMultiplier={1}>
                {spot.people}
              </AppText>
            </View>
          ) : favorite ? (
            <View style={[styles.badge, styles.heartBadge]}>
              <Ionicons name="heart" size={9} color={palette.white} />
            </View>
          ) : null}
        </Animated.View>
      </View>
    </Marker>
  );
}

/** The selected place's name, drawn as a separate marker above the pin. */
export function SelectionLabel({ spot }: { spot: Spot }) {
  return (
    <Marker
      coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
      // iOS places the label's center this far above the coordinate (Apple Maps), Android uses the anchor
      centerOffset={{ x: 0, y: -48 }}
      anchor={{ x: 0.5, y: 2.3 }}
      tappable={false}
      zIndex={101}
      tracksViewChanges={false}
    >
      <View style={styles.label} pointerEvents="none">
        <AppText variant="footnote" style={styles.labelText} numberOfLines={1} maxFontSizeMultiplier={1.2}>
          {spot.primary.name}
        </AppText>
      </View>
    </Marker>
  );
}

export function ClusterMarker({ cluster, onPress }: { cluster: Cluster; onPress: () => void }) {
  const mine = cluster.spots.filter((s) => s.hasMine).length;
  const ring =
    mine === cluster.spots.length ? colors.markerMine : mine === 0 ? colors.markerFriend : colors.markerSelected;
  const size = cluster.spots.length >= 10 ? 46 : 40;

  return (
    <Marker
      coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
      onPress={onPress}
      zIndex={4}
      tracksViewChanges={false}
    >
      <View
        style={styles.box}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${cluster.spots.length} places. Zoom in`}
      >
        <View style={[styles.cluster, { width: size, height: size, borderRadius: size / 2, borderColor: ring }]}>
          <AppText variant="headline" maxFontSizeMultiplier={1}>
            {cluster.spots.length}
          </AppText>
        </View>
      </View>
    </Marker>
  );
}

/** A pin dropped with a long press, before it becomes a saved place. */
export function DraftMarker({ coordinate }: { coordinate: { latitude: number; longitude: number } }) {
  return (
    <Marker coordinate={coordinate} zIndex={102} tracksViewChanges={false}>
      <View style={styles.box} accessible accessibilityLabel="Dropped pin">
        <View style={[styles.pin, styles.draft]}>
          <Ionicons name="add" size={22} color={palette.white} />
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  box: {
    width: BOX,
    height: BOX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    width: PIN,
    height: PIN,
    borderRadius: PIN / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.markerRing,
    boxShadow: shadow.marker,
  },
  draft: {
    backgroundColor: colors.markerSelected,
    transform: [{ scale: SELECTED_SCALE }],
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -7,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.markerRing,
  },
  countBadge: {
    backgroundColor: colors.markerSelected,
  },
  heartBadge: {
    backgroundColor: colors.favorite,
  },
  badgeText: {
    color: palette.white,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
  },
  cluster: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 3,
    boxShadow: shadow.marker,
  },
  label: {
    maxWidth: 200,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.surface,
    boxShadow: shadow.floating,
  },
  labelText: {
    fontWeight: '600',
    color: colors.text,
  },
});
