/**
 * Complete Game hook for mobile
 * Commits game results and updates leaderboard stats on TEE
 */
import { useState, useCallback } from 'react';
import {
    pipe,
    createSolanaRpc,
    createTransactionMessage,
    setTransactionMessageFeePayerSigner,
    setTransactionMessageLifetimeUsingBlockhash,
    appendTransactionMessageInstructions,
    address,
    signTransactionMessageWithSigners,
    sendTransactionWithoutConfirmingFactory,
    getSignatureFromTransaction,
    getBase64EncodedWireTransaction,
} from '@solana/kit';

import { getCommitAndUpdateStatsInstructionAsync } from '../generated';
import { getLeaderboardPDA, getCurrentPeriodIds } from './pdas';
import { handleTransactionError } from './utils';
import { useWallet } from '../providers';
import { useTempKeypair } from './use-temp-keypair';
import { usePrivateRollupAuth } from './use-private-rollup-auth';

export interface CompleteGameResult {
    success: boolean;
    signature?: string;
    error?: string;
    finalScore?: number;
    leaderboardRank?: number;
}

export function useCompleteGame() {
    const { address: walletAddress, connected } = useWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const tempKeypair = useTempKeypair();
    const { getToken } = usePrivateRollupAuth();

    const completeGame = useCallback(async (periodId: string): Promise<CompleteGameResult> => {
        setIsLoading(true);
        setError(null);

        try {
            if (!connected || !walletAddress) {
                throw new Error('No wallet connected');
            }

            if (!periodId || periodId.trim().length === 0) {
                throw new Error('Period ID is required');
            }

            if (!tempKeypair) {
                throw new Error('Temp keypair not available');
            }

            // Get period IDs
            const { daily, weekly, monthly } = getCurrentPeriodIds();

            // Get leaderboard PDAs
            const [dailyLeaderboardPda] = await getLeaderboardPDA(daily, 'daily');
            const [weeklyLeaderboardPda] = await getLeaderboardPDA(weekly, 'weekly');
            const [monthlyLeaderboardPda] = await getLeaderboardPDA(monthly, 'monthly');

            // Get auth token for TEE
            const authToken = await getToken();
            if (!authToken) {
                throw new Error('Failed to authenticate with TEE');
            }
            const teeUrl = `https://tee.magicblock.app?token=${authToken}`;
            const rpc = createSolanaRpc(teeUrl);

            // Create commit instruction
            const commitIx = await getCommitAndUpdateStatsInstructionAsync({
                payer: tempKeypair.signer,
                player: address(walletAddress),
                dailyLeaderboard: dailyLeaderboardPda,
                weeklyLeaderboard: weeklyLeaderboardPda,
                monthlyLeaderboard: monthlyLeaderboardPda,
                dailyPeriodId: daily,
                weeklyPeriodId: weekly,
                monthlyPeriodId: monthly,
            });

            // Get latest blockhash
            const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

            // Build transaction (gasless - temp keypair pays)
            const transactionMessage = pipe(
                createTransactionMessage({ version: 0 }),
                (tx) => setTransactionMessageFeePayerSigner(tempKeypair.signer, tx),
                (tx) => appendTransactionMessageInstructions([commitIx], tx),
                (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
            );

            // Sign
            const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);

            // Simulate first
            console.log('🔍 Simulating complete game transaction...');
            const encodedTx = getBase64EncodedWireTransaction(signedTransaction);
            const simulationResult = await rpc
                .simulateTransaction(encodedTx as any, { encoding: 'base64' })
                .send();

            if (simulationResult.value.err) {
                console.error('❌ Simulation failed:', simulationResult.value.err);
                throw new Error(`Simulation failed: ${JSON.stringify(simulationResult.value.err)}`);
            }

            console.log('✅ Simulation succeeded, sending transaction...');

            // Send transaction
            const sendTransaction = sendTransactionWithoutConfirmingFactory({ rpc });
            await sendTransaction(signedTransaction, { commitment: 'confirmed' });

            const signature = getSignatureFromTransaction(signedTransaction);

            setIsLoading(false);
            return { success: true, signature };
        } catch (err: unknown) {
            console.error('❌ Error completing game:', err);
            const errorMessage = handleTransactionError(err);
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    }, [connected, walletAddress, tempKeypair, getToken]);

    return { completeGame, isLoading, error };
}
