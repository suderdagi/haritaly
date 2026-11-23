import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, space } from '@/src/theme';
import { usersAPI } from '@/src/api/users';
import { getErrorMessage } from '@/src/api/client';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { PasswordField } from '../auth/PasswordField';

interface Props {
  visible: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

/**
 * Asks for the password before deleting the account for good (App Store guideline 5.1.1(v): deletion
 * must be possible inside the app). A custom dialog because Alert.prompt only exists on iOS.
 */
export function DeleteAccountModal({ visible, onClose, onDeleted }: Props) {
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setPassword('');
    setError(null);
    onClose();
  };

  const remove = async () => {
    setDeleting(true);
    setError(null);
    try {
      await usersAPI.deleteAccount(password);
      setPassword('');
      onDeleted();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete your account'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.dialog} accessibilityViewIsModal>
          <View style={styles.icon}>
            <Ionicons name="trash-outline" size={22} color={colors.danger} />
          </View>
          <AppText variant="title3" align="center" accessibilityRole="header">
            Delete your account?
          </AppText>
          <AppText variant="callout" tone="secondary" align="center" style={styles.text}>
            This permanently deletes your account and everything in it: your places, photos, favorites and
            friendships. It can’t be undone.
          </AppText>

          <PasswordField
            placeholder="Enter your password to confirm"
            value={password}
            onChangeText={setPassword}
            autoComplete="current-password"
            autoFocus
            error={error}
            accessibilityLabel="Password"
          />

          <View style={styles.buttons}>
            <Button title="Cancel" variant="secondary" size="md" onPress={close} disabled={deleting} style={styles.button} />
            <Button
              title="Delete"
              variant="destructive"
              size="md"
              onPress={remove}
              loading={deleting}
              disabled={!password}
              style={styles.button}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: space.xl,
    backgroundColor: colors.scrim,
  },
  dialog: {
    padding: space.xl,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    boxShadow: shadow.raised,
  },
  icon: {
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerSoft,
    marginBottom: space.md,
  },
  text: {
    marginTop: space.xs,
    marginBottom: space.lg,
  },
  buttons: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.lg,
  },
  button: {
    flex: 1,
  },
});
