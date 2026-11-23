import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '@/src/theme';
import { IconName } from '@/src/lib/categories';
import { PressableScale } from './PressableScale';

type Variant = 'filled' | 'glass' | 'plain' | 'primary';

export interface IconButtonProps {
  icon: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  variant?: Variant;
  size?: number;
  iconSize?: number;
  color?: string;
  /** Background of the `filled` variant, for example a soft rose when a favorite is on. */
  background?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Round icon-only button. `glass` is the translucent version used on top of the map, where a solid
 * surface would hide too much of what is underneath.
 */
export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'filled',
  size = 40,
  iconSize,
  color,
  background,
  disabled,
  style,
}: IconButtonProps) {
  const fg = color ?? (variant === 'primary' ? colors.textInverse : colors.text);
  const glyph = iconSize ?? Math.round(size * 0.48);

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      scaleTo={0.92}
      hitSlop={size < 44 ? (44 - size) / 2 : undefined}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        { width: size, height: size, borderRadius: size / 2 },
        variant === 'glass' && styles.glassShadow,
        style,
      ]}
    >
      <View
        style={[
          styles.inner,
          { borderRadius: size / 2 },
          variant === 'filled' && { backgroundColor: background ?? colors.fill },
          variant === 'primary' && { backgroundColor: colors.primary },
          variant === 'glass' && styles.glassBorder,
          disabled && { opacity: 0.4 },
        ]}
      >
        {variant === 'glass' && (
          <BlurView intensity={40} tint="light" style={[StyleSheet.absoluteFill, { backgroundColor: colors.glass }]} />
        )}
        <Ionicons name={icon} size={glyph} color={fg} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glassBorder: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(41, 45, 43, 0.10)',
  },
  glassShadow: {
    boxShadow: shadow.floating,
    borderRadius: radius.pill,
  },
});
