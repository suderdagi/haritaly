import React from 'react';
import { StyleProp, StyleSheet, Switch, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@/src/theme';
import { IconName } from '@/src/lib/categories';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

/**
 * Grouped list, the way iOS Settings groups rows, but on paper with hairline separators that start
 * after the icon so each group reads as one object.
 */
export function ListGroup({
  children,
  style,
  separatorInset = DEFAULT_INSET,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Where separators start; defaults to just after the row icon. */
  separatorInset?: number;
}) {
  const rows = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.group, style]}>
      {rows.map((row, i) => (
        <View key={i}>
          {row}
          {i < rows.length - 1 && <View style={[styles.separator, { marginLeft: separatorInset }]} />}
        </View>
      ))}
    </View>
  );
}

type Tint = 'neutral' | 'accent' | 'social' | 'favorite' | 'danger' | 'rating';

const tints: Record<Tint, { bg: string; fg: string }> = {
  neutral: { bg: colors.fill, fg: colors.text },
  accent: { bg: colors.accentSoft, fg: colors.accent },
  social: { bg: colors.socialSoft, fg: colors.social },
  favorite: { bg: colors.favoriteSoft, fg: colors.favorite },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  rating: { bg: colors.ratingSoft, fg: colors.rating },
};

export interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  tint?: Tint;
  /** Text shown on the right, before the chevron. */
  value?: string;
  onPress?: () => void;
  /** Turns the row into a switch row. */
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  destructive?: boolean;
  /** Hide the chevron for rows that perform an action instead of opening something. */
  chevron?: boolean;
  /** Something custom on the left instead of an icon, such as an avatar. */
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  accessibilityHint?: string;
}

export function ListRow({
  title,
  subtitle,
  icon,
  tint = 'neutral',
  value,
  onPress,
  switchValue,
  onSwitchChange,
  destructive = false,
  chevron,
  leading,
  trailing,
  accessibilityHint,
}: ListRowProps) {
  const isSwitch = onSwitchChange !== undefined;
  const t = destructive ? tints.danger : tints[tint];
  const showChevron = chevron ?? (!!onPress && !isSwitch);

  const content = (
    <View style={styles.row}>
      {leading ??
        (icon ? (
          <View style={[styles.iconTile, { backgroundColor: t.bg }]}>
            <Ionicons name={icon} size={17} color={t.fg} />
          </View>
        ) : null)}
      <View style={styles.text}>
        <AppText variant="body" tone={destructive ? 'danger' : 'primary'} numberOfLines={2}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="footnote" tone="secondary" style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {value ? (
        <AppText variant="callout" tone="secondary" numberOfLines={1} style={styles.value}>
          {value}
        </AppText>
      ) : null}
      {trailing}
      {isSwitch && (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ true: colors.accent, false: colors.stone }}
          thumbColor={colors.surface}
          ios_backgroundColor={colors.stone}
          accessibilityLabel={title}
        />
      )}
      {showChevron && <Ionicons name="chevron-forward" size={17} color={colors.textTertiary} />}
    </View>
  );

  if (!onPress || isSwitch) return content;

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.99}
      dimTo={0.7}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      accessibilityHint={accessibilityHint}
    >
      {content}
    </PressableScale>
  );
}

const ICON_TILE = 30;
const DEFAULT_INSET = space.md + ICON_TILE + space.sm;

const styles = StyleSheet.create({
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 54,
    paddingHorizontal: space.md,
    paddingVertical: space.sm - 2,
  },
  iconTile: {
    width: ICON_TILE,
    height: ICON_TILE,
    borderRadius: 9,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
  subtitle: {
    marginTop: 1,
  },
  value: {
    maxWidth: '45%',
  },
});
