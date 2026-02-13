import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { Award, DollarSign } from 'lucide-react-native';

interface PrizeCenterProps {
    totalPrizeWinnings: bigint;
    totalLuckyDrawWinnings: bigint;
}

const USDC_DECIMALS = 6;

const formatUSDC = (lamports: bigint): string => {
    const value = Number(lamports) / Math.pow(10, USDC_DECIMALS);
    return `$${value.toFixed(2)}`;
};

export function PrizeCenter({ totalPrizeWinnings, totalLuckyDrawWinnings }: PrizeCenterProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const totalWinnings = totalPrizeWinnings + totalLuckyDrawWinnings;

    return (
        <View className={`rounded-2xl p-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <View className="flex-row items-center mb-4">
                <Award size={16} color="#10b981" />
                <Text className={`ml-2 font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Prize Winnings
                </Text>
            </View>

            {/* Total */}
            <View className={`rounded-xl p-4 mb-3 ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-50'}`}>
                <Text className={`text-xs mb-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    Total Earned
                </Text>
                <Text className="text-3xl font-black text-emerald-500">
                    {formatUSDC(totalWinnings)}
                </Text>
                <Text className={`text-xs ${isDark ? 'text-emerald-400/60' : 'text-emerald-500/60'}`}>USDC</Text>
            </View>

            {/* Breakdown */}
            <View className="flex-row gap-3">
                <View className={`flex-1 rounded-xl p-3 ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <View className="flex-row items-center mb-1">
                        <DollarSign size={12} color={isDark ? '#818cf8' : '#6366f1'} />
                        <Text className={`ml-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Leaderboard
                        </Text>
                    </View>
                    <Text className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        {formatUSDC(totalPrizeWinnings)}
                    </Text>
                </View>
                <View className={`flex-1 rounded-xl p-3 ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <View className="flex-row items-center mb-1">
                        <Text className="text-xs mr-1">🎰</Text>
                        <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Lucky Draw
                        </Text>
                    </View>
                    <Text className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        {formatUSDC(totalLuckyDrawWinnings)}
                    </Text>
                </View>
            </View>
        </View>
    );
}
