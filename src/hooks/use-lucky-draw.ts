import { useState, useEffect, useMemo, useCallback } from 'react';
import { useVaultBalances } from './use-vault-balances';
import { useLeaderboard } from './use-leaderboard';

const API_BASE_URL = 'https://voble.fun';

export interface LuckyDrawWinner {
    week: string;
    address: string;
    amount: string;
    date: string;
}

export interface LuckyDrawData {
    currentBalance: number;
    totalEligiblePlayers: number;
    nextDrawIn: string;
    isEligible: boolean;
    isLoading: boolean;
    error: string | null;
    recentWinners: LuckyDrawWinner[];
    refetch: () => void;
}

/**
 * Calculate time until next Sunday midnight UTC
 */
function calculateNextDrawIn(): string {
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0 = Sunday
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;

    const targetDate = new Date(now);
    targetDate.setUTCDate(now.getUTCDate() + daysUntilSunday);
    targetDate.setUTCHours(23, 59, 59, 0);

    const diff = targetDate.getTime() - now.getTime();
    if (diff <= 0) return 'Soon...';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
}

export function useLuckyDraw(): LuckyDrawData {
    const { balances, isLoading: isVaultLoading, refetch: refetchVault } = useVaultBalances();
    const {
        totalPlayers,
        userRank,
        isLoading: isLeaderboardLoading,
        refetch: refetchLeaderboard,
    } = useLeaderboard('weekly');

    const [recentWinners, setRecentWinners] = useState<LuckyDrawWinner[]>([]);
    const [isLoadingWinners, setIsLoadingWinners] = useState(false);

    const nextDrawIn = useMemo(() => calculateNextDrawIn(), []);

    const fetchRecentWinners = useCallback(async () => {
        setIsLoadingWinners(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/lucky-draw/winners`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.winners)) {
                    setRecentWinners(data.winners.map((w: any) => ({
                        week: w.week || w.period_id || '',
                        address: w.address ? `${w.address.slice(0, 4)}...${w.address.slice(-4)}` : '',
                        amount: w.amount ? (Number(w.amount) / 1_000_000).toFixed(2) : '0',
                        date: w.date || w.timestamp || '',
                    })));
                }
            }
        } catch {
            // API not available yet — show empty list
        } finally {
            setIsLoadingWinners(false);
        }
    }, []);

    useEffect(() => {
        fetchRecentWinners();
    }, [fetchRecentWinners]);

    const refetch = useCallback(() => {
        refetchVault();
        refetchLeaderboard();
        fetchRecentWinners();
    }, [refetchVault, refetchLeaderboard, fetchRecentWinners]);

    return {
        currentBalance: balances?.luckyDraw?.balance ?? 0,
        totalEligiblePlayers: totalPlayers,
        nextDrawIn,
        isEligible: userRank !== null,
        isLoading: isVaultLoading || isLeaderboardLoading || isLoadingWinners,
        error: null,
        recentWinners,
        refetch,
    };
}
