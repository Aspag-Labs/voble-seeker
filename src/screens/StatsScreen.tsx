import React from 'react';
import {
    View,
    Text,
    ScrollView,
    SafeAreaView,
    Pressable,
    RefreshControl,
    ActivityIndicator,
    useColorScheme,
} from 'react-native';
import {
    ArrowLeft,
    Users,
    Trophy,
    Award,
    TrendingUp,
    Gift,
    Crown,
    Medal,
} from 'lucide-react-native';
import { useVaultBalances } from '../hooks/use-vault-balances';
import { useProtocolStats, useTopEarners } from '../hooks/use-protocol-stats';

const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
};

const formatUSDC = (amount: number, digits = 2) => `$${amount.toFixed(digits)}`;

const formatAddress = (address: string) => {
    if (!address || address.length <= 8) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

function StatCard({
    icon,
    label,
    value,
    suffix,
    isLoading,
    isDark,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    suffix?: string;
    isLoading: boolean;
    isDark: boolean;
}) {
    return (
        <View className={`flex-1 min-w-[47%] p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <View className="flex-row items-center mb-2">
                {icon}
                <Text className={`ml-2 text-xs uppercase font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {label}
                </Text>
            </View>
            {isLoading ? (
                <ActivityIndicator size="small" color={isDark ? '#818cf8' : '#6366f1'} />
            ) : (
                <>
                    <Text className={`text-2xl font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{value}</Text>
                    {suffix && (
                        <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{suffix}</Text>
                    )}
                </>
            )}
        </View>
    );
}

export default function StatsScreen({ navigation }: any) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { stats, isLoading: statsLoading, refetch: refetchStats } = useProtocolStats();
    const { balances, isLoading: vaultsLoading, refetch: refetchVaults } = useVaultBalances();
    const { earners, isLoading: earnersLoading, refetch: refetchEarners } = useTopEarners();

    const isLoading = statsLoading || vaultsLoading;

    const prizeTotals = balances
        ? balances.daily.balance + balances.weekly.balance + balances.monthly.balance
        : 0;

    const totalPrizeClaimedUSDC = stats ? stats.totalPrizeClaimedLamports / 1_000_000 : 0;

    const onRefresh = () => {
        refetchStats();
        refetchVaults();
        refetchEarners();
    };

    const getRankBadge = (index: number) => {
        if (index === 0) return <Crown size={16} color="#f59e0b" />;
        if (index === 1) return <Medal size={16} color="#94a3b8" />;
        if (index === 2) return <Medal size={16} color="#d97706" />;
        return null;
    };

    const getRankBg = (index: number) => {
        if (index === 0) return isDark ? 'bg-yellow-900/30' : 'bg-yellow-50';
        if (index === 1) return isDark ? 'bg-slate-700' : 'bg-slate-100';
        if (index === 2) return isDark ? 'bg-orange-900/30' : 'bg-orange-50';
        return isDark ? 'bg-slate-700/50' : 'bg-slate-100';
    };

    return (
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
            {/* Header */}
            <View className={`px-4 py-3 ${isDark ? 'bg-slate-800 border-b border-slate-700' : 'bg-white border-b border-slate-100'}`}>
                <View className="flex-row items-center">
                    <Pressable onPress={() => navigation.goBack()} className="mr-3 p-1">
                        <ArrowLeft size={22} color={isDark ? '#f1f5f9' : '#1e293b'} />
                    </Pressable>
                    <View>
                        <Text className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            Protocol Dashboard
                        </Text>
                        <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Live metrics from Voble on Solana
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
                }
            >
                <View className="px-4 py-4">
                    {/* Stats Grid */}
                    <View className="flex-row flex-wrap gap-3 mb-4">
                        <StatCard
                            icon={<Users size={16} color="#3b82f6" />}
                            label="Players"
                            value={formatNumber(stats?.totalPlayers ?? 0)}
                            isLoading={statsLoading}
                            isDark={isDark}
                        />
                        <StatCard
                            icon={<TrendingUp size={16} color="#10b981" />}
                            label="Prize Pool"
                            value={formatUSDC(prizeTotals)}
                            suffix="USDC"
                            isLoading={vaultsLoading}
                            isDark={isDark}
                        />
                        <StatCard
                            icon={<Trophy size={16} color="#f59e0b" />}
                            label="Claimed"
                            value={formatUSDC(totalPrizeClaimedUSDC)}
                            suffix="USDC"
                            isLoading={statsLoading}
                            isDark={isDark}
                        />
                        <StatCard
                            icon={<Gift size={16} color="#ec4899" />}
                            label="Lucky Draw"
                            value={formatUSDC(balances?.luckyDraw.balance ?? 0)}
                            suffix="Jackpot"
                            isLoading={vaultsLoading}
                            isDark={isDark}
                        />
                    </View>

                    {/* Prize Pool Breakdown */}
                    <View className={`rounded-2xl overflow-hidden mb-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                        <View className={`flex-row items-center px-4 py-3 ${isDark ? 'border-b border-slate-700' : 'border-b border-slate-100'}`}>
                            <TrendingUp size={18} color={isDark ? '#64748b' : '#94a3b8'} />
                            <Text className={`ml-2 font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                Prize Pool Breakdown
                            </Text>
                        </View>

                        {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                            <View
                                key={period}
                                className={`flex-row justify-between items-center px-4 py-3 ${isDark ? 'border-b border-slate-700/50' : 'border-b border-slate-50'}`}
                            >
                                <Text className={`capitalize text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {period}
                                </Text>
                                {vaultsLoading ? (
                                    <ActivityIndicator size="small" color={isDark ? '#818cf8' : '#6366f1'} />
                                ) : (
                                    <Text className={`text-sm font-bold tabular-nums ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                                        {formatUSDC(balances?.[period].balance ?? 0)}
                                    </Text>
                                )}
                            </View>
                        ))}

                        <View className={`flex-row justify-between items-center px-4 py-3 ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                            <Text className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                Total Active
                            </Text>
                            {vaultsLoading ? (
                                <ActivityIndicator size="small" color={isDark ? '#818cf8' : '#6366f1'} />
                            ) : (
                                <Text className={`text-base font-black tabular-nums ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                                    {formatUSDC(prizeTotals)}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Top Earners */}
                    <View className={`rounded-2xl overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                        <View className={`flex-row items-center px-4 py-3 ${isDark ? 'border-b border-slate-700' : 'border-b border-slate-100'}`}>
                            <Award size={18} color="#f59e0b" />
                            <Text className={`ml-2 font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                Top 10 All-Time Earners
                            </Text>
                        </View>

                        {earnersLoading ? (
                            <View className="py-8 items-center">
                                <ActivityIndicator size="small" color={isDark ? '#818cf8' : '#6366f1'} />
                            </View>
                        ) : earners.length > 0 ? (
                            earners.map((earner, idx) => (
                                <View
                                    key={earner.player}
                                    className={`flex-row items-center px-4 py-3 ${isDark ? 'border-b border-slate-700/50' : 'border-b border-slate-50'}`}
                                >
                                    <View className={`w-7 h-7 rounded-full items-center justify-center mr-3 ${getRankBg(idx)}`}>
                                        {getRankBadge(idx) || (
                                            <Text className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {idx + 1}
                                            </Text>
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                            {earner.username || 'Anonymous'}
                                        </Text>
                                        <Text className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            {formatAddress(earner.player)}
                                        </Text>
                                    </View>
                                    <Text className="text-sm font-bold text-emerald-500 tabular-nums">
                                        +{formatUSDC(earner.totalEarned)}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <View className="py-8 items-center">
                                <View className={`w-12 h-12 rounded-full items-center justify-center mb-3 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                    <Award size={24} color={isDark ? '#64748b' : '#94a3b8'} />
                                </View>
                                <Text className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Coming Soon
                                </Text>
                                <Text className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Earnings data will be available once the indexer is live.
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="h-8" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
