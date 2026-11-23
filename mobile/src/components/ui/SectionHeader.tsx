import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { space } from '@/src/theme';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

export interface SectionHeaderProps {
  title: string;
  /** Small count or note after the title. */
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Quiet uppercase label above a group of content. */
export function SectionHeader({ title, detail, actionLabel, onAction, style }: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]} accessibilityRole="header">
      <AppText variant="overline" tone="secondary" style={styles.title}>
        {title}
        {detail ? <AppText variant="overline" tone="tertiary">{`  ${detail}`}</AppText> : null}
      </AppText>
      {actionLabel && onAction ? (
        <PressableScale onPress={onAction} hitSlop={10} accessibilityRole="button">
          <AppText variant="subheadMedium" tone="accent">
            {actionLabel}
          </AppText>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: space.xs + 2,
    paddingHorizontal: space.xxs,
  },
  title: {
    flex: 1,
  },
});
