import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

interface TextProps extends RNTextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
    color?: 'primary' | 'secondary' | 'muted' | 'success' | 'error';
}

const variantStyles = {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-bold',
    h3: 'text-xl font-semibold',
    body: 'text-base',
    caption: 'text-sm',
    label: 'text-xs font-medium uppercase tracking-wider',
};

const colorStyles = {
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    muted: 'text-gray-500',
    success: 'text-green-600',
    error: 'text-red-600',
};

export function Typography({
    variant = 'body',
    color = 'primary',
    className,
    children,
    ...props
}: TextProps & { className?: string }) {
    return (
        <RNText
            className={`
        ${variantStyles[variant]}
        ${colorStyles[color]}
        ${className || ''}
      `}
            {...props}
        >
            {children}
        </RNText>
    );
}

// Convenience exports
export const H1 = (props: Omit<TextProps, 'variant'> & { className?: string }) => (
    <Typography variant="h1" {...props} />
);

export const H2 = (props: Omit<TextProps, 'variant'> & { className?: string }) => (
    <Typography variant="h2" {...props} />
);

export const H3 = (props: Omit<TextProps, 'variant'> & { className?: string }) => (
    <Typography variant="h3" {...props} />
);

export const Body = (props: Omit<TextProps, 'variant'> & { className?: string }) => (
    <Typography variant="body" {...props} />
);

export const Caption = (props: Omit<TextProps, 'variant'> & { className?: string }) => (
    <Typography variant="caption" color="muted" {...props} />
);

export default Typography;
