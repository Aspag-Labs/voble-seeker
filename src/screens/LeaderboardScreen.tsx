import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, SafeAreaView, useColorScheme } from 'react-native';
import { Users, Clock, Crown, Medal, RefreshCw } from 'lucide-react-native';
import { useLeaderboard, useVaultBalances, PeriodType } from '../hooks';

// Tiered winner counts per period
const WINNER_COUNTS: Record<PeriodType, number> = {
    daily: 10,
    weekly: 5,
    monthly: 3,
};

// Tiered prize splits per period (basis points, sum to 10000)
const PRIZE_SPLITS: Record<PeriodType, number[]> = {
    daily: [3500, 2000, 1200, 800, 600, 500, 400, 400, 300, 300], // 10 winners
    weekly: [4000, 2500, 1500, 1200, 800], // 5 winners
    monthly: [5000, 3000, 2000], // 3 winners
};

const formatDuration = (ms: number) => {
    if (!ms) return '';
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
};

export default function LeaderboardScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [activePeriod, setActivePeriod] = useState<PeriodType>('daily');
    const [timeLeft, setTimeLeft] = useState('');

    const {
        entries,
        totalPlayers,
        isLoading,
        isFetching,
        refetch: refetchLeaderboard
    } = useLeaderboard(activePeriod);

    const {
        balances,
        isLoading: isBalanceLoading,
        refetch: refetchBalances
    } = useVaultBalances();

    const isRefreshing = isFetching || isBalanceLoading;

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const targetDate = new Date(now);

            if (activePeriod === 'daily') {
                targetDate.setDate(now.getDate() + 1);
                targetDate.setHours(0, 0, 0, 0);
            } else if (activePeriod === 'weekly') {
                const day = now.getDay();
                const daysUntilMonday = (8 - day) % 7 || 7;
                targetDate.setDate(now.getDate() + daysUntilMonday);
                targetDate.setHours(0, 0, 0, 0);
            } else {
                targetDate.setMonth(now.getMonth() + 1);
                targetDate.setDate(1);
                targetDate.setHours(0, 0, 0, 0);
            }

            const diff = targetDate.getTime() - now.getTime();
            if (diff <= 0) return 'Soon...';

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (activePeriod === 'daily') return `${hours}h ${minutes}m ${seconds}s`;
            return `${days}d ${hours}h ${minutes}m`;
        };

        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        setTimeLeft(calculateTimeLeft());
        return () => clearInterval(timer);
    }, [activePeriod]);

    const getPrizePool = () => {
        if (!balances) return 0;
        switch (activePeriod) {
            case 'daily': return balances.daily.balance;
            case 'weekly': return balances.weekly.balance;
            case 'monthly': return balances.monthly.balance;
            default: return 0;
        }
    };

    const prizePool = getPrizePool();
    const isWinner = (rank: number) => rank <= WINNER_COUNTS[activePeriod];

    const getPrizeShare = (rank: number) => {
        const splits = PRIZE_SPLITS[activePeriod];
        if (rank < 1 || rank > splits.length) return null;
        const bps = splits[rank - 1];
        return (prizePool * bps) / 10000;
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown size={18} color="#eab308" />;
        if (rank === 2) return <Medal size={18} color="#94a3b8" />;
        if (rank === 3) return <Medal size={18} color="#f97316" />;
        return null;
    };

    const getAvatarColor = (address: string) => {
        const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500', 'bg-violet-500'];
        const index = address.charCodeAt(address.length - 1) % colors.length;
        return colors[index];
    };

    const onRefresh = () => {
        refetchLeaderboard();
        refetchBalances();
    };

    return (
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
            {/* Header */}
            <View className={`px-4 py-4 ${isDark ? 'bg-slate-800 border-b border-slate-700' : 'bg-white border-b border-slate-100'}`}>
                {/* Period Tabs */}
                <View className="flex-row justify-center mb-4">
                    {(['daily', 'weekly', 'monthly'] as PeriodType[]).map((period) => (
                        <Pressable
                            key={period}
                            onPress={() => setActivePeriod(period)}
                            className={`px-4 py-2 rounded-lg mx-1 ${activePeriod === period
                                ? (isDark ? 'bg-indigo-900/50' : 'bg-indigo-100')
                                : 'bg-transparent'
                                }`}
                        >
                            <Text
                                className={`text-sm font-bold uppercase ${activePeriod === period
                                    ? (isDark ? 'text-indigo-400' : 'text-indigo-600')
                                    : (isDark ? 'text-slate-500' : 'text-slate-400')
                                    }`}
                            >
                                {period}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Prize Display */}
                <View className="items-center mb-3">
                    <Text className={`text-xs uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {activePeriod} Prize Pool
                    </Text>
                    <Text className={`text-4xl font-black tracking-tight ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        ${prizePool.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Text>
                </View>

                {/* Stats Row */}
                <View className="flex-row justify-center items-center">
                    <View className={`flex-row items-center px-3 py-1.5 rounded-full mr-2 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <Users size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                        <Text className={`ml-1.5 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {totalPlayers} players
                        </Text>
                    </View>
                    <View className={`flex-row items-center px-3 py-1.5 rounded-full mr-2 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <Clock size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                        <Text className={`ml-1.5 text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {timeLeft}
                        </Text>
                    </View>
                    <Pressable onPress={onRefresh} disabled={isRefreshing} className="p-2">
                        <RefreshCw size={16} color={isRefreshing ? '#94a3b8' : (isDark ? '#94a3b8' : '#64748b')} />
                    </Pressable>
                </View>
            </View>

            {/* Leaderboard List */}
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
            >
                <View className="px-4 py-4">
                    <View className={`rounded-2xl overflow-hidden shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                        {/* Table Header */}
                        <View className={`flex-row px-4 py-3 ${isDark ? 'bg-slate-700 border-b border-slate-600' : 'bg-slate-50 border-b border-slate-100'}`}>
                            <Text className={`flex-1 text-xs font-medium uppercase ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Player</Text>
                            <Text className={`w-20 text-xs font-medium uppercase text-right ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Score</Text>
                            <Text className={`w-20 text-xs font-medium uppercase text-right ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Prize</Text>
                        </View>

                        {/* Loading State */}
                        {isLoading ? (
                            <View className="p-8 items-center">
                                <Text className={isDark ? 'text-slate-500' : 'text-slate-400'}>Loading rankings...</Text>
                            </View>
                        ) : entries.length === 0 ? (
                            <View className="p-8 items-center">
                                <Text className={isDark ? 'text-slate-500' : 'text-slate-400'}>No players yet. Be the first!</Text>
                            </View>
                        ) : (
                            entries.map((entry, index) => {
                                const prize = getPrizeShare(entry.rank);
                                const isTopWinner = isWinner(entry.rank);
                                const isLastWinner = entry.rank === WINNER_COUNTS[activePeriod];
                                const nextEntry = entries[index + 1];
                                const showSeparator = isLastWinner && nextEntry && !isWinner(nextEntry.rank);

                                return (
                                    <View key={entry.rank}>
                                        <View
                                            className={`flex-row items-center px-4 py-3.5 ${isDark ? 'border-b border-slate-700' : 'border-b border-slate-50'} ${!isTopWinner ? 'opacity-60' : ''}`}
                                        >
                                            {/* Rank + Avatar + Name */}
                                            <View className="flex-1 flex-row items-center">
                                                <View className="w-7 items-center mr-2">
                                                    {getRankIcon(entry.rank) || (
                                                        <Text className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>#{entry.rank}</Text>
                                                    )}
                                                </View>
                                                <View
                                                    className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${getAvatarColor(entry.player)}`}
                                                >
                                                    <Text className="text-white text-xs font-bold">
                                                        {entry.username ? entry.username[0].toUpperCase() : 'A'}
                                                    </Text>
                                                </View>
                                                <View className="flex-1">
                                                    <Text className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`} numberOfLines={1}>
                                                        {entry.username || 'Anonymous'}
                                                    </Text>
                                                    <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                        {activePeriod === 'daily'
                                                            ? `${entry.guessesUsed}g • ${formatDuration(entry.timeMs)}`
                                                            : `${entry.gamesPlayed} games`}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Score */}
                                            <View className="w-20 items-end">
                                                <Text className={`font-bold ${isTopWinner ? (isDark ? 'text-slate-200' : 'text-slate-800') : (isDark ? 'text-slate-500' : 'text-slate-500')}`}>
                                                    {entry.score.toLocaleString()}
                                                </Text>
                                            </View>

                                            {/* Prize */}
                                            <View className="w-20 items-end">
                                                {prize ? (
                                                    <View className={`px-2 py-1 rounded-full ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-50'}`}>
                                                        <Text className={`font-bold text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                                            ${prize.toFixed(2)}
                                                        </Text>
                                                    </View>
                                                ) : (
                                                    <Text className={isDark ? 'text-slate-600' : 'text-slate-300'}>—</Text>
                                                )}
                                            </View>
                                        </View>

                                        {/* Winner separator */}
                                        {showSeparator && (
                                            <View className={`flex-row items-center px-4 py-2 ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                                                <View className={`flex-1 h-px ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
                                                <Text className={`mx-3 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                                                    Top {WINNER_COUNTS[activePeriod]} Win Prizes
                                                </Text>
                                                <View className={`flex-1 h-px ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
                                            </View>
                                        )}
                                    </View>
                                );
                            })
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
