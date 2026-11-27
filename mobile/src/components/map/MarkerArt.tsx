import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, palette, shadow } from '@/src/theme';
import { IconName } from '@/src/lib/categories';
import { User } from '@/src/types';
import { Avatar } from '../ui/Avatar';
import { AppText } from '../ui/AppText';

/**
 * The drawing of a place marker, without the map. The map markers and the illustration on the sign-in
 * screen both use it, so the two always look the same.
 *
 * The shape is a rounded tile with a small tail, like a note left on the map. The tail's tip is the
 * place's exact spot.
 *
 *   Yours    solid eucalyptus tile, white icon
 *   Friend's paper tile with a lavender edge, lavender icon, and the friend's initials on the corner
 *   Shared   the number of people who saved it on the corner
 *   Selected charcoal tile, slightly larger (scaled by the caller)
 */

export const MARKER_BOX = { width: 60, height: 64 };
export const BODY = 42;
const TAIL = 12;
const TOP = 6;
/** Distance from the top of the marker box to the tail's tip. */
export const TIP_Y = TOP + BODY - 2 + (TAIL * Math.SQRT2) / 2;
/** Offset that puts the tail's tip, not the middle of the box, on the coordinate (Apple Maps centers views). */
export const TIP_OFFSET = { x: 0, y: -(TIP_Y - MARKER_BOX.height / 2) };

export type MarkerKind = 'mine' | 'friend';

export function MarkerArt({
  kind,
  icon,
  selected = false,
  friend,
  people = 1,
  favorite = false,
}: {
  kind: MarkerKind;
  icon: IconName;
  selected?: boolean;
  /** Whose pick it is, for the initials on a friend's marker. */
  friend?: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'profilePicture'> | null;
  /** How many people saved this place. */
  people?: number;
  favorite?: boolean;
}) {
  const mine = kind === 'mine';
  const fill = selected ? colors.markerSelected : mine ? colors.markerMine : colors.surface;
  const edge = selected ? colors.markerRing : mine ? colors.markerRing : colors.markerFriend;
  const glyph = selected || mine ? palette.white : colors.markerFriend;

  return (
    <View style={styles.box} pointerEvents="none">
      {/* The tail sits under the tile, so only its lower half shows */}
      <View style={[styles.tail, { backgroundColor: fill, borderColor: edge }]} />
      <View style={[styles.body, { backgroundColor: fill, borderColor: edge }]}>
        <Ionicons name={icon} size={20} color={glyph} />
      </View>

      {people > 1 ? (
        <View style={[styles.corner, styles.count]}>
          <AppText style={styles.countText} maxFontSizeMultiplier={1}>
            {people}
          </AppText>
        </View>
      ) : !mine && friend ? (
        <View style={styles.cornerAvatar}>
          <Avatar user={friend} size={20} ring />
        </View>
      ) : null}

      {favorite && (
        <View style={styles.heart}>
          <Ionicons name="heart" size={9} color={palette.white} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: MARKER_BOX.width,
    height: MARKER_BOX.height,
    alignItems: 'center',
  },
  body: {
    position: 'absolute',
    top: TOP,
    width: BODY,
    height: BODY,
    borderRadius: 14,
    borderCurve: 'continuous',
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadow.marker,
  },
  tail: {
    position: 'absolute',
    top: TOP + BODY - TAIL / 2 - 2,
    width: TAIL,
    height: TAIL,
    borderWidth: 2.5,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    boxShadow: '1px 1px 2px rgba(41, 45, 43, 0.25)',
  },
  corner: {
    position: 'absolute',
    top: 0,
    right: 2,
  },
  cornerAvatar: {
    position: 'absolute',
    top: -1,
    right: 1,
  },
  count: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.markerSelected,
    borderWidth: 2,
    borderColor: colors.markerRing,
  },
  countText: {
    color: palette.white,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
  },
  heart: {
    position: 'absolute',
    top: 0,
    left: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.favorite,
    borderWidth: 2,
    borderColor: colors.markerRing,
  },
});
