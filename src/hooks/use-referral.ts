import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useWallet } from '../providers';

const API_BASE_URL = 'https://voble.fun';

export interface ReferralStats {
    code: string | null;
    referralLink: string | null;
    referralCount: number;
    claimableAmount: number;
    lifetimeEarnings: number;
    lastClaimedAt: string | null;
    recentEarnings: Array<{
        referee_wallet: string;
        referral_commission: number;
        created_at: string;
    }>;
}

export function useReferralStats() {
    const { address } = useWallet();

    const queryResult = useQuery<ReferralStats>({
        queryKey: ['referralStats', address],
        queryFn: async () => {
            if (!address) throw new Error('No wallet connected');
            const response = await fetch(`${API_BASE_URL}/api/referral/stats?wallet=${address}`);
            if (!response.ok) throw new Error('Failed to fetch referral stats');
            return response.json();
        },
        enabled: !!address,
        staleTime: 30_000,
        refetchInterval: 60_000,
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

export function useGenerateReferralCode() {
    const { address } = useWallet();
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateCode = async () => {
        if (!address) throw new Error('No wallet connected');

        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/referral/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet: address }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to generate referral code');
            }

            return response.json();
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsGenerating(false);
        }
    };

    return { generateCode, isGenerating, error };
}

export function useClaimReferral() {
    const { address } = useWallet();
    const [isClaiming, setIsClaiming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const claimReferral = async () => {
        if (!address) throw new Error('No wallet connected');

        setIsClaiming(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/referral/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet: address }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to claim referral earnings');
            }

            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsClaiming(false);
        }
    };

    return { claimReferral, isClaiming, error };
}
