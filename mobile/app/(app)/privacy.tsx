import React, { useCallback, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, screenPadding, space } from '@/src/theme';
import { useAuth } from '@/src/store/auth';
import { useUserLocation } from '@/src/store/location';
import { placesAPI } from '@/src/api/places';
import { getAppConfig } from '@/src/api/config';
import { hasAiConsent, setAiConsent } from '@/src/utils/aiConsent';
import { openWebPage } from '@/src/utils/openWebPage';
import { getDefaultVisibility, setDefaultVisibility, Visibility } from '@/src/lib/preferences';
import { IconName } from '@/src/lib/categories';
import { plural } from '@/src/lib/format';
import { AppText, Button, ListGroup, ListRow, Segmented, SectionHeader } from '@/src/components/ui';
import { DeleteAccountModal } from '@/src/components/DeleteAccountModal/DeleteAccountModal';

function Point({ icon, children }: { icon: IconName; children: string }) {
  return (
    <View style={styles.point}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} style={styles.pointIcon} />
      <AppText variant="callout" tone="secondary" style={styles.pointText}>
        {children}
      </AppText>
    </View>
  );
}

/** Everything Haritaly shares and with whom, in plain words, with the controls next to each part. */
export default function PrivacyScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { status, requestLocation } = useUserLocation();
  const [visibility, setVisibility] = useState<Visibility>('friends');
  const [counts, setCounts] = useState<{ total: number; private: number } | null>(null);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [aiAllowed, setAiAllowed] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getDefaultVisibility().then((v) => active && setVisibility(v));
      placesAPI
        .getMyPlaces()
        .then((places) => active && setCounts({ total: places.length, private: places.filter((p) => p.isPrivate).length }))
        .catch(() => {});
      getAppConfig().then((c) => active && setAiAvailable(c.aiSummary));
      hasAiConsent().then((a) => active && setAiAllowed(a));
      return () => {
        active = false;
      };
    }, [])
  );

  const privateNote = counts
    ? counts.private === 0
      ? `None of your ${plural(counts.total, 'place')} are private right now.`
      : `${counts.private} of your ${plural(counts.total, 'place')} ${counts.private === 1 ? 'is' : 'are'} private.`
    : null;

  const locationValue = status === 'granted' ? 'While using the app' : status === 'denied' ? 'Off' : 'Not asked yet';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AppText variant="callout" tone="secondary" style={styles.lead}>
        What Haritaly shares, and with whom. Nothing here is shared with advertisers, and Haritaly does not track
        you across other apps.
      </AppText>

      <SectionHeader title="Your location" />
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <View style={[styles.cardIcon, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="navigate" size={17} color={colors.accent} />
          </View>
          <View style={styles.cardHeadText}>
            <AppText variant="headline">Location access</AppText>
            <AppText variant="footnote" tone="secondary">
              {locationValue}
            </AppText>
          </View>
        </View>
        <Point icon="map-outline">Used only while the app is open: to center the map, show distances and save a place where you are.</Point>
        <Point icon="eye-off-outline">
          Your exact position stays on this phone. To load friends’ places, Haritaly sends only the area you’re looking
          at, rounded to about 1 km, and doesn’t store it. Friends see only the places you share.
        </Point>
        <Point icon="time-outline">Never used in the background.</Point>
        <Button
          title={status === 'undetermined' ? 'Continue' : 'Open Settings'}
          variant="secondary"
          size="md"
          onPress={() => (status === 'undetermined' ? requestLocation() : Linking.openSettings())}
          style={styles.cardButton}
        />
      </View>

      <SectionHeader title="Your places" style={styles.sectionGap} />
      <View style={styles.card}>
        <AppText variant="headline">New places are visible to</AppText>
        <View style={styles.segment}>
          <Segmented
            accessibilityLabel="Who sees new places"
            value={visibility}
            onChange={(v) => {
              setVisibility(v);
              setDefaultVisibility(v);
            }}
            options={[
              { value: 'friends', label: 'Friends', icon: 'people-outline' },
              { value: 'private', label: 'Only me', icon: 'lock-closed-outline' },
            ]}
          />
        </View>
        <Point icon="people-outline">Friends see a shared place with your rating, notes and photos.</Point>
        <Point icon="lock-closed-outline">A private place stays off your friends’ maps, searches and favorites.</Point>
        <AppText variant="footnote" tone="tertiary" style={styles.cardNote}>
          You can change this for each place when you save it.{privateNote ? ` ${privateNote}` : ''}
        </AppText>
      </View>

      <SectionHeader title="People" style={styles.sectionGap} />
      <ListGroup>
        <ListRow
          icon="ban-outline"
          title="Blocked people"
          subtitle="They can’t see your places, find you or send requests"
          onPress={() => router.push('/blocked-users')}
        />
        {aiAvailable ? (
          <ListRow
            icon="sparkles"
            tint="social"
            title="AI summaries"
            subtitle="Lets OpenAI read saved ratings and notes to summarize a place. No names or emails."
            switchValue={aiAllowed}
            onSwitchChange={async (allowed) => {
              setAiAllowed(allowed);
              await setAiConsent(allowed);
            }}
          />
        ) : null}
      </ListGroup>
      <AppText variant="footnote" tone="tertiary" style={styles.groupNote}>
        Only people you accept as friends see your shared places. Report a place or a note from its ••• menu.
      </AppText>

      <SectionHeader title="Policies" style={styles.sectionGap} />
      <ListGroup>
        <ListRow icon="shield-checkmark-outline" title="Privacy Policy" onPress={() => openWebPage('/privacy')} />
        <ListRow icon="document-text-outline" title="Terms of Use" onPress={() => openWebPage('/terms')} />
      </ListGroup>

      <SectionHeader title="Your account" style={styles.sectionGap} />
      <ListGroup>
        <ListRow icon="trash-outline" title="Delete Account" destructive chevron={false} onPress={() => setDeleting(true)} />
      </ListGroup>
      <AppText variant="footnote" tone="tertiary" style={styles.groupNote}>
        Deletes your account and everything in it: places, photos, favorites and friendships.
      </AppText>

      <DeleteAccountModal
        visible={deleting}
        onClose={() => setDeleting(false)}
        onDeleted={async () => {
          setDeleting(false);
          await signOut();
          router.replace('/(auth)/login');
          Alert.alert('Account deleted', 'Your account and everything in it have been deleted.');
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: screenPadding,
    paddingBottom: space.xxxl,
  },
  lead: {
    marginTop: space.xs,
    marginBottom: space.xl,
    marginHorizontal: space.xxs,
  },
  sectionGap: {
    marginTop: space.xl,
  },
  card: {
    padding: space.md,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    gap: space.sm,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.xxs,
  },
  cardIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeadText: {
    flex: 1,
  },
  cardButton: {
    alignSelf: 'flex-start',
    marginTop: space.xs,
  },
  cardNote: {
    marginTop: space.xxs,
  },
  segment: {
    marginBottom: space.xxs,
  },
  point: {
    flexDirection: 'row',
    gap: space.xs,
  },
  pointIcon: {
    marginTop: 2,
  },
  pointText: {
    flex: 1,
  },
  groupNote: {
    marginTop: space.sm,
    marginHorizontal: space.xxs,
  },
});
