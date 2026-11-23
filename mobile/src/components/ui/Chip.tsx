import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { chromeFontScale, colors, radius, space } from '@/src/theme';
import { IconName } from '@/src/lib/categories';
import { haptics } from '@/src/lib/haptics';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  /** Small colored dot before the label, used by the map's owner filters. */
  dotColor?: string;
  /** Translucent version for use on top of the map. */
  glass?: boolean;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

/** Selectable capsule. Selected chips turn charcoal, so the current choice reads at a glance. */
export function Chip({ label, selected = false, onPress, icon, dotColor, glass = false, size = 'md', style }: ChipProps) {
  const fg = selected ? colors.textInverse : colors.text;
  const height = size === 'sm' ? 32 : 36;

  return (
    <PressableScale
      onPress={() => {
        haptics.selection();
        onPress?.();
      }}
      scaleTo={0.95}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[styles.shadowWrap, glass && !selected && styles.glassShadow, style]}
    >
      <View
        style={[
          styles.chip,
          { height, paddingHorizontal: size === 'sm' ? space.sm : space.sm + 2 },
          selected ? styles.selected : glass ? styles.glass : styles.plain,
        ]}
      >
        {glass && !selected && (
          <BlurView intensity={40} tint="light" style={[StyleSheet.absoluteFill, { backgroundColor: colors.glass }]} />
        )}
        {dotColor && <View style={[styles.dot, { backgroundColor: dotColor }, selected && styles.dotSelected]} />}
        {icon && <Ionicons name={icon} size={size === 'sm' ? 14 : 15} color={fg} />}
        <AppText
          variant={size === 'sm' ? 'footnote' : 'subheadMedium'}
          style={[{ color: fg }, size === 'sm' && styles.smallLabel]}
          numberOfLines={1}
          maxFontSizeMultiplier={chromeFontScale}
        >
          {label}
        </AppText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: radius.pill,
  },
  glassShadow: {
    boxShadow: '0px 1px 2px rgba(41, 45, 43, 0.08), 0px 4px 14px rgba(41, 45, 43, 0.10)',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  plain: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stone,
  },
  glass: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(41, 45, 43, 0.10)',
  },
  selected: {
    backgroundColor: colors.primary,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotSelected: {
    borderWidth: 1.5,
    borderColor: colors.textInverse,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  smallLabel: {
    fontWeight: '500',
  },
});
