import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/src/store/auth';
import { colors } from '@/src/theme';

export default function Index() {
  const { isLoading, userToken } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.textSecondary} />
      </View>
    );
  }

  return <Redirect href={userToken ? '/map' : '/(auth)/login'} />;
}
