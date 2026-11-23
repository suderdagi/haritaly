import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors, screenPadding, space } from '@/src/theme';
import { useAuth } from '@/src/store/auth';
import { usersAPI } from '@/src/api/users';
import { getErrorMessage } from '@/src/api/client';
import { haptics } from '@/src/lib/haptics';
import { AppText, Avatar, TextField } from '@/src/components/ui';

/** Name and bio, in a sheet with Cancel and Save like other iOS edit screens. */
export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [saving, setSaving] = useState(false);

  const filled = useRef(!!user);
  useEffect(() => {
    if (!user || filled.current) return;
    filled.current = true;
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    setBio(user.bio ?? '');
  }, [user]);

  if (!user) return null;

  const changed =
    firstName.trim() !== (user.firstName ?? '') ||
    lastName.trim() !== (user.lastName ?? '') ||
    bio.trim() !== (user.bio ?? '');

  const save = async () => {
    setSaving(true);
    try {
      const updated = await usersAPI.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim(),
      });
      await updateUser({ ...user, ...updated });
      haptics.success();
      router.back();
    } catch (error) {
      Alert.alert('Couldn’t save your profile', getErrorMessage(error, 'Please try again.'));
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button">
              <AppText variant="body">Cancel</AppText>
            </Pressable>
          ),
          headerRight: () =>
            saving ? (
              <ActivityIndicator color={colors.textSecondary} />
            ) : (
              <Pressable onPress={save} disabled={!changed} hitSlop={10} accessibilityRole="button" accessibilityState={{ disabled: !changed }}>
                <AppText variant="headline" style={{ color: changed ? colors.accent : colors.textTertiary }}>
                  Save
                </AppText>
              </Pressable>
            ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatar}>
          <Avatar user={{ ...user, firstName: firstName || user.firstName, lastName: lastName || user.lastName }} size={88} />
          <AppText variant="footnote" tone="tertiary" style={styles.avatarNote}>
            Your initials are your picture
          </AppText>
        </View>
        <View style={styles.row}>
          <TextField label="First name" value={firstName} onChangeText={setFirstName} maxLength={50} autoComplete="given-name" containerStyle={styles.half} />
          <TextField label="Last name" value={lastName} onChangeText={setLastName} maxLength={50} autoComplete="family-name" containerStyle={styles.half} />
        </View>
        <TextField
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder="A line about you, for your friends"
          multiline
          maxLength={300}
          showCount
          containerStyle={styles.field}
        />
        <TextField label="Email" value={user.email} editable={false} hint="Your email can’t be changed." containerStyle={styles.field} style={styles.readOnly} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  avatar: {
    alignItems: 'center',
    paddingVertical: space.lg,
  },
  avatarNote: {
    marginTop: space.xs,
  },
  row: {
    flexDirection: 'row',
    gap: space.sm,
  },
  half: {
    flex: 1,
  },
  field: {
    marginTop: space.lg,
  },
  readOnly: {
    color: colors.textSecondary,
  },
});
