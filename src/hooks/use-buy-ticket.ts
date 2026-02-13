/**
 * Buy Ticket hook for mobile
 * Buys game ticket with USDC and initializes game session on TEE
 */
import { useState, useCallback } from 'react';
import {
    pipe,
    createTransactionMessage,
    setTransactionMessageFeePayer,
    setTransactionMessageFeePayerSigner,
    setTransactionMessageLifetimeUsingBlockhash,
    appendTransactionMessageInstructions,
    compileTransaction,
    createNoopSigner,
    createSolanaRpc,
    getTransactionEncoder,
    address,
    signTransactionMessageWithSigners,
    sendTransactionWithoutConfirmingFactory,
    getSignatureFromTransaction,
    getBase64EncodedWireTransaction,
} from '@solana/kit';
import { VersionedTransaction } from '@solana/web3.js';
import { findAssociatedTokenPda, TOKEN_PROGRAM_ADDRESS } from '@solana-program/token';

import { getBuyTicketAndStartGameInstructionAsync, getResetSessionInstruction } from '../generated';
import { getTargetWordPDA, getSessionPDA, getUserProfilePDA, getLeaderboardPDA, getCurrentPeriodIds } from './pdas';
import { createRpc, handleTransactionError } from './utils';
import { useWallet } from '../providers';
import { useTempKeypair } from './use-temp-keypair';
import { usePrivateRollupAuth } from './use-private-rollup-auth';

export interface BuyTicketResult {
    success: boolean;
    signature?: string;
    error?: string;
    sessionId?: string;
}

export function useBuyTicket() {
    const { address: walletAddress, connected, connection, signTransaction } = useWallet();
    const tempKeypair = useTempKeypair();
    const { getToken } = usePrivateRollupAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ticketPurchased, setTicketPurchased] = useState(false);
    const [vrfCompleted, setVrfCompleted] = useState(false);

    const buyTicket = useCallback(async (periodId: string): Promise<BuyTicketResult> => {
        setIsLoading(true);
        setError(null);
        setTicketPurchased(false);
        setVrfCompleted(false);

        const currentTempKeypair = tempKeypair;

        try {
            if (!connected || !walletAddress) {
                throw new Error('No wallet connected');
            }

            if (!periodId || periodId.trim().length === 0) {
                throw new Error('Period ID is required');
            }

            const trimmedPeriodId = periodId.trim();
            const playerAddress = address(walletAddress);
            const rpc = createRpc();

            // === Check leaderboard initialization ===
            const periodIds = getCurrentPeriodIds();
            const [dailyLeaderboardPda] = await getLeaderboardPDA(periodIds.daily, 'daily');
            const [weeklyLeaderboardPda] = await getLeaderboardPDA(periodIds.weekly, 'weekly');
            const [monthlyLeaderboardPda] = await getLeaderboardPDA(periodIds.monthly, 'monthly');

            const [dailyInfo, weeklyInfo, monthlyInfo] = await Promise.all([
                rpc.getAccountInfo(dailyLeaderboardPda, { encoding: 'base64' }).send(),
                rpc.getAccountInfo(weeklyLeaderboardPda, { encoding: 'base64' }).send(),
                rpc.getAccountInfo(monthlyLeaderboardPda, { encoding: 'base64' }).send(),
            ]);

            const missingLeaderboards: string[] = [];
            if (!dailyInfo.value) missingLeaderboards.push(`daily (${periodIds.daily})`);
            if (!weeklyInfo.value) missingLeaderboards.push(`weekly (${periodIds.weekly})`);
            if (!monthlyInfo.value) missingLeaderboards.push(`monthly (${periodIds.monthly})`);

            if (missingLeaderboards.length > 0) {
                throw new Error(`Leaderboards not initialized: ${missingLeaderboards.join(', ')}`);
            }

            // === Pre-flight check on TEE ===
            let preFlightData: {
                targetWordPda: any;
                sessionPda: any;
                userProfilePda: any;
                teeRpc: any;
            } | null = null;

            if (currentTempKeypair) {
                const [targetWordPda] = await getTargetWordPDA(playerAddress);
                const [sessionPda] = await getSessionPDA(playerAddress);
                const [userProfilePda] = await getUserProfilePDA(playerAddress);

                const authToken = await getToken();
                if (!authToken) {
                    throw new Error('Failed to authenticate with TEE');
                }

                const teeUrl = `https://tee.magicblock.app?token=${authToken}`;
                const teeRpc = createSolanaRpc(teeUrl);

                // Simulate reset session on TEE
                const resetSessionIx = getResetSessionInstruction({
                    payer: currentTempKeypair.signer,
                    session: sessionPda,
                    targetWord: targetWordPda,
                    userProfile: userProfilePda,
                    periodId: trimmedPeriodId,
                });

                const { value: teeBlockhash } = await teeRpc.getLatestBlockhash().send();

                const resetTxMessage = pipe(
                    createTransactionMessage({ version: 0 }),
                    (tx) => setTransactionMessageFeePayerSigner(currentTempKeypair.signer, tx),
                    (tx) => setTransactionMessageLifetimeUsingBlockhash(teeBlockhash, tx),
                    (tx) => appendTransactionMessageInstructions([resetSessionIx], tx),
                );

                const signedResetTx = await signTransactionMessageWithSigners(resetTxMessage);
                const encodedTx = getBase64EncodedWireTransaction(signedResetTx);

                const simulationResult = await teeRpc
                    .simulateTransaction(encodedTx as any, { encoding: 'base64' })
                    .send();

                if (simulationResult.value.err) {
                    const errJson = JSON.stringify(simulationResult.value.err, (_, v) =>
                        typeof v === 'bigint' ? v.toString() : v
                    );
                    const logs = simulationResult.value.logs?.join(' ') || '';

                    const isProgramError = errJson.includes('InstructionError') ||
                        errJson.includes('Custom') ||
                        logs.includes('Error Code:');

                    if (!isProgramError) {
                        throw new Error(`Game server unavailable: ${errJson}`);
                    }
                }

                preFlightData = { targetWordPda, sessionPda, userProfilePda, teeRpc };
            } else {
                throw new Error('Session keypair not available');
            }

            // === Buy Ticket ===
            const usdc_mint = address('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

            const [payerTokenAccount] = await findAssociatedTokenPda({
                owner: playerAddress,
                mint: usdc_mint,
                tokenProgram: TOKEN_PROGRAM_ADDRESS,
            });

            const buyTicketIx = await getBuyTicketAndStartGameInstructionAsync({
                payer: createNoopSigner(playerAddress),
                mint: usdc_mint,
                payerTokenAccount,
                periodId: trimmedPeriodId,
            });

            const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

            const compiledTx = pipe(
                createTransactionMessage({ version: 0 }),
                (tx) => setTransactionMessageFeePayer(playerAddress, tx),
                (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
                (tx) => appendTransactionMessageInstructions([buyTicketIx], tx),
                (tx) => compileTransaction(tx),
            );

            const txBytes = new Uint8Array(getTransactionEncoder().encode(compiledTx));
            const legacyTx = VersionedTransaction.deserialize(txBytes);
            const signedTx = await signTransaction(legacyTx);
            const rawTx = signedTx.serialize();
            const signature = await connection.sendRawTransaction(rawTx);

            console.log('✅ [BuyTicket] Transaction sent:', signature);
            setTicketPurchased(true);

            // === Send Reset Session on TEE ===
            if (preFlightData && currentTempKeypair) {
                const MAX_RETRIES = 3;
                const RETRY_DELAY_MS = 2000;

                for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                    try {
                        const { value: freshBlockhash } = await preFlightData.teeRpc.getLatestBlockhash().send();

                        const resetSessionIx = getResetSessionInstruction({
                            payer: currentTempKeypair.signer,
                            session: preFlightData.sessionPda,
                            targetWord: preFlightData.targetWordPda,
                            userProfile: preFlightData.userProfilePda,
                            periodId: trimmedPeriodId,
                        });

                        const resetTxMessage = pipe(
                            createTransactionMessage({ version: 0 }),
                            (tx) => setTransactionMessageFeePayerSigner(currentTempKeypair.signer, tx),
                            (tx) => setTransactionMessageLifetimeUsingBlockhash(freshBlockhash, tx),
                            (tx) => appendTransactionMessageInstructions([resetSessionIx], tx),
                        );

                        const signedResetTx = await signTransactionMessageWithSigners(resetTxMessage);
                        const sendTransaction = sendTransactionWithoutConfirmingFactory({ rpc: preFlightData.teeRpc });
                        await sendTransaction(signedResetTx, { commitment: 'confirmed' });

                        setVrfCompleted(true);
                        break;
                    } catch (erErr: unknown) {
                        console.error(`Reset session attempt ${attempt} failed:`, (erErr as Error)?.message);
                        if (attempt === MAX_RETRIES) {
                            throw new Error('Ticket purchased but game session failed to initialize.');
                        }
                        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
                    }
                }
            }

            const sessionId = `voble-${walletAddress}-${trimmedPeriodId}`;

            setIsLoading(false);
            return { success: true, sessionId };
        } catch (err: unknown) {
            console.error('❌ Buy ticket error:', (err as Error)?.message);
            const errorMessage = handleTransactionError(err);
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    }, [connected, walletAddress, connection, signTransaction, tempKeypair, getToken]);

    return { buyTicket, isLoading, error, ticketPurchased, vrfCompleted };
}
