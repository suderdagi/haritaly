import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '@/src/theme';
import { Coordinates, regionAround } from '@/src/lib/geo';

/**
 * A small still map with a pin, for showing where a place is inside a form.
 * The map is not interactive; the screen around it decides what a tap does.
 */
export function LocationPreview({ point, height = 150 }: { point: Coordinates; height?: number }) {
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
        <View style={styles.pin}>
          <Ionicons name="location" size={18} color={colors.textInverse} />
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
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.markerSelected,
    borderWidth: 2.5,
    borderColor: colors.markerRing,
    boxShadow: shadow.marker,
  },
});
