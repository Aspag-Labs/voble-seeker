import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, useColorScheme } from 'react-native';
import { Award, DollarSign, Gift } from 'lucide-react-native';
import type { UnclaimedPrize, UnclaimedRaffle } from '../../hooks/use-claim';

interface PrizeCenterProps {
    totalPrizeWinnings: bigint;
    totalLuckyDrawWinnings: bigint;
    claimablePrizes: UnclaimedPrize[];
    rafflePrizes: UnclaimedRaffle[];
    hasCheckedPrize: boolean;
    hasCheckedRaffle: boolean;
    isClaimingPrize: boolean;
    isClaimingRaffle: boolean;
    onClaimPrize: (prize: UnclaimedPrize) => void;
    onClaimRafflePrize: (raffle: UnclaimedRaffle) => void;
}

const USDC_DECIMALS = 6;

const formatUSDC = (lamports: bigint): string => {
    const value = Number(lamports) / Math.pow(10, USDC_DECIMALS);
    return `$${value.toFixed(2)}`;
};

const getRankIcon = (rank: number): string | null => {
    switch (rank) {
        case 1: return '\u{1F947}';
        case 2: return '\u{1F948}';
        case 3: return '\u{1F949}';
        default: return null;
    }
};

export function PrizeCenter({
    totalPrizeWinnings,
    totalLuckyDrawWinnings,
    claimablePrizes,
    rafflePrizes,
    hasCheckedPrize,
    hasCheckedRaffle,
    isClaimingPrize,
    isClaimingRaffle,
    onClaimPrize,
    onClaimRafflePrize,
}: PrizeCenterProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [activeTab, setActiveTab] = useState<'leaderboard' | 'raffle'>('leaderboard');

    const totalPrizes = claimablePrizes.length;
    const totalRaffles = rafflePrizes.length;

    return (
        <View className={`rounded-2xl overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            {/* Header with tabs */}
            <View className={`flex-row items-center justify-between px-4 py-3 ${isDark ? 'border-b border-slate-700' : 'border-b border-slate-200'}`}>
                <View className="flex-row items-center">
                    <Award size={16} color="#eab308" />
                    <Text className={`ml-2 font-bold text-xs uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Prize Center
                    </Text>
                </View>
                <View className={`flex-row rounded-lg overflow-hidden ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                    <Pressable
                        onPress={() => setActiveTab('leaderboard')}
                        className={`px-3 py-1.5 ${activeTab === 'leaderboard' ? (isDark ? 'bg-slate-700' : 'bg-slate-100') : ''}`}
                    >
                        <View className="flex-row items-center">
                            <Text className={`text-xs font-medium ${activeTab === 'leaderboard' ? (isDark ? 'text-slate-200' : 'text-slate-800') : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                                Leaderboard
                            </Text>
                            {totalPrizes > 0 && (
                                <View className="ml-1.5 bg-emerald-500 rounded-full px-1.5 py-0.5">
                                    <Text className="text-white text-[10px] font-bold">{totalPrizes}</Text>
                                </View>
                            )}
                        </View>
                    </Pressable>
                    <Pressable
                        onPress={() => setActiveTab('raffle')}
                        className={`px-3 py-1.5 ${activeTab === 'raffle' ? (isDark ? 'bg-slate-700' : 'bg-slate-100') : ''}`}
                    >
                        <View className="flex-row items-center">
                            <Text className={`text-xs font-medium ${activeTab === 'raffle' ? (isDark ? 'text-slate-200' : 'text-slate-800') : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                                Raffle
                            </Text>
                            {totalRaffles > 0 && (
                                <View className="ml-1.5 bg-purple-500 rounded-full px-1.5 py-0.5">
                                    <Text className="text-white text-[10px] font-bold">{totalRaffles}</Text>
                                </View>
                            )}
                        </View>
                    </Pressable>
                </View>
            </View>

            <View className="p-4">
                {/* Total Prize Claimed */}
                <View className={`flex-row items-center pb-4 mb-4 ${isDark ? 'border-b border-slate-700' : 'border-b border-slate-200'}`}>
                    <View className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <DollarSign size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                    </View>
                    <View>
                        <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Prize Claimed
                        </Text>
                        <Text className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            {formatUSDC(activeTab === 'leaderboard' ? totalPrizeWinnings : totalLuckyDrawWinnings)} USDC
                        </Text>
                    </View>
                </View>

                {/* Leaderboard Tab */}
                {activeTab === 'leaderboard' && (
                    <View>
                        <Text className={`font-bold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Leaderboard Rewards
                        </Text>
                        <Text className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {!hasCheckedPrize
                                ? 'Checking for available prizes...'
                                : totalPrizes === 0
                                    ? 'No unclaimed leaderboard prizes found.'
                                    : `You have ${totalPrizes} unclaimed prize${totalPrizes > 1 ? 's' : ''}!`}
                        </Text>

                        {totalPrizes > 0 && claimablePrizes.map((prize) => {
                            const icon = getRankIcon(prize.rank);
                            return (
                                <View
                                    key={String(prize.address)}
                                    className={`flex-row items-center justify-between p-3 rounded-xl mb-2 ${isDark ? 'bg-emerald-900/20 border border-emerald-800' : 'bg-emerald-50 border border-emerald-200'}`}
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View className="w-10 h-10 rounded-full bg-[#c7f284] items-center justify-center mr-3">
                                            {icon ? (
                                                <Text className="text-lg">{icon}</Text>
                                            ) : (
                                                <Text className="text-xs font-bold">#{prize.rank}</Text>
                                            )}
                                        </View>
                                        <View>
                                            <Text className={`text-base font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                                ${(prize.amount / 1_000_000).toFixed(2)}
                                            </Text>
                                            <Text className={`text-xs ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>
                                                {prize.periodType.charAt(0).toUpperCase() + prize.periodType.slice(1)} {'\u2022'} {prize.periodId}
                                            </Text>
                                        </View>
                                    </View>
                                    <Pressable
                                        onPress={() => onClaimPrize(prize)}
                                        disabled={isClaimingPrize}
                                        className={`flex-row items-center px-4 py-2 rounded-lg ${isClaimingPrize ? 'opacity-50' : ''} bg-emerald-600 active:bg-emerald-700`}
                                    >
                                        {isClaimingPrize ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Gift size={14} color="#fff" />
                                        )}
                                        <Text className="text-white font-bold text-sm ml-1.5">Claim</Text>
                                    </Pressable>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Raffle Tab */}
                {activeTab === 'raffle' && (
                    <View>
                        <Text className={`font-bold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Lucky Draw
                        </Text>
                        <Text className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {!hasCheckedRaffle
                                ? 'Checking ticket status...'
                                : totalRaffles === 0
                                    ? 'No lucky draw wins found.'
                                    : `You have ${totalRaffles} unclaimed raffle prize${totalRaffles > 1 ? 's' : ''}!`}
                        </Text>

                        {totalRaffles > 0 && rafflePrizes.map((raffle) => (
                            <View
                                key={String(raffle.address)}
                                className={`flex-row items-center justify-between p-3 rounded-xl mb-2 ${isDark ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                                        <Text className="text-lg">{'\u{1F389}'}</Text>
                                    </View>
                                    <View>
                                        <Text className={`text-base font-bold ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                                            ${(raffle.amount / 1_000_000).toFixed(2)}
                                        </Text>
                                        <Text className={`text-xs ${isDark ? 'text-purple-500' : 'text-purple-600'}`}>
                                            Week {raffle.periodId}
                                        </Text>
                                    </View>
                                </View>
                                <Pressable
                                    onPress={() => onClaimRafflePrize(raffle)}
                                    disabled={isClaimingRaffle}
                                    className={`flex-row items-center px-4 py-2 rounded-lg ${isClaimingRaffle ? 'opacity-50' : ''} bg-purple-600 active:bg-purple-700`}
                                >
                                    {isClaimingRaffle ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Gift size={14} color="#fff" />
                                    )}
                                    <Text className="text-white font-bold text-sm ml-1.5">Claim</Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}
