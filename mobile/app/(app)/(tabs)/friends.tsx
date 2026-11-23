import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, screenPadding, space, type } from '@/src/theme';
import { friendsAPI } from '@/src/api/friends';
import { getErrorMessage } from '@/src/api/client';
import { haptics } from '@/src/lib/haptics';
import { plural } from '@/src/lib/format';
import { chooseOption } from '@/src/utils/chooseOption';
import { confirmBlock } from '@/src/utils/safety';
import { displayName, Friend, FriendRequest, UserSearchResult } from '@/src/types';
import {
  AppText,
  Avatar,
  Button,
  EmptyState,
  LargeTitle,
  ListGroup,
  ListRow,
  ScreenHeader,
  SectionHeader,
  SkeletonRow,
  Tag,
  useScrollTitle,
} from '@/src/components/ui';

const SEARCH_DELAY_MS = 350;
const AVATAR = 44;
const ROW_INSET = space.md + AVATAR + space.sm;

export default function FriendsScreen() {
  const router = useRouter();
  const { scrollY, onScroll } = useScrollTitle();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyRequest, setBusyRequest] = useState<number | null>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const load = useCallback(async () => {
    try {
      const [friendList, requestList] = await Promise.all([friendsAPI.list(), friendsAPI.incomingRequests()]);
      setFriends(friendList);
      setRequests(requestList);
    } catch (error) {
      Alert.alert('Couldn’t load friends', getErrorMessage(error, 'Please try again.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Search people only once the user stops typing
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const found = await friendsAPI.searchUsers(q);
        if (active) setResults(found);
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setSearching(false);
      }
    }, SEARCH_DELAY_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const run = async (action: () => Promise<unknown>, errorTitle: string) => {
    try {
      await action();
      await load();
      return true;
    } catch (error) {
      Alert.alert(errorTitle, getErrorMessage(error, 'Please try again.'));
      return false;
    }
  };

  const addFriend = async (person: UserSearchResult) => {
    haptics.tap();
    const done = await run(() => friendsAPI.sendRequest(person.id), 'Couldn’t send the request');
    if (done) {
      setResults((prev) =>
        prev.map((u) =>
          u.id === person.id ? { ...u, relation: u.relation === 'REQUEST_RECEIVED' ? 'FRIEND' : 'REQUEST_SENT' } : u
        )
      );
    }
  };

  const accept = async (request: FriendRequest) => {
    setBusyRequest(request.id);
    if (await run(() => friendsAPI.accept(request.id), 'Couldn’t accept the request')) haptics.success();
    setBusyRequest(null);
  };

  // Declining also offers blocking, so nobody can keep sending unwanted requests
  const decline = (request: FriendRequest) => {
    chooseOption(`Decline ${displayName(request.sender)}’s request?`, [
      { label: 'Decline', onPress: () => run(() => friendsAPI.reject(request.id), 'Couldn’t decline the request') },
      { label: 'Decline and Block', destructive: true, onPress: () => confirmBlock(request.sender, load) },
    ]);
  };

  const isSearching = query.trim().length >= 2;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Friends" scrollY={scrollY} />
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.textTertiary}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
      >
        <LargeTitle
          title="Friends"
          subtitle={!loading && friends.length > 0 ? `${plural(friends.length, 'friend')} sharing places with you` : undefined}
        />

        <View style={styles.searchWrap}>
          <View style={styles.search}>
            <Ionicons name="search" size={18} color={colors.textTertiary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Find people by name or email"
              placeholderTextColor={colors.textTertiary}
              selectionColor={colors.accent}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              returnKeyType="search"
              style={styles.searchInput}
              accessibilityLabel="Find people by name or email"
            />
            {searching && <ActivityIndicator size="small" color={colors.textTertiary} />}
          </View>
        </View>

        {isSearching ? (
          <View style={styles.block}>
            <SectionHeader title="People" />
            {results.length > 0 ? (
              <ListGroup separatorInset={ROW_INSET}>
                {results.map((person) => (
                  <ListRow
                    key={person.id}
                    title={displayName(person)}
                    subtitle={person.email}
                    leading={<Avatar user={person} size={AVATAR} />}
                    trailing={<RelationAction person={person} onAdd={() => addFriend(person)} />}
                  />
                ))}
              </ListGroup>
            ) : (
              !searching && (
                <AppText variant="callout" tone="secondary" style={styles.noResults}>
                  No one found for “{query.trim()}”. Try their full email address.
                </AppText>
              )
            )}
          </View>
        ) : loading ? (
          <View style={styles.block}>
            <ListGroup separatorInset={ROW_INSET}>
              {[0, 1, 2].map((i) => (
                <SkeletonRow key={i} avatar={AVATAR} />
              ))}
            </ListGroup>
          </View>
        ) : (
          <>
            {requests.length > 0 && (
              <View style={styles.block}>
                <SectionHeader title="Requests" detail={String(requests.length)} />
                <View style={styles.requests}>
                  {requests.map((request) => (
                    <View key={request.id} style={styles.requestCard}>
                      <View style={styles.requestTop}>
                        <Avatar user={request.sender} size={AVATAR} />
                        <View style={styles.requestText}>
                          <AppText variant="headline" numberOfLines={1}>
                            {displayName(request.sender)}
                          </AppText>
                          <AppText variant="footnote" tone="secondary">
                            Wants to share places with you
                          </AppText>
                        </View>
                      </View>
                      <View style={styles.requestButtons}>
                        <Button
                          title="Accept"
                          size="sm"
                          onPress={() => accept(request)}
                          loading={busyRequest === request.id}
                          style={styles.requestButton}
                        />
                        <Button
                          title="Decline"
                          size="sm"
                          variant="secondary"
                          onPress={() => decline(request)}
                          style={styles.requestButton}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {friends.length > 0 ? (
              <View style={styles.block}>
                <SectionHeader title="Your friends" />
                <ListGroup separatorInset={ROW_INSET}>
                  {friends.map((friend) => (
                    <ListRow
                      key={friend.id}
                      title={displayName(friend)}
                      subtitle={friend.email}
                      leading={<Avatar user={friend} size={AVATAR} />}
                      onPress={() => router.push({ pathname: '/friend', params: { userId: friend.id } })}
                      accessibilityHint="Shows the places they share"
                    />
                  ))}
                </ListGroup>
                <AppText variant="footnote" tone="tertiary" style={styles.footnote}>
                  Friends see the places you share, and you see theirs. Open a friend to remove or block them.
                </AppText>
              </View>
            ) : (
              requests.length === 0 && (
                <EmptyState
                  icon="people-outline"
                  tint="social"
                  title="Better with friends"
                  message="Search for people you know. Once they accept, the places they love appear on your map."
                />
              )
            )}
          </>
        )}
      </Animated.ScrollView>
    </View>
  );
}

function RelationAction({ person, onAdd }: { person: UserSearchResult; onAdd: () => void }) {
  switch (person.relation) {
    case 'FRIEND':
      return <Tag label="Friends" icon="checkmark" tint="accent" />;
    case 'REQUEST_SENT':
      return <Tag label="Requested" icon="time-outline" />;
    case 'REQUEST_RECEIVED':
      return <Button title="Accept" size="sm" onPress={onAdd} />;
    default:
      return <Button title="Add" icon="person-add-outline" size="sm" variant="tinted" onPress={onAdd} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: space.xxxl,
  },
  searchWrap: {
    paddingHorizontal: screenPadding,
  },
  search: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.sm + 2,
    borderRadius: radius.md - 2,
    borderCurve: 'continuous',
    backgroundColor: colors.fill,
  },
  searchInput: {
    flex: 1,
    fontSize: type.body.fontSize,
    color: colors.text,
    outlineWidth: 0,
  },
  block: {
    marginTop: space.xl,
    paddingHorizontal: screenPadding,
  },
  noResults: {
    paddingHorizontal: space.xxs,
  },
  requests: {
    gap: space.sm,
  },
  requestCard: {
    padding: space.md,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  requestTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  requestText: {
    flex: 1,
    gap: 2,
  },
  requestButtons: {
    flexDirection: 'row',
    gap: space.xs,
    marginTop: space.md,
  },
  requestButton: {
    flex: 1,
  },
  footnote: {
    marginTop: space.sm,
    marginHorizontal: space.xxs,
  },
});
