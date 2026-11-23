import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import { motion } from '@/src/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** How far the element shrinks while pressed. */
  scaleTo?: number;
  /** How much it dims while pressed (1 = not at all). */
  dimTo?: number;
  /** Resting opacity, for example for a disabled button. */
  baseOpacity?: number;
  children?: React.ReactNode;
}

/**
 * The tactile press used across the app: the element eases down a few percent and dims slightly
 * while the finger is on it, then springs back. Runs on the native driver.
 */
export function PressableScale({
  style,
  scaleTo = motion.pressScale,
  dimTo = 0.88,
  baseOpacity = 1,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: PressableScaleProps) {
  const progress = useRef(new Animated.Value(0)).current;

  const animate = (to: number) =>
    Animated.spring(progress, {
      toValue: to,
      useNativeDriver: true,
      speed: 40,
      bounciness: to === 0 ? 6 : 0,
    }).start();

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        animate(1);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animate(0);
        onPressOut?.(e);
      }}
      style={[
        style,
        {
          opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [baseOpacity, baseOpacity * dimTo] }),
          transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, scaleTo] }) }],
        },
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}
