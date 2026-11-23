import React, { useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, screenPadding, space, type } from '@/src/theme';
import { AppText } from './AppText';

/** Scroll position of a tab screen, shared by its list and its header. */
export function useScrollTitle() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const onScroll = useMemo(
    () => Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true }),
    [scrollY]
  );
  return { scrollY, onScroll };
}

const BAR_HEIGHT = 44;

/**
 * Top bar of a tab screen. At rest it is empty and the large title below it does the talking; once the
 * large title scrolls away, a small centered title and a hairline fade in, like an iOS navigation bar.
 */
export function ScreenHeader({
  title,
  scrollY,
  right,
}: {
  title: string;
  scrollY: Animated.Value;
  right?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const visible = scrollY.interpolate({ inputRange: [28, 52], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <View style={[styles.bar, { paddingTop: insets.top, height: insets.top + BAR_HEIGHT }]}>
      <Animated.View style={[styles.hairline, { opacity: visible }]} />
      <Animated.Text
        style={[type.headline, styles.compactTitle, { opacity: visible }]}
        numberOfLines={1}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        {title}
      </Animated.Text>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

/** The large title at the top of a tab screen's content. */
export function LargeTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.large}>
      <AppText variant="largeTitle" accessibilityRole="header">
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="callout" tone="secondary" style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.background,
    justifyContent: 'center',
    zIndex: 2,
  },
  hairline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
  },
  compactTitle: {
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 72,
  },
  right: {
    position: 'absolute',
    right: screenPadding - 4,
    bottom: (BAR_HEIGHT - 40) / 2,
    flexDirection: 'row',
    gap: space.xs,
  },
  large: {
    paddingHorizontal: screenPadding,
    paddingTop: space.xxs,
    paddingBottom: space.lg,
  },
  subtitle: {
    marginTop: space.xxs,
  },
});
