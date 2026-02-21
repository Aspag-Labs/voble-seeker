import React from 'react';
import { View, Text, Pressable, useColorScheme } from 'react-native';
import { Clock, Zap, X } from 'lucide-react-native';

interface GameHeaderProps {
    timeElapsed: number;
    guessesUsed: number;
    maxGuesses: number;
    formatTime: (seconds: number) => string;
    onBack?: () => void;
}

export function GameHeader({
    timeElapsed,
    guessesUsed,
    maxGuesses,
    formatTime,
    onBack,
}: GameHeaderProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View
            className={`flex-row justify-between items-center px-4 py-4 ${isDark ? 'bg-[#09090b]' : 'bg-white'}`}
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.05,
                shadowRadius: 3,
                elevation: 2,
            }}
        >
            {/* Back/Timer */}
            <View className="flex-row items-center">
                {onBack && (
                    <Pressable
                        onPress={onBack}
                        className={`w-9 h-9 rounded-full items-center justify-center mr-2 ${isDark ? 'bg-slate-700 active:bg-slate-600' : 'bg-slate-100 active:bg-slate-200'}`}
                    >
                        <X size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                    </Pressable>
                )}
                <View className={`flex-row items-center px-4 py-2 rounded-2xl ${isDark ? 'bg-zinc-800/80 border border-zinc-700' : 'bg-white border border-zinc-200'}`}
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
                    <Clock size={16} color="#6366f1" />
                    <Text className={`ml-2 font-mono font-bold text-base ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>
                        {formatTime(timeElapsed)}
                    </Text>
                </View>
            </View>

            {/* Logo */}
            <View className="items-center">
                <Text className={`text-lg font-black tracking-wider ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    VOBLE
                </Text>
            </View>

            {/* Guesses */}
            <View className={`flex-row items-center px-3 py-2 rounded-full ${isDark ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
                <Zap size={14} color={isDark ? '#fbbf24' : '#f59e0b'} />
                <Text className={`ml-1.5 font-bold text-xs ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                    {guessesUsed}/{maxGuesses}
                </Text>
            </View>
        </View>
    );
}

export default GameHeader;
