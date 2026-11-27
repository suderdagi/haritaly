import React, { useEffect, useRef, useState } from 'react';
import { Animated, LayoutAnimation, ScrollView, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { chromeFontScale, colors, palette, radius, shadow, space } from '@/src/theme';
import { CATEGORIES, Category, categoryIcon, categoryLabel } from '@/src/lib/categories';
import { haptics } from '@/src/lib/haptics';
import { AppText } from '../ui/AppText';
import { PressableScale } from '../ui/PressableScale';

export type OwnerFilter = 'all' | 'mine' | 'friends';

const OWNERS: { key: OwnerFilter; label: string; dot?: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'mine', label: 'Yours', dot: colors.markerMine },
  { key: 'friends', label: 'Friends', dot: colors.markerFriend },
];

function Glass({ style, children }: { style?: object; children: React.ReactNode }) {
  return (
    <View style={[styles.glassShadow, style]}>
      <View style={styles.glass}>
        <BlurView intensity={40} tint="light" style={[StyleSheet.absoluteFill, { backgroundColor: colors.glass }]} />
        {children}
      </View>
    </View>
  );
}

/**
 * Whose places to show, as one translucent segmented control. A charcoal thumb slides to the choice.
 */
export function OwnerSwitch({ value, onChange }: { value: OwnerFilter; onChange: (value: OwnerFilter) => void }) {
  const [widths, setWidths] = useState<number[]>([0, 0, 0]);
  const index = OWNERS.findIndex((o) => o.key === value);
  const x = useRef(new Animated.Value(0)).current;
  const w = useRef(new Animated.Value(0)).current;
  const ready = widths.every((n) => n > 0);

  useEffect(() => {
    if (!ready) return;
    const left = widths.slice(0, index).reduce((a, b) => a + b, 0);
    Animated.parallel([
      Animated.spring(x, { toValue: left, useNativeDriver: false, speed: 22, bounciness: 6 }),
      Animated.spring(w, { toValue: widths[index], useNativeDriver: false, speed: 22, bounciness: 6 }),
    ]).start();
  }, [index, widths, ready, x, w]);

  return (
    <Glass>
      <View style={styles.segments} accessibilityRole="tablist">
        {ready && <Animated.View style={[styles.thumb, { left: x, width: w }]} />}
        {OWNERS.map((o, i) => {
          const selected = o.key === value;
          return (
            <PressableScale
              key={o.key}
              scaleTo={0.95}
              onPress={() => {
                if (!selected) haptics.selection();
                onChange(o.key);
              }}
              onLayout={(e) => {
                const width = e.nativeEvent.layout.width;
                setWidths((prev) => (prev[i] === width ? prev : prev.map((v, j) => (j === i ? width : v))));
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={o.key === 'all' ? 'All places' : o.key === 'mine' ? 'Your places' : "Friends' places"}
              style={styles.segment}
            >
              {o.dot && <View style={[styles.dot, { backgroundColor: o.dot }, selected && styles.dotOnDark]} />}
              <AppText
                variant="subheadMedium"
                style={{ color: selected ? colors.textInverse : colors.text }}
                maxFontSizeMultiplier={chromeFontScale}
                numberOfLines={1}
              >
                {o.label}
              </AppText>
            </PressableScale>
          );
        })}
      </View>
    </Glass>
  );
}

/**
 * Categories as round glass buttons that show only their icon; the chosen one opens up into a
 * charcoal capsule with its name. Tapping it again clears the filter.
 */
export function CategoryRail({ value, onChange }: { value: Category | null; onChange: (value: Category | null) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rail}
      style={styles.railScroll}
      accessibilityLabel="Categories"
    >
      {CATEGORIES.filter((c) => c !== 'Other').map((c) => {
        const selected = value === c;
        return (
          <PressableScale
            key={c}
            scaleTo={0.92}
            onPress={() => {
              haptics.selection();
              LayoutAnimation.configureNext(LayoutAnimation.create(180, 'easeInEaseOut', 'opacity'));
              onChange(selected ? null : c);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={categoryLabel(c)}
            style={[styles.glassShadow, styles.categoryShadow]}
          >
            <View style={[styles.category, selected && styles.categorySelected]}>
              {!selected && (
                <BlurView intensity={40} tint="light" style={[StyleSheet.absoluteFill, { backgroundColor: colors.glass }]} />
              )}
              <Ionicons name={categoryIcon(c)} size={17} color={selected ? palette.white : colors.text} />
              {selected && (
                <AppText variant="subheadMedium" style={styles.categoryLabel} maxFontSizeMultiplier={chromeFontScale} numberOfLines={1}>
                  {categoryLabel(c)}
                </AppText>
              )}
            </View>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const HEIGHT = 38;

const styles = StyleSheet.create({
  glassShadow: {
    borderRadius: radius.pill,
    boxShadow: '0px 1px 2px rgba(41, 45, 43, 0.08), 0px 4px 14px rgba(41, 45, 43, 0.10)',
  },
  glass: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(41, 45, 43, 0.10)',
  },
  segments: {
    flexDirection: 'row',
    alignItems: 'center',
    height: HEIGHT,
    padding: 3,
  },
  thumb: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    boxShadow: shadow.marker,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: HEIGHT - 6,
    paddingHorizontal: space.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOnDark: {
    borderWidth: 1.5,
    borderColor: colors.textInverse,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  railScroll: {
    overflow: 'visible',
  },
  rail: {
    gap: space.xs,
    alignItems: 'center',
    paddingRight: space.lg,
    height: HEIGHT + 6,
  },
  categoryShadow: {
    borderRadius: HEIGHT / 2,
  },
  category: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: HEIGHT,
    height: HEIGHT,
    paddingHorizontal: 10,
    borderRadius: HEIGHT / 2,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(41, 45, 43, 0.10)',
  },
  categorySelected: {
    backgroundColor: colors.primary,
    paddingHorizontal: space.sm,
    borderColor: colors.primary,
  },
  categoryLabel: {
    color: palette.white,
  },
});
