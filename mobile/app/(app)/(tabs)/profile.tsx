import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/src/store/auth';
import { usersAPI } from '@/src/api/users';
import { getErrorMessage } from '@/src/api/client';
import { getAppConfig } from '@/src/api/config';
import { DeleteAccountModal } from '@/src/components/DeleteAccountModal/DeleteAccountModal';
import { hasAiConsent, setAiConsent } from '@/src/utils/aiConsent';
import { openWebPage } from '@/src/utils/openWebPage';
import { displayName, initials } from '@/src/types';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function MenuRow({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={20} color="#6b7280" />
      <Text style={styles.menuLabel}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#d1d5db" />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, updateUser } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    bio: user?.bio ?? '',
  });
  const [placeCount, setPlaceCount] = React.useState<number | null>(null);
  const [aiAvailable, setAiAvailable] = React.useState(false);
  const [aiAllowed, setAiAllowed] = React.useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = React.useState(false);

  React.useEffect(() => {
    usersAPI
      .getProfile()
      .then((profile) => setPlaceCount(profile._count?.places ?? 0))
      .catch(() => setPlaceCount(null));
    getAppConfig().then((config) => setAiAvailable(config.aiSummary));
    hasAiConsent().then(setAiAllowed);
  }, []);

  const toggleAiSummaries = async (allowed: boolean) => {
    setAiAllowed(allowed);
    await setAiConsent(allowed);
  };

  const handleAccountDeleted = async () => {
    setShowDeleteAccount(false);
    await signOut();
    router.replace('/(auth)/login');
    Alert.alert('Account deleted', 'Your account and all of its data have been deleted.');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const updated = await usersAPI.updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        bio: formData.bio.trim(),
      });
      await updateUser({ ...user!, ...updated });
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to update profile'));
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
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(user)}</Text>
          </View>
          <Text style={styles.userName}>{displayName(user)}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {placeCount !== null && (
            <Text style={styles.userEmail}>
              {placeCount} saved {placeCount === 1 ? 'place' : 'places'}
            </Text>
          )}
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
                    firstName: user.firstName ?? '',
                    lastName: user.lastName ?? '',
                    bio: user.bio ?? '',
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

        {/* Privacy, safety and the legal pages the App Store requires inside the app */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & safety</Text>
          <View style={styles.menu}>
            <MenuRow icon="account-cancel-outline" label="Blocked users" onPress={() => router.push('/blocked-users')} />
            {aiAvailable && (
              <View style={styles.menuRow}>
                <MaterialCommunityIcons name="creation" size={20} color="#6b7280" />
                <View style={styles.menuLabelGroup}>
                  <Text style={styles.menuText}>AI summaries</Text>
                  <Text style={styles.menuHint}>Allow sending saved notes to OpenAI</Text>
                </View>
                <Switch value={aiAllowed} onValueChange={toggleAiSummaries} />
              </View>
            )}
            <MenuRow icon="shield-lock-outline" label="Privacy Policy" onPress={() => openWebPage('/privacy')} />
            <MenuRow icon="file-document-outline" label="Terms of Use" onPress={() => openWebPage('/terms')} />
            <MenuRow icon="lifebuoy" label="Help & Support" onPress={() => openWebPage('/support')} />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteAccountButton} onPress={() => setShowDeleteAccount(true)}>
          <Text style={styles.deleteAccountText}>Delete account</Text>
        </TouchableOpacity>
      </ScrollView>

      <DeleteAccountModal
        visible={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
        onDeleted={handleAccountDeleted}
      />
    </View>
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
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutButtonText: {
    fontWeight: '600',
    color: '#ef4444',
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  menuLabelGroup: {
    flex: 1,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
  },
  menuText: {
    fontSize: 15,
    color: '#1f2937',
  },
  menuHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  deleteAccountButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 24,
  },
  deleteAccountText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
});
