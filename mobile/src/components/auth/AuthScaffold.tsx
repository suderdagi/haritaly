import React from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, palette, screenPadding, shadow, space } from '@/src/theme';
import { IconName } from '@/src/lib/categories';
import { AppText } from '../ui/AppText';

const HERO_REGION = { latitude: 41.039, longitude: 28.987, latitudeDelta: 0.032, longitudeDelta: 0.03 };

// Decoration only: a hint of what the map looks like once friends start saving places
const DECOR: { latitude: number; longitude: number; icon: IconName; mine: boolean }[] = [
  { latitude: 41.0468, longitude: 28.9905, icon: 'leaf', mine: true },
  { latitude: 41.0402, longitude: 28.9712, icon: 'cafe', mine: false },
  { latitude: 41.0372, longitude: 29.0028, icon: 'restaurant', mine: false },
  { latitude: 41.0318, longitude: 28.9838, icon: 'camera', mine: true },
];

/**
 * Shared layout of the login and sign-up screens: a quiet map fading into the page,
 * the app icon, a title and the form.
 */
export function AuthScaffold({
  heroHeight = 300,
  title,
  subtitle,
  children,
}: {
  heroHeight?: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + space.xl }]}
      >
        <View style={{ height: heroHeight }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <MapView
            style={StyleSheet.absoluteFill}
            initialRegion={HERO_REGION}
            mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            showsPointsOfInterest={false}
            toolbarEnabled={false}
            liteMode
            pointerEvents="none"
          >
            {DECOR.map((m) => (
              <Marker key={m.icon} coordinate={m} tappable={false} tracksViewChanges={false}>
                <View style={[styles.marker, { backgroundColor: m.mine ? colors.markerMine : colors.markerFriend }]}>
                  <Ionicons name={m.icon} size={14} color={palette.white} />
                </View>
              </Marker>
            ))}
          </MapView>
          <LinearGradient
            colors={['rgba(247, 245, 240, 0.7)', 'rgba(247, 245, 240, 0)']}
            style={[styles.topFade, { height: insets.top + 40 }]}
          />
          <LinearGradient
            colors={['rgba(247, 245, 240, 0)', 'rgba(247, 245, 240, 0.75)', colors.background]}
            locations={[0, 0.6, 1]}
            style={styles.bottomFade}
          />
        </View>

        <View style={styles.body}>
          <Image source={require('../../../assets/icon.png')} style={styles.icon} accessibilityIgnoresInvertColors />
          <AppText variant="largeTitle" style={styles.title} accessibilityRole="header">
            {title}
          </AppText>
          <AppText variant="callout" tone="secondary" style={styles.subtitle}>
            {subtitle}
          </AppText>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const ICON = 64;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
  },
  marker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.markerRing,
    boxShadow: shadow.marker,
  },
  topFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '45%',
  },
  body: {
    marginTop: -ICON / 2 - space.md,
    paddingHorizontal: screenPadding + space.xxs,
  },
  icon: {
    width: ICON,
    height: ICON,
    borderRadius: ICON * 0.225,
    borderCurve: 'continuous',
    boxShadow: shadow.floating,
  },
  title: {
    marginTop: space.lg,
  },
  subtitle: {
    marginTop: space.xs,
    marginBottom: space.xl,
    maxWidth: 320,
  },
});

