import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, space } from '@/src/theme';

/** A softly breathing placeholder block, shown while content loads. */
export function Skeleton({ width, height, round = false, style }: {
  width: number | `${number}%`;
  height: number;
  round?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width,
          height,
          borderRadius: round ? height / 2 : radius.xs,
          backgroundColor: colors.stone,
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
        },
        style,
      ]}
    />
  );
}

/** Placeholder for a list row with an avatar or icon and two lines of text. */
export function SkeletonRow({ avatar = 44 }: { avatar?: number }) {
  return (
    <View style={styles.row}>
      <Skeleton width={avatar} height={avatar} round />
      <View style={styles.lines}>
        <Skeleton width="55%" height={13} />
        <Skeleton width="35%" height={11} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  lines: {
    flex: 1,
    gap: space.xs,
  },
});
