import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme';
import { categoryIcon } from '@/src/lib/categories';

export type PlaceOwner = 'mine' | 'friend';

const tints: Record<PlaceOwner, { bg: string; fg: string }> = {
  mine: { bg: colors.accentSoft, fg: colors.markerMine },
  friend: { bg: colors.socialSoft, fg: colors.markerFriend },
};

/**
 * The category icon on a soft tile, tinted by whose place it is. It mirrors the map markers,
 * so a place looks the same in a list as it does on the map.
 */
export function PlaceGlyph({ category, owner, size = 44 }: { category?: string | null; owner: PlaceOwner; size?: number }) {
  const t = tints[owner];
  return (
    <View
      style={[styles.tile, { width: size, height: size, borderRadius: size * 0.32, backgroundColor: t.bg }]}
      accessible={false}
    >
      <Ionicons name={categoryIcon(category)} size={size * 0.45} color={t.fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
});
