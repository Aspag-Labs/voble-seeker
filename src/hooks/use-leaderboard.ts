import { useQuery } from '@tanstack/react-query';
import { useWallet } from '../providers';

// API base URL - in production this would be your backend URL
const API_BASE_URL = 'https://voble.fun';

export type PeriodType = 'daily' | 'weekly' | 'monthly';

export interface LeaderboardRow {
    rank: number;
    player: string;
    username: string;
    score: number;
    guessesUsed: number;
    timeMs: number;
    gamesPlayed: number;
}

export interface UseLeaderboardResult {
    entries: LeaderboardRow[];
    totalPlayers: number;
    periodId: string;
    userRank: number | null;
    isLoading: boolean;
    isFetching: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Get current period IDs based on UTC+8 timezone
 */
function getCurrentPeriodIds() {
    const now = new Date();
    // Convert to UTC+8
    const utc8Offset = 8 * 60 * 60 * 1000;
    const utc8Time = new Date(now.getTime() + utc8Offset);

    const year = utc8Time.getUTCFullYear();
    const month = String(utc8Time.getUTCMonth() + 1).padStart(2, '0');
    const day = String(utc8Time.getUTCDate()).padStart(2, '0');

    // Calculate week number
    const startOfYear = new Date(Date.UTC(year, 0, 1));
    const daysSinceStart = Math.floor((utc8Time.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((daysSinceStart + startOfYear.getUTCDay() + 1) / 7);

    return {
        daily: `${year}-${month}-${day}`,
        weekly: `${year}-W${String(weekNumber).padStart(2, '0')}`,
        monthly: `${year}-${month}`,
    };
}

export function useLeaderboard(periodType: PeriodType): UseLeaderboardResult {
    const { address } = useWallet();
    const { daily, weekly, monthly } = getCurrentPeriodIds();
    const periodId = periodType === 'daily' ? daily : periodType === 'weekly' ? weekly : monthly;

    const queryResult = useQuery({
        queryKey: ['leaderboard', periodType, periodId],
        queryFn: async () => {
            const params = new URLSearchParams({
                period: periodType,
                period_id: periodId,
            });

            const response = await fetch(`${API_BASE_URL}/api/leaderboard?${params}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch leaderboard');
            }

            const entries: LeaderboardRow[] = (data.entries || []).map((e: any) => ({
                rank: e.rank,
                player: e.player,
                username: e.username || '',
                score: Number(e.score ?? 0),
                guessesUsed: Number(e.guessesUsed ?? 0),
                timeMs: Number(e.timeMs ?? 0),
                gamesPlayed: Number(e.gamesPlayed ?? 1),
            }));

            return {
                entries,
                totalPlayers: data.totalPlayers || entries.length,
                periodId: data.periodId || periodId,
            };
        },
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: 2,
    });

    const entries = queryResult.data?.entries ?? [];

    // Find user's rank if connected
    const userRank = address
        ? entries.find((e) => e.player === address)?.rank ?? null
        : null;

    return {
        entries,
        totalPlayers: queryResult.data?.totalPlayers ?? 0,
        periodId: queryResult.data?.periodId ?? periodId,
        userRank,
        isLoading: queryResult.isLoading,
        isFetching: queryResult.isFetching,
        error: queryResult.error?.message ?? null,
        refetch: queryResult.refetch,
    };
}
