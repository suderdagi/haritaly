import React, { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { space } from '@/src/theme';
import { authAPI } from '@/src/api/auth';
import { getErrorMessage } from '@/src/api/client';
import { useAuth } from '@/src/store/auth';
import { haptics } from '@/src/lib/haptics';
import { openWebPage } from '@/src/utils/openWebPage';
import { AppText, Button, PressableScale, TextField } from '@/src/components/ui';
import { AuthScaffold } from '@/src/components/auth/AuthScaffold';
import { PasswordField } from '@/src/components/auth/PasswordField';

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof typeof form) => (value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  const canSubmit = form.email.trim().length > 0 && form.password.length > 0 && !loading;

  const register = async () => {
    if (!canSubmit) return;
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      haptics.warning();
      setError(`Your password needs at least ${MIN_PASSWORD_LENGTH} characters.`);
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
      haptics.success();
      router.replace('/map');
    } catch (err) {
      haptics.warning();
      setError(getErrorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold
      title="Create your account"
      subtitle="Save the places you love and see the ones your friends recommend."
    >
      <View style={styles.row}>
        <TextField
          placeholder="First name"
          value={form.firstName}
          onChangeText={update('firstName')}
          autoComplete="given-name"
          textContentType="givenName"
          returnKeyType="next"
          onSubmitEditing={() => lastNameRef.current?.focus()}
          containerStyle={styles.half}
          maxLength={50}
        />
        <TextField
          ref={lastNameRef}
          placeholder="Last name"
          value={form.lastName}
          onChangeText={update('lastName')}
          autoComplete="family-name"
          textContentType="familyName"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          containerStyle={styles.half}
          maxLength={50}
        />
      </View>
      <TextField
        ref={emailRef}
        icon="mail-outline"
        placeholder="Email"
        value={form.email}
        onChangeText={update('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        containerStyle={styles.gap}
        accessibilityLabel="Email"
      />
      <PasswordField
        ref={passwordRef}
        placeholder="Password"
        value={form.password}
        onChangeText={update('password')}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={register}
        hint={`At least ${MIN_PASSWORD_LENGTH} characters`}
        containerStyle={styles.gap}
        accessibilityLabel="Password"
      />

      {error && (
        <AppText variant="footnote" tone="danger" style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}

      <Button title="Create Account" onPress={register} loading={loading} disabled={!canSubmit} fullWidth haptic style={styles.submit} />

      {/* The terms say there is no tolerance for objectionable content (App Store guideline 1.2) */}
      <AppText variant="footnote" tone="secondary" align="center" style={styles.legal}>
        By creating an account you agree to the{' '}
        <AppText variant="footnote" tone="accent" style={styles.link} onPress={() => openWebPage('/terms')} accessibilityRole="link">
          Terms of Use
        </AppText>{' '}
        and the{' '}
        <AppText variant="footnote" tone="accent" style={styles.link} onPress={() => openWebPage('/privacy')} accessibilityRole="link">
          Privacy Policy
        </AppText>
        .
      </AppText>

      <View style={styles.switchRow}>
        <AppText variant="callout" tone="secondary">
          Already have an account?
        </AppText>
        <PressableScale onPress={() => router.replace('/(auth)/login')} hitSlop={10} accessibilityRole="link">
          <AppText variant="calloutMedium" tone="accent">
            Log in
          </AppText>
        </PressableScale>
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.sm,
  },
  half: {
    flex: 1,
  },
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
  link: {
    textDecorationLine: 'underline',
  },
  legal: {
    marginTop: space.md,
    paddingHorizontal: space.md,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: space.xl,
  },
});
