import React from 'react';
import { View, Text, ActivityIndicator, Image, useColorScheme } from 'react-native';

interface GameLoadingProps {
    message?: string;
}

export function GameLoading({ message }: GameLoadingProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View className={`flex-1 items-center justify-center px-8 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <Image
                source={require('../../../assets/images/logo.png')}
                className="w-20 h-20 mb-6"
                resizeMode="contain"
            />
            <ActivityIndicator size="large" color={isDark ? '#818cf8' : '#6366f1'} />
            <Text className={`mt-4 text-base font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {message || 'Initializing...'}
            </Text>
        </View>
    );
}
