import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@/src/theme';
import { assetUrl } from '@/src/api/client';
import { distanceInMeters, Coordinates } from '@/src/lib/geo';
import { firstName, formatDistance, joinNames, possessive } from '@/src/lib/format';
import { openDirections, sharePlace } from '@/src/lib/maps';
import { categoryLabel, IconName } from '@/src/lib/categories';
import { Spot } from '@/src/lib/spots';
import { displayName, Place } from '@/src/types';
import { AppText } from '../ui/AppText';
import { Avatar, AvatarStack } from '../ui/Avatar';
import { IconButton } from '../ui/IconButton';
import { PressableScale } from '../ui/PressableScale';
import { RatingStars } from '../ui/Rating';
import { Tag } from '../ui/Tag';
import { PlaceGlyph } from '../place/PlaceGlyph';

function ActionButton({
  icon,
  label,
  onPress,
  primary = false,
  active = false,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  primary?: boolean;
  active?: boolean;
}) {
  const fg = primary ? colors.textInverse : active ? colors.favorite : colors.text;
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.95}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={[styles.action, primary ? styles.actionPrimary : active ? styles.actionActive : styles.actionPlain]}
    >
      <Ionicons name={icon} size={20} color={fg} />
      <AppText variant="caption" style={{ color: fg }} numberOfLines={1} maxFontSizeMultiplier={1.3}>
        {label}
      </AppText>
    </PressableScale>
  );
}

/** What you see when a place is selected on the map. Collapsed, only the header row shows. */
export function PlaceSheet({
  spot,
  myId,
  userCoords,
  isFavorite,
  onToggleFavorite,
  onOpenDetails,
  onClose,
}: {
  spot: Spot;
  myId?: number;
  userCoords: Coordinates | null;
  isFavorite: (placeId: number) => boolean;
  onToggleFavorite: (place: Place) => void;
  onOpenDetails: (place: Place) => void;
  onClose: () => void;
}) {
  const place = spot.primary;
  const distance = userCoords ? formatDistance(distanceInMeters(userCoords, place)) : null;
  const people = spot.places.map((p) => p.user).filter((u): u is NonNullable<Place['user']> => !!u);
  const friendNames = spot.places.filter((p) => p.userId !== myId).map((p) => firstName(p.user));
  const savedLine = spot.hasMine
    ? friendNames.length
      ? `You and ${joinNames(friendNames)} saved this`
      : 'Saved by you'
    : friendNames.length > 1
      ? `${joinNames(friendNames)} saved this`
      : `${possessive(friendNames[0] ?? 'A friend')} pick`;
  const photos = spot.places.flatMap((p) => p.photos ?? []);
  const favorite = isFavorite(place.id);
  const others = spot.places.length > 1 ? spot.places : [];

  return (
    <View>
      <View style={styles.header}>
        <PlaceGlyph category={place.category} owner={spot.hasMine ? 'mine' : 'friend'} size={46} />
        <View style={styles.headerText}>
          <AppText variant="title2" numberOfLines={2}>
            {place.name}
          </AppText>
          <AppText variant="subhead" tone="secondary" numberOfLines={1} style={styles.meta}>
            {[categoryLabel(place.category), distance && `${distance} away`].filter(Boolean).join(' · ')}
          </AppText>
        </View>
        <IconButton icon="close" accessibilityLabel="Close" onPress={onClose} size={32} iconSize={17} />
      </View>

      <View style={styles.social}>
        {people.length > 0 && <AvatarStack users={people} size={24} />}
        <AppText variant="subhead" tone="secondary" style={styles.socialText} numberOfLines={1}>
          {savedLine}
        </AppText>
        {place.isPrivate && place.userId === myId ? <Tag label="Only you" icon="lock-closed" /> : null}
        <RatingStars value={place.rating} size={13} />
      </View>

      <View style={styles.actions}>
        <ActionButton icon="navigate" label="Directions" primary onPress={() => openDirections(place)} />
        <ActionButton
          icon={favorite ? 'heart' : 'heart-outline'}
          label="Favorite"
          active={favorite}
          onPress={() => onToggleFavorite(place)}
        />
        <ActionButton icon="share-outline" label="Share" onPress={() => sharePlace(place)} />
        <ActionButton icon="ellipsis-horizontal" label="Details" onPress={() => onOpenDetails(place)} />
      </View>

      {photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
          {photos.map((photo) => (
            <Image key={photo.id} source={{ uri: assetUrl(photo.url) }} style={styles.photo} accessibilityLabel="Place photo" />
          ))}
        </ScrollView>
      )}

      {others.length === 0 && place.notes ? (
        <View style={styles.note}>
          <AppText variant="body" style={styles.noteText}>
            {place.notes}
          </AppText>
        </View>
      ) : null}

      {others.length === 0 && (place.favoriteFood || place.favoriteDrink) ? (
        <View style={styles.favorites}>
          {place.favoriteFood ? <Pick icon="restaurant-outline" label={place.favoriteFood} /> : null}
          {place.favoriteDrink ? <Pick icon="cafe-outline" label={place.favoriteDrink} /> : null}
        </View>
      ) : null}

      {others.length > 0 && (
        <View style={styles.entries}>
          <AppText variant="overline" tone="secondary" style={styles.entriesTitle}>
            What everyone saved
          </AppText>
          {others.map((entry) => (
            <PressableScale
              key={entry.id}
              onPress={() => onOpenDetails(entry)}
              scaleTo={0.985}
              style={styles.entry}
              accessibilityRole="button"
            >
              {entry.user && <Avatar user={entry.user} size={34} />}
              <View style={styles.entryText}>
                <View style={styles.entryTop}>
                  <AppText variant="headline" numberOfLines={1} style={styles.entryName}>
                    {entry.userId === myId ? 'You' : entry.user ? displayName(entry.user) : 'A friend'}
                  </AppText>
                  <RatingStars value={entry.rating} size={11} showValue={false} />
                </View>
                <AppText variant="subhead" tone="secondary" numberOfLines={2}>
                  {entry.notes || [entry.favoriteFood, entry.favoriteDrink].filter(Boolean).join(' · ') || entry.name}
                </AppText>
              </View>
            </PressableScale>
          ))}
        </View>
      )}

      <PressableScale onPress={() => onOpenDetails(place)} scaleTo={0.985} style={styles.more} accessibilityRole="button">
        <AppText variant="bodyMedium">See all details</AppText>
        <Ionicons name="chevron-forward" size={17} color={colors.textTertiary} />
      </PressableScale>
    </View>
  );
}

function Pick({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.pick}>
      <Ionicons name={icon} size={15} color={colors.textSecondary} />
      <AppText variant="subheadMedium" numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
  },
  headerText: {
    flex: 1,
    paddingTop: 1,
  },
  meta: {
    marginTop: 2,
  },
  social: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    marginTop: space.md,
  },
  socialText: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: space.xs,
    marginTop: space.md,
  },
  action: {
    flex: 1,
    height: 58,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionPrimary: {
    backgroundColor: colors.primary,
  },
  actionPlain: {
    backgroundColor: colors.fill,
  },
  actionActive: {
    backgroundColor: colors.favoriteSoft,
  },
  photos: {
    gap: space.xs,
    marginTop: space.md,
  },
  photo: {
    width: 132,
    height: 132,
    borderRadius: radius.md,
    backgroundColor: colors.fill,
  },
  note: {
    marginTop: space.md,
    paddingLeft: space.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.rating,
  },
  noteText: {
    color: colors.text,
  },
  favorites: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
    marginTop: space.md,
  },
  pick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.sm,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.fill,
    maxWidth: '100%',
  },
  entries: {
    marginTop: space.lg,
  },
  entriesTitle: {
    marginBottom: space.xxs,
  },
  entry: {
    flexDirection: 'row',
    gap: space.sm,
    paddingVertical: space.sm - 2,
  },
  entryText: {
    flex: 1,
    gap: 2,
  },
  entryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  entryName: {
    flexShrink: 1,
  },
  more: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.lg,
    paddingVertical: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
});
