import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, palette } from '@/src/theme';
import { categoryIcon } from '@/src/lib/categories';

export type PlaceOwner = 'mine' | 'friend';

/**
 * The category icon on a tile drawn like the map markers: solid eucalyptus for your places,
 * paper with a lavender edge for friends'. A place looks the same in a list as on the map.
 */
export function PlaceGlyph({ category, owner, size = 44 }: { category?: string | null; owner: PlaceOwner; size?: number }) {
  const mine = owner === 'mine';
  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: size * 0.32,
          backgroundColor: mine ? colors.markerMine : colors.surface,
          borderColor: mine ? colors.markerMine : colors.markerFriend,
        },
      ]}
      accessible={false}
    >
      <Ionicons name={categoryIcon(category)} size={size * 0.44} color={mine ? palette.white : colors.markerFriend} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
    borderWidth: 2,
  },
});
