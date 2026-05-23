import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Friend } from '@/src/types';

export default function FriendsScreen() {
  const [friends, setFriends] = React.useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = React.useState<Friend[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // TODO: Fetch friends list and pending requests from API
  }, []);

  const handleAddFriend = () => {
    // TODO: Navigate to add friend screen
  };

  const handleAcceptRequest = (friendId: number) => {
    // TODO: Call API to accept friend request
  };

  const handleRejectRequest = (friendId: number) => {
    // TODO: Call API to reject friend request
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && <ActivityIndicator size="large" color="#6366f1" />}

      {pendingRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Friend Requests</Text>
          <FlatList
            data={pendingRequests}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.requestCard}>
                <View style={styles.requestInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {item.firstName[0]}
                      {item.lastName?.[0]}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.friendName}>
                      {item.firstName} {item.lastName}
                    </Text>
                    <Text style={styles.friendEmail}>{item.email}</Text>
                  </View>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.button, styles.acceptButton]}
                    onPress={() => handleAcceptRequest(item.id)}
                  >
                    <MaterialCommunityIcons name="check" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onPress={() => handleRejectRequest(item.id)}
                  >
                    <MaterialCommunityIcons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            scrollEnabled={false}
          />
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Friends</Text>
          <TouchableOpacity onPress={handleAddFriend}>
            <MaterialCommunityIcons name="plus" size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>

        {friends.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="account-multiple-outline"
              size={48}
              color="#d1d5db"
            />
            <Text style={styles.emptyText}>No friends yet</Text>
            <Text style={styles.emptySubtext}>Add friends to see their places on the map</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddFriend}>
              <Text style={styles.emptyButtonText}>Add Friend</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={friends}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.friendCard}>
                <View style={styles.friendInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {item.firstName[0]}
                      {item.lastName?.[0]}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.friendName}>
                      {item.firstName} {item.lastName}
                    </Text>
                    <Text style={styles.friendEmail}>{item.email}</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
              </View>
            )}
            scrollEnabled={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  requestCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  friendCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  friendEmail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#6366f1',
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
