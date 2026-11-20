import { Alert } from 'react-native';
import { getErrorMessage } from '@/src/api/client';
import { placesAPI } from '@/src/api/places';
import { usersAPI } from '@/src/api/users';
import { displayName, ReportReason, User } from '@/src/types';
import { chooseOption } from './chooseOption';

/**
 * Report and block flows, shared by the place and friends screens.
 * The App Store requires apps with user content to offer both.
 */

export function confirmBlock(user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>, onBlocked: () => void) {
  Alert.alert(
    `Block ${displayName(user)}?`,
    "You will stop being friends, and you won't see each other's places or find each other in search. You can unblock them later in Profile.",
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          try {
            await usersAPI.block(user.id);
            onBlocked();
          } catch (error) {
            Alert.alert('Error', getErrorMessage(error, 'Could not block this user'));
          }
        },
      },
    ]
  );
}

export function reportPlace(placeId: number) {
  const send = async (reason: ReportReason) => {
    try {
      await placesAPI.reportPlace(placeId, reason);
      Alert.alert('Thanks for reporting', 'We review reports within 24 hours and remove content that breaks our rules.');
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Could not send the report'));
    }
  };

  chooseOption(
    'Report this place',
    [
      { label: 'Offensive or inappropriate', onPress: () => send('INAPPROPRIATE') },
      { label: 'Spam or misleading', onPress: () => send('SPAM') },
      { label: 'Something else', onPress: () => send('OTHER') },
    ],
    'Why are you reporting it?'
  );
}
