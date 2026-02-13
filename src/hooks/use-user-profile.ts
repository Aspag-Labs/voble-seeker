/**
 * User Profile hook for mobile
 * Fetches user profile from blockchain (base layer)
 * Used by game machine for lastPaidPeriod check (auto-recovery)
 */
import { useQuery } from '@tanstack/react-query';
import { address, type Address } from '@solana/kit';

import { getUserProfilePDA } from './pdas';
import { fetchMaybeUserProfile, type UserProfile } from '../generated';
import { createRpc } from './utils';
import { useWallet } from '../providers';

export interface UserProfileData {
    player: Address;
    username: string;
    totalGamesPlayed: number;
    gamesWon: number;
    totalScore: number;
    bestScore: number;
    totalPrizeWinnings: bigint;
    totalLuckyDrawWinnings: bigint;
    createdAt: bigint;
    lastPlayed: bigint;
    activityPoints: number;
    lastPaidPeriod: string;
}

export interface UserProfileResult {
    profile: UserProfileData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
    exists: boolean;
}

export function useUserProfile(walletAddress?: string): UserProfileResult {
    const { address: connectedAddress } = useWallet();
    const targetAddress = walletAddress || connectedAddress;

    const queryResult = useQuery({
        queryKey: ['userProfile', targetAddress],
        queryFn: async (): Promise<UserProfileData | null> => {
            if (!targetAddress) {
                throw new Error('No wallet address provided');
            }

            const playerAddress = address(targetAddress);
            const [userProfilePda] = await getUserProfilePDA(playerAddress);

            try {
                const rpc = createRpc();
                const maybeProfile = await fetchMaybeUserProfile(rpc, userProfilePda);

                if (!maybeProfile.exists) {
                    return null;
                }

                const profileAccount = maybeProfile.data;

                return {
                    player: profileAccount.player,
                    username: profileAccount.username,
                    totalGamesPlayed: profileAccount.totalGamesPlayed,
                    gamesWon: profileAccount.gamesWon,
                    totalScore: profileAccount.totalScore,
                    bestScore: profileAccount.bestScore,
                    totalPrizeWinnings: profileAccount.totalPrizeWinnings,
                    totalLuckyDrawWinnings: profileAccount.totalLuckyDrawWinnings,
                    createdAt: profileAccount.createdAt,
                    lastPlayed: profileAccount.lastPlayed,
                    activityPoints: profileAccount.activityPoints,
                    lastPaidPeriod: profileAccount.lastPaidPeriod,
                };
            } catch (err: unknown) {
                const error = err as Error;
                console.error('[useUserProfile] Error:', err);
                throw new Error(`Failed to fetch user profile: ${error.message}`);
            }
        },
        enabled: !!targetAddress,
        staleTime: 30_000,
        refetchOnMount: true,
        retry: (failureCount, error) => {
            if (error.message?.includes('Account does not exist')) {
                return false;
            }
            return failureCount < 3;
        },
    });

    return {
        profile: queryResult.data || null,
        isLoading: queryResult.isLoading,
        error: queryResult.error?.message || null,
        refetch: queryResult.refetch,
        exists: queryResult.data !== null && queryResult.data !== undefined,
    };
}
