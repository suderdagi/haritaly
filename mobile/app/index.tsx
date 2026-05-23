import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/store/auth';

export default function SplashScreen() {
  const router = useRouter();
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Redirect to app map screen (authenticated or not)
      router.replace('/(app)/map');
    }
  }, [isLoading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}
