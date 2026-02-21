import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    ActivityIndicator,
    useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Wallet, Shield, Check, AlertCircle, ArrowRight } from 'lucide-react-native';

import { useWallet } from '../../providers';
import { useInitializeProfile } from '../../hooks/use-initialize-profile';
import { shortenAddress } from '../../hooks/utils';

interface CreateProfileFormProps {
    onSuccess?: () => void;
}

export function CreateProfileForm({ onSuccess }: CreateProfileFormProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { address: walletAddress } = useWallet();
    const { initializeProfile, isLoading, error } = useInitializeProfile();

    const [username, setUsername] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [referralCode, setReferralCode] = useState<string | null>(null);

    useEffect(() => {
        AsyncStorage.getItem('referralCode').then((code) => {
            if (code) setReferralCode(code);
        });
    }, []);

    const validateUsername = (value: string): boolean => {
        setValidationError(null);

        if (!value || value.trim().length === 0) {
            setValidationError('Username is required');
            return false;
        }

        if (value.length > 10) {
            setValidationError('Maximum 10 characters');
            return false;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            setValidationError('Letters, numbers, and underscore only');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateUsername(username)) return;

        const result = await initializeProfile(username.trim());

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                onSuccess?.();
            }, 2500);
        }
    };

    // Success state
    if (success) {
        return (
            <View className="flex-1 items-center justify-center px-8">
                <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
                    <Check size={40} color={isDark ? '#34d399' : '#16a34a'} />
                </View>
                <Text className={`text-3xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    You're In.
                </Text>
                <Text className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Profile created successfully.
                </Text>
                <View className="flex-row items-center gap-2 mt-8">
                    <ActivityIndicator size="small" color={isDark ? '#818cf8' : '#6366f1'} />
                    <Text className={`text-sm font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Loading profile...
                    </Text>
                </View>
            </View>
        );
    }

    if (!walletAddress) return null;

    return (
        <View className="flex-1 justify-center px-6">
            <View className={`rounded-3xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 12,
                    elevation: 8,
                }}
            >
                {/* Header */}
                <View className="items-center mb-6">
                    <User size={48} color={isDark ? '#334155' : '#e2e8f0'} />
                    <Text className={`text-2xl font-bold mt-3 mb-1 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                        Create Your Profile
                    </Text>
                    <Text className={`text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Choose a username for the leaderboard.
                    </Text>
                </View>

                {/* Username Input */}
                <View className="mb-4">
                    <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Username
                    </Text>
                    <View className="relative">
                        <TextInput
                            value={username}
                            onChangeText={(text) => {
                                setUsername(text);
                                setValidationError(null);
                            }}
                            placeholder="Enter username"
                            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                            maxLength={10}
                            editable={!isLoading}
                            autoCapitalize="none"
                            autoCorrect={false}
                            className={`h-12 px-4 pr-16 rounded-xl text-base font-medium ${
                                isDark ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'
                            } ${
                                validationError
                                    ? 'border-2 border-red-500'
                                    : isDark ? 'border border-slate-600' : 'border border-slate-200'
                            }`}
                        />
                        <Text className={`absolute right-4 top-3.5 text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {username.length}/10
                        </Text>
                    </View>

                    {validationError ? (
                        <View className="flex-row items-center gap-1 mt-1.5">
                            <AlertCircle size={14} color="#ef4444" />
                            <Text className="text-sm text-red-500 font-medium">{validationError}</Text>
                        </View>
                    ) : (
                        <Text className={`text-xs mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Letters, numbers, and underscore only.
                        </Text>
                    )}
                </View>

                {/* Wallet Info Card */}
                <View className={`rounded-xl p-4 mb-4 ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                            <Wallet size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Wallet</Text>
                        </View>
                        <Text className={`font-mono text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {shortenAddress(walletAddress)}
                        </Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <Shield size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fee (refundable)</Text>
                        </View>
                        <Text className={`font-mono text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>~0.002 SOL</Text>
                    </View>
                </View>

                {/* Referral Code */}
                {referralCode && (
                    <View className={`rounded-xl p-4 mb-4 flex-row items-center justify-between ${
                        isDark ? 'bg-emerald-900/20 border border-emerald-800/30' : 'bg-emerald-50 border border-emerald-200'
                    }`}>
                        <View>
                            <Text className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                Referral Applied
                            </Text>
                            <Text className={`font-mono font-bold ${isDark ? 'text-emerald-200' : 'text-emerald-900'}`}>
                                {referralCode}
                            </Text>
                        </View>
                        <Check size={20} color={isDark ? '#34d399' : '#10b981'} />
                    </View>
                )}

                {/* Error */}
                {error && (
                    <View className={`rounded-xl p-3 mb-4 flex-row items-center gap-2 ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                        <AlertCircle size={16} color="#ef4444" />
                        <Text className="text-red-500 text-sm flex-1">{error}</Text>
                    </View>
                )}

                {/* Submit Button */}
                <Pressable
                    onPress={handleSubmit}
                    disabled={isLoading || !username.trim()}
                    className={`py-4 rounded-xl flex-row items-center justify-center ${
                        isLoading || !username.trim()
                            ? isDark ? 'bg-indigo-800/50' : 'bg-indigo-300'
                            : 'bg-indigo-600 active:bg-indigo-700'
                    }`}
                >
                    {isLoading ? (
                        <>
                            <ActivityIndicator size="small" color="#fff" />
                            <Text className="text-white font-bold text-base ml-2">Creating...</Text>
                        </>
                    ) : (
                        <>
                            <Text className="text-white font-bold text-base">Create Profile</Text>
                            <ArrowRight size={18} color="#fff" style={{ marginLeft: 8 }} />
                        </>
                    )}
                </Pressable>
            </View>
        </View>
    );
}
