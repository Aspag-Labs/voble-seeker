import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { BarChart3 } from 'lucide-react-native';

interface GuessDistributionProps {
    distribution: number[];
}

const getBarColor = (index: number): string => {
    if (index <= 2) return 'bg-emerald-500';
    if (index <= 4) return 'bg-yellow-500';
    return 'bg-orange-500';
};

export function GuessDistribution({ distribution }: GuessDistributionProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const maxValue = Math.max(...distribution, 1);
    const totalGames = distribution.reduce((a, b) => a + b, 0);

    return (
        <View className={`rounded-2xl p-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <View className="flex-row items-center mb-4">
                <BarChart3 size={16} color={isDark ? '#818cf8' : '#6366f1'} />
                <Text className={`ml-2 font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Guess Distribution
                </Text>
            </View>

            {distribution.map((count, i) => {
                const widthPercent = Math.max((count / maxValue) * 100, 4);
                return (
                    <View key={i} className="flex-row items-center mb-2">
                        <Text className={`w-5 text-xs font-bold text-right mr-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {i + 1}
                        </Text>
                        <View className="flex-1 h-6 rounded overflow-hidden" style={{ flexDirection: 'row' }}>
                            <View
                                className={`h-full rounded ${getBarColor(i)} items-end justify-center px-2`}
                                style={{ width: `${widthPercent}%` }}
                            >
                                {count > 0 && (
                                    <Text className="text-white text-xs font-bold">{count}</Text>
                                )}
                            </View>
                        </View>
                    </View>
                );
            })}

            <View className={`mt-3 pt-3 ${isDark ? 'border-t border-slate-700' : 'border-t border-slate-100'}`}>
                <Text className={`text-xs text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {totalGames} total games
                </Text>
            </View>
        </View>
    );
}
