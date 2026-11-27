import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, space } from '@/src/theme';
import { distanceInMeters, Coordinates } from '@/src/lib/geo';
import { plural } from '@/src/lib/format';
import { Spot } from '@/src/lib/spots';
import { LocationStatus } from '@/src/store/location';
import { AppText } from '../ui/AppText';
import { PlaceRow } from '../place/PlaceRow';
import { LocationCard } from './LocationCard';

const MAX_ROWS = 40;

/**
 * The sheet when nothing is selected: the places in the visible area, nearest first,
 * with a small legend so the marker colors explain themselves.
 */
export function AreaSheet({
  spots,
  totalInView,
  loading,
  origin,
  nearUser,
  locationStatus,
  onLocationContinue,
  onSelect,
  isFavorite,
  filterLabel,
  onHeaderLayout,
}: {
  spots: Spot[];
  totalInView: number;
  loading: boolean;
  /** Distances are measured from here: the user if known, otherwise the center of the map. */
  origin: Coordinates;
  nearUser: boolean;
  locationStatus: LocationStatus;
  onLocationContinue: () => void;
  onSelect: (spot: Spot) => void;
  isFavorite: (placeId: number) => boolean;
  filterLabel: string | null;
  /** Reports the header's height, which sets how tall the collapsed sheet is. */
  onHeaderLayout?: (height: number) => void;
}) {
  const sorted = spots
    .map((spot) => ({ spot, distance: distanceInMeters(origin, spot) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, MAX_ROWS);
  const friendsCount = spots.filter((s) => !s.hasMine).length;

  return (
    <View>
      <View style={styles.header} onLayout={(e) => onHeaderLayout?.(e.nativeEvent.layout.height)}>
        <View style={styles.headerText}>
          <AppText variant="title3">{filterLabel ?? (nearUser ? 'Around you' : 'In this area')}</AppText>
          <AppText variant="subhead" tone="secondary" style={styles.subtitle}>
            {totalInView === 0
              ? 'No saved places here yet'
              : `${plural(totalInView, 'place')}${friendsCount ? ` · ${friendsCount} from friends` : ''}`}
          </AppText>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={colors.textTertiary} />
        ) : (
          <View style={styles.legend} accessible accessibilityLabel="Green markers are yours, lavender are friends'">
            <Legend color={colors.markerMine} label="Yours" />
            <Legend color={colors.markerFriend} label="Friends" />
          </View>
        )}
      </View>

      {(locationStatus === 'undetermined' || locationStatus === 'denied') && (
        <View style={styles.block}>
          <LocationCard status={locationStatus} onContinue={onLocationContinue} />
        </View>
      )}

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="callout" tone="secondary">
            Move the map to explore, or touch and hold anywhere to save a place there. Places your friends save show
            up here too.
          </AppText>
        </View>
      ) : (
        <View style={styles.list}>
          {sorted.map(({ spot, distance }) => (
            <PlaceRow
              key={spot.key}
              place={spot.primary}
              isMine={spot.hasMine}
              savedBy={spot.people}
              distance={distance}
              isFavorite={isFavorite(spot.primary.id)}
              onPress={() => onSelect(spot)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  // The legend moves under the title when larger text leaves no room beside it
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: space.sm,
    rowGap: space.xs,
  },
  headerText: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 200,
  },
  subtitle: {
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    gap: space.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  block: {
    marginTop: space.md,
  },
  empty: {
    marginTop: space.md,
  },
  list: {
    marginTop: space.sm,
  },
});
