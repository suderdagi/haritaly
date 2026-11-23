import React, { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { space } from '@/src/theme';
import { authAPI } from '@/src/api/auth';
import { getErrorMessage } from '@/src/api/client';
import { useAuth } from '@/src/store/auth';
import { haptics } from '@/src/lib/haptics';
import { AppText, Button, PressableScale, TextField } from '@/src/components/ui';
import { AuthScaffold } from '@/src/components/auth/AuthScaffold';
import { PasswordField } from '@/src/components/auth/PasswordField';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  const login = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await authAPI.login({ email: email.trim(), password });
      await signIn(token, user);
      router.replace('/map');
    } catch (err) {
      haptics.warning();
      setError(getErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold title="Welcome back" subtitle="The places your friends love, together on one calm map.">
      <TextField
        icon="mail-outline"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        accessibilityLabel="Email"
      />
      <PasswordField
        ref={passwordRef}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={login}
        accessibilityLabel="Password"
        containerStyle={styles.gap}
      />

      {error && (
        <AppText variant="footnote" tone="danger" style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}

      <Button title="Log In" onPress={login} loading={loading} disabled={!canSubmit} fullWidth haptic style={styles.submit} />

      <View style={styles.switchRow}>
        <AppText variant="callout" tone="secondary">
          New to Haritaly?
        </AppText>
        <PressableScale onPress={() => router.replace('/(auth)/register')} hitSlop={10} accessibilityRole="link">
          <AppText variant="calloutMedium" tone="accent">
            Create an account
          </AppText>
        </PressableScale>
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  gap: {
    marginTop: space.sm,
  },
  error: {
    marginTop: space.sm,
    marginHorizontal: space.xxs,
  },
  submit: {
    marginTop: space.xl,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: space.xl,
  },
});
