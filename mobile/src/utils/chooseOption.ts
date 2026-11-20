import { ActionSheetIOS, Alert, Platform } from 'react-native';

export interface Option {
  label: string;
  destructive?: boolean;
  onPress: () => void;
}

/**
 * Lets the user pick one of a few actions: a native action sheet on iOS, an alert on Android.
 * Android alerts show at most three buttons, so only the first two options fit next to Cancel there.
 */
export function chooseOption(title: string, options: Option[], message?: string) {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        message,
        options: [...options.map((o) => o.label), 'Cancel'],
        cancelButtonIndex: options.length,
        destructiveButtonIndex: options.flatMap((o, i) => (o.destructive ? [i] : [])),
      },
      (index) => options[index]?.onPress()
    );
    return;
  }

  Alert.alert(title, message, [
    ...options.slice(0, 2).map((o) => ({
      text: o.label,
      style: o.destructive ? ('destructive' as const) : ('default' as const),
      onPress: o.onPress,
    })),
    { text: 'Cancel', style: 'cancel' as const },
  ]);
}
