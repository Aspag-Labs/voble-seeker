import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Linking,
    useColorScheme,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

// ── Helpers ──────────────────────────────────────────────────────────────────

function P({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
    return (
        <Text className={`text-[15px] leading-6 mb-4 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
            {children}
        </Text>
    );
}

function H2({ children, isDark }: { children: string; isDark: boolean }) {
    return (
        <Text className={`text-2xl font-bold mb-2 mt-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {children}
        </Text>
    );
}

function H3({ children, isDark }: { children: string; isDark: boolean }) {
    return (
        <Text className={`text-lg font-bold mb-1 mt-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {children}
        </Text>
    );
}

function Bullet({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
    return (
        <View className="flex-row pl-4 mb-1.5">
            <Text className={`mr-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>•</Text>
            <Text className={`text-[15px] leading-6 flex-1 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                {children}
            </Text>
        </View>
    );
}

function Card({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
    return (
        <View className={`p-4 rounded-xl mb-4 border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            {children}
        </View>
    );
}

function BorderLeft({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
    return (
        <View className={`pl-3 border-l-2 mb-4 ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}>
            {children}
        </View>
    );
}

function Bold({ children }: { children: string }) {
    return <Text className="font-bold">{children}</Text>;
}

// ── Section Content Components ───────────────────────────────────────────────

function IntroContent({ isDark }: { isDark: boolean }) {
    const primary = isDark ? 'text-white' : 'text-zinc-900';
    return (
        <View>
            <H2 isDark={isDark}>Overview</H2>
            <P isDark={isDark}>
                Voble is a real stakes, competitive word puzzle game where your vocabulary skills translate directly into
                cryptocurrency rewards. Built on Solana blockchain, it combines the familiar mechanics of word guessing
                games with competitive tournaments and real monetary rewards.
            </P>
            <P isDark={isDark}>
                Players pay a small entry fee of <Bold>1 USDC</Bold> to participate in daily word challenges, with the
                top performers earning USDC prizes. The game uses private ephemeral rollups by MagicBlock with blockhash
                randomness inside a trusted execution environment (TEE) for random and fair word selection—making it
                impossible for anyone to peek or cheat.
            </P>

            <H2 isDark={isDark}>How to Play</H2>
            <P isDark={isDark}>
                Each day, players attempt to guess a randomly selected 6-letter word within 7 attempts. The game provides
                feedback after each guess:
            </P>
            <Bullet isDark={isDark}>Green tiles indicate correct letters in the correct position</Bullet>
            <Bullet isDark={isDark}>Purple tiles show correct letters in the wrong position</Bullet>
            <Bullet isDark={isDark}>Gray tiles represent letters not in the target word</Bullet>
            <P isDark={isDark}>
                Your performance is scored based on the number of guesses used, completion time, and accuracy. The scoring
                algorithm rewards both speed and efficiency.
            </P>
        </View>
    );
}

function TournamentsContent({ isDark }: { isDark: boolean }) {
    const primary = isDark ? '#e8e8e8' : '#171717';
    return (
        <View>
            <H2 isDark={isDark}>One Game, Three Opportunities</H2>
            <P isDark={isDark}>
                You don't need to play separate games for each tournament. <Bold>Every single game you play automatically
                counts towards the Daily, Weekly, and Monthly leaderboards simultaneously.</Bold> This means you can
                potentially win prizes in all three tournaments at the same time!
            </P>

            <H2 isDark={isDark}>Tournament Schedule</H2>

            <BorderLeft isDark={isDark}>
                <Text className={`text-lg font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>📅 Daily Tournament</Text>
                <Text className={`text-[15px] leading-6 mt-1 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    Resets every 24 hours at <Bold>00:00 UTC+8</Bold>. Each day is a fresh start with a new word and a
                    clean leaderboard. Perfect for quick wins.
                </Text>
            </BorderLeft>

            <BorderLeft isDark={isDark}>
                <Text className={`text-lg font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>🗓️ Weekly Tournament</Text>
                <Text className={`text-[15px] leading-6 mt-1 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    Runs from <Bold>Sunday to Sunday</Bold> (UTC+8). Your total score across the 7 days determines your
                    rank. This rewards consistency and regular play.
                </Text>
            </BorderLeft>

            <BorderLeft isDark={isDark}>
                <Text className={`text-lg font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>🏆 Monthly Tournament</Text>
                <Text className={`text-[15px] leading-6 mt-1 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    Runs for the full <Bold>calendar month</Bold>. This is the ultimate challenge, proving your
                    long-term mastery to win the biggest prizes.
                </Text>
            </BorderLeft>

            <H2 isDark={isDark}>Prize Distribution</H2>
            <P isDark={isDark}>Each tournament tier has a different number of winners who share the prize pool.</P>

            <Card isDark={isDark}>
                <Text className={`font-bold mb-1 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>📅 Daily - Top 10 Winners</Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    1st: 35% • 2nd: 20% • 3rd: 12% • 4th: 8% • 5th: 6% • 6th: 5% • 7th-8th: 4% each • 9th-10th: 3% each
                </Text>
            </Card>
            <Card isDark={isDark}>
                <Text className={`font-bold mb-1 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>🗓️ Weekly - Top 5 Winners</Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    1st: 40% • 2nd: 25% • 3rd: 15% • 4th: 12% • 5th: 8%
                </Text>
            </Card>
            <Card isDark={isDark}>
                <Text className={`font-bold mb-1 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>🏆 Monthly - Top 3 Winners</Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    1st: 50% • 2nd: 30% • 3rd: 20%
                </Text>
            </Card>

            <Text className={`text-sm mt-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Prizes are claimable via the dashboard immediately after the period ends.
            </Text>
        </View>
    );
}

function ScoringContent({ isDark }: { isDark: boolean }) {
    return (
        <View>
            <P isDark={isDark}>
                Your score in Voble is a combination of accuracy and speed. You earn points only when you solve the word.
            </P>

            <View className={`p-4 rounded-xl my-4 ${isDark ? 'bg-zinc-900/50' : 'bg-zinc-100'}`}>
                <Text className={`text-center font-mono text-base font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                    Total Score = Base Score + Time Bonus
                </Text>
            </View>

            <H3 isDark={isDark}>1. Base Score</H3>
            <P isDark={isDark}>Points are awarded based on how many guesses you needed to solve the word.</P>
            {[
                ['1 Guess', '1,000 pts'], ['2 Guesses', '800 pts'], ['3 Guesses', '600 pts'],
                ['4 Guesses', '400 pts'], ['5 Guesses', '300 pts'], ['6 Guesses', '200 pts'], ['7 Guesses', '100 pts'],
            ].map(([g, p]) => (
                <Bullet key={g} isDark={isDark}>{g}: <Bold>{p}</Bold></Bullet>
            ))}

            <H3 isDark={isDark}>2. Time Bonus</H3>
            <P isDark={isDark}>Speed matters! You get bonus points for finishing quickly.</P>
            {[
                ['Max 3 minutes', '+100 pts'], ['Max 5 minutes', '+50 pts'],
                ['Max 7 minutes', '+20 pts'], ['Over 7 minutes', '+0 pts'],
            ].map(([t, b]) => (
                <Bullet key={t} isDark={isDark}>{t}: <Bold>{b}</Bold></Bullet>
            ))}

            <Card isDark={isDark}>
                <Text className={`font-semibold mb-1 ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>Example Calculation:</Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    You solve the word in 3 guesses and take 150 seconds.{'\n'}
                    Base Score (3 guesses) = 600{'\n'}
                    Time Bonus (max 3 min) = 100{'\n'}
                    Total Score = 700 points
                </Text>
            </Card>

            <H2 isDark={isDark}>Tournament Scoring</H2>
            <P isDark={isDark}>Your game scores accumulate differently for each tournament period.</P>

            <H3 isDark={isDark}>Daily Tournament</H3>
            <P isDark={isDark}>Your score for the daily tournament is simply your score from that day's single game.</P>

            <H3 isDark={isDark}>Weekly Tournament</H3>
            <P isDark={isDark}>
                Your weekly score is the <Bold>sum of all your daily scores</Bold> from Sunday to Sunday (UTC+8).
                Consistency is key!
            </P>

            <H3 isDark={isDark}>Monthly Tournament</H3>
            <P isDark={isDark}>
                Your monthly score is the <Bold>sum of all your daily scores</Bold> for the entire calendar month.
                Playing every day maximizes your chances.
            </P>

            <Card isDark={isDark}>
                <Text className={`font-bold mb-2 ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>🏆 Tie-Breaker Rules</Text>
                <Bullet isDark={isDark}><Bold>Primary:</Bold> Higher score wins.</Bullet>
                <Bullet isDark={isDark}><Bold>Secondary:</Bold> If scores are equal, the player with the fastest completion time wins.</Bullet>
                <Bullet isDark={isDark}><Bold>Final:</Bold> If both score and time are identical, the player who submitted their score first wins.</Bullet>
            </Card>
        </View>
    );
}

function LuckyDrawContent({ isDark }: { isDark: boolean }) {
    return (
        <View>
            <H2 isDark={isDark}>Automatic Entry</H2>
            <P isDark={isDark}>
                Every player who participates during the week is automatically entered into the Lucky Draw.
                <Bold> All players are eligible, including tournament winners!</Bold>
            </P>

            <H2 isDark={isDark}>How It Works</H2>

            <BorderLeft isDark={isDark}>
                <Text className={`text-lg font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Prize Pool Allocation</Text>
                <Text className={`text-[15px] leading-6 mt-1 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    <Bold>5% of all ticket sales</Bold> accumulate into the weekly Lucky Draw jackpot. As more people play, the prize grows.
                </Text>
            </BorderLeft>

            <BorderLeft isDark={isDark}>
                <Text className={`text-lg font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Winner Selection</Text>
                <Text className={`text-[15px] leading-6 mt-1 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    Every Monday at 00:15 UTC+8, one lucky winner from the previous week is randomly selected using
                    MagicBlock's Verifiable Random Function (VRF)—ensuring a provably fair and tamper-proof selection process.
                </Text>
            </BorderLeft>

            <H2 isDark={isDark}>Eligibility</H2>
            <Bullet isDark={isDark}>Play at least <Bold>1 game</Bold> during the week.</Bullet>
            <Bullet isDark={isDark}><Bold>All players</Bold> who participated are eligible, including daily and weekly prize winners!</Bullet>
        </View>
    );
}

function FeeStructureContent({ isDark }: { isDark: boolean }) {
    return (
        <View>
            <P isDark={isDark}>
                Voble is built on a foundation of fairness. Every USDC entered goes into a verifiable on-chain distribution
                system, ensuring that the majority of funds return directly to the players.
            </P>

            <View className="flex-row gap-3 mb-6">
                {[
                    { pct: '80%', label: 'Player Rewards', desc: 'Funds the Daily, Weekly, and Monthly tournament prize pools.' },
                    { pct: '5%', label: 'Lucky Draw', desc: 'Weekly jackpot where one random player wins.' },
                    { pct: '15%', label: 'Operations', desc: 'Platform development and maintenance.' },
                ].map((item) => (
                    <View key={item.pct} className={`flex-1 items-center p-3 rounded-xl border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                        <Text className={`text-2xl font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{item.pct}</Text>
                        <Text className={`text-xs font-semibold mt-1 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>{item.label}</Text>
                        <Text className={`text-[10px] text-center mt-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{item.desc}</Text>
                    </View>
                ))}
            </View>

            <H2 isDark={isDark}>Prize Pool Allocation</H2>
            <P isDark={isDark}>Here is the breakdown of how each ticket is allocated to the tournament prize pools:</P>

            <View className="flex-row gap-3 mb-4">
                {[
                    { pct: '52%', label: 'Daily Vault' },
                    { pct: '16%', label: 'Weekly Vault' },
                    { pct: '12%', label: 'Monthly Vault' },
                ].map((item) => (
                    <View key={item.pct} className={`flex-1 items-center p-3 rounded-xl border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                        <Text className={`text-xl font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{item.pct}</Text>
                        <Text className={`text-xs font-semibold mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.label}</Text>
                    </View>
                ))}
            </View>

            <Text className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                All fund distributions are executed automatically by smart contracts on the Solana blockchain and verifiable.
            </Text>
        </View>
    );
}

function ReferralContent({ isDark }: { isDark: boolean }) {
    const rows = [
        ['100', '3 USDC', '21 USDC', '90 USDC'],
        ['1,000', '30 USDC', '210 USDC', '900 USDC'],
        ['2,000', '60 USDC', '420 USDC', '1,800 USDC'],
        ['3,000', '90 USDC', '630 USDC', '2,700 USDC'],
        ['5,000', '150 USDC', '1,050 USDC', '4,500 USDC'],
    ];
    return (
        <View>
            <H2 isDark={isDark}>Invite Your Friends, Get Lifetime Bonus!</H2>
            <P isDark={isDark}>Earn more USDC by inviting friends to play Voble.</P>

            <Card isDark={isDark}>
                <Text className={`text-2xl mb-2`}>💸</Text>
                <Text className={`font-bold mb-1 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>20% Commission</Text>
                <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    You earn <Bold>20% of the platform fees</Bold> generated by every player you invite. Paid in USDC.
                </Text>
            </Card>

            <H2 isDark={isDark}>Potential Earnings</H2>
            <P isDark={isDark}>Below is an estimated bonus you'll get based on active daily players you invite on Voble:</P>

            <View className={`rounded-xl overflow-hidden border ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                {/* Header */}
                <View className={`flex-row ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                    {['Players', 'Daily', 'Weekly', 'Monthly'].map((h) => (
                        <View key={h} className="flex-1 px-3 py-2.5">
                            <Text className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{h}</Text>
                        </View>
                    ))}
                </View>
                {/* Rows */}
                {rows.map((cells, i) => (
                    <View key={i} className={`flex-row ${i > 0 ? (isDark ? 'border-t border-zinc-800' : 'border-t border-zinc-200') : ''}`}>
                        {cells.map((cell, j) => (
                            <View key={j} className="flex-1 px-3 py-2.5">
                                <Text className={`text-xs ${j === 0 ? 'font-semibold' : ''} ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{cell}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
}

function TokenomicsContent({ isDark }: { isDark: boolean }) {
    return (
        <View>
            <H2 isDark={isDark}>Contract Address</H2>
            <View className={`p-3 rounded-xl border mb-4 ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <Text className={`font-mono text-sm ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>TBD</Text>
            </View>

            <H3 isDark={isDark}>Dev Address</H3>
            <P isDark={isDark}>Collects trading fees to cover development costs and fill prize pools.</P>
            <View className={`p-3 rounded-xl border mb-4 ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <Text className={`font-mono text-sm ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>TBD</Text>
            </View>

            <H2 isDark={isDark}>Play-to-Earn</H2>
            <P isDark={isDark}>
                Simply playing Voble earns you <Bold>Activity Points</Bold>. These points can be exchanged for 500
                $VOBLE tokens, allowing every player to become a stakeholder in the ecosystem just by participating.
            </P>

            <H2 isDark={isDark}>Flywheel</H2>
            <P isDark={isDark}>
                The Voble ecosystem is designed to create a sustainable value loop where platform success directly
                benefits token holders and players.
            </P>

            <Card isDark={isDark}>
                <H3 isDark={isDark}>Trading Revenue Share</H3>
                <Text className={`text-sm mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Fees generated from trading $VOBLE are reinvested back into the ecosystem.
                </Text>
                <View className="flex-row gap-2">
                    <View className={`flex-1 items-center p-2 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                        <Text className={`font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>60%</Text>
                        <Text className={`text-[10px] text-center mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Daily & Lucky Draw Prize Pools</Text>
                    </View>
                    <View className={`flex-1 items-center p-2 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                        <Text className={`font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>40%</Text>
                        <Text className={`text-[10px] text-center mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Development</Text>
                    </View>
                </View>
            </Card>

            <Card isDark={isDark}>
                <H3 isDark={isDark}>Platform Revenue Buyback</H3>
                <Text className={`text-sm mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    A portion of the revenue generated from game fees is used to support the token price.
                </Text>
                <View className={`items-center p-4 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                    <Text className={`text-3xl font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>20%</Text>
                    <Text className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>of Platform Revenue</Text>
                    <Text className={`text-[10px] mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Used for Token Buybacks</Text>
                </View>
            </Card>
        </View>
    );
}

function LinksContent({ isDark }: { isDark: boolean }) {
    return (
        <View>
            <H2 isDark={isDark}>Platform Revenue Address</H2>
            <P isDark={isDark}>Collects all revenue generated by the platform.</P>
            <View className={`p-3 rounded-xl border mb-4 ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <Text className={`font-mono text-sm ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>TBD</Text>
            </View>

            <H3 isDark={isDark}>Admin Address</H3>
            <P isDark={isDark}>Withdraws platform revenue for development and buybacks.</P>
            <View className={`p-3 rounded-xl border mb-4 ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <Text className={`font-mono text-sm ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>TBD</Text>
            </View>

            <H2 isDark={isDark}>Community</H2>
            <Pressable
                onPress={() => Linking.openURL('https://x.com/voblefun')}
                className={`flex-row items-center justify-between p-4 rounded-xl mb-3 ${isDark ? 'bg-zinc-900/50 active:bg-zinc-800' : 'bg-zinc-50 active:bg-zinc-100'}`}
            >
                <Text className={`text-sm font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>Twitter / X</Text>
                <Text className={`text-sm font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>@voblefun</Text>
            </Pressable>

            <Pressable
                onPress={() => Linking.openURL('https://t.me/voblefun')}
                className={`flex-row items-center justify-between p-4 rounded-xl ${isDark ? 'bg-zinc-900/50 active:bg-zinc-800' : 'bg-zinc-50 active:bg-zinc-100'}`}
            >
                <Text className={`text-sm font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>Telegram</Text>
                <Text className={`text-sm font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>@voblefun</Text>
            </Pressable>
        </View>
    );
}

// ── Sections config ──────────────────────────────────────────────────────────

const SECTIONS = [
    { id: 'intro', title: 'Introduction', heading: 'Intro', subtitle: 'Learn about Voble.', Content: IntroContent },
    { id: 'tournaments', title: 'Tournaments', heading: 'Tournaments', subtitle: 'Learn about tournaments.', Content: TournamentsContent },
    { id: 'scoring', title: 'Scoring', heading: 'Scoring', subtitle: 'Learn about scoring in Voble.', Content: ScoringContent },
    { id: 'lucky-draw', title: 'Lucky Draw', heading: 'Lucky Draw', subtitle: 'Learn about the weekly raffle.', Content: LuckyDrawContent },
    { id: 'fee-structure', title: 'Fee Structure', heading: 'Fee Structure', subtitle: 'Learn how funds are distributed.', Content: FeeStructureContent },
    { id: 'referral', title: 'Referral', heading: 'Referral Program', subtitle: 'Share the game, share the revenue.', Content: ReferralContent },
    { id: 'tokenomics', title: 'Tokenomics', heading: 'Tokenomics', subtitle: 'Learn about the token economy.', Content: TokenomicsContent },
    { id: 'links', title: 'Links', heading: 'Links', subtitle: 'Key information and links', Content: LinksContent },
];

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function AboutScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [activeIndex, setActiveIndex] = useState(0);

    const section = SECTIONS[activeIndex];
    const prev = SECTIONS[activeIndex - 1];
    const next = SECTIONS[activeIndex + 1];

    const mutedColor = isDark ? '#a3a3a3' : '#737373';
    const primaryColor = isDark ? '#fafafa' : '#09090b';

    return (
        <View className={`flex-1 ${isDark ? 'bg-[#09090b]' : 'bg-white'}`}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} key={activeIndex}>
                <View className="px-4 py-8">
                    {/* Heading */}
                    <Text className={`text-4xl font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {section.heading}
                    </Text>
                    <Text className={`text-sm tracking-wider mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {section.subtitle}
                    </Text>

                    {/* Content */}
                    <section.Content isDark={isDark} />

                    {/* Pagination */}
                    <View className={`flex-row items-center justify-between pt-8 mt-8 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                        {prev ? (
                            <Pressable
                                onPress={() => setActiveIndex(activeIndex - 1)}
                                className="flex-row items-center"
                            >
                                <ChevronLeft size={18} color={mutedColor} />
                                <View className="ml-2">
                                    <Text className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Previous</Text>
                                    <Text className={`font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>{prev.title}</Text>
                                </View>
                            </Pressable>
                        ) : (
                            <View />
                        )}

                        {next ? (
                            <Pressable
                                onPress={() => setActiveIndex(activeIndex + 1)}
                                className="flex-row items-center"
                            >
                                <View className="mr-2 items-end">
                                    <Text className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Next</Text>
                                    <Text className={`font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>{next.title}</Text>
                                </View>
                                <ChevronRight size={18} color={mutedColor} />
                            </Pressable>
                        ) : (
                            <View />
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
