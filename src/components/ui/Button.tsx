import React from 'react';
import { Pressable, Text, ActivityIndicator, PressableProps } from 'react-native';

interface ButtonProps extends PressableProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    children: React.ReactNode;
}

const variantStyles = {
    primary: 'bg-blue-500 active:bg-blue-600',
    secondary: 'bg-gray-200 active:bg-gray-300',
    outline: 'border border-gray-300 bg-transparent active:bg-gray-100',
    ghost: 'bg-transparent active:bg-gray-100',
};

const textStyles = {
    primary: 'text-white',
    secondary: 'text-gray-900',
    outline: 'text-gray-900',
    ghost: 'text-gray-900',
};

const sizeStyles = {
    sm: 'px-3 py-1.5',
    md: 'px-4 py-2.5',
    lg: 'px-6 py-3.5',
};

const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
};

export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    children,
    className,
    ...props
}: ButtonProps & { className?: string }) {
    const isDisabled = disabled || isLoading;

    return (
        <Pressable
            disabled={isDisabled}
            className={`
        flex-row items-center justify-center rounded-xl
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${isDisabled ? 'opacity-50' : ''}
        ${className || ''}
      `}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? '#fff' : '#000'}
                    size="small"
                />
            ) : (
                <Text className={`font-semibold ${textStyles[variant]} ${textSizes[size]}`}>
                    {children}
                </Text>
            )}
        </Pressable>
    );
}

export default Button;
