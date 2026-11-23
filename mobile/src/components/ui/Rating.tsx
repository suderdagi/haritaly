import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '@/src/theme';
import { formatRating } from '@/src/lib/format';
import { haptics } from '@/src/lib/haptics';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

/** Read-only stars with half steps, followed by the number. */
export function RatingStars({
  value,
  size = 14,
  showValue = true,
}: {
  value?: number | string | null;
  size?: number;
  showValue?: boolean;
}) {
  const rating = Number(value ?? 0);
  const label = formatRating(rating);
  if (!label) return null;

  return (
    <View style={styles.row} accessible accessibilityLabel={`Rated ${label} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={rating >= i ? 'star' : rating >= i - 0.5 ? 'star-half' : 'star-outline'}
          size={size}
          color={colors.rating}
        />
      ))}
      {showValue && (
        <AppText variant="footnote" tone="secondary" style={styles.value}>
          {label}
        </AppText>
      )}
    </View>
  );
}

const LABELS = ['', 'Not for me', 'It was fine', 'Good', 'Really good', 'A favorite'];

/** Tap a star to rate; tap the same star again to clear the rating. */
export function RatingInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const rounded = Math.round(value);
  return (
    <View>
      <View
        style={styles.inputRow}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Rating"
        accessibilityValue={{ min: 0, max: 5, now: rounded, text: rounded ? `${rounded} of 5` : 'No rating' }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'increment') onChange(Math.min(5, rounded + 1));
          if (e.nativeEvent.actionName === 'decrement') onChange(Math.max(0, rounded - 1));
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <PressableScale
            key={i}
            scaleTo={0.85}
            hitSlop={4}
            onPress={() => {
              haptics.selection();
              onChange(rounded === i ? 0 : i);
            }}
          >
            <Ionicons
              name={rounded >= i ? 'star' : 'star-outline'}
              size={34}
              color={rounded >= i ? colors.rating : colors.textTertiary}
            />
          </PressableScale>
        ))}
      </View>
      <AppText variant="footnote" tone={rounded ? 'secondary' : 'tertiary'} style={styles.caption}>
        {rounded ? LABELS[rounded] : 'Tap a star to rate'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  value: {
    marginLeft: space.xxs + 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: space.xs,
  },
  caption: {
    marginTop: space.xs,
  },
});
