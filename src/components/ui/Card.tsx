import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
    variant?: 'default' | 'outlined' | 'elevated';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
    default: 'bg-white rounded-2xl',
    outlined: 'bg-white rounded-2xl border border-gray-200',
    elevated: 'bg-white rounded-2xl shadow-md',
};

const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
};

export function Card({
    variant = 'default',
    padding = 'md',
    className,
    children,
    ...props
}: CardProps & { className?: string }) {
    return (
        <View
            className={`
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className || ''}
      `}
            {...props}
        >
            {children}
        </View>
    );
}

export function CardHeader({
    children,
    className
}: {
    children: React.ReactNode;
    className?: string
}) {
    return (
        <View className={`mb-3 ${className || ''}`}>
            {children}
        </View>
    );
}

export function CardContent({
    children,
    className
}: {
    children: React.ReactNode;
    className?: string
}) {
    return (
        <View className={className}>
            {children}
        </View>
    );
}

export default Card;
