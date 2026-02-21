import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, SafeAreaView, Alert, ActivityIndicator, useColorScheme } from 'react-native';
import { Wallet, Award, ChevronRight, Copy, Check, LogOut, BarChart3, UserPlus, Trash2 } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

import { useWallet } from '../providers';
import { useUserProfile } from '../hooks/use-user-profile';
import { useGameHistory } from '../hooks/use-game-history';
import { usePlayerRank } from '../hooks/use-player-rank';
import { useTradeActivityPoints } from '../hooks/use-trade-activity-points';
import { useCloseAccounts } from '../hooks/use-close-accounts';
import { useClaim, type UnclaimedPrize, type UnclaimedRaffle } from '../hooks/use-claim';

import { StatsOverview } from '../components/profile/StatsOverview';
import { GuessDistribution } from '../components/profile/GuessDistribution';
import { GameHistoryList } from '../components/profile/GameHistoryList';
import { PrizeCenter } from '../components/profile/PrizeCenter';
import { ActivityHeatmap } from '../components/profile/ActivityHeatmap';
import { RewardsWidget } from '../components/profile/RewardsWidget';

export default function ProfileScreen({ navigation }: any) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { connected, connecting, address, connect, disconnect } = useWallet();
    const [refreshing, setRefreshing] = useState(false);
    const [copied, setCopied] = useState(false);

    const { profile, isLoading: profileLoading, exists: profileExists, refetch: refetchProfile } = useUserProfile();
    const { games, stats, isLoading: historyLoading, refetch: refetchHistory } = useGameHistory();
    const { data: rankData, refetch: refetchRank } = usePlayerRank();
    const { tradePoints, isTrading, isTradingEnabled } = useTradeActivityPoints();
    const { closePermissions, isClosing } = useCloseAccounts();
    const {
        claimPrize,
        claimLuckyDraw,
        getAllUnclaimedPrizes,
        getAllUnclaimedRaffles,
        isClaimingPrize,
        isClaimingLuckyDraw: isClaimingRaffle,
    } = useClaim();

    // Prize discovery state
    const [claimablePrizes, setClaimablePrizes] = useState<UnclaimedPrize[]>([]);
    const [hasCheckedPrize, setHasCheckedPrize] = useState(false);
    const [rafflePrizes, setRafflePrizes] = useState<UnclaimedRaffle[]>([]);
    const [hasCheckedRaffle, setHasCheckedRaffle] = useState(false);

    // Check for unclaimed leaderboard prizes (blockchain-based)
    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!address) return;
            try {
                const prizes = await getAllUnclaimedPrizes();
                if (cancelled) return;
                setClaimablePrizes(prizes);
                setHasCheckedPrize(true);
            } catch (err) {
                console.error('Error checking prizes:', err);
                if (!cancelled) setHasCheckedPrize(true);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [getAllUnclaimedPrizes, address]);

    // Check for unclaimed raffle prizes (blockchain-based + API)
    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!address) return;
            try {
                const raffles = await getAllUnclaimedRaffles();
                if (cancelled) return;
                setRafflePrizes(raffles);
                setHasCheckedRaffle(true);
            } catch (err) {
                console.error('Error checking raffle prizes:', err);
                if (!cancelled) setHasCheckedRaffle(true);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [getAllUnclaimedRaffles, address]);

    // Claim handlers
    const handleClaimPrize = async (prize: UnclaimedPrize) => {
        const result = await claimPrize(prize.periodType, prize.periodId);
        if (result.success) {
            setClaimablePrizes((prev) => prev.filter((p) => p.address !== prize.address));
            Alert.alert('Success', 'Prize claimed successfully!');
            await refetchProfile();
        } else if (result.error) {
            Alert.alert('Claim Failed', result.error);
        }
    };

    const handleClaimRafflePrize = async (raffle: UnclaimedRaffle) => {
        const result = await claimLuckyDraw(raffle.periodId);
        if (result.success) {
            setRafflePrizes((prev) => prev.filter((r) => r.address !== raffle.address));
            Alert.alert('Success', 'Raffle prize claimed successfully!');
            await refetchProfile();
        } else if (result.error) {
            Alert.alert('Claim Failed', result.error);
        }
    };

    const winRate = useMemo(() => {
        if (!profile || profile.totalGamesPlayed === 0) return 0;
        return Math.round((profile.gamesWon / profile.totalGamesPlayed) * 100);
    }, [profile?.gamesWon, profile?.totalGamesPlayed]);

    const currentStreak = useMemo(() => {
        if (!games || games.length === 0) return 0;
        let streak = 0;
        for (const game of games) {
            if (game.is_won) streak++;
            else break;
        }
        return streak;
    }, [games]);

    const guessDistribution = useMemo(() => {
        if (stats?.guess_distribution && stats.guess_distribution.length === 7) {
            return stats.guess_distribution;
        }
        const dist = new Array(7).fill(0);
        if (games) {
            games.forEach((g) => {
                if (g.is_won && g.guesses_used >= 1 && g.guesses_used <= 7) {
                    dist[g.guesses_used - 1]++;
                }
            });
        }
        return dist;
    }, [stats?.guess_distribution, games]);

    const shortenAddress = (addr: string | null) => {
        if (!addr) return '';
        return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([refetchProfile(), refetchHistory(), refetchRank()]);
        setRefreshing(false);
    };

    const handleCopy = async () => {
        if (address) {
            await Clipboard.setStringAsync(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleConnect = async () => {
        try {
            await connect();
        } catch (error: any) {
            Alert.alert('Connection Failed', error.message || 'Could not connect to wallet');
        }
    };

    const handleDisconnect = () => {
        Alert.alert(
            'Disconnect Wallet',
            'Are you sure you want to disconnect?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Disconnect', style: 'destructive', onPress: disconnect },
            ]
        );
    };

    // Not connected
    if (!connected) {
        return (
            <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#09090b]' : 'bg-slate-50'}`}>
                <View className="flex-1 items-center justify-center px-8">
                    <View className={`w-20 h-20 rounded-full items-center justify-center mb-6 ${isDark ? 'bg-[#0f0f10]' : 'bg-slate-100'}`}>
                        <Wallet size={40} color={isDark ? '#64748b' : '#94a3b8'} />
                    </View>
                    <Text className={`text-2xl font-bold mb-2 text-center ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                        Connect Your Wallet
                    </Text>
                    <Text className={`text-center mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Connect your Solana wallet to view your profile, stats, and claim rewards.
                    </Text>
                    <Pressable
                        onPress={handleConnect}
                        disabled={connecting}
                        className={`bg-[#1877F2] px-8 py-4 rounded-2xl w-full ${connecting ? 'opacity-50' : 'active:opacity-90'}`}
                        style={{
                            shadowColor: '#1877F2',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 5,
                        }}
                    >
                        {connecting ? (
                            <View className="flex-row items-center justify-center">
                                <ActivityIndicator color="#fff" size="small" />
                                <Text className="text-white font-bold text-center text-lg ml-2">Connecting...</Text>
                            </View>
                        ) : (
                            <Text className="text-white font-bold text-center text-lg">Connect Wallet</Text>
                        )}
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    // Loading profile
    if (profileLoading) {
        return (
            <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#09090b]' : 'bg-slate-50'}`}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={isDark ? '#818cf8' : '#6366f1'} />
                    <Text className={`mt-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // No profile
    if (!profileExists) {
        return (
            <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#09090b]' : 'bg-slate-50'}`}>
                <View className="flex-1 items-center justify-center px-8">
                    <View className={`w-20 h-20 rounded-full items-center justify-center mb-6 ${isDark ? 'bg-indigo-900/40' : 'bg-indigo-100'}`}>
                        <Award size={40} color={isDark ? '#818cf8' : '#6366f1'} />
                    </View>
                    <Text className={`text-2xl font-bold mb-2 text-center ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                        Create Your Profile
                    </Text>
                    <Text className={`text-center mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Play your first game to create your on-chain profile automatically.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#09090b]' : 'bg-slate-50'}`}>
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Profile Header */}
                <View className={`px-4 py-6 ${isDark ? 'bg-[#0f0f10] border-b border-zinc-800' : 'bg-white border-b border-zinc-200'}`}>
                    <View className="flex-row items-center">
                        <View className="w-16 h-16 bg-indigo-500 rounded-2xl items-center justify-center mr-4">
                            <Text className="text-white text-2xl font-bold">
                                {(profile?.username || 'P')[0].toUpperCase()}
                            </Text>
                        </View>

                        <View className="flex-1">
                            <View className="flex-row items-center">
                                <Text className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                                    {profile?.username || 'Player'}
                                </Text>
                                {rankData?.percentile && (
                                    <View className="ml-2 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                                        <Text className="text-indigo-500 text-xs font-bold">
                                            Top {rankData.percentile}%
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Pressable onPress={handleCopy} className="flex-row items-center mt-1">
                                <Text className={`font-mono text-sm mr-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {shortenAddress(address)}
                                </Text>
                                {copied ? (
                                    <Check size={14} color="#10b981" />
                                ) : (
                                    <Copy size={14} color={isDark ? '#64748b' : '#94a3b8'} />
                                )}
                            </Pressable>
                        </View>

                        <Pressable
                            onPress={handleDisconnect}
                            className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}
                        >
                            <LogOut size={18} color="#ef4444" />
                        </Pressable>
                    </View>
                </View>

                <View className="px-4 py-4 space-y-4">
                    {/* Stats Overview */}
                    <StatsOverview
                        totalGamesPlayed={profile?.totalGamesPlayed || 0}
                        gamesWon={profile?.gamesWon || 0}
                        winRate={winRate}
                        currentStreak={currentStreak}
                        bestScore={profile?.bestScore || 0}
                    />

                    {/* Rewards Widget */}
                    <View className="mt-3">
                        <RewardsWidget
                            points={Number(profile?.activityPoints || 0)}
                            isTrading={isTrading}
                            isTradingEnabled={isTradingEnabled}
                            onTrade={async (amt) => {
                                const result = await tradePoints(amt);
                                if (result.success) onRefresh();
                                return result;
                            }}
                        />
                    </View>

                    {/* Activity Heatmap */}
                    <View className="mt-3">
                        <ActivityHeatmap gameHistory={games} />
                    </View>

                    {/* Guess Distribution */}
                    <View className="mt-3">
                        <GuessDistribution distribution={guessDistribution} />
                    </View>

                    {/* Prize Center */}
                    <View className="mt-3">
                        <PrizeCenter
                            totalPrizeWinnings={profile?.totalPrizeWinnings || 0n}
                            totalLuckyDrawWinnings={profile?.totalLuckyDrawWinnings || 0n}
                            claimablePrizes={claimablePrizes}
                            rafflePrizes={rafflePrizes}
                            hasCheckedPrize={hasCheckedPrize}
                            hasCheckedRaffle={hasCheckedRaffle}
                            isClaimingPrize={isClaimingPrize}
                            isClaimingRaffle={isClaimingRaffle}
                            onClaimPrize={handleClaimPrize}
                            onClaimRafflePrize={handleClaimRafflePrize}
                        />
                    </View>

                    {/* Game History */}
                    <View className="mt-3">
                        <GameHistoryList
                            history={games}
                            isLoading={historyLoading}
                        />
                    </View>

                    {/* Menu Items */}
                    <View className={`mt-3 rounded-2xl overflow-hidden ${isDark ? 'bg-[#0f0f10] border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
                        <Pressable
                            onPress={() => navigation.navigate('Stats')}
                            className={`flex-row items-center px-4 py-3.5 ${isDark ? 'active:bg-zinc-800 border-b border-zinc-800' : 'active:bg-slate-50 border-b border-zinc-200'}`}
                        >
                            <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                                <BarChart3 size={16} color="#3b82f6" />
                            </View>
                            <Text className={`flex-1 font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Protocol Stats</Text>
                            <ChevronRight size={18} color={isDark ? '#64748b' : '#94a3b8'} />
                        </Pressable>

                        <Pressable
                            onPress={() => navigation.navigate('Referral')}
                            className={`flex-row items-center px-4 py-3.5 ${isDark ? 'active:bg-zinc-800 border-b border-zinc-800' : 'active:bg-slate-50 border-b border-zinc-200'}`}
                        >
                            <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                                <UserPlus size={16} color="#10b981" />
                            </View>
                            <Text className={`flex-1 font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Referral Program</Text>
                            <ChevronRight size={18} color={isDark ? '#64748b' : '#94a3b8'} />
                        </Pressable>

                        <Pressable
                            onPress={() => {
                                Alert.alert(
                                    'Close Accounts',
                                    'This will close your game session accounts and reclaim the rent SOL. Are you sure?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Close',
                                            style: 'destructive',
                                            onPress: async () => {
                                                const result = await closePermissions();
                                                if (result.success) {
                                                    Alert.alert('Success', 'Accounts closed. Rent SOL reclaimed.');
                                                    onRefresh();
                                                } else {
                                                    Alert.alert('Error', result.error || 'Failed to close accounts');
                                                }
                                            },
                                        },
                                    ],
                                );
                            }}
                            disabled={isClosing}
                            className={`flex-row items-center px-4 py-3.5 ${isDark ? 'active:bg-zinc-800' : 'active:bg-slate-50'} ${isClosing ? 'opacity-50' : ''}`}
                        >
                            <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                                {isClosing ? (
                                    <ActivityIndicator size="small" color="#ef4444" />
                                ) : (
                                    <Trash2 size={16} color="#ef4444" />
                                )}
                            </View>
                            <Text className={`flex-1 font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Close Accounts</Text>
                            <ChevronRight size={18} color={isDark ? '#64748b' : '#94a3b8'} />
                        </Pressable>
                    </View>

                    <View className="h-8" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
