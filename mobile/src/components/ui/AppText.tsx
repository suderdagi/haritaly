import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { colors, type, TypeVariant } from '@/src/theme';

type Tone = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'accent' | 'social' | 'danger' | 'favorite';

const toneColor: Record<Tone, string> = {
  primary: colors.text,
  secondary: colors.textSecondary,
  tertiary: colors.textTertiary,
  inverse: colors.textInverse,
  accent: colors.accent,
  social: colors.social,
  danger: colors.danger,
  favorite: colors.favorite,
};

export interface AppTextProps extends TextProps {
  variant?: TypeVariant;
  tone?: Tone;
  align?: 'left' | 'center' | 'right';
}

/** Every piece of text in the app goes through this, so the type scale stays consistent. */
export function AppText({ variant = 'body', tone = 'primary', align, style, ...rest }: AppTextProps) {
  return (
    <Text
      {...rest}
      style={[type[variant], { color: toneColor[tone] }, align && { textAlign: align }, styles.base, style]}
    />
  );
}

const styles = StyleSheet.create({
  // Keeps Android from adding extra space above and below the text
  base: { includeFontPadding: false },
});
