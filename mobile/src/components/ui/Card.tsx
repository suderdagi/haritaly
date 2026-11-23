import React from 'react';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { colors, radius, shadow, space } from '@/src/theme';

export interface CardProps extends ViewProps {
  /** Inner padding; cards that hold list rows set this to 0. */
  padding?: number;
  /** Cards on the ivory background are flat with a hairline; `raised` adds a soft shadow. */
  raised?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** The basic content surface: paper on ivory, a hairline edge, continuous corners. */
export function Card({ padding = space.md, raised = false, style, ...rest }: CardProps) {
  return <View {...rest} style={[styles.card, { padding }, raised && styles.raised, style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  raised: {
    boxShadow: shadow.card,
  },
});
