import React from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, screenPadding, shadow, space } from '@/src/theme';
import { IconName } from '@/src/lib/categories';
import { AppText } from '../ui/AppText';
import { MARKER_BOX, MarkerArt, MarkerKind, TIP_Y } from '../map/MarkerArt';

// The illustration is drawn at 1179 × 780 (393 × 260 pt at 3x). Its top 40 pt fade in and sit under
// the status bar, its bottom fades into the page. Markers are placed in fractions of it, by their tips.
const HERO_RATIO = 780 / 1179;
const HERO_BLEED = 40 / 260;
const FRIEND = { id: 2, email: 'friend@haritaly.app', firstName: 'Ada', lastName: 'Kaya', profilePicture: null };

const MARKERS: { x: number; y: number; kind: MarkerKind; icon: IconName; people?: number; friend?: typeof FRIEND }[] = [
  // The two ends of the dotted route in the illustration (see assets/source/login-hero.svg)
  { x: 0.24, y: 0.5, kind: 'mine', icon: 'leaf' },
  { x: 0.7, y: 0.76, kind: 'friend', icon: 'cafe', friend: FRIEND },
  { x: 0.84, y: 0.44, kind: 'friend', icon: 'restaurant', people: 2 },
];

/**
 * Shared layout of the sign-in and sign-up screens: an illustrated map (contour lines, a route
 * between your place and a friend's) that fades into the page, the app icon, a title and the form.
 * It is a drawing, not a live map, so no map provider is involved before the user signs in.
 * The markers always sit below the status bar; only the faded top of the drawing goes under it.
 */
export function AuthScaffold({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const drawingHeight = width * HERO_RATIO;
  const bleed = drawingHeight * HERO_BLEED;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + space.xl }]}
      >
        <View
          style={{ height: insets.top + drawingHeight - bleed, overflow: 'hidden' }}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <View style={{ position: 'absolute', left: 0, right: 0, top: insets.top - bleed, height: drawingHeight }}>
            <Image source={require('../../../assets/login-hero.png')} style={{ width, height: drawingHeight }} />
            {MARKERS.map((m) => (
              <View
                key={m.icon}
                style={{ position: 'absolute', left: m.x * width - MARKER_BOX.width / 2, top: m.y * drawingHeight - TIP_Y }}
              >
                <MarkerArt kind={m.kind} icon={m.icon} friend={m.friend} people={m.people} />
              </View>
            ))}
          </View>
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
  body: {
    marginTop: -ICON / 2,
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
