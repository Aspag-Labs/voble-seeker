import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, SafeAreaView, useColorScheme } from 'react-native';
import { Trophy, CheckCircle, Ticket, Clock, RefreshCw } from 'lucide-react-native';
import { useLuckyDraw } from '../hooks';

export default function RaffleScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [nextDrawIn, setNextDrawIn] = useState('');

    const {
        currentBalance,
        totalEligiblePlayers,
        isEligible,
        recentWinners,
        isLoading,
        refetch
    } = useLuckyDraw();

    useEffect(() => {
        const calculateTimeUntilDraw = () => {
            const now = new Date();
            const targetDate = new Date(now);

            const day = now.getDay();
            const daysUntilSunday = day === 0 ? 7 : 7 - day;
            targetDate.setDate(now.getDate() + daysUntilSunday);
            targetDate.setHours(0, 0, 0, 0);

            const diff = targetDate.getTime() - now.getTime();
            if (diff <= 0) return 'Soon...';

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            return `${days}d ${hours}h ${minutes}m ${seconds}s`;
        };

        const timer = setInterval(() => setNextDrawIn(calculateTimeUntilDraw()), 1000);
        setNextDrawIn(calculateTimeUntilDraw());
        return () => clearInterval(timer);
    }, []);

    return (
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#09090b]' : 'bg-slate-50'}`}>
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refetch} />
                }
            >
                {/* Header */}
                <View className={`px-4 py-6 ${isDark ? 'bg-[#0f0f10] border-b border-zinc-800' : 'bg-white border-b border-zinc-200'}`}>
                    {/* Badge */}
                    <View className="items-center mb-4">
                        <View className={`flex-row items-center px-3 py-1.5 rounded-lg ${isDark ? 'bg-zinc-800 border border-zinc-700' : 'bg-zinc-100 border border-zinc-200'}`}>
                            <View className="w-2 h-2 rounded-full bg-indigo-500 mr-2" />
                            <Text className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>
                                Weekly Raffle
                            </Text>
                        </View>
                    </View>

                    {/* Jackpot Display */}
                    <View className="items-center mb-4">
                        <Text className={`text-xs uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Jackpot Prize
                        </Text>
                        <Text className={`text-5xl font-black tracking-tight ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                            ${isLoading ? '...' : currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </Text>
                    </View>

                    {/* Stats Row */}
                    <View className="flex-row justify-center items-center">
                        <View className={`flex-row items-center px-3 py-1.5 rounded-full mr-2 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <Trophy size={14} color={isDark ? '#818cf8' : '#6366f1'} />
                            <Text className={`ml-1.5 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {totalEligiblePlayers} eligible
                            </Text>
                        </View>
                        <View className={`flex-row items-center px-3 py-1.5 rounded-full mr-2 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <Clock size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                            <Text className={`ml-1.5 text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {nextDrawIn}
                            </Text>
                        </View>
                        <Pressable onPress={refetch} disabled={isLoading} className="p-2">
                            <RefreshCw size={16} color={isLoading ? '#94a3b8' : (isDark ? '#94a3b8' : '#64748b')} />
                        </Pressable>
                    </View>
                </View>

                <View className="px-4 py-6 space-y-4">
                    {/* Your Status Card */}
                    <View className={`rounded-2xl overflow-hidden shadow-sm mb-4 ${isDark ? 'bg-[#0f0f10] border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
                        <View
                            className={`p-5 flex-row items-center ${isEligible
                                ? (isDark ? 'bg-emerald-900/30' : 'bg-emerald-50')
                                : (isDark ? 'bg-slate-700' : 'bg-slate-50')
                                }`}
                        >
                            <View
                                className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${isEligible
                                    ? (isDark ? 'bg-emerald-900/50' : 'bg-emerald-100')
                                    : (isDark ? 'bg-slate-600' : 'bg-slate-200')
                                    }`}
                            >
                                {isEligible ? (
                                    <CheckCircle size={24} color="#10b981" />
                                ) : (
                                    <Ticket size={24} color={isDark ? '#64748b' : '#94a3b8'} />
                                )}
                            </View>

                            <View className="flex-1">
                                <Text className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                                    {isEligible ? "You're Entered!" : "You're Not Entered Yet"}
                                </Text>
                                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {isEligible
                                        ? 'Good luck! The draw happens automatically on Sunday.'
                                        : 'Play at least 1 game this week to qualify.'}
                                </Text>
                            </View>

                            {!isEligible && (
                                <Pressable className="bg-[#1877F2] px-4 py-2.5 rounded-full active:opacity-90">
                                    <Text className="text-white font-bold text-sm">Play Now</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>

                    {/* How it Works */}
                    <View className="flex-row gap-3 mb-4">
                        <View className={`flex-1 p-4 rounded-xl shadow-sm ${isDark ? 'bg-[#0f0f10] border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
                            <View className={`w-8 h-8 rounded-lg items-center justify-center mb-3 ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`}>
                                <Text className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>1</Text>
                            </View>
                            <Text className={`font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Play a Game</Text>
                            <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Complete just 1 game to enter.</Text>
                        </View>
                        <View className={`flex-1 p-4 rounded-xl shadow-sm ${isDark ? 'bg-[#0f0f10] border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
                            <View className={`w-8 h-8 rounded-lg items-center justify-center mb-3 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                <Text className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>2</Text>
                            </View>
                            <Text className={`font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Win Jackpot</Text>
                            <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Winner drawn Sunday @ Midnight.</Text>
                        </View>
                    </View>

                    {/* Hall of Fame */}
                    <View className={`rounded-2xl overflow-hidden shadow-sm ${isDark ? 'bg-[#0f0f10] border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
                        {/* Header */}
                        <View className={`flex-row items-center px-4 py-3 ${isDark ? 'bg-zinc-800/50 border-b border-zinc-800' : 'bg-slate-50 border-b border-zinc-200'}`}>
                            <Trophy size={16} color="#f59e0b" />
                            <Text className={`ml-2 text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                Hall of Fame
                            </Text>
                        </View>

                        {/* Winners List */}
                        {recentWinners.length === 0 ? (
                            <View className="p-8 items-center">
                                <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${isDark ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
                                    <Trophy size={32} color="#fcd34d" />
                                </View>
                                <Text className={`text-lg font-medium mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>No Winners Yet</Text>
                                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>The next draw could be the first!</Text>
                            </View>
                        ) : (
                            recentWinners.map((winner, i) => (
                                <View
                                    key={i}
                                    className={`flex-row items-center px-4 py-4 ${isDark ? 'border-b border-slate-700' : 'border-b border-slate-50'}`}
                                >
                                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isDark ? 'bg-amber-900/40' : 'bg-amber-100'}`}>
                                        <Text className="text-amber-600 text-xs font-bold">W{winner.week}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className={`font-mono font-medium text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                            {winner.address}
                                        </Text>
                                        <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{winner.date}</Text>
                                    </View>
                                    <Text className="font-bold text-amber-600">+{winner.amount} USDC</Text>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
