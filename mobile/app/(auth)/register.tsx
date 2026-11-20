import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authAPI } from '@/src/api/auth';
import { getErrorMessage } from '@/src/api/client';
import { useAuth } from '@/src/store/auth';
import { authStyles as styles } from '@/src/components/AuthForm/styles';
import { openWebPage } from '@/src/utils/openWebPage';

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { token, user } = await authAPI.register({
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
      });
      await signIn(token, user);
      router.replace('/map');
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = form.email.trim().length > 0 && form.password.length > 0 && !loading;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <MaterialCommunityIcons name="map-marker-plus" size={56} color="#6366f1" style={styles.logo} />
        <Text style={styles.title}>Create an account</Text>
        <Text style={styles.subtitle}>Save your places and share them with friends</Text>

        <View style={styles.row}>
          <TextInput style={styles.input} placeholder="First name" value={form.firstName} onChangeText={update('firstName')} />
          <TextInput style={styles.input} placeholder="Last name" value={form.lastName} onChangeText={update('lastName')} />
        </View>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={form.email}
            onChangeText={update('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder={`Password (min. ${MIN_PASSWORD_LENGTH} characters)`}
            value={form.password}
            onChangeText={update('password')}
            secureTextEntry
            autoComplete="new-password"
          />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={!canSubmit}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign up</Text>}
        </TouchableOpacity>

        {/* The terms say there is no tolerance for objectionable content (App Store guideline 1.2) */}
        <Text style={styles.legalText}>
          By signing up, you agree to the{' '}
          <Text style={styles.legalLink} onPress={() => openWebPage('/terms')}>
            Terms of Use
          </Text>{' '}
          and the{' '}
          <Text style={styles.legalLink} onPress={() => openWebPage('/privacy')}>
            Privacy Policy
          </Text>
          .
        </Text>

        <Text style={styles.switchText}>
          Already have an account?{' '}
          <Link href="/(auth)/login" replace style={styles.switchLink}>
            Log in
          </Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
