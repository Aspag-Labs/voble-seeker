import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = 'https://voble.fun';

export interface ProtocolStats {
    totalPlayers: number;
    totalPrizeClaimedLamports: number;
}

export interface TopEarner {
    player: string;
    username: string;
    totalEarned: number;
}

export function useProtocolStats() {
    const queryResult = useQuery({
        queryKey: ['protocolStats'],
        queryFn: async (): Promise<ProtocolStats> => {
            const response = await fetch(`${API_BASE_URL}/api/stats`);
            if (!response.ok) throw new Error('Failed to fetch stats');
            const data = await response.json();
            return {
                totalPlayers: data.totalPlayers || 0,
                totalPrizeClaimedLamports: data.totalPrizeClaimedLamports || 0,
            };
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: 2,
    });

    return {
        stats: queryResult.data ?? null,
        isLoading: queryResult.isLoading,
        isFetching: queryResult.isFetching,
        error: queryResult.error?.message ?? null,
        refetch: queryResult.refetch,
    };
}

export function useTopEarners() {
    const queryResult = useQuery({
        queryKey: ['topEarners'],
        queryFn: async (): Promise<TopEarner[]> => {
            const response = await fetch(`${API_BASE_URL}/api/stats/top-earners`);
            if (!response.ok) throw new Error('Failed to fetch top earners');
            return response.json();
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: 2,
    });

    return {
        earners: queryResult.data ?? [],
        isLoading: queryResult.isLoading,
        error: queryResult.error?.message ?? null,
        refetch: queryResult.refetch,
    };
}
