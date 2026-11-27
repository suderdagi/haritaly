import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { colors, screenPadding, space } from '@/src/theme';
import { usersAPI } from '@/src/api/users';
import { getErrorMessage } from '@/src/api/client';
import { formatDate } from '@/src/lib/format';
import { haptics } from '@/src/lib/haptics';
import { BlockedUser, displayName } from '@/src/types';
import { AppText, Avatar, Button, EmptyState, ListGroup, ListRow, SkeletonRow } from '@/src/components/ui';

const AVATAR = 40;

export default function BlockedUsersScreen() {
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setUsers(await usersAPI.getBlocked());
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const unblock = (person: BlockedUser) => {
    Alert.alert(
      `Unblock ${displayName(person)}?`,
      'They will be able to find you and send you a friend request again. You won’t become friends automatically.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            setBusy(person.id);
            try {
              await usersAPI.unblock(person.id);
              haptics.success();
              setUsers((prev) => prev.filter((u) => u.id !== person.id));
            } catch (error) {
              Alert.alert('Couldn’t unblock', getErrorMessage(error, 'Please try again.'));
            } finally {
              setBusy(null);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AppText variant="callout" tone="secondary" style={styles.intro}>
        Blocked people can’t see your places, send you friend requests or find you in search. They aren’t told
        that you blocked them.
      </AppText>

      {loading ? (
        <ListGroup separatorInset={space.md + AVATAR + space.sm}>
          {[0, 1].map((i) => (
            <SkeletonRow key={i} avatar={AVATAR} />
          ))}
        </ListGroup>
      ) : failed ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn’t load this list"
          message="Check your connection and try again."
          actionLabel="Try again"
          onAction={() => {
            setLoading(true);
            load();
          }}
        />
      ) : users.length === 0 ? (
        <EmptyState
          icon="shield-checkmark-outline"
          tint="accent"
          title="No one is blocked"
          message="If someone bothers you, open their profile or one of their places and choose Block."
        />
      ) : (
        <ListGroup separatorInset={space.md + AVATAR + space.sm}>
          {users.map((person) => (
            <ListRow
              key={person.id}
              title={displayName(person)}
              subtitle={`Blocked ${formatDate(person.blockedAt) ?? ''}`.trim()}
              leading={<Avatar user={person} size={AVATAR} />}
              trailing={
                <Button
                  title="Unblock"
                  size="sm"
                  variant="secondary"
                  loading={busy === person.id}
                  onPress={() => unblock(person)}
                />
              }
            />
          ))}
        </ListGroup>
      )}
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
  intro: {
    marginTop: space.xs,
    marginBottom: space.lg,
    marginHorizontal: space.xxs,
  },
});
