import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator, Alert, useColorScheme } from 'react-native';
import { Coins, ArrowRightLeft } from 'lucide-react-native';

interface RewardsWidgetProps {
    points: number;
    isTrading: boolean;
    isTradingEnabled: boolean;
    onTrade: (amount: number) => Promise<{ success: boolean; error?: string }>;
}

const VOBLE_PER_POINT = 500;

export function RewardsWidget({ points, isTrading, isTradingEnabled, onTrade }: RewardsWidgetProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [amount, setAmount] = useState(Math.min(100, points).toString());

    const parsedAmount = parseInt(amount, 10) || 0;
    const isValid = parsedAmount > 0 && parsedAmount <= points;

    const handleTrade = async () => {
        if (!isValid) return;
        const result = await onTrade(parsedAmount);
        if (result.success) {
            Alert.alert('Success', `Traded ${parsedAmount} points for ${(parsedAmount * VOBLE_PER_POINT).toLocaleString()} $VOBLE!`);
            setAmount('0');
        } else {
            Alert.alert('Error', result.error || 'Trade failed');
        }
    };

    const setPercentage = (pct: number) => {
        setAmount(Math.floor(points * pct).toString());
    };

    return (
        <View className={`rounded-2xl overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            {/* Header */}
            <View className={`flex-row items-center px-4 py-3 ${isDark ? 'border-b border-slate-700' : 'border-b border-slate-100'}`}>
                <Coins size={16} color="#f97316" />
                <Text className={`ml-2 text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Rewards
                </Text>
            </View>

            <View className="px-4 py-4">
                {/* Points Display */}
                <View className="flex-row items-center justify-between mb-4">
                    <View>
                        <Text className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            Activity Points
                        </Text>
                        <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Trade points for $VOBLE tokens
                        </Text>
                    </View>
                    <Text className="text-2xl font-black font-mono text-orange-500">
                        {points.toLocaleString()}
                    </Text>
                </View>

                {!isTradingEnabled ? (
                    <View className={`p-4 rounded-xl items-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                        <Text className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Token trading coming soon
                        </Text>
                    </View>
                ) : points <= 0 ? (
                    <View className={`p-4 rounded-xl items-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                        <Text className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Play games to earn activity points
                        </Text>
                    </View>
                ) : (
                    <View className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50 border border-slate-600' : 'bg-slate-50 border border-slate-100'}`}>
                        {/* Percentage Buttons */}
                        <View className="flex-row gap-2 mb-3">
                            {[
                                { label: '25%', pct: 0.25 },
                                { label: '50%', pct: 0.5 },
                                { label: 'Max', pct: 1 },
                            ].map(({ label, pct }) => (
                                <Pressable
                                    key={label}
                                    onPress={() => setPercentage(pct)}
                                    className={`flex-1 py-2 rounded-lg items-center ${isDark ? 'bg-slate-600 active:bg-slate-500' : 'bg-white active:bg-slate-100'} border ${isDark ? 'border-slate-500' : 'border-slate-200'}`}
                                >
                                    <Text className={`text-xs font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                        {label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        {/* Input + Trade Button */}
                        <View className="flex-row gap-2 mb-3">
                            <TextInput
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="number-pad"
                                className={`flex-1 rounded-lg px-3 py-2.5 text-sm ${isDark ? 'bg-slate-600 text-slate-100 border-slate-500' : 'bg-white text-slate-800 border-slate-200'} border`}
                                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                            />
                            <Pressable
                                onPress={handleTrade}
                                disabled={isTrading || !isValid}
                                className={`px-5 py-2.5 rounded-lg flex-row items-center justify-center ${
                                    isTrading || !isValid
                                        ? 'bg-orange-400 opacity-50'
                                        : 'bg-orange-600 active:bg-orange-700'
                                }`}
                            >
                                {isTrading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <ArrowRightLeft size={14} color="#fff" />
                                        <Text className="text-white font-bold text-sm ml-1">Trade</Text>
                                    </>
                                )}
                            </Pressable>
                        </View>

                        {/* Conversion Preview */}
                        <Text className={`text-xs text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            You get:{' '}
                            <Text className={`font-mono font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                {(parsedAmount * VOBLE_PER_POINT).toLocaleString()}
                            </Text>
                            {' '}$VOBLE
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
