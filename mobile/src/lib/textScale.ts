import { useWindowDimensions } from 'react-native';

/**
 * True when the user has chosen one of the largest text sizes (Settings › Display & Brightness › Text Size,
 * or the larger accessibility sizes). Layouts that place text side by side use it to stack instead.
 */
export function useLargeText(threshold = 1.3) {
  return useWindowDimensions().fontScale >= threshold;
}
