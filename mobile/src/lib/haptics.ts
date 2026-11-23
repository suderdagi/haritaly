import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Light tactile feedback, used sparingly: confirming a choice, selecting something on the map,
 * and the result of an important action. Never for plain navigation.
 * Failures are ignored, haptics are a nicety.
 */
const run = (fn: () => Promise<void>) => {
  if (Platform.OS === 'web') return;
  fn().catch(() => {});
};

export const haptics = {
  /** A chip, star or marker was selected */
  selection: () => run(() => Haptics.selectionAsync()),
  /** A primary button was pressed */
  tap: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
};
