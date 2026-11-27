import AsyncStorage from '@react-native-async-storage/async-storage';

export type Visibility = 'friends' | 'private';

const DEFAULT_VISIBILITY_KEY = 'defaultPlaceVisibility';

/** Who sees a new place unless the user picks otherwise while saving it. Kept on this device. */
export async function getDefaultVisibility(): Promise<Visibility> {
  return (await AsyncStorage.getItem(DEFAULT_VISIBILITY_KEY)) === 'private' ? 'private' : 'friends';
}

export async function setDefaultVisibility(value: Visibility): Promise<void> {
  await AsyncStorage.setItem(DEFAULT_VISIBILITY_KEY, value);
}
