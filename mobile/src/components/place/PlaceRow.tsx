import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '@/src/theme';
import { firstName, formatDistance, possessive } from '@/src/lib/format';
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

/**
 * One place in a list: what it is, whose it is, how far it is and, where a star rating would usually be,
 * how many people saved it. Haritaly has no ratings: a place is only ever saved because someone loves it.
 */
export function PlaceRow({ place, isMine, onPress, distance, savedBy, isFavorite }: PlaceRowProps) {
  const who = isMine ? 'Yours' : `${possessive(firstName(place.user))} pick`;
  const meta = [place.category && categoryLabel(place.category), who].filter(Boolean).join(' · ');
  const shared = savedBy !== undefined && savedBy > 1;
  const away = formatDistance(distance);

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.985}
      dimTo={0.75}
      accessibilityRole="button"
      accessibilityLabel={[place.name, meta, shared && `saved by ${savedBy} people`, away && `${away} away`]
        .filter(Boolean)
        .join(', ')}
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
        {shared && (
          <View style={styles.savedBy}>
            <Ionicons name="people" size={13} color={colors.social} />
            <AppText variant="footnote" style={styles.savedByText}>
              {savedBy}
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
  savedBy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  savedByText: {
    fontWeight: '600',
    color: colors.text,
  },
});
