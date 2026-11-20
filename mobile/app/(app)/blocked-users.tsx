import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usersAPI } from '@/src/api/users';
import { getErrorMessage } from '@/src/api/client';
import { Avatar } from '@/src/components/Avatar/Avatar';
import { BlockedUser, displayName } from '@/src/types';

export default function BlockedUsersScreen() {
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setUsers(await usersAPI.getBlocked());
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Could not load blocked users'));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const unblock = (user: BlockedUser) => {
    Alert.alert(
      `Unblock ${displayName(user)}?`,
      'They will be able to find you and send you a friend request again. Your friendship is not restored.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              await usersAPI.unblock(user.id);
              setUsers((prev) => prev.filter((u) => u.id !== user.id));
            } catch (error) {
              Alert.alert('Error', getErrorMessage(error, 'Could not unblock this user'));
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 48 }} size="large" color="#6366f1" />;
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={users.length === 0 && styles.emptyContainer}
      data={users}
      keyExtractor={(item) => String(item.id)}
      ListEmptyComponent={
        <View style={styles.empty}>
          <MaterialCommunityIcons name="account-cancel-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No blocked users</Text>
          <Text style={styles.emptyText}>
            People you block can't see your places, send you requests or find you in search.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Avatar user={item} />
          <Text style={styles.name}>{displayName(item)}</Text>
          <TouchableOpacity style={styles.unblockButton} onPress={() => unblock(item)}>
            <Text style={styles.unblockText}>Unblock</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingTop: 12,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 6,
    textAlign: 'center',
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
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  unblockButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  unblockText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 13,
  },
});
