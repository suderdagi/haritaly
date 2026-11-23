import React, { forwardRef, useState } from 'react';
import { TextInput } from 'react-native';
import { colors } from '@/src/theme';
import { IconButton } from '../ui/IconButton';
import { TextField, TextFieldProps } from '../ui/TextField';

/** Password input with a button to show what was typed. */
export const PasswordField = forwardRef<TextInput, TextFieldProps>(function PasswordField(props, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      ref={ref}
      icon="lock-closed-outline"
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
      trailing={
        <IconButton
          icon={visible ? 'eye-off-outline' : 'eye-outline'}
          variant="plain"
          size={32}
          iconSize={18}
          color={colors.textTertiary}
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          onPress={() => setVisible((v) => !v)}
        />
      }
    />
  );
});
