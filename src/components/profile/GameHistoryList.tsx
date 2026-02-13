import React from 'react';
import { View, Text, ActivityIndicator, useColorScheme } from 'react-native';
import { History, Clock } from 'lucide-react-native';
import type { GameHistoryItem } from '../../hooks/use-game-history';

interface GameHistoryListProps {
    history: GameHistoryItem[];
    isLoading: boolean;
}

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = date.toLocaleString('en', { month: 'short' });
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${month} ${day}, ${hours}:${mins}`;
};

const formatTime = (timeMs: number): string => {
    const mins = Math.floor(timeMs / 1000 / 60);
    const secs = (Math.floor(timeMs / 1000) % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

export function GameHistoryList({ history, isLoading }: GameHistoryListProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    if (isLoading) {
        return (
            <View className={`rounded-2xl p-8 items-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                <ActivityIndicator size="small" color={isDark ? '#818cf8' : '#6366f1'} />
                <Text className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Loading history...
                </Text>
            </View>
        );
    }

    if (history.length === 0) {
        return (
            <View className={`rounded-2xl p-8 items-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                <History size={32} color={isDark ? '#475569' : '#94a3b8'} />
                <Text className={`mt-3 font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    No Games Yet
                </Text>
                <Text className={`mt-1 text-sm text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Play your first game to see your history here
                </Text>
            </View>
        );
    }

    return (
        <View className={`rounded-2xl overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <View className={`flex-row items-center px-4 py-3 ${isDark ? 'bg-slate-700 border-b border-slate-600' : 'bg-slate-50 border-b border-slate-100'}`}>
                <History size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                <Text className={`ml-2 font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Recent Games
                </Text>
            </View>

            {history.slice(0, 10).map((game, i) => (
                <View
                    key={game.id || i}
                    className={`flex-row items-center px-4 py-3 ${
                        i < Math.min(history.length, 10) - 1
                            ? isDark ? 'border-b border-slate-700' : 'border-b border-slate-50'
                            : ''
                    }`}
                >
                    {/* Word + Date */}
                    <View className="flex-1">
                        <Text className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {game.target_word || game.period_id}
                        </Text>
                        <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {formatDate(game.created_at)}
                        </Text>
                    </View>

                    {/* Score + Time */}
                    <View className="items-end mr-3">
                        <Text className={`text-sm font-bold ${
                            game.is_won ? 'text-emerald-500' : isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                            {game.is_won ? `${game.score.toLocaleString()} pts` : 'Failed'}
                        </Text>
                        <View className="flex-row items-center">
                            <Clock size={10} color={isDark ? '#64748b' : '#94a3b8'} />
                            <Text className={`ml-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {formatTime(game.time_ms)}
                            </Text>
                        </View>
                    </View>

                    {/* Guesses badge */}
                    <View className={`w-8 h-8 rounded-full items-center justify-center ${
                        game.is_won
                            ? isDark ? 'bg-emerald-900/40' : 'bg-emerald-100'
                            : isDark ? 'bg-slate-700' : 'bg-slate-100'
                    }`}>
                        <Text className={`text-xs font-bold ${
                            game.is_won ? 'text-emerald-500' : isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                            {game.guesses_used}
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );
}
