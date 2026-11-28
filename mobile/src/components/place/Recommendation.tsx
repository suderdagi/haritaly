import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@/src/theme';
import { firstName, formatDate, possessive } from '@/src/lib/format';
import { IconName } from '@/src/lib/categories';
import { displayName, Place } from '@/src/types';
import { AppText } from '../ui/AppText';
import { Avatar } from '../ui/Avatar';
import { PressableScale } from '../ui/PressableScale';

/**
 * Who recommends a place, in their own words: their face, their note and what to order. There is no star
 * rating; saving a place is the recommendation. Friends' picks are tinted lavender, your own eucalyptus.
 */
export function RecommendationCard({
  place,
  isMine,
  onPressPerson,
  size = 'large',
}: {
  place: Place;
  isMine: boolean;
  onPressPerson?: () => void;
  size?: 'large' | 'compact';
}) {
  const large = size === 'large';
  const person = place.user;
  const title = isMine ? 'Your pick' : `${possessive(firstName(person))} pick`;
  const date = formatDate(place.createdAt);
  const tint = isMine ? styles.mine : styles.friend;
  const picks = [
    place.favoriteFood ? { icon: 'restaurant-outline' as IconName, text: place.favoriteFood } : null,
    place.favoriteDrink ? { icon: 'cafe-outline' as IconName, text: place.favoriteDrink } : null,
  ].filter((p): p is { icon: IconName; text: string } => !!p);

  return (
    <View style={[styles.card, tint, !large && styles.compactCard]}>
      <PressableScale
        onPress={onPressPerson}
        disabled={!onPressPerson}
        scaleTo={0.98}
        style={styles.head}
        accessibilityRole={onPressPerson ? 'button' : undefined}
        accessibilityLabel={`${title}${person && !isMine ? `, ${displayName(person)}` : ''}`}
        accessibilityHint={onPressPerson ? 'Opens their profile' : undefined}
      >
        {person && <Avatar user={person} size={large ? 44 : 34} ring />}
        <View style={styles.headText}>
          <AppText variant={large ? 'title3' : 'headline'} tone={isMine ? 'accent' : 'social'} numberOfLines={2}>
            {title}
          </AppText>
          <AppText variant="footnote" tone="secondary" numberOfLines={2}>
            {[!isMine && person ? displayName(person) : null, date && `${isMine ? 'Saved' : 'Recommended'} ${date}`]
              .filter(Boolean)
              .join(' · ')}
          </AppText>
        </View>
        {onPressPerson && <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />}
      </PressableScale>

      {place.notes ? (
        <AppText
          variant={large ? 'body' : 'callout'}
          style={[styles.note, large && styles.noteLarge]}
          numberOfLines={large ? undefined : 3}
        >
          “{place.notes}”
        </AppText>
      ) : null}

      {picks.length > 0 && (
        <View style={styles.picks}>
          {picks.map((p) => (
            <View key={p.icon} style={styles.pick}>
              <Ionicons name={p.icon} size={14} color={colors.pick} />
              <AppText variant="subheadMedium" numberOfLines={1} style={styles.pickText}>
                {p.text}
              </AppText>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    padding: space.md,
  },
  compactCard: {
    padding: space.sm + 2,
  },
  friend: {
    backgroundColor: colors.socialSoft,
  },
  mine: {
    backgroundColor: colors.accentSoft,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  headText: {
    flex: 1,
    gap: 1,
  },
  note: {
    marginTop: space.sm,
    color: colors.text,
  },
  noteLarge: {
    fontSize: 17,
    lineHeight: 25,
  },
  picks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
    marginTop: space.sm,
  },
  pick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '100%',
    paddingHorizontal: space.sm - 2,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(253, 252, 249, 0.85)',
  },
  pickText: {
    flexShrink: 1,
  },
});
