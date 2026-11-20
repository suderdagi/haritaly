import AsyncStorage from '@react-native-async-storage/async-storage';

// Apple guideline 5.1.2(i): ask before personal data is sent to a third-party AI service.
// The answer is remembered on this device and can be changed in Profile.
const AI_CONSENT_KEY = 'aiSummaryConsent';

export async function hasAiConsent(): Promise<boolean> {
  return (await AsyncStorage.getItem(AI_CONSENT_KEY)) === 'granted';
}

export async function setAiConsent(granted: boolean): Promise<void> {
  if (granted) await AsyncStorage.setItem(AI_CONSENT_KEY, 'granted');
  else await AsyncStorage.removeItem(AI_CONSENT_KEY);
}

export const AI_CONSENT_MESSAGE =
  'To write this summary, Haritaly sends the ratings, notes and favorite food and drinks that you and your friends saved for this place to OpenAI. Names, email addresses and photos are not sent.';
