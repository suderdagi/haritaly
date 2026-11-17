import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { assetUrl } from '@/src/api/client';
import { initials, User } from '@/src/types';

export function Avatar({ user, size = 44 }: { user: User; size?: number }) {
  const style = { width: size, height: size, borderRadius: size / 2 };

  if (user.profilePicture) {
    return <Image source={{ uri: assetUrl(user.profilePicture) }} style={[styles.avatar, style]} />;
  }

  return (
    <View style={[styles.avatar, style]}>
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials(user)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '700',
  },
});
