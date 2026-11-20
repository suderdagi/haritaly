import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { friendsAPI } from '@/src/api/friends';
import { getErrorMessage } from '@/src/api/client';
import { Avatar } from '@/src/components/Avatar/Avatar';
import { displayName, Friend, FriendRequest, UserSearchResult } from '@/src/types';

const SEARCH_DELAY_MS = 350;

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const load = useCallback(async () => {
    try {
      const [friendList, requestList] = await Promise.all([
        friendsAPI.list(),
        friendsAPI.incomingRequests(),
      ]);
      setFriends(friendList);
      setRequests(requestList);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Could not load friends'));
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

  // Debounced user search: only call the API after the user stops typing
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        setResults(await friendsAPI.searchUsers(q));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, SEARCH_DELAY_MS);

    return () => clearTimeout(timer);
  }, [query]);

  const runAction = async (action: () => Promise<unknown>, errorText: string) => {
    try {
      await action();
      await load();
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, errorText));
    }
  };

  const sendRequest = async (user: UserSearchResult) => {
    await runAction(() => friendsAPI.sendRequest(user.id), 'Could not send request');
    setResults((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, relation: u.relation === 'REQUEST_RECEIVED' ? 'FRIEND' : 'REQUEST_SENT' } : u
      )
    );
  };

  const confirmRemove = (friend: Friend) => {
    Alert.alert('Remove friend', `Remove ${displayName(friend)} from your friends?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => runAction(() => friendsAPI.remove(friend.id), 'Could not remove friend'),
      },
    ]);
  };

  const isSearching = query.trim().length >= 2;

  const searchHeader = (
    <View style={styles.searchBox}>
      <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" />
      <TextInput
        style={styles.searchInput}
        placeholder="Find people by name or email"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      {searching && <ActivityIndicator size="small" color="#6366f1" />}
    </View>
  );

  if (isSearching) {
    return (
      <View style={styles.container}>
        {searchHeader}
        <SectionList
          sections={[{ title: 'People', data: results }]}
          keyExtractor={(item) => `user-${item.id}`}
          keyboardShouldPersistTaps="handled"
          renderSectionHeader={() => null}
          ListEmptyComponent={
            !searching ? <Text style={styles.emptySubtext}>No users found for “{query.trim()}”</Text> : null
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Avatar user={item} />
              <View style={styles.info}>
                <Text style={styles.name}>{displayName(item)}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
              <RelationButton user={item} onAdd={() => sendRequest(item)} />
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {searchHeader}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} size="large" color="#6366f1" />
      ) : (
        <SectionList
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
          stickySectionHeadersEnabled={false}
          sections={[
            { key: 'requests', title: `Friend requests (${requests.length})`, data: requests as (FriendRequest | Friend)[] },
            { key: 'friends', title: `Friends (${friends.length})`, data: friends as (FriendRequest | Friend)[] },
          ].filter((section) => section.data.length > 0)}
          keyExtractor={(item) => ('sender' in item ? `request-${item.id}` : `friend-${item.id}`)}
          renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-multiple-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No friends yet</Text>
              <Text style={styles.emptySubtext}>
                Search for people above. Their saved places will show up on your map.
              </Text>
            </View>
          }
          renderItem={({ item }) =>
            'sender' in item ? (
              <View style={styles.card}>
                <Avatar user={item.sender} />
                <View style={styles.info}>
                  <Text style={styles.name}>{displayName(item.sender)}</Text>
                  <Text style={styles.email}>wants to be your friend</Text>
                </View>
                <TouchableOpacity
                  style={[styles.roundButton, styles.accept]}
                  onPress={() => runAction(() => friendsAPI.accept(item.id), 'Could not accept request')}
                  accessibilityLabel="Accept request"
                >
                  <MaterialCommunityIcons name="check" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roundButton, styles.reject]}
                  onPress={() => runAction(() => friendsAPI.reject(item.id), 'Could not reject request')}
                  accessibilityLabel="Reject request"
                >
                  <MaterialCommunityIcons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.card} onLongPress={() => confirmRemove(item)}>
                <Avatar user={item} />
                <View style={styles.info}>
                  <Text style={styles.name}>{displayName(item)}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                </View>
                <TouchableOpacity onPress={() => confirmRemove(item)} accessibilityLabel="Remove friend">
                  <MaterialCommunityIcons name="dots-vertical" size={22} color="#9ca3af" />
                </TouchableOpacity>
              </TouchableOpacity>
            )
          }
        />
      )}
    </View>
  );
}

function RelationButton({ user, onAdd }: { user: UserSearchResult; onAdd: () => void }) {
  switch (user.relation) {
    case 'FRIEND':
      return <Text style={styles.relationText}>Friends</Text>;
    case 'REQUEST_SENT':
      return <Text style={styles.relationText}>Requested</Text>;
    case 'REQUEST_RECEIVED':
      return (
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Text style={styles.addButtonText}>Accept</Text>
        </TouchableOpacity>
      );
    default:
      return (
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <MaterialCommunityIcons name="account-plus" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  email: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  roundButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accept: {
    backgroundColor: '#10b981',
  },
  reject: {
    backgroundColor: '#ef4444',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  relationText: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 6,
  },
});
