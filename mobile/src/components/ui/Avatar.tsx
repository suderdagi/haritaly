import React from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { assetUrl } from '@/src/api/client';
import { palette } from '@/src/theme';
import { initials, User } from '@/src/types';
import { AppText } from './AppText';

/** Pastel backgrounds with a deep version of the same hue for the initials. */
const TINTS = [
  { bg: palette.sageSoft, fg: palette.eucalyptusDeep },
  { bg: palette.lavenderSoft, fg: palette.lavenderDeep },
  { bg: palette.roseSoft, fg: palette.roseDeep },
  { bg: palette.champagneSoft, fg: palette.champagneDeep },
  { bg: palette.stone, fg: palette.graphite },
];

/** The same person always gets the same color. */
function tintFor(user: Pick<User, 'id' | 'email'>) {
  const key = user.id ?? [...user.email].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return TINTS[Math.abs(key) % TINTS.length];
}

type AvatarUser = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'profilePicture'>;

export interface AvatarProps {
  user: AvatarUser;
  size?: number;
  /** Ring in the background color, for avatars that overlap each other or sit on photos. */
  ring?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ user, size = 44, ring = false, style }: AvatarProps) {
  const tint = tintFor(user);
  const shape = { width: size, height: size, borderRadius: size / 2 };
  const ringStyle = ring && { borderWidth: Math.max(2, size * 0.06), borderColor: palette.paper };

  if (user.profilePicture) {
    return (
      <Image
        source={{ uri: assetUrl(user.profilePicture) }}
        style={[shape, ringStyle, style as object]}
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View style={[styles.avatar, shape, { backgroundColor: tint.bg }, ringStyle, style]} accessible={false}>
      <AppText
        style={{ color: tint.fg, fontSize: size * 0.36, lineHeight: size * 0.44, fontWeight: '600', letterSpacing: 0.3 }}
        maxFontSizeMultiplier={1}
      >
        {initials(user)}
      </AppText>
    </View>
  );
}

/** Two or three overlapping avatars, for "saved by several friends". */
export function AvatarStack({ users, size = 24, max = 3 }: { users: AvatarUser[]; size?: number; max?: number }) {
  const shown = users.slice(0, max);
  return (
    <View style={styles.stack}>
      {shown.map((u, i) => (
        <Avatar key={u.id ?? u.email} user={u} size={size} ring style={i > 0 && { marginLeft: -size * 0.32 }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
