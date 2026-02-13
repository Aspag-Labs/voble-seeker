import React from 'react';
import { View, Text, Modal, Pressable, ActivityIndicator, Image, useColorScheme } from 'react-native';
import { Check, Shield } from 'lucide-react-native';

interface InitializeSessionDialogProps {
    visible: boolean;
    isInitializing: boolean;
    isSessionCreated: boolean;
    isAuthenticated: boolean;
    onInitialize: () => void;
}

export function InitializeSessionDialog({
    visible,
    isInitializing,
    isSessionCreated,
    isAuthenticated,
    onInitialize,
}: InitializeSessionDialogProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 items-center justify-center bg-black/60 px-6">
                <View className={`w-full max-w-sm rounded-3xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    {/* Logo */}
                    <View className="items-center mb-5">
                        <Image
                            source={require('../../../assets/images/logo.png')}
                            className="w-16 h-16 mb-3"
                            resizeMode="contain"
                        />
                        <Text className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            {isAuthenticated ? 'One More Step' : 'Setting Up...'}
                        </Text>
                        <Text className={`text-sm mt-1 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            First-time setup for your game account
                        </Text>
                    </View>

                    {/* Steps */}
                    <View className={`rounded-xl p-4 mb-4 ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                        {/* Step 1: TEE Auth */}
                        <View className="flex-row items-center mb-3">
                            {isAuthenticated ? (
                                <View className="w-6 h-6 rounded-full bg-emerald-500 items-center justify-center">
                                    <Check size={14} color="#fff" />
                                </View>
                            ) : (
                                <ActivityIndicator size="small" color={isDark ? '#818cf8' : '#6366f1'} />
                            )}
                            <View className="ml-3 flex-1">
                                <Text className={`text-sm font-medium ${
                                    isAuthenticated
                                        ? 'text-emerald-500'
                                        : isDark ? 'text-slate-200' : 'text-slate-700'
                                }`}>
                                    TEE Wallet Signature
                                </Text>
                                <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Authenticating with game server
                                </Text>
                            </View>
                        </View>

                        {/* Step 2: Create Session */}
                        <View className="flex-row items-center">
                            {isSessionCreated ? (
                                <View className="w-6 h-6 rounded-full bg-emerald-500 items-center justify-center">
                                    <Check size={14} color="#fff" />
                                </View>
                            ) : isInitializing ? (
                                <ActivityIndicator size="small" color={isDark ? '#818cf8' : '#6366f1'} />
                            ) : (
                                <View className={`w-6 h-6 rounded-full items-center justify-center ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
                                    <Text className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>2</Text>
                                </View>
                            )}
                            <View className="ml-3 flex-1">
                                <Text className={`text-sm font-medium ${
                                    isSessionCreated
                                        ? 'text-emerald-500'
                                        : isDark ? 'text-slate-200' : 'text-slate-700'
                                }`}>
                                    Create Game Account
                                </Text>
                                <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    One-time on-chain setup
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Cost Info */}
                    {isAuthenticated && !isSessionCreated && (
                        <View className={`flex-row items-center rounded-xl p-3 mb-4 ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                            <Shield size={14} color={isDark ? '#818cf8' : '#6366f1'} />
                            <Text className={`ml-2 text-xs flex-1 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                                ~0.028 SOL one-time fee (refundable). This creates your game session account on Solana.
                            </Text>
                        </View>
                    )}

                    {/* Create Session Button */}
                    {isAuthenticated && !isSessionCreated && (
                        <Pressable
                            onPress={onInitialize}
                            disabled={isInitializing}
                            className={`py-3.5 rounded-xl items-center ${
                                isInitializing
                                    ? isDark ? 'bg-indigo-800' : 'bg-indigo-400'
                                    : 'bg-indigo-600 active:bg-indigo-700'
                            }`}
                        >
                            {isInitializing ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text className="text-white font-bold text-base">Create Session</Text>
                            )}
                        </Pressable>
                    )}

                    {/* Authenticating helper */}
                    {!isAuthenticated && (
                        <Text className={`text-xs text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Please wait while we authenticate with the game server...
                        </Text>
                    )}
                </View>
            </View>
        </Modal>
    );
}
