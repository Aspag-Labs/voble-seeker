import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { Gamepad2, Target, TrendingUp, Flame, Trophy } from 'lucide-react-native';

interface StatsOverviewProps {
    totalGamesPlayed: number;
    gamesWon: number;
    winRate: number;
    currentStreak: number;
    bestScore: number;
}

const stats = [
    { key: 'games', label: 'Total Games', icon: Gamepad2, color: '#3b82f6', bgLight: 'bg-blue-50', bgDark: 'bg-blue-900/30' },
    { key: 'wins', label: 'Wins', icon: Target, color: '#10b981', bgLight: 'bg-emerald-50', bgDark: 'bg-emerald-900/30' },
    { key: 'winRate', label: 'Win Rate', icon: TrendingUp, color: '#8b5cf6', bgLight: 'bg-purple-50', bgDark: 'bg-purple-900/30' },
    { key: 'streak', label: 'Streak', icon: Flame, color: '#f97316', bgLight: 'bg-orange-50', bgDark: 'bg-orange-900/30' },
    { key: 'best', label: 'Best Score', icon: Trophy, color: '#eab308', bgLight: 'bg-yellow-50', bgDark: 'bg-yellow-900/30' },
] as const;

export function StatsOverview({ totalGamesPlayed, gamesWon, winRate, currentStreak, bestScore }: StatsOverviewProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const values: Record<string, string> = {
        games: totalGamesPlayed.toString(),
        wins: gamesWon.toString(),
        winRate: `${winRate}%`,
        streak: currentStreak.toString(),
        best: bestScore.toLocaleString(),
    };

    return (
        <View className="flex-row flex-wrap gap-3">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <View
                        key={stat.key}
                        className={`flex-1 min-w-[47%] p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                    >
                        <View className={`w-8 h-8 rounded-lg items-center justify-center mb-2 ${isDark ? stat.bgDark : stat.bgLight}`}>
                            <Icon size={16} color={stat.color} />
                        </View>
                        <Text className={`text-2xl font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            {values[stat.key]}
                        </Text>
                        <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {stat.label}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}
