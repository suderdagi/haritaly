import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '@/src/theme';
import { IconName } from '@/src/lib/categories';
import { AppText } from './AppText';
import { Button } from './Button';

type Tint = 'accent' | 'social' | 'favorite' | 'neutral';

const tints: Record<Tint, { outer: string; inner: string; fg: string }> = {
  accent: { outer: 'rgba(177, 187, 168, 0.18)', inner: colors.accentSoft, fg: colors.accent },
  social: { outer: 'rgba(185, 179, 200, 0.20)', inner: colors.socialSoft, fg: colors.social },
  favorite: { outer: 'rgba(214, 189, 182, 0.22)', inner: colors.favoriteSoft, fg: colors.favorite },
  neutral: { outer: 'rgba(222, 219, 210, 0.35)', inner: colors.fill, fg: colors.textSecondary },
};

export interface EmptyStateProps {
  icon: IconName;
  title: string;
  message: string;
  tint?: Tint;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Empty screens get the same care as full ones: a soft medallion in the section's accent color,
 * one sentence on what belongs here and, when there is one, the action that fills it.
 */
export function EmptyState({ icon, title, message, tint = 'neutral', actionLabel, onAction, style }: EmptyStateProps) {
  const t = tints[tint];
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.halo, { backgroundColor: t.outer }]}>
        <View style={[styles.medallion, { backgroundColor: t.inner }]}>
          <Ionicons name={icon} size={30} color={t.fg} />
        </View>
      </View>
      <AppText variant="title3" align="center" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="callout" tone="secondary" align="center" style={styles.message}>
        {message}
      </AppText>
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} variant="secondary" size="md" style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: space.xxl,
    paddingVertical: space.xxxl,
  },
  halo: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  medallion: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: space.xs,
  },
  message: {
    maxWidth: 300,
  },
  action: {
    marginTop: space.lg,
  },
});
