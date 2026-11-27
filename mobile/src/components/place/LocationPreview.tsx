import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';
import { colors, radius } from '@/src/theme';
import { Coordinates, regionAround } from '@/src/lib/geo';
import { IconName } from '@/src/lib/categories';
import { MarkerArt, TIP_OFFSET } from '../map/MarkerArt';

/**
 * A small still map with the place's marker, for showing where a place is inside a form. The marker is
 * the one the map will show, so choosing a category updates it.
 * The map is not interactive; the screen around it decides what a tap does.
 */
export function LocationPreview({
  point,
  icon = 'add',
  height = 150,
}: {
  point: Coordinates;
  icon?: IconName;
  height?: number;
}) {
  return (
    <View style={[styles.wrap, { height }]} pointerEvents="none">
      <MapView
        // Remount when the point moves, since initialRegion is only read once
        key={`${point.latitude.toFixed(5)},${point.longitude.toFixed(5)}`}
        style={StyleSheet.absoluteFill}
        initialRegion={regionAround(point, 700)}
        mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        showsPointsOfInterest={false}
        toolbarEnabled={false}
        liteMode
      />
      <View style={styles.pinWrap}>
        {/* The tail's tip, not the middle of the drawing, sits on the point */}
        <View style={{ transform: [{ translateY: TIP_OFFSET.y }] }}>
          <MarkerArt kind="mine" icon={icon} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: colors.fill,
  },
  pinWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
