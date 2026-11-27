import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@/src/theme';
import { IconName } from '@/src/lib/categories';
import { haptics } from '@/src/lib/haptics';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

/** Two or three mutually exclusive choices, like iOS's segmented control. Grows with Dynamic Type. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}) {
  return (
    <View style={styles.track} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <PressableScale
            key={o.value}
            onPress={() => {
              if (!selected) haptics.selection();
              onChange(o.value);
            }}
            scaleTo={0.97}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            style={[styles.item, selected && styles.selected]}
          >
            {o.icon && <Ionicons name={o.icon} size={16} color={selected ? colors.text : colors.textSecondary} />}
            <AppText variant="subheadMedium" tone={selected ? 'primary' : 'secondary'} numberOfLines={1}>
              {o.label}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    backgroundColor: colors.fill,
  },
  item: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: space.xs,
    paddingVertical: space.xs,
    borderRadius: radius.md - 3,
    borderCurve: 'continuous',
  },
  selected: {
    backgroundColor: colors.surface,
    boxShadow: '0px 1px 3px rgba(41, 45, 43, 0.12)',
  },
});
