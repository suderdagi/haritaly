import React, { useCallback, useState } from 'react';
import { Alert, Animated, Linking, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { colors, radius, screenPadding, space } from '@/src/theme';
import { useAuth } from '@/src/store/auth';
import { useUserLocation } from '@/src/store/location';
import { usersAPI } from '@/src/api/users';
import { friendsAPI } from '@/src/api/friends';
import { placesAPI } from '@/src/api/places';
import { getAppConfig } from '@/src/api/config';
import { hasAiConsent, setAiConsent } from '@/src/utils/aiConsent';
import { openWebPage } from '@/src/utils/openWebPage';
import { displayName } from '@/src/types';
import {
  AppText,
  Avatar,
  Button,
  LargeTitle,
  ListGroup,
  ListRow,
  PressableScale,
  ScreenHeader,
  SectionHeader,
  useScrollTitle,
} from '@/src/components/ui';
import { DeleteAccountModal } from '@/src/components/DeleteAccountModal/DeleteAccountModal';

interface Stats {
  places: number | null;
  friends: number | null;
  favorites: number | null;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { status: locationStatus, requestLocation } = useUserLocation();
  const { scrollY, onScroll } = useScrollTitle();
  const [stats, setStats] = useState<Stats>({ places: null, friends: null, favorites: null });
  const [aiAvailable, setAiAvailable] = useState(false);
  const [aiAllowed, setAiAllowed] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const settle = <T,>(promise: Promise<T>, pick: (value: T) => number) =>
        promise.then(pick).catch(() => null);
      Promise.all([
        settle(usersAPI.getProfile(), (p) => p._count?.places ?? 0),
        settle(friendsAPI.list(), (f) => f.length),
        settle(placesAPI.getFavorites(), (f) => f.length),
      ]).then(([places, friends, favorites]) => active && setStats({ places, friends, favorites }));
      getAppConfig().then((config) => active && setAiAvailable(config.aiSummary));
      hasAiConsent().then((allowed) => active && setAiAllowed(allowed));
      return () => {
        active = false;
      };
    }, [])
  );

  const toggleAi = async (allowed: boolean) => {
    setAiAllowed(allowed);
    await setAiConsent(allowed);
  };

  const logOut = () => {
    Alert.alert('Log out of Haritaly?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const accountDeleted = async () => {
    setShowDeleteAccount(false);
    await signOut();
    router.replace('/(auth)/login');
    Alert.alert('Account deleted', 'Your account and everything in it have been deleted.');
  };

  if (!user) return null;

  const locationValue =
    locationStatus === 'granted' ? 'While using' : locationStatus === 'denied' ? 'Off' : 'Not set';

  return (
    <View style={styles.container}>
      <ScreenHeader title="Profile" scrollY={scrollY} />
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={styles.content}>
        <LargeTitle title="Profile" />

        {/* Who you are */}
        <View style={styles.identity}>
          <Avatar user={user} size={84} />
          <View style={styles.identityText}>
            <AppText variant="title2" numberOfLines={2}>
              {displayName(user)}
            </AppText>
            <AppText variant="subhead" tone="secondary" numberOfLines={1}>
              {user.email}
            </AppText>
          </View>
        </View>
        {user.bio ? (
          <AppText variant="callout" style={styles.bio}>
            {user.bio}
          </AppText>
        ) : (
          <PressableScale onPress={() => router.push('/edit-profile')} style={styles.bioPrompt} accessibilityRole="button">
            <AppText variant="callout" tone="accent">
              Add a short bio so friends know it’s you
            </AppText>
          </PressableScale>
        )}

        <View style={styles.stats}>
          <Stat value={stats.places} label="Places" onPress={() => router.navigate('/map')} />
          <View style={styles.statDivider} />
          <Stat value={stats.friends} label="Friends" onPress={() => router.navigate('/friends')} />
          <View style={styles.statDivider} />
          <Stat value={stats.favorites} label="Favorites" onPress={() => router.navigate('/favorites')} />
        </View>

        <Button
          title="Edit Profile"
          icon="create-outline"
          variant="secondary"
          size="md"
          onPress={() => router.push('/edit-profile')}
          style={styles.edit}
        />

        <View style={styles.block}>
          <SectionHeader title="Privacy & safety" />
          <ListGroup>
            <ListRow
              icon="navigate-outline"
              tint="accent"
              title="Location"
              subtitle="Only used on this phone, never shown to friends"
              value={locationValue}
              onPress={() => (locationStatus === 'undetermined' ? requestLocation() : Linking.openSettings())}
              accessibilityHint={locationStatus === 'undetermined' ? 'Asks for location access' : 'Opens Settings'}
            />
            <ListRow
              icon="ban-outline"
              tint="neutral"
              title="Blocked people"
              onPress={() => router.push('/blocked-users')}
            />
            {aiAvailable ? (
              <ListRow
                icon="sparkles"
                tint="social"
                title="AI summaries"
                subtitle="Lets OpenAI read saved notes to summarize a place"
                switchValue={aiAllowed}
                onSwitchChange={toggleAi}
              />
            ) : null}
          </ListGroup>
        </View>

        <View style={styles.block}>
          <SectionHeader title="Help & legal" />
          <ListGroup>
            <ListRow icon="help-buoy-outline" title="Help & Support" onPress={() => openWebPage('/support')} />
            <ListRow icon="shield-checkmark-outline" title="Privacy Policy" onPress={() => openWebPage('/privacy')} />
            <ListRow icon="document-text-outline" title="Terms of Use" onPress={() => openWebPage('/terms')} />
          </ListGroup>
        </View>

        <View style={styles.block}>
          <ListGroup>
            <ListRow icon="log-out-outline" title="Log Out" onPress={logOut} chevron={false} />
            <ListRow
              icon="trash-outline"
              title="Delete Account"
              destructive
              onPress={() => setShowDeleteAccount(true)}
              chevron={false}
            />
          </ListGroup>
          <AppText variant="footnote" tone="tertiary" style={styles.footnote}>
            Deleting your account removes your places, photos, favorites and friendships for good.
          </AppText>
        </View>

        <AppText variant="caption" tone="tertiary" align="center" style={styles.version}>
          Haritaly {Constants.expoConfig?.version ?? ''}
        </AppText>
      </Animated.ScrollView>

      <DeleteAccountModal
        visible={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
        onDeleted={accountDeleted}
      />
    </View>
  );
}

function Stat({ value, label, onPress }: { value: number | null; label: string; onPress: () => void }) {
  return (
    <PressableScale
      onPress={onPress}
      style={styles.stat}
      accessibilityRole="button"
      accessibilityLabel={`${value ?? 'Unknown number of'} ${label}`}
    >
      <AppText variant="title2">{value ?? '–'}</AppText>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: space.xxxl,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: screenPadding,
  },
  identityText: {
    flex: 1,
    gap: 2,
  },
  bio: {
    marginTop: space.md,
    paddingHorizontal: screenPadding,
  },
  bioPrompt: {
    marginTop: space.md,
    marginHorizontal: screenPadding,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.lg,
    marginHorizontal: screenPadding,
    paddingVertical: space.sm,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: space.xxs,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: colors.hairline,
  },
  edit: {
    marginTop: space.sm,
    marginHorizontal: screenPadding,
  },
  block: {
    marginTop: space.xl,
    paddingHorizontal: screenPadding,
  },
  footnote: {
    marginTop: space.sm,
    marginHorizontal: space.xxs,
  },
  version: {
    marginTop: space.xl,
  },
});
