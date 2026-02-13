import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingProps {
    size?: 'small' | 'large';
    text?: string;
    fullScreen?: boolean;
}

export function Loading({
    size = 'large',
    text,
    fullScreen = false
}: LoadingProps) {
    const content = (
        <View className="items-center justify-center">
            <ActivityIndicator size={size} color="#3b82f6" />
            {text && (
                <Text className="mt-3 text-gray-500 text-sm">{text}</Text>
            )}
        </View>
    );

    if (fullScreen) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                {content}
            </View>
        );
    }

    return content;
}

export function LoadingOverlay({
    visible,
    text
}: {
    visible: boolean;
    text?: string
}) {
    if (!visible) return null;

    return (
        <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
            <View className="bg-white rounded-2xl p-6 items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                {text && (
                    <Text className="mt-3 text-gray-700">{text}</Text>
                )}
            </View>
        </View>
    );
}

export default Loading;
