import React from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Linking,
    useColorScheme,
} from 'react-native';
import {
    BookOpen,
    Trophy,
    Target,
    Gift,
    PieChart,
    UserPlus,
    Coins,
    ExternalLink,
} from 'lucide-react-native';

interface SectionProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    isDark: boolean;
}

function Section({ icon, title, children, isDark }: SectionProps) {
    return (
        <View className={`rounded-2xl overflow-hidden mb-4 ${isDark ? 'bg-[#0f0f10] border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
            <View className={`flex-row items-center px-4 py-3 ${isDark ? 'border-b border-zinc-800' : 'border-b border-zinc-200'}`}>
                {icon}
                <Text className={`ml-2 text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    {title}
                </Text>
            </View>
            <View className="px-4 py-4">{children}</View>
        </View>
    );
}

function TableRow({ cells, isHeader, isDark }: { cells: string[]; isHeader?: boolean; isDark: boolean }) {
    return (
        <View className={`flex-row ${isHeader ? (isDark ? 'bg-slate-700' : 'bg-slate-100') : ''}`}>
            {cells.map((cell, i) => (
                <View key={i} className={`flex-1 px-3 py-2 ${i > 0 ? (isDark ? 'border-l border-slate-700' : 'border-l border-slate-200') : ''}`}>
                    <Text
                        className={`text-xs ${isHeader
                            ? `font-bold uppercase ${isDark ? 'text-slate-300' : 'text-slate-600'}`
                            : `${isDark ? 'text-slate-300' : 'text-slate-700'}`
                            }`}
                    >
                        {cell}
                    </Text>
                </View>
            ))}
        </View>
    );
}

function TileSample({ letter, color, isDark }: { letter: string; color: 'green' | 'purple' | 'gray'; isDark: boolean }) {
    const bg = color === 'green'
        ? 'bg-[#14F195]'
        : color === 'purple'
            ? 'bg-[#9945FF]'
            : isDark ? 'bg-gray-500' : 'bg-gray-500';

    return (
        <View className={`w-9 h-9 rounded-lg items-center justify-center ${bg}`}>
            <Text className="text-white font-bold text-base">{letter}</Text>
        </View>
    );
}

export default function AboutScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const iconColor = isDark ? '#818cf8' : '#6366f1';
    const iconSize = 20;

    return (
        <View className={`flex-1 ${isDark ? 'bg-[#09090b]' : 'bg-slate-50'}`}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="px-4 py-4">

                    {/* 1. Introduction */}
                    <Section icon={<BookOpen size={iconSize} color={iconColor} />} title="Introduction" isDark={isDark}>
                        <Text className={`text-sm leading-5 mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Voble is a real stakes, competitive word puzzle game where your vocabulary skills translate directly into cryptocurrency rewards. Built on Solana blockchain.
                        </Text>
                        <Text className={`text-sm leading-5 mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Players pay an entry fee of 1 USDC to participate in daily word challenges. The game uses private ephemeral rollups by MagicBlock with blockhash randomness inside a TEE for fair word selection.
                        </Text>

                        <Text className={`text-base font-bold mb-2 mt-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            How to Play
                        </Text>
                        <Text className={`text-sm leading-5 mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Guess a 6-letter word within 7 attempts. After each guess you get feedback:
                        </Text>

                        <View className="flex-row items-center gap-3 mb-2">
                            <TileSample letter="V" color="green" isDark={isDark} />
                            <Text className={`text-sm flex-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                Green = correct letter, correct position
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-3 mb-2">
                            <TileSample letter="O" color="purple" isDark={isDark} />
                            <Text className={`text-sm flex-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                Purple = correct letter, wrong position
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-3">
                            <TileSample letter="X" color="gray" isDark={isDark} />
                            <Text className={`text-sm flex-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                Gray = letter not in the word
                            </Text>
                        </View>
                    </Section>

                    {/* 2. Tournaments */}
                    <Section icon={<Trophy size={iconSize} color="#f59e0b" />} title="Tournaments" isDark={isDark}>
                        <Text className={`text-sm leading-5 mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Every game counts towards Daily, Weekly, and Monthly leaderboards simultaneously. Win prizes in all three at the same time!
                        </Text>

                        <View className={`rounded-xl overflow-hidden mb-3 ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                            <View className={`px-3 py-2 ${isDark ? 'border-l-2 border-indigo-400' : 'border-l-2 border-indigo-600'}`}>
                                <Text className={`font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Daily Tournament</Text>
                                <Text className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Resets every 24 hours at 00:00 UTC+8. Fresh start daily.
                                </Text>
                            </View>
                        </View>
                        <View className={`rounded-xl overflow-hidden mb-3 ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                            <View className={`px-3 py-2 ${isDark ? 'border-l-2 border-indigo-400' : 'border-l-2 border-indigo-600'}`}>
                                <Text className={`font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Weekly Tournament</Text>
                                <Text className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Sunday to Sunday (UTC+8). Total score across 7 days.
                                </Text>
                            </View>
                        </View>
                        <View className={`rounded-xl overflow-hidden mb-4 ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                            <View className={`px-3 py-2 ${isDark ? 'border-l-2 border-indigo-400' : 'border-l-2 border-indigo-600'}`}>
                                <Text className={`font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Monthly Tournament</Text>
                                <Text className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Full calendar month. Ultimate long-term challenge.
                                </Text>
                            </View>
                        </View>

                        <Text className={`text-base font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            Prize Distribution
                        </Text>
                        <View className={`rounded-xl overflow-hidden mb-2 ${isDark ? 'bg-indigo-900/30 border border-indigo-800' : 'bg-indigo-50 border border-indigo-100'}`}>
                            <View className="px-3 py-2">
                                <Text className={`font-bold text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Daily - Top 10</Text>
                                <Text className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    1st: 35% | 2nd: 20% | 3rd: 12% | 4th: 8% | 5th: 6% | 6th: 5% | 7-8th: 4% | 9-10th: 3%
                                </Text>
                            </View>
                        </View>
                        <View className={`rounded-xl overflow-hidden mb-2 ${isDark ? 'bg-indigo-900/30 border border-indigo-800' : 'bg-indigo-50 border border-indigo-100'}`}>
                            <View className="px-3 py-2">
                                <Text className={`font-bold text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Weekly - Top 5</Text>
                                <Text className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    1st: 40% | 2nd: 25% | 3rd: 15% | 4th: 12% | 5th: 8%
                                </Text>
                            </View>
                        </View>
                        <View className={`rounded-xl overflow-hidden ${isDark ? 'bg-indigo-900/30 border border-indigo-800' : 'bg-indigo-50 border border-indigo-100'}`}>
                            <View className="px-3 py-2">
                                <Text className={`font-bold text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Monthly - Top 3</Text>
                                <Text className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    1st: 50% | 2nd: 30% | 3rd: 20%
                                </Text>
                            </View>
                        </View>
                    </Section>

                    {/* 3. Scoring */}
                    <Section icon={<Target size={iconSize} color={iconColor} />} title="Scoring" isDark={isDark}>
                        <View className={`rounded-xl p-3 mb-4 ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                            <Text className={`text-center font-mono text-sm font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                Total Score = Base Score + Time Bonus
                            </Text>
                        </View>

                        <Text className={`text-base font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            Base Score
                        </Text>
                        <View className={`rounded-xl overflow-hidden mb-4 border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                            <TableRow cells={['Guesses', 'Points']} isHeader isDark={isDark} />
                            <TableRow cells={['1 guess', '1,000 pts']} isDark={isDark} />
                            <TableRow cells={['2 guesses', '800 pts']} isDark={isDark} />
                            <TableRow cells={['3 guesses', '600 pts']} isDark={isDark} />
                            <TableRow cells={['4 guesses', '400 pts']} isDark={isDark} />
                            <TableRow cells={['5 guesses', '300 pts']} isDark={isDark} />
                            <TableRow cells={['6 guesses', '200 pts']} isDark={isDark} />
                            <TableRow cells={['7 guesses', '100 pts']} isDark={isDark} />
                        </View>

                        <Text className={`text-base font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            Time Bonus
                        </Text>
                        <View className={`rounded-xl overflow-hidden mb-4 border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                            <TableRow cells={['Time', 'Bonus']} isHeader isDark={isDark} />
                            <TableRow cells={['<= 3 min', '+100 pts']} isDark={isDark} />
                            <TableRow cells={['<= 5 min', '+50 pts']} isDark={isDark} />
                            <TableRow cells={['<= 7 min', '+20 pts']} isDark={isDark} />
                            <TableRow cells={['> 7 min', '+0 pts']} isDark={isDark} />
                        </View>

                        <View className={`rounded-xl p-3 ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                            <Text className={`text-sm font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                Example
                            </Text>
                            <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                3 guesses (600) + 150 seconds (100) = 700 points
                            </Text>
                        </View>
                    </Section>

                    {/* 4. Lucky Draw */}
                    <Section icon={<Gift size={iconSize} color="#ec4899" />} title="Lucky Draw" isDark={isDark}>
                        <Text className={`text-sm leading-5 mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Every player who participates during the week is automatically entered. 5% of all ticket sales go into the weekly jackpot.
                        </Text>
                        <Text className={`text-sm leading-5 mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Every Monday at 00:15 UTC+8, one lucky winner is randomly selected using MagicBlock's Verifiable Random Function (VRF) for provably fair selection.
                        </Text>
                        <Text className={`text-sm leading-5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            All players who played at least 1 game during the week are eligible, including tournament winners!
                        </Text>
                    </Section>

                    {/* 5. Fee Structure */}
                    <Section icon={<PieChart size={iconSize} color={iconColor} />} title="Fee Structure" isDark={isDark}>
                        <Text className={`text-sm leading-5 mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Every USDC entered goes into a verifiable on-chain distribution system.
                        </Text>

                        <View className="flex-row gap-2 mb-4">
                            <View className={`flex-1 items-center p-3 rounded-xl ${isDark ? 'bg-emerald-900/30 border border-emerald-800' : 'bg-emerald-50 border border-emerald-100'}`}>
                                <Text className={`text-2xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>80%</Text>
                                <Text className={`text-xs font-medium mt-1 text-center ${isDark ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>Player Rewards</Text>
                            </View>
                            <View className={`flex-1 items-center p-3 rounded-xl ${isDark ? 'bg-pink-900/30 border border-pink-800' : 'bg-pink-50 border border-pink-100'}`}>
                                <Text className={`text-2xl font-black ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>5%</Text>
                                <Text className={`text-xs font-medium mt-1 text-center ${isDark ? 'text-pink-400/70' : 'text-pink-600/70'}`}>Lucky Draw</Text>
                            </View>
                            <View className={`flex-1 items-center p-3 rounded-xl ${isDark ? 'bg-slate-700 border border-slate-600' : 'bg-slate-100 border border-slate-200'}`}>
                                <Text className={`text-2xl font-black ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>15%</Text>
                                <Text className={`text-xs font-medium mt-1 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Operations</Text>
                            </View>
                        </View>

                        <Text className={`text-base font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            Prize Pool Allocation
                        </Text>
                        <View className="flex-row gap-2">
                            <View className={`flex-1 items-center p-2 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                                <Text className={`text-lg font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>52%</Text>
                                <Text className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Daily</Text>
                            </View>
                            <View className={`flex-1 items-center p-2 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                                <Text className={`text-lg font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>16%</Text>
                                <Text className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Weekly</Text>
                            </View>
                            <View className={`flex-1 items-center p-2 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                                <Text className={`text-lg font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>12%</Text>
                                <Text className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Monthly</Text>
                            </View>
                        </View>
                    </Section>

                    {/* 6. Referral Program */}
                    <Section icon={<UserPlus size={iconSize} color="#10b981" />} title="Referral Program" isDark={isDark}>
                        <Text className={`text-sm leading-5 mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Earn 20% commission on platform fees from every player you invite. Paid in USDC, lifetime.
                        </Text>

                        <Text className={`text-base font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            Potential Earnings
                        </Text>
                        <View className={`rounded-xl overflow-hidden border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                            <TableRow cells={['Players', 'Daily', 'Weekly', 'Monthly']} isHeader isDark={isDark} />
                            <TableRow cells={['100', '$3', '$21', '$90']} isDark={isDark} />
                            <TableRow cells={['1,000', '$30', '$210', '$900']} isDark={isDark} />
                            <TableRow cells={['2,000', '$60', '$420', '$1,800']} isDark={isDark} />
                            <TableRow cells={['3,000', '$90', '$630', '$2,700']} isDark={isDark} />
                            <TableRow cells={['5,000', '$150', '$1,050', '$4,500']} isDark={isDark} />
                        </View>
                    </Section>

                    {/* 7. Tokenomics */}
                    <Section icon={<Coins size={iconSize} color="#f59e0b" />} title="Tokenomics" isDark={isDark}>
                        <Text className={`text-sm leading-5 mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Playing Voble earns you Activity Points. These points can be exchanged for 500 $VOBLE tokens, making every player a stakeholder.
                        </Text>

                        <Text className={`text-base font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            Trading Revenue Share
                        </Text>
                        <View className="flex-row gap-2 mb-4">
                            <View className={`flex-1 items-center p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                                <Text className={`text-xl font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>60%</Text>
                                <Text className={`text-[10px] text-center mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Daily & Lucky Draw Prize Pools
                                </Text>
                            </View>
                            <View className={`flex-1 items-center p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                                <Text className={`text-xl font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>40%</Text>
                                <Text className={`text-[10px] text-center mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Development
                                </Text>
                            </View>
                        </View>

                        <Text className={`text-base font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            Platform Revenue Buyback
                        </Text>
                        <View className={`items-center p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                            <Text className={`text-3xl font-black ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>20%</Text>
                            <Text className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>of Platform Revenue</Text>
                            <Text className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Used for Token Buybacks</Text>
                        </View>
                    </Section>

                    {/* 8. Links */}
                    <Section icon={<ExternalLink size={iconSize} color={iconColor} />} title="Links" isDark={isDark}>
                        <Pressable
                            onPress={() => Linking.openURL('https://x.com/voblefun')}
                            className={`flex-row items-center justify-between p-3 rounded-xl mb-2 ${isDark ? 'bg-slate-700/50 active:bg-slate-700' : 'bg-slate-50 active:bg-slate-100'}`}
                        >
                            <View className="flex-row items-center">
                                <Text className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Twitter / X</Text>
                            </View>
                            <Text className={`text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>@voblefun</Text>
                        </Pressable>

                        <Pressable
                            onPress={() => Linking.openURL('https://t.me/voblefun')}
                            className={`flex-row items-center justify-between p-3 rounded-xl ${isDark ? 'bg-slate-700/50 active:bg-slate-700' : 'bg-slate-50 active:bg-slate-100'}`}
                        >
                            <View className="flex-row items-center">
                                <Text className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Telegram</Text>
                            </View>
                            <Text className={`text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>@voblefun</Text>
                        </Pressable>
                    </Section>

                    <View className="h-8" />
                </View>
            </ScrollView>
        </View>
    );
}
