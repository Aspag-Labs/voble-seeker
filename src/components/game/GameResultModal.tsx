import React from 'react';
import { View, Text, Modal, Pressable, Share, Linking, useColorScheme } from 'react-native';
import { X, Share2, RotateCcw, Trophy } from 'lucide-react-native';

interface GameResultModalProps {
    visible: boolean;
    onClose: () => void;
    onViewLeaderboard?: () => void;
    gameStatus: 'won' | 'lost';
    targetWord: string;
    guessesUsed: number;
    score: number;
    timeTaken?: number;
}

const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function GameResultModal({
    visible,
    onClose,
    onViewLeaderboard,
    gameStatus,
    targetWord,
    guessesUsed,
    score,
    timeTaken,
}: GameResultModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const isWin = gameStatus === 'won';

    const getShareMessage = () => {
        const guessEmojis = '🟩'.repeat(Math.min(guessesUsed, 7));
        if (isWin) {
            return `Just solved today's puzzle in ${guessesUsed} guesses! 🎯\n\n${guessEmojis} ${score.toLocaleString()} pts\n\nCan you beat my score on @voblefun?\nTry beta: devnet-test.voble.fun`;
        }
        return `Today's word got me 😤\n\n"${targetWord}" was tough!\n\nThink you can solve it? @voblefun\nTry beta: devnet-test.voble.fun`;
    };

    const handleShare = async () => {
        try {
            await Share.share({ message: getShareMessage() });
        } catch (err) {
            console.error('Share failed:', err);
        }
    };

    const handleShareToTwitter = async () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareMessage())}`;
        try {
            await Linking.openURL(url);
        } catch (err) {
            console.error('Twitter share failed:', err);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 items-center justify-center bg-black/60 px-6">
                <View className={`w-full max-w-sm rounded-3xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    {/* Close button */}
                    <Pressable
                        onPress={onClose}
                        className="absolute top-4 right-4 p-1 z-10"
                    >
                        <X size={20} color={isDark ? '#64748b' : '#94a3b8'} />
                    </Pressable>

                    {/* Result Icon */}
                    <View className="items-center mb-4">
                        <View className={`w-20 h-20 rounded-full items-center justify-center mb-3 ${
                            isWin
                                ? isDark ? 'bg-emerald-900/40' : 'bg-emerald-100'
                                : isDark ? 'bg-slate-700' : 'bg-slate-100'
                        }`}>
                            <Text className="text-4xl">{isWin ? '🎉' : '😔'}</Text>
                        </View>
                        <Text className={`text-2xl font-black ${
                            isWin ? 'text-emerald-500' : isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                            {isWin ? 'VICTORY!' : 'GAME OVER'}
                        </Text>
                    </View>

                    {/* Stats */}
                    <View className={`rounded-2xl p-4 mb-4 ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                        <View className={`flex-row justify-around ${isWin && timeTaken ? '' : ''}`}>
                            <View className="items-center flex-1">
                                <Text className={`text-2xl font-black ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                    {guessesUsed}/7
                                </Text>
                                <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Guesses
                                </Text>
                            </View>

                            {isWin && timeTaken !== undefined && (
                                <View className="items-center flex-1">
                                    <Text className="text-2xl font-black text-amber-500">
                                        {formatTime(timeTaken)}
                                    </Text>
                                    <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Time
                                    </Text>
                                </View>
                            )}

                            <View className="items-center flex-1">
                                <Text className="text-2xl font-black text-emerald-500">
                                    {score}
                                </Text>
                                <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Score
                                </Text>
                            </View>
                        </View>

                        {/* Target Word */}
                        {targetWord && (
                            <View className={`mt-4 pt-4 items-center ${isDark ? 'border-t border-slate-600' : 'border-t border-slate-200'}`}>
                                <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    The word was
                                </Text>
                                <Text className={`text-xl font-black tracking-widest mt-1 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                                    {targetWord}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Action Buttons */}
                    <View className="gap-3">
                        {/* Share Row */}
                        <View className="flex-row gap-3">
                            <Pressable
                                onPress={handleShareToTwitter}
                                className="flex-1 py-3.5 rounded-xl flex-row items-center justify-center bg-black active:opacity-80"
                            >
                                <Text className="text-white font-bold text-base mr-1.5">𝕏</Text>
                                <Text className="font-bold text-white">Post</Text>
                            </Pressable>

                            <Pressable
                                onPress={handleShare}
                                className={`flex-1 py-3.5 rounded-xl flex-row items-center justify-center ${isDark ? 'bg-slate-700 active:bg-slate-600' : 'bg-slate-100 active:bg-slate-200'}`}
                            >
                                <Share2 size={18} color={isDark ? '#e2e8f0' : '#475569'} />
                                <Text className={`ml-2 font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                    Share
                                </Text>
                            </Pressable>
                        </View>

                        {/* Leaderboard Button */}
                        {onViewLeaderboard && (
                            <Pressable
                                onPress={onViewLeaderboard}
                                className="py-3.5 rounded-xl flex-row items-center justify-center bg-amber-500 active:bg-amber-600"
                            >
                                <Trophy size={18} color="#fff" />
                                <Text className="ml-2 font-bold text-white">Leaderboard</Text>
                            </Pressable>
                        )}

                        {/* Done Button */}
                        <Pressable
                            onPress={onClose}
                            className="py-3.5 rounded-xl flex-row items-center justify-center bg-indigo-600 active:bg-indigo-700"
                        >
                            <RotateCcw size={18} color="#fff" />
                            <Text className="ml-2 font-bold text-white">Done</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
