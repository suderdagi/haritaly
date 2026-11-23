import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { colors, screenPadding, space } from '@/src/theme';
import { usersAPI } from '@/src/api/users';
import { friendsAPI } from '@/src/api/friends';
import { getErrorMessage } from '@/src/api/client';
import { useUserLocation } from '@/src/store/location';
import { distanceInMeters } from '@/src/lib/geo';
import { plural } from '@/src/lib/format';
import { chooseOption } from '@/src/utils/chooseOption';
import { confirmBlock } from '@/src/utils/safety';
import { displayName, Place, User } from '@/src/types';
import { AppText, Avatar, EmptyState, SectionHeader } from '@/src/components/ui';
import { PlaceRow } from '@/src/components/place/PlaceRow';

/** A friend's profile: who they are and the places they share. */
export default function FriendScreen() {
  const router = useRouter();
  const { userId: param } = useLocalSearchParams<{ userId: string }>();
  const userId = Number(param);
  const { status: locationStatus, coords } = useUserLocation();

  const [person, setPerson] = useState<User | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState<'not-friends' | 'missing' | 'error' | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([usersAPI.getUser(userId), usersAPI.getUserPlaces(userId)])
        .then(([profile, shared]) => {
          if (!active) return;
          setPerson(profile);
          setPlaces(shared);
          setProblem(null);
        })
        .catch((error) => {
          if (!active) return;
          const status = axios.isAxiosError(error) ? error.response?.status : undefined;
          setProblem(status === 403 ? 'not-friends' : status === 404 ? 'missing' : 'error');
        })
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
    }, [userId])
  );

  const showMenu = () => {
    if (!person) return;
    const name = displayName(person);
    chooseOption(name, [
      {
        label: 'Remove Friend',
        onPress: () =>
          Alert.alert(`Remove ${name}?`, 'You will no longer see each other’s places.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Remove',
              style: 'destructive',
              onPress: async () => {
                try {
                  await friendsAPI.remove(person.id);
                  router.back();
                } catch (error) {
                  Alert.alert('Couldn’t remove friend', getErrorMessage(error, 'Please try again.'));
                }
              },
            },
          ]),
      },
      { label: `Block ${name}`, destructive: true, onPress: () => confirmBlock(person, () => router.back()) },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.textSecondary} />
      </View>
    );
  }

  if (problem || !person) {
    return (
      <View style={styles.center}>
        <EmptyState
          icon={problem === 'not-friends' ? 'lock-closed-outline' : 'person-outline'}
          tint="social"
          title={problem === 'not-friends' ? 'Only for friends' : 'Profile unavailable'}
          message={
            problem === 'not-friends'
              ? 'You can see someone’s places once you are friends.'
              : problem === 'missing'
                ? 'This person can’t be found.'
                : 'Check your connection and try again.'
          }
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const here = locationStatus === 'granted' ? coords : null;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={showMenu} hitSlop={12} accessibilityRole="button" accessibilityLabel="Remove or block" style={styles.headerButton}>
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.text} />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Avatar user={person} size={92} />
          <AppText variant="title1" align="center" style={styles.name} accessibilityRole="header">
            {displayName(person)}
          </AppText>
          {person.bio ? (
            <AppText variant="callout" tone="secondary" align="center" style={styles.bio}>
              {person.bio}
            </AppText>
          ) : null}
          <View style={styles.stat}>
            <Ionicons name="location-outline" size={14} color={colors.social} />
            <AppText variant="subheadMedium" tone="social">
              {plural(places.length, 'shared place')}
            </AppText>
          </View>
        </View>

        <View style={styles.list}>
          <SectionHeader title="Their places" />
          {places.length === 0 ? (
            <EmptyState
              icon="map-outline"
              tint="social"
              title="No places yet"
              message={`When ${person.firstName ?? 'they'} save a place, it shows up here and on your map.`}
            />
          ) : (
            places.map((place, i) => (
              <View key={place.id} style={i > 0 && styles.divided}>
                <PlaceRow
                  place={place}
                  isMine={false}
                  distance={here ? distanceInMeters(here, place) : null}
                  onPress={() => router.push({ pathname: '/place-details', params: { placeId: place.id } })}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: space.xxxl,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: screenPadding,
    paddingTop: space.md,
  },
  name: {
    marginTop: space.md,
  },
  bio: {
    marginTop: space.xs,
    maxWidth: 320,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: space.md,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.socialSoft,
  },
  list: {
    marginTop: space.xxl,
    paddingHorizontal: screenPadding,
  },
  divided: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
});
