import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, ViewStyle } from 'react-native';

export type ThemedKeyboardAvoidingViewProps = React.ComponentProps<typeof KeyboardAvoidingView> & {
  lightColor?: string;
  darkColor?: string;
  style?: ViewStyle | ViewStyle[];
};

export function ThemedKeyboardAvoidingView({
  children,
  lightColor,
  darkColor,
  style,
  ...rest
}: ThemedKeyboardAvoidingViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[{ backgroundColor, flex: 1 }, style]}
      {...rest}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Add custom styles here if needed
});
