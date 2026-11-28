import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chromeFontScale, colors, radius, space } from '@/src/theme';
import { IconName } from '@/src/lib/categories';
import { AppText } from './AppText';

type Tint = 'neutral' | 'accent' | 'social' | 'favorite' | 'pick';

const tints: Record<Tint, { bg: string; fg: string }> = {
  neutral: { bg: colors.fill, fg: colors.textSecondary },
  accent: { bg: colors.accentSoft, fg: colors.accent },
  social: { bg: colors.socialSoft, fg: colors.social },
  favorite: { bg: colors.favoriteSoft, fg: colors.favorite },
  pick: { bg: colors.pickSoft, fg: colors.pick },
};

/** Small non-interactive label, such as a category or "Only you". */
export function Tag({
  label,
  icon,
  tint = 'neutral',
  style,
}: {
  label: string;
  icon?: IconName;
  tint?: Tint;
  style?: StyleProp<ViewStyle>;
}) {
  const t = tints[tint];
  return (
    <View style={[styles.tag, { backgroundColor: t.bg }, style]}>
      {icon && <Ionicons name={icon} size={12} color={t.fg} />}
      <AppText variant="caption" style={{ color: t.fg }} maxFontSizeMultiplier={chromeFontScale}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.xxs,
    paddingHorizontal: space.xs,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderCurve: 'continuous',
  },
});
