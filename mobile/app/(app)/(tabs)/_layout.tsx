import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { chromeFontScale, colors } from '@/src/theme';
import { IconName } from '@/src/lib/categories';

const tabIcon =
  (active: IconName, inactive: IconName) =>
  ({ focused, color }: { focused: boolean; color: string }) => (
    <Ionicons name={focused ? active : inactive} size={24} color={color} />
  );

// Labels grow with Dynamic Type, but only so far that the bar keeps its shape
const tabLabel = ({ color, children }: { color: string; children: string }) => (
  <Text style={{ color, fontSize: 10, fontWeight: '600', letterSpacing: 0.2 }} maxFontSizeMultiplier={chromeFontScale}>
    {children}
  </Text>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        // Each tab draws its own large-title header; the map is full screen
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabel: tabLabel,
        // No custom padding or height: the defaults keep the bar clear of the home indicator
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.hairline,
          borderTopWidth: 0.5,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: tabIcon('map', 'map-outline') }} />
      <Tabs.Screen name="friends" options={{ title: 'Friends', tabBarIcon: tabIcon('people', 'people-outline') }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favorites', tabBarIcon: tabIcon('heart', 'heart-outline') }} />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: tabIcon('person-circle', 'person-circle-outline') }}
      />
    </Tabs>
  );
}
