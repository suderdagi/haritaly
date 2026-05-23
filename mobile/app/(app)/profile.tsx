import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/src/store/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
  });

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              setIsLoading(true);
              await logout();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      // TODO: Call API to update user profile
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.firstName[0]}
              {user.lastName[0]}
            </Text>
          </View>
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        {/* Edit/Save Button */}
        {!isEditing && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.firstName}
              onChangeText={(text) =>
                setFormData({ ...formData, firstName: text })
              }
              editable={isEditing}
              placeholderTextColor="#d1d5db"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.lastName}
              onChangeText={(text) =>
                setFormData({ ...formData, lastName: text })
              }
              editable={isEditing}
              placeholderTextColor="#d1d5db"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput, !isEditing && styles.inputDisabled]}
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              editable={isEditing}
              multiline
              numberOfLines={4}
              placeholder="Tell us about yourself"
              placeholderTextColor="#d1d5db"
            />
          </View>

          {isEditing && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setIsEditing(false);
                  setFormData({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    bio: user.bio || '',
                  });
                }}
              >
                <MaterialCommunityIcons name="close" size={20} color="#6366f1" />
                <Text style={[styles.buttonText, styles.cancelButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity style={styles.settingItem}>
            <MaterialCommunityIcons name="bell" size={20} color="#6366f1" />
            <Text style={styles.settingText}>Notifications</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <MaterialCommunityIcons name="shield" size={20} color="#6366f1" />
            <Text style={styles.settingText}>Privacy & Security</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <MaterialCommunityIcons name="information" size={20} color="#6366f1" />
            <Text style={styles.settingText}>About</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#d1d5db" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ef4444" />
          ) : (
            <>
              <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 28,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  editButton: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#6366f1',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  bioInput: {
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#6366f1',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonText: {
    fontWeight: '600',
    color: '#fff',
  },
  cancelButtonText: {
    color: '#6366f1',
  },
  settingItem: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  settingText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutButtonText: {
    fontWeight: '600',
    color: '#ef4444',
  },
});
