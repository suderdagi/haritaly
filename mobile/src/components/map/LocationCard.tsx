import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@/src/theme';
import { LocationStatus } from '@/src/store/location';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';

/**
 * Explains what location is used for before the system asks (Apple HIG: give context first).
 * Its only button continues to the system prompt; there is no "not now" that skips it, because the card
 * is not in the way and the map works without location.
 */
export function LocationCard({ status, onContinue }: { status: LocationStatus; onContinue: () => void }) {
  if (status !== 'undetermined' && status !== 'denied') return null;
  const denied = status === 'denied';

  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Ionicons name="navigate" size={18} color={colors.accent} />
      </View>
      <View style={styles.text}>
        <AppText variant="headline">{denied ? 'Location is off' : 'See what’s around you'}</AppText>
        <AppText variant="footnote" tone="secondary" style={styles.body}>
          {denied
            ? 'You can still explore by moving the map or searching. Turn location on in Settings to see what’s near you.'
            : 'Haritaly uses your location only while you use the app, to center the map and sort places by distance. Friends never see it.'}
        </AppText>
        <Button
          title={denied ? 'Open Settings' : 'Continue'}
          onPress={onContinue}
          variant="tinted"
          size="sm"
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
  body: {
    marginTop: 2,
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: space.sm,
  },
});
