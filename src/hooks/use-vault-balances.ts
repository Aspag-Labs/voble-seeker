import { useQuery } from '@tanstack/react-query';

// API base URL
const API_BASE_URL = 'https://voble.fun';

export interface VaultBalances {
    daily: { balance: number };
    weekly: { balance: number };
    monthly: { balance: number };
    luckyDraw: { balance: number };
}

export interface UseVaultBalancesResult {
    balances: VaultBalances | null;
    isLoading: boolean;
    isFetching: boolean;
    error: string | null;
    refetch: () => void;
}

export function useVaultBalances(): UseVaultBalancesResult {
    const queryResult = useQuery({
        queryKey: ['vaultBalances'],
        queryFn: async (): Promise<VaultBalances> => {
            const response = await fetch(`${API_BASE_URL}/api/vault-balances`);

            if (!response.ok) {
                throw new Error('Failed to fetch vault balances');
            }

            const data = await response.json();

            return {
                daily: { balance: data.daily?.balance ?? 0 },
                weekly: { balance: data.weekly?.balance ?? 0 },
                monthly: { balance: data.monthly?.balance ?? 0 },
                luckyDraw: { balance: data.luckyDraw?.balance ?? 0 },
            };
        },
        staleTime: 60_000, // Cache for 1 minute
        refetchOnWindowFocus: false,
        retry: 2,
    });

    return {
        balances: queryResult.data ?? null,
        isLoading: queryResult.isLoading,
        isFetching: queryResult.isFetching,
        error: queryResult.error?.message ?? null,
        refetch: queryResult.refetch,
    };
}
