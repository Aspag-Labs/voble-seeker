/**
 * Player Rank hook for mobile
 * Fetches player ranking from Supabase via API
 * Ported from web's use-player-rank.ts
 */
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '../providers';

const API_BASE_URL = 'https://voble.fun';

export interface PlayerRank {
    rank: number | null;
    totalPlayers: number;
    percentile: number | null;
}

export function usePlayerRank() {
    const { address: walletAddress, connected } = useWallet();

    return useQuery<PlayerRank>({
        queryKey: ['playerRank', walletAddress],
        queryFn: async (): Promise<PlayerRank> => {
            if (!walletAddress) {
                throw new Error('No wallet connected');
            }

            const params = new URLSearchParams({ player: walletAddress });
            const response = await fetch(`${API_BASE_URL}/api/player/rank?${params}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch player rank: ${response.status}`);
            }

            return response.json();
        },
        enabled: !!walletAddress && connected,
        staleTime: 60_000,
        refetchInterval: 300_000,
    });
}
