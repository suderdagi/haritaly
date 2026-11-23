import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/src/store/auth';
import { LocationProvider } from '@/src/store/location';
import { colors, type } from '@/src/theme';

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
    <LocationProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerTitleStyle: { fontSize: 17, fontWeight: type.headline.fontWeight, color: colors.text },
          // Just the chevron, the way iOS shows it in modern apps
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add-place" options={{ title: 'New place' }} />
        <Stack.Screen
          name="pick-location"
          // Full screen, so dragging the map can never be mistaken for dismissing a sheet
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />
        <Stack.Screen name="place-details" options={{ title: '' }} />
        <Stack.Screen name="friend" options={{ title: '' }} />
        <Stack.Screen name="edit-profile" options={{ title: 'Edit profile', presentation: 'modal' }} />
        <Stack.Screen name="blocked-users" options={{ title: 'Blocked people' }} />
      </Stack>
    </LocationProvider>
  );
}
