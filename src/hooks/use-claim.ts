/**
 * Claim Prize hook for mobile
 * Claims leaderboard prizes (daily/weekly/monthly) and lucky draw prizes
 */
import { useState, useCallback } from 'react';
import {
    pipe,
    createTransactionMessage,
    setTransactionMessageFeePayer,
    setTransactionMessageLifetimeUsingBlockhash,
    appendTransactionMessageInstructions,
    compileTransaction,
    getTransactionEncoder,
    address,
    type Address,
} from '@solana/kit';
import { VersionedTransaction } from '@solana/web3.js';

import {
    getClaimDailyInstructionAsync,
    getClaimWeeklyInstructionAsync,
    getClaimMonthlyInstructionAsync,
    fetchMaybeWinnerEntitlement,
    getClaimLuckyDrawPrizeInstructionAsync,
    fetchMaybeLuckyDrawState,
    VOBLE_PROGRAM_ADDRESS,
} from '../generated';
import { getWinnerEntitlementPDA, getLuckyDrawStatePDA } from './pdas';
import { createRpc } from './utils';
import { useWallet } from '../providers';

const USDC_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU' as Address;

export type PrizePeriodType = 'daily' | 'weekly' | 'monthly';

export interface ClaimResult {
    success: boolean;
    signature?: string;
    error?: string;
}

export function useClaim() {
    const { address: walletAddress, connected, connection, signTransaction } = useWallet();
    const [isClaimingPrize, setIsClaimingPrize] = useState(false);
    const [isClaimingLuckyDraw, setIsClaimingLuckyDraw] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- CLAIM LEADERBOARD PRIZE ---
    const claimPrize = useCallback(
        async (periodType: PrizePeriodType, periodId: string): Promise<ClaimResult> => {
            setIsClaimingPrize(true);
            setError(null);

            try {
                if (!connected || !walletAddress) throw new Error('No wallet connected');
                if (!periodId?.trim()) throw new Error('Period ID is required');

                const playerAddress = address(walletAddress);
                const [entitlementPda] = await getWinnerEntitlementPDA(playerAddress, periodType, periodId.trim());
                const rpc = createRpc();

                // Validate entitlement
                const maybeEntitlement = await fetchMaybeWinnerEntitlement(rpc, entitlementPda);
                if (!maybeEntitlement.exists) throw new Error('No prize available');
                if (maybeEntitlement.data.claimed) throw new Error('Prize already claimed');
                if (maybeEntitlement.data.amount <= 0n) throw new Error('Invalid prize amount');

                // Build instruction
                const walletSigner = {
                    address: playerAddress,
                    signTransactions: async () => {
                        throw new Error('Not used');
                    },
                };

                let ix: any;
                if (periodType === 'daily') {
                    ix = await getClaimDailyInstructionAsync({
                        winnerEntitlement: entitlementPda,
                        winner: walletSigner,
                        usdcMint: USDC_MINT,
                        program: VOBLE_PROGRAM_ADDRESS,
                    });
                } else if (periodType === 'weekly') {
                    ix = await getClaimWeeklyInstructionAsync({
                        winnerEntitlement: entitlementPda,
                        winner: walletSigner,
                        usdcMint: USDC_MINT,
                        program: VOBLE_PROGRAM_ADDRESS,
                    });
                } else {
                    ix = await getClaimMonthlyInstructionAsync({
                        winnerEntitlement: entitlementPda,
                        winner: walletSigner,
                        usdcMint: USDC_MINT,
                        program: VOBLE_PROGRAM_ADDRESS,
                    });
                }

                // Build transaction
                const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
                const compiledTx = pipe(
                    createTransactionMessage({ version: 0 }),
                    (tx) => setTransactionMessageFeePayer(playerAddress, tx),
                    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
                    (tx) => appendTransactionMessageInstructions([ix], tx),
                    (tx) => compileTransaction(tx),
                );

                const txBytes = new Uint8Array(getTransactionEncoder().encode(compiledTx));
                const legacyTx = VersionedTransaction.deserialize(txBytes);
                const signedTx = await signTransaction(legacyTx);
                const rawTx = signedTx.serialize();
                const signature = await connection.sendRawTransaction(rawTx);

                console.log('✅ [Claim] Prize claimed:', signature);
                return { success: true, signature };
            } catch (err: any) {
                console.error('[useClaim] claimPrize:error', err);
                const msg = err?.message || 'Failed to claim prize';
                setError(msg);
                return { success: false, error: msg };
            } finally {
                setIsClaimingPrize(false);
            }
        },
        [connected, walletAddress, connection, signTransaction],
    );

    // --- CLAIM LUCKY DRAW PRIZE ---
    const claimLuckyDraw = useCallback(
        async (periodId: string): Promise<ClaimResult> => {
            setIsClaimingLuckyDraw(true);
            setError(null);

            try {
                if (!connected || !walletAddress) throw new Error('No wallet connected');
                if (!periodId?.trim()) throw new Error('Period ID is required');

                const playerAddress = address(walletAddress);
                const trimmedId = periodId.trim();
                const [statePda] = await getLuckyDrawStatePDA(trimmedId);
                const rpc = createRpc();

                // Validate state
                const maybeState = await fetchMaybeLuckyDrawState(rpc, statePda);
                if (!maybeState.exists) throw new Error('No lucky draw prize available');
                if (maybeState.data.isClaimed) throw new Error('Lucky draw prize already claimed');
                if (maybeState.data.isPending) throw new Error('Lucky draw VRF still pending');

                // Fetch Merkle proof from API
                const proofResponse = await fetch(
                    `https://voble.fun/api/lucky-draw?periodId=${encodeURIComponent(trimmedId)}&wallet=${walletAddress}`,
                );
                if (!proofResponse.ok) {
                    const errorData = await proofResponse.json();
                    throw new Error(errorData.error || 'Failed to get Merkle proof');
                }
                const proofData = await proofResponse.json();

                // Convert hex strings to Uint8Array
                const merkleProof = proofData.merkleProof.map((hex: string) => {
                    const bytes = new Uint8Array(32);
                    for (let i = 0; i < 32; i++) {
                        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
                    }
                    return Array.from(bytes) as unknown as Uint8Array;
                });

                // Build instruction
                const walletSigner = {
                    address: playerAddress,
                    signTransactions: async () => {
                        throw new Error('Not used');
                    },
                };

                const ix = await getClaimLuckyDrawPrizeInstructionAsync({
                    payer: walletSigner,
                    winner: playerAddress,
                    usdcMint: USDC_MINT,
                    periodId: trimmedId,
                    merkleProof,
                    program: VOBLE_PROGRAM_ADDRESS,
                });

                // Build transaction
                const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
                const compiledTx = pipe(
                    createTransactionMessage({ version: 0 }),
                    (tx) => setTransactionMessageFeePayer(playerAddress, tx),
                    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
                    (tx) => appendTransactionMessageInstructions([ix], tx),
                    (tx) => compileTransaction(tx),
                );

                const txBytes = new Uint8Array(getTransactionEncoder().encode(compiledTx));
                const legacyTx = VersionedTransaction.deserialize(txBytes);
                const signedTx = await signTransaction(legacyTx);
                const rawTx = signedTx.serialize();
                const signature = await connection.sendRawTransaction(rawTx);

                console.log('✅ [Claim] Lucky draw prize claimed:', signature);
                return { success: true, signature };
            } catch (err: any) {
                console.error('[useClaim] claimLuckyDraw:error', err);
                const msg = err?.message || 'Failed to claim lucky draw';
                setError(msg);
                return { success: false, error: msg };
            } finally {
                setIsClaimingLuckyDraw(false);
            }
        },
        [connected, walletAddress, connection, signTransaction],
    );

    return {
        claimPrize,
        claimLuckyDraw,
        isClaimingPrize,
        isClaimingLuckyDraw,
        error,
    };
}
