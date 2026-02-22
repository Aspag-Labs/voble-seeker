import React from 'react';
import { View, Text, Pressable, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserCircle, Trophy, Target, Zap, Share2, ArrowRight } from 'lucide-react-native';

const FEATURES = [
    { Icon: Trophy, text: 'Win Prizes' },
    { Icon: Target, text: 'Track Stats' },
    { Icon: Zap, text: 'Gasless Play' },
    { Icon: Share2, text: 'Share Wins' },
];

export function CreateProfilePrompt() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const navigation = useNavigation<any>();

    const iconColor = isDark ? '#818cf8' : '#4f46e5';
    const textColor = isDark ? 'text-white' : 'text-zinc-900';
    const subtextColor = isDark ? 'text-zinc-400' : 'text-zinc-600';
    const borderColor = isDark ? 'border-zinc-800' : 'border-zinc-200';

    return (
        <View className={`flex-1 items-center justify-center p-4 ${isDark ? 'bg-[#09090b]' : 'bg-zinc-50'}`}>
            <View
                className={`w-full rounded-2xl border p-8 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: isDark ? 0.4 : 0.15,
                    shadowRadius: 24,
                    elevation: 12,
                }}
            >
                {/* Icon */}
                <View className={`w-20 h-20 rounded-2xl items-center justify-center self-center mb-8 ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-100'}`}>
                    <UserCircle size={40} color={iconColor} />
                </View>

                {/* Title */}
                <Text className={`text-3xl font-black text-center mb-3 ${textColor}`}>
                    Create Your Profile
                </Text>
                <Text className={`text-lg text-center mb-10 ${subtextColor}`}>
                    Join the leaderboard and compete for daily prizes
                </Text>

                {/* Features Grid */}
                <View className="flex-row flex-wrap gap-4 mb-10">
                    {FEATURES.map(({ Icon, text }, i) => (
                        <View
                            key={i}
                            className={`flex-row items-center gap-3 p-4 rounded-xl border ${borderColor}`}
                            style={{ width: '47%' }}
                        >
                            <Icon size={20} color={iconColor} />
                            <Text className={`font-semibold ${textColor}`}>{text}</Text>
                        </View>
                    ))}
                </View>

                {/* Button */}
                <Pressable
                    onPress={() => navigation.navigate('Profile')}
                    className="bg-[#4f46e5] active:opacity-90 py-4 rounded-xl flex-row items-center justify-center"
                >
                    <Text className="text-white font-bold text-base">Create Profile</Text>
                    <ArrowRight size={18} color="#fff" style={{ marginLeft: 8 }} />
                </Pressable>
            </View>
        </View>
    );
}
