import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '@/src/theme';
import { firstName, formatDistance, formatRating, possessive } from '@/src/lib/format';
import { categoryLabel } from '@/src/lib/categories';
import { Place } from '@/src/types';
import { AppText } from '../ui/AppText';
import { PressableScale } from '../ui/PressableScale';
import { PlaceGlyph } from './PlaceGlyph';

export interface PlaceRowProps {
  place: Place;
  isMine: boolean;
  onPress?: () => void;
  /** Meters from the user, shown on the right when known. */
  distance?: number | null;
  /** Several people saved this place. */
  savedBy?: number;
  isFavorite?: boolean;
}

/** One place in a list: what it is, whose it is, how it was rated and how far it is. */
export function PlaceRow({ place, isMine, onPress, distance, savedBy, isFavorite }: PlaceRowProps) {
  const rating = formatRating(place.rating);
  const who = isMine ? 'Yours' : `${possessive(firstName(place.user))} pick`;
  const meta = [place.category && categoryLabel(place.category), savedBy && savedBy > 1 ? `Saved by ${savedBy}` : who].filter(Boolean).join(' · ');
  const away = formatDistance(distance);

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.985}
      dimTo={0.75}
      accessibilityRole="button"
      accessibilityLabel={[place.name, meta, rating && `rated ${rating}`, away && `${away} away`].filter(Boolean).join(', ')}
      style={styles.row}
    >
      <PlaceGlyph category={place.category} owner={isMine ? 'mine' : 'friend'} />
      <View style={styles.text}>
        <View style={styles.titleLine}>
          <AppText variant="headline" numberOfLines={1} style={styles.name}>
            {place.name}
          </AppText>
          {isFavorite && <Ionicons name="heart" size={13} color={colors.favorite} />}
          {place.isPrivate && (
            <Ionicons name="lock-closed" size={12} color={colors.textTertiary} accessibilityLabel="Only you can see this place" />
          )}
        </View>
        <AppText variant="footnote" tone="secondary" numberOfLines={1}>
          {meta}
        </AppText>
      </View>
      <View style={styles.trailing}>
        {rating && (
          <View style={styles.rating}>
            <Ionicons name="star" size={12} color={colors.rating} />
            <AppText variant="footnote" style={styles.ratingText}>
              {rating}
            </AppText>
          </View>
        )}
        {away && (
          <AppText variant="caption" tone="tertiary">
            {away}
          </AppText>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.sm - 2,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    flexShrink: 1,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: 3,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontWeight: '600',
    color: colors.text,
  },
});
