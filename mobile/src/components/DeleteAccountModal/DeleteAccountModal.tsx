import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { usersAPI } from '@/src/api/users';
import { getErrorMessage } from '@/src/api/client';

interface Props {
  visible: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

/**
 * Asks for the password before deleting the account for good.
 * A custom modal instead of Alert.prompt, which only exists on iOS.
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

  const handleDelete = async () => {
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
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.dialog}>
          <Text style={styles.title}>Delete account</Text>
          <Text style={styles.text}>
            This permanently deletes your account and everything in it: your places, photos, favorites and
            friendships. It cannot be undone.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            autoFocus
          />
          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={close} disabled={deleting}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.delete, (!password || deleting) && styles.disabled]}
              onPress={handleDelete}
              disabled={!password || deleting}
            >
              {deleting ? <ActivityIndicator color="#fff" /> : <Text style={styles.deleteText}>Delete</Text>}
            </TouchableOpacity>
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
    padding: 24,
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  text: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  error: {
    color: '#ef4444',
    marginTop: 8,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  cancel: {
    backgroundColor: '#f3f4f6',
  },
  cancelText: {
    fontWeight: '600',
    color: '#374151',
  },
  delete: {
    backgroundColor: '#ef4444',
  },
  deleteText: {
    fontWeight: '700',
    color: '#fff',
  },
  disabled: {
    opacity: 0.5,
  },
});
