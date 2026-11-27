import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, space } from '@/src/theme';
import { IconName } from '@/src/lib/categories';
import { AppText } from './ui/AppText';
import { Button } from './ui/Button';

const POINTS: { icon: IconName; text: string }[] = [
  { icon: 'map-outline', text: 'Centers the map on you and shows how far places are.' },
  { icon: 'time-outline', text: 'Only while you use Haritaly, never in the background.' },
  { icon: 'eye-off-outline', text: 'Never shown to your friends. They only see the places you choose to save.' },
];

/**
 * Shown once, right before iOS asks for location access, so the reason comes first (Apple HIG).
 * Its only button continues to the system prompt, where the user decides; App Review rejects
 * pre-permission screens with a button that skips the prompt.
 */
export function LocationExplainer({ visible, onContinue }: { visible: boolean; onContinue: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onContinue} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal>
          <View style={styles.icon}>
            <Ionicons name="navigate" size={24} color={colors.accent} />
          </View>
          <AppText variant="title2" align="center" accessibilityRole="header">
            See what’s around you
          </AppText>
          <AppText variant="callout" tone="secondary" align="center" style={styles.lead}>
            Haritaly can use your location while the app is open.
          </AppText>

          <View style={styles.points}>
            {POINTS.map((p) => (
              <View key={p.icon} style={styles.point}>
                <View style={styles.pointIcon}>
                  <Ionicons name={p.icon} size={17} color={colors.text} />
                </View>
                <AppText variant="callout" style={styles.pointText}>
                  {p.text}
                </AppText>
              </View>
            ))}
          </View>

          <Button title="Continue" onPress={onContinue} fullWidth haptic />
          <AppText variant="footnote" tone="tertiary" align="center" style={styles.note}>
            iOS asks next. You can change your answer any time in Settings.
          </AppText>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: space.lg,
    backgroundColor: colors.scrim,
  },
  card: {
    padding: space.xl,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    boxShadow: shadow.raised,
  },
  icon: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    marginBottom: space.md,
  },
  lead: {
    marginTop: space.xs,
  },
  points: {
    gap: space.sm,
    marginVertical: space.xl,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
  },
  pointIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.fill,
  },
  pointText: {
    flex: 1,
    paddingTop: 5,
  },
  note: {
    marginTop: space.sm,
  },
});
