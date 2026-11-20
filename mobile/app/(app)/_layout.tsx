import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/src/store/auth';

/**
 * Signed-in area: the tab bar plus screens pushed on top of it.
 * Detail screens live in this stack (not in the tabs) so they get a back button and swipe-back,
 * and start with fresh state every time they open.
 */
export default function AppLayout() {
  const { userToken, isLoading } = useAuth();

  // Every screen in this group needs a logged-in user
  if (!isLoading && !userToken) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerTintColor: '#1f2937',
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-place" options={{ title: 'Add Place' }} />
      <Stack.Screen name="place-details" options={{ title: 'Place' }} />
    </Stack>
  );
}
