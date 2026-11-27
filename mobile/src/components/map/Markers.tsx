import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { colors, shadow } from '@/src/theme';
import { categoryIcon, categoryLabel } from '@/src/lib/categories';
import { firstName, possessive } from '@/src/lib/format';
import { Cluster, Spot } from '@/src/lib/spots';
import { AppText } from '../ui/AppText';
import { MARKER_BOX, MarkerArt, TIP_OFFSET, TIP_Y } from './MarkerArt';

/**
 * Map markers. The drawing lives in MarkerArt; this file places it on the map.
 * Every place marker sits in a box of the same size and is anchored at its tail's tip, so selecting
 * one (which scales it up from the tip) never moves the spot it points at.
 */

const SELECTED_SCALE = 1.18;
// Android anchors by fraction of the view; iOS (Apple Maps) uses centerOffset
const TIP_ANCHOR = { x: 0.5, y: TIP_Y / MARKER_BOX.height };

function useSelectionScale(selected: boolean) {
  const scale = useRef(new Animated.Value(selected ? SELECTED_SCALE : 1)).current;
  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? SELECTED_SCALE : 1,
      useNativeDriver: true,
      speed: 18,
      bounciness: 9,
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
  const who = spot.hasMine
    ? 'Your place'
    : spot.people > 1
      ? `Saved by ${spot.people} friends`
      : `${possessive(firstName(spot.primary.user))} pick`;

  return (
    <Marker
      coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
      onPress={onPress}
      centerOffset={TIP_OFFSET}
      anchor={TIP_ANCHOR}
      zIndex={selected ? 100 : spot.hasMine ? 3 : 2}
      tracksViewChanges={false}
    >
      <Animated.View
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${spot.primary.name}, ${categoryLabel(spot.primary.category)}, ${who}`}
        accessibilityState={{ selected }}
        style={{ transform: [{ scale }], transformOrigin: `50% ${TIP_Y}px 0` }}
      >
        <MarkerArt
          kind={spot.hasMine ? 'mine' : 'friend'}
          icon={categoryIcon(spot.primary.category)}
          selected={selected}
          friend={spot.primary.user}
          people={spot.people}
          favorite={favorite}
        />
      </Animated.View>
    </Marker>
  );
}

/** The selected place's name, as a separate marker floating above the tile. */
export function SelectionLabel({ spot }: { spot: Spot }) {
  return (
    <Marker
      coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
      centerOffset={{ x: 0, y: -(TIP_Y * SELECTED_SCALE + 14) }}
      anchor={{ x: 0.5, y: 3.1 }}
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
  const friends = cluster.spots.length - mine;
  const size = cluster.spots.length >= 10 ? 50 : 44;

  return (
    <Marker
      coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
      onPress={onPress}
      zIndex={4}
      tracksViewChanges={false}
    >
      <View
        style={styles.clusterBox}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${cluster.spots.length} places here: ${mine} yours, ${friends} from friends. Zoom in`}
      >
        <View style={[styles.cluster, { width: size, height: size, borderRadius: size / 2 }]}>
          <AppText variant="headline" maxFontSizeMultiplier={1}>
            {cluster.spots.length}
          </AppText>
          {/* How the group splits between yours and friends', as two small bars */}
          <View style={styles.split}>
            {mine > 0 && <View style={[styles.splitPart, { flex: mine, backgroundColor: colors.markerMine }]} />}
            {friends > 0 && <View style={[styles.splitPart, { flex: friends, backgroundColor: colors.markerFriend }]} />}
          </View>
        </View>
      </View>
    </Marker>
  );
}

/** A pin dropped with a long press, before it becomes a saved place. */
export function DraftMarker({ coordinate }: { coordinate: { latitude: number; longitude: number } }) {
  return (
    <Marker coordinate={coordinate} centerOffset={TIP_OFFSET} anchor={TIP_ANCHOR} zIndex={102} tracksViewChanges={false}>
      <View accessible accessibilityLabel="Dropped pin" style={{ transform: [{ scale: SELECTED_SCALE }], transformOrigin: `50% ${TIP_Y}px 0` }}>
        <MarkerArt kind="mine" icon="add" selected />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  clusterBox: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cluster: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2.5,
    borderColor: colors.markerRing,
    boxShadow: shadow.marker,
  },
  split: {
    flexDirection: 'row',
    width: 20,
    height: 3,
    marginTop: 2,
    borderRadius: 2,
    overflow: 'hidden',
    gap: 1,
  },
  splitPart: {
    height: 3,
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

