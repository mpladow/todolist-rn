import { padding } from '@/constants';
import { useMemo } from 'react';
import { Pressable, PressableProps, Text } from 'react-native';

export type CustomButtonProps = {
  label: string | JSX.Element;
  buttonType: 'primary' | 'danger';
  buttonSize: 'large' | 'small';
  variant?: 'standard' | 'round';
} & PressableProps;

export const CustomButton = ({ label, buttonType, buttonSize, variant, onPress, ...rest }: CustomButtonProps) => {
  const variantStyles = useMemo(() => {
    switch (buttonType) {
      case 'primary':
        return {
          backgroundColor: '#007AFF',
          color: '#FFFFFF',
        };
      case 'danger':
        return {
          backgroundColor: '#FF3B30',
          color: '#FFFFFF',
        };
      default:
        return {
          backgroundColor: '#007AFF',
          color: '#FFFFFF',
        };
    }
  }, [buttonType]);
  return (
    <Pressable
      {...rest}
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: variantStyles.backgroundColor,
          opacity: pressed ? 0.5 : 1,
        },
        { paddingVertical: buttonSize == 'large' ? padding * 3 : padding * 2 },
        { paddingHorizontal: buttonSize == 'large' ? padding * 4 : padding * 3 },
        variant === 'round' ? { borderRadius: 50, width: 20, height: 20 } : {},
        {
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}>
      {typeof label === 'string' ? <Text style={{ color: variantStyles.color }}>{label}</Text> : label}
    </Pressable>
  );
};
