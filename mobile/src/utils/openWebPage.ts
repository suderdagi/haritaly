import { Alert, Linking } from 'react-native';
import { WEB_URL } from '@/src/api/client';

/** Pages served by the backend website, required by the App Store to be reachable from the app. */
export type WebPage = '/privacy' | '/terms' | '/support';

export function openWebPage(page: WebPage) {
  Linking.openURL(WEB_URL + page).catch(() => Alert.alert('Could not open the page', WEB_URL + page));
}
