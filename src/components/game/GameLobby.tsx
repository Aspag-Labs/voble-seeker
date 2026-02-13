import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator, useColorScheme } from 'react-native';
import { Play, Check, AlertCircle, DollarSign, Trophy, Gift } from 'lucide-react-native';
import { useVaultBalances } from '../../hooks/use-vault-balances';

interface GameLobbyProps {
    isStartingGame: boolean;
    isBuyingTicket: boolean;
    ticketPurchased: boolean;
    vrfCompleted: boolean;
    isAlreadyPlayedToday: boolean;
    onBuyTicket: () => void;
    error?: string | null;
}

const formatUSDC = (amount: number) => `$${amount.toFixed(2)}`;

function isBlackoutWindow(): boolean {
    const now = new Date();
    const utc8 = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const hours = utc8.getUTCHours();
    const minutes = utc8.getUTCMinutes();
    const totalMinutes = hours * 60 + minutes;
    // Blackout: 23:35 - 00:25 UTC+8
    return totalMinutes >= 23 * 60 + 35 || totalMinutes <= 25;
}

export function GameLobby({
    isStartingGame,
    isBuyingTicket,
    ticketPurchased,
    vrfCompleted,
    isAlreadyPlayedToday,
    onBuyTicket,
    error,
}: GameLobbyProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { balances, isLoading: vaultsLoading } = useVaultBalances();
    const [isBlackout, setIsBlackout] = useState(isBlackoutWindow());

    useEffect(() => {
        const interval = setInterval(() => {
            setIsBlackout(isBlackoutWindow());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const isDisabled = isStartingGame || isAlreadyPlayedToday || isBlackout;

    const prizeTotals = balances
        ? balances.daily.balance + balances.weekly.balance + balances.monthly.balance
        : 0;

    return (
        <View className="flex-1 items-center justify-center px-6">
            {/* Logo */}
            <View className="mb-6 items-center">
                <Image
                    source={require('../../../assets/images/logo.png')}
                    className="w-20 h-20 mb-3"
                    resizeMode="contain"
                />
                <Text className={`text-3xl font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    VOBLE
                </Text>
            </View>

            {/* Loading Progress */}
            {isStartingGame && (
                <View className={`w-full rounded-2xl p-5 mb-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    <Text className={`text-sm font-bold mb-4 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        Entering Arena...
                    </Text>
                    {[
                        { label: 'Verifying funds', done: ticketPurchased },
                        { label: 'Getting a Random Word', done: vrfCompleted },
                        { label: 'Preparing Game Board', done: false },
                    ].map((step, i) => (
                        <View key={i} className="flex-row items-center mb-2">
                            {step.done ? (
                                <Check size={16} color="#10b981" />
                            ) : (
                                <ActivityIndicator size="small" color={isDark ? '#818cf8' : '#6366f1'} />
                            )}
                            <Text className={`ml-3 text-sm ${step.done
                                ? 'text-emerald-500 font-medium'
                                : isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                                {step.label}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Prize Vaults */}
            {!isStartingGame && (
                <View className={`w-full rounded-2xl p-4 mb-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    <View className="flex-row items-center mb-3">
                        <Trophy size={16} color="#f59e0b" />
                        <Text className={`ml-2 font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                            Prize Pool
                        </Text>
                    </View>
                    <View className="flex-row gap-3">
                        {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                            <View key={period} className="flex-1 items-center">
                                {vaultsLoading ? (
                                    <ActivityIndicator size="small" color={isDark ? '#818cf8' : '#6366f1'} />
                                ) : (
                                    <Text className={`text-base font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                                        {formatUSDC(balances?.[period].balance ?? 0)}
                                    </Text>
                                )}
                                <Text className={`text-xs capitalize ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {period}
                                </Text>
                            </View>
                        ))}
                    </View>
                    {balances?.luckyDraw && (
                        <View className={`mt-3 pt-3 flex-row items-center justify-center ${isDark ? 'border-t border-slate-700' : 'border-t border-slate-100'}`}>
                            <Gift size={14} color="#ec4899" />
                            <Text className={`ml-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Lucky Draw: {formatUSDC(balances.luckyDraw.balance)}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Enter Arena Card */}
            {!isStartingGame && (
                <View className={`w-full rounded-2xl p-5 mb-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    <Text className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                        Ready to Compete?
                    </Text>
                    <Text className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Guess the 6-letter word in 7 tries
                    </Text>

                    <Pressable
                        onPress={onBuyTicket}
                        disabled={isDisabled}
                        className={`py-4 rounded-2xl flex-row items-center justify-center ${
                            isDisabled
                                ? isDark ? 'bg-slate-700' : 'bg-slate-200'
                                : 'bg-indigo-600 active:bg-indigo-700'
                        }`}
                        style={!isDisabled ? {
                            shadowColor: '#4f46e5',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 5,
                        } : undefined}
                    >
                        {isDisabled ? (
                            <Text className={`font-bold text-base ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {isAlreadyPlayedToday
                                    ? 'Come Back Tomorrow'
                                    : isBlackout
                                        ? 'Daily Reset in Progress'
                                        : 'Starting...'}
                            </Text>
                        ) : (
                            <>
                                <Play size={22} color="#ffffff" />
                                <Text className="text-white font-bold text-lg ml-2">Enter Arena</Text>
                                <View className="ml-2 bg-white/20 rounded-full px-2 py-0.5">
                                    <Text className="text-white text-xs font-bold">$1 USDC</Text>
                                </View>
                            </>
                        )}
                    </Pressable>
                </View>
            )}

            {/* Status Messages */}
            {isBlackout && !isStartingGame && (
                <View className="flex-row items-center px-4">
                    <AlertCircle size={14} color="#f59e0b" />
                    <Text className={`ml-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Daily reset occurs at midnight UTC+8. Games resume shortly after.
                    </Text>
                </View>
            )}

            {/* Error */}
            {error && (
                <View className="w-full mt-3 bg-red-500/10 rounded-xl p-3 flex-row items-center">
                    <AlertCircle size={16} color="#ef4444" />
                    <Text className="ml-2 text-red-500 text-sm flex-1">{error}</Text>
                </View>
            )}
        </View>
    );
}
