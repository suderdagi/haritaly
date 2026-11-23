import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, iconSize, radius, space } from '@/src/theme';
import { haptics } from '@/src/lib/haptics';
import { IconName } from '@/src/lib/categories';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

type Variant = 'primary' | 'secondary' | 'tinted' | 'ghost' | 'destructive';
type Size = 'lg' | 'md' | 'sm';

const variantStyle: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.primary, fg: colors.textInverse },
  secondary: { bg: colors.fill, fg: colors.text },
  tinted: { bg: colors.accentSoft, fg: colors.accent },
  ghost: { bg: 'transparent', fg: colors.accent },
  destructive: { bg: colors.dangerSoft, fg: colors.danger },
};

const sizeStyle: Record<Size, { height: number; paddingX: number; radius: number; icon: number }> = {
  lg: { height: 54, paddingX: space.xl, radius: radius.md + 2, icon: iconSize.md },
  md: { height: 44, paddingX: space.lg, radius: radius.md - 2, icon: iconSize.sm + 2 },
  sm: { height: 34, paddingX: space.sm + 2, radius: radius.pill, icon: iconSize.sm },
};

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Light haptic on press, for the main action of a screen. */
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  haptic = false,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const v = variantStyle[variant];
  const s = sizeStyle[size];
  const inactive = disabled || loading;

  return (
    <PressableScale
      onPress={() => {
        if (haptic) haptics.tap();
        onPress?.();
      }}
      disabled={inactive}
      baseOpacity={disabled && !loading ? 0.38 : 1}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={[
        styles.base,
        {
          minHeight: s.height,
          paddingHorizontal: s.paddingX,
          borderRadius: s.radius,
          backgroundColor: v.bg,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={s.icon} color={v.fg} />}
          <AppText
            variant={size === 'sm' ? 'subheadMedium' : 'headline'}
            style={{ color: v.fg }}
            numberOfLines={1}
            maxFontSizeMultiplier={1.6}
          >
            {title}
          </AppText>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
});
