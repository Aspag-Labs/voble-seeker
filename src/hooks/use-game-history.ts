/**
 * Game History hook for mobile
 * Fetches game history and player stats from Supabase via API
 * Ported from web's use-game-history.ts
 */
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '../providers';

const API_BASE_URL = 'https://voble.fun';

export interface GameHistoryItem {
    id: number;
    player: string;
    period_id: string;
    target_word: string | null;
    guesses: any[];
    score: number;
    guesses_used: number;
    time_ms: number;
    is_won: boolean;
    created_at: string;
}

export interface PlayerStatsFromDB {
    player: string;
    username: string | null;
    total_games: number;
    games_won: number;
    total_score: number;
    best_score: number;
    average_guesses: number;
    guess_distribution: number[];
}

export interface GameHistoryResult {
    games: GameHistoryItem[];
    stats: PlayerStatsFromDB | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useGameHistory(limit = 20, offset = 0): GameHistoryResult {
    const { address: walletAddress, connected } = useWallet();

    const queryResult = useQuery({
        queryKey: ['gameHistory', walletAddress, limit, offset],
        queryFn: async () => {
            if (!walletAddress) {
                throw new Error('No wallet connected');
            }

            const params = new URLSearchParams({
                player: walletAddress,
                limit: limit.toString(),
                offset: offset.toString(),
            });

            const response = await fetch(`${API_BASE_URL}/api/game/history?${params}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch game history: ${response.status}`);
            }

            const data = await response.json();

            return {
                games: (data.games || []) as GameHistoryItem[],
                stats: (data.stats || null) as PlayerStatsFromDB | null,
            };
        },
        enabled: !!walletAddress && connected,
        staleTime: 30_000,
        retry: 2,
    });

    return {
        games: queryResult.data?.games || [],
        stats: queryResult.data?.stats || null,
        isLoading: queryResult.isLoading,
        error: queryResult.error?.message || null,
        refetch: queryResult.refetch,
    };
}
