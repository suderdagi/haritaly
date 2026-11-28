import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@/src/theme';
import { assetUrl } from '@/src/api/client';
import { distanceInMeters, Coordinates } from '@/src/lib/geo';
import { firstName, formatDistance, joinNames } from '@/src/lib/format';
import { categoryLabel } from '@/src/lib/categories';
import { sharePlace } from '@/src/lib/maps';
import { Spot } from '@/src/lib/spots';
import { chooseOption } from '@/src/utils/chooseOption';
import { confirmBlock, reportPlace } from '@/src/utils/safety';
import { displayName, Place } from '@/src/types';
import { AppText } from '../ui/AppText';
import { Avatar, AvatarStack } from '../ui/Avatar';
import { IconButton } from '../ui/IconButton';
import { PressableScale } from '../ui/PressableScale';
import { Tag } from '../ui/Tag';
import { PlaceGlyph } from '../place/PlaceGlyph';
import { RecommendationCard } from '../place/Recommendation';
import { DirectionsButton, FavoriteButton } from '../place/PlaceActions';

/** What you see when a place is selected on the map. Collapsed, only the header row shows. */
export function PlaceSheet({
  spot,
  myId,
  userCoords,
  isFavorite,
  onToggleFavorite,
  onOpenDetails,
  onOpenPerson,
  onBlocked,
  onClose,
}: {
  spot: Spot;
  myId?: number;
  userCoords: Coordinates | null;
  isFavorite: (placeId: number) => boolean;
  onToggleFavorite: (place: Place) => void;
  onOpenDetails: (place: Place) => void;
  onOpenPerson: (userId: number) => void;
  /** After blocking someone: their places disappear, so the sheet closes. */
  onBlocked: () => void;
  onClose: () => void;
}) {
  const place = spot.primary;
  const distance = userCoords ? formatDistance(distanceInMeters(userCoords, place)) : null;
  const district = place.address?.split(',').map((s) => s.trim()).filter(Boolean).pop();
  const photos = spot.places.flatMap((p) => p.photos ?? []);
  const shared = spot.places.length > 1;
  const people = spot.places.map((p) => p.user).filter((u): u is NonNullable<Place['user']> => !!u);
  const names = spot.places.map((p) => (p.userId === myId ? 'You' : firstName(p.user)));

  // Each friend's entry can be reported, and the friend blocked (App Store guideline 1.2)
  const entryMenu = (entry: Place) => {
    const owner = entry.user;
    chooseOption(owner ? `${displayName(owner)}’s entry` : 'This entry', [
      { label: 'Report Place or Note', onPress: () => reportPlace(entry.id) },
      ...(owner
        ? [{ label: `Block ${displayName(owner)}`, destructive: true, onPress: () => confirmBlock(owner, onBlocked) }]
        : []),
    ]);
  };

  return (
    <View>
      <View style={styles.header}>
        <PlaceGlyph category={place.category} owner={spot.hasMine ? 'mine' : 'friend'} size={46} />
        <View style={styles.headerText}>
          <AppText variant="title2" numberOfLines={2}>
            {place.name}
          </AppText>
          <AppText variant="subhead" tone="secondary" numberOfLines={2} style={styles.meta}>
            {[categoryLabel(place.category), district, distance && `${distance} away`].filter(Boolean).join(' · ')}
          </AppText>
        </View>
        <IconButton icon="close" accessibilityLabel="Close" onPress={onClose} size={32} iconSize={17} />
      </View>

      <View style={styles.actions}>
        {/* The distance is already in the header, so the button keeps room for larger text */}
        <DirectionsButton place={place} style={styles.directions} />
        <FavoriteButton active={isFavorite(place.id)} onPress={() => onToggleFavorite(place)} />
        <IconButton icon="share-outline" accessibilityLabel="Share" onPress={() => sharePlace(place)} size={52} iconSize={22} />
      </View>

      {shared ? (
        <View style={styles.block}>
          <View style={styles.sharedHead}>
            <AvatarStack users={people} size={26} />
            <AppText variant="headline" tone="social" style={styles.sharedTitle} numberOfLines={2}>
              {joinNames(names)} saved this
            </AppText>
          </View>
          <View style={styles.entries}>
            {spot.places.map((entry) => {
              const mine = entry.userId === myId;
              return (
                <View key={entry.id} style={[styles.entry, mine ? styles.entryMine : styles.entryFriend]}>
                  <PressableScale
                    onPress={() => (mine ? onOpenDetails(entry) : entry.user && onOpenPerson(entry.user.id))}
                    scaleTo={0.98}
                    style={styles.entryHead}
                    accessibilityRole="button"
                  >
                    {entry.user && <Avatar user={entry.user} size={30} />}
                    <AppText variant="headline" numberOfLines={1} style={styles.entryName}>
                      {mine ? 'You' : entry.user ? displayName(entry.user) : 'A friend'}
                    </AppText>
                  </PressableScale>
                  {entry.notes || entry.favoriteFood || entry.favoriteDrink ? (
                    <AppText variant="callout" style={styles.entryNote} numberOfLines={3}>
                      {entry.notes
                        ? `“${entry.notes}”`
                        : [entry.favoriteFood, entry.favoriteDrink].filter(Boolean).join(' · ')}
                    </AppText>
                  ) : null}
                  {!mine && (
                    <PressableScale
                      onPress={() => entryMenu(entry)}
                      hitSlop={10}
                      style={styles.entryMore}
                      accessibilityRole="button"
                      accessibilityLabel={`Report or block, ${entry.user ? displayName(entry.user) : 'this entry'}`}
                    >
                      <Ionicons name="ellipsis-horizontal" size={16} color={colors.textTertiary} />
                    </PressableScale>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.block}>
          <RecommendationCard
            place={place}
            isMine={spot.hasMine}
            size="compact"
            onPressPerson={!spot.hasMine && place.user ? () => onOpenPerson(place.user!.id) : undefined}
          />
          {place.isPrivate && place.userId === myId ? (
            <Tag label="Only you can see this place" icon="lock-closed" style={styles.privateTag} />
          ) : null}
        </View>
      )}

      {photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
          {photos.map((photo) => (
            <Image key={photo.id} source={{ uri: assetUrl(photo.url) }} style={styles.photo} accessibilityLabel="Place photo" />
          ))}
        </ScrollView>
      )}

      <PressableScale onPress={() => onOpenDetails(place)} scaleTo={0.985} style={styles.more} accessibilityRole="button">
        <AppText variant="bodyMedium">See all details</AppText>
        <View style={styles.moreRight}>
          {!spot.hasMine && (
            <AppText variant="footnote" tone="tertiary">
              Report or block inside
            </AppText>
          )}
          <Ionicons name="chevron-forward" size={17} color={colors.textTertiary} />
        </View>
      </PressableScale>
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    marginTop: space.md,
  },
  directions: {
    flex: 1,
  },
  block: {
    marginTop: space.md,
  },
  privateTag: {
    marginTop: space.xs,
  },
  sharedHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  sharedTitle: {
    flex: 1,
  },
  entries: {
    gap: space.xs,
    marginTop: space.sm,
  },
  entry: {
    padding: space.sm,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  entryFriend: {
    backgroundColor: colors.socialSoft,
  },
  entryMine: {
    backgroundColor: colors.accentSoft,
  },
  entryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingRight: space.xl,
  },
  entryName: {
    flexShrink: 1,
  },
  entryNote: {
    marginTop: space.xs,
    color: colors.text,
  },
  entryMore: {
    position: 'absolute',
    top: space.sm,
    right: space.sm,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
  more: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.lg,
    paddingVertical: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  moreRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
});
