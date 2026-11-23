import React, { forwardRef, useState } from 'react';
import { StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space, type } from '@/src/theme';
import { IconName } from '@/src/lib/categories';
import { AppText } from './AppText';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  icon?: IconName;
  error?: string | null;
  hint?: string;
  /** Shows "12/100" under the field. */
  showCount?: boolean;
  trailing?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Text input with an optional label above it. The field is a soft fill without a border; focus is shown
 * with a charcoal outline so the active field is always obvious.
 */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, icon, error, hint, showCount, trailing, containerStyle, multiline, style, onFocus, onBlur, value, maxLength, ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label && (
        <AppText variant="footnote" tone="secondary" style={styles.label}>
          {label}
        </AppText>
      )}
      <View
        style={[
          styles.field,
          multiline && styles.multilineField,
          focused && styles.focused,
          !!error && styles.errorBorder,
        ]}
      >
        {icon && <Ionicons name={icon} size={18} color={colors.textTertiary} style={multiline && styles.multilineIcon} />}
        <TextInput
          ref={ref}
          {...rest}
          value={value}
          maxLength={maxLength}
          multiline={multiline}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.accent}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, multiline && styles.multilineInput, style]}
        />
        {trailing}
      </View>
      {(error || hint || (showCount && maxLength)) && (
        <View style={styles.footer}>
          <AppText variant="footnote" tone={error ? 'danger' : 'tertiary'} style={styles.footerText}>
            {error ?? hint ?? ''}
          </AppText>
          {showCount && maxLength ? (
            <AppText variant="footnote" tone="tertiary">
              {(value ?? '').length}/{maxLength}
            </AppText>
          ) : null}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  label: {
    marginBottom: space.xs - 2,
    marginLeft: space.xxs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs + 2,
    minHeight: 50,
    paddingHorizontal: space.md - 2,
    borderRadius: radius.md - 2,
    borderCurve: 'continuous',
    backgroundColor: colors.fill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  multilineField: {
    alignItems: 'flex-start',
    paddingVertical: space.sm,
  },
  multilineIcon: {
    marginTop: 3,
  },
  focused: {
    borderColor: colors.text,
    backgroundColor: colors.surface,
  },
  errorBorder: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    // No lineHeight: on iOS it pushes single-line input text off center
    fontSize: type.body.fontSize,
    color: colors.text,
    paddingVertical: space.sm - 1,
    // Browsers draw their own focus ring; the field border already shows focus
    outlineWidth: 0,
  },
  multilineInput: {
    minHeight: 96,
    paddingVertical: 0,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: space.xxs + 2,
    marginHorizontal: space.xxs,
    gap: space.sm,
  },
  footerText: {
    flex: 1,
  },
});
