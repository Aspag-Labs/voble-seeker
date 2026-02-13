/**
 * Recover Ticket hook for mobile
 * Retries reset_session on TEE for tickets that were paid but session reset failed
 * Ported from web's use-recover-ticket.ts
 */
import { useState, useCallback } from 'react';
import {
    pipe,
    createTransactionMessage,
    setTransactionMessageFeePayerSigner,
    setTransactionMessageLifetimeUsingBlockhash,
    appendTransactionMessageInstructions,
    signTransactionMessageWithSigners,
    sendTransactionWithoutConfirmingFactory,
    createSolanaRpc,
    getSignatureFromTransaction,
    address,
} from '@solana/kit';

import { getResetSessionInstruction } from '../generated';
import { getTargetWordPDA, getSessionPDA, getUserProfilePDA } from './pdas';
import { useWallet } from '../providers';
import { useTempKeypair } from './use-temp-keypair';
import { usePrivateRollupAuth } from './use-private-rollup-auth';

export interface RecoverTicketResult {
    success: boolean;
    signature?: string;
    error?: string;
}

export function useRecoverTicket() {
    const { address: walletAddress, connected } = useWallet();
    const tempKeypair = useTempKeypair();
    const { getToken } = usePrivateRollupAuth();
    const [isRecovering, setIsRecovering] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const recoverTicket = useCallback(async (periodId: string): Promise<RecoverTicketResult> => {
        setIsRecovering(true);
        setError(null);

        const currentTempKeypair = tempKeypair;

        try {
            if (!connected || !walletAddress) {
                throw new Error('No wallet connected');
            }

            if (!currentTempKeypair) {
                throw new Error('Session keypair not available');
            }

            const trimmedPeriodId = periodId.trim();
            console.log('[useRecoverTicket] Starting recovery for period:', trimmedPeriodId);

            const playerAddress = address(walletAddress);
            const [targetWordPda] = await getTargetWordPDA(playerAddress);
            const [sessionPda] = await getSessionPDA(playerAddress);
            const [userProfilePda] = await getUserProfilePDA(playerAddress);

            const authToken = await getToken();
            if (!authToken) {
                throw new Error('Failed to authenticate with TEE');
            }

            const teeUrl = `https://tee.magicblock.app?token=${authToken}`;
            const teeRpc = createSolanaRpc(teeUrl);

            const MAX_RETRIES = 5;
            const RETRY_DELAY_MS = 3000;

            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    console.log(`[useRecoverTicket] Attempt ${attempt}/${MAX_RETRIES}...`);

                    const { value: freshBlockhash } = await teeRpc.getLatestBlockhash().send();

                    const resetSessionIx = getResetSessionInstruction({
                        payer: currentTempKeypair.signer,
                        session: sessionPda,
                        targetWord: targetWordPda,
                        userProfile: userProfilePda,
                        periodId: trimmedPeriodId,
                    });

                    const resetTxMessage = pipe(
                        createTransactionMessage({ version: 0 }),
                        (tx) => setTransactionMessageFeePayerSigner(currentTempKeypair.signer, tx),
                        (tx) => setTransactionMessageLifetimeUsingBlockhash(freshBlockhash, tx),
                        (tx) => appendTransactionMessageInstructions([resetSessionIx], tx),
                    );

                    const signedResetTx = await signTransactionMessageWithSigners(resetTxMessage);
                    const sendTransaction = sendTransactionWithoutConfirmingFactory({ rpc: teeRpc });
                    await sendTransaction(signedResetTx, { commitment: 'confirmed' });

                    const resetSignature = getSignatureFromTransaction(signedResetTx);
                    console.log('[useRecoverTicket] Recovery successful:', resetSignature);

                    setIsRecovering(false);
                    return { success: true, signature: resetSignature };
                } catch (retryErr: unknown) {
                    const typedErr = retryErr as Error;
                    console.error(`[useRecoverTicket] Attempt ${attempt} failed:`, typedErr.message);

                    // TicketAlreadyUsed (error 6032) means recovery already happened
                    if (typedErr.message?.includes('TicketAlreadyUsed') || typedErr.message?.includes('6032')) {
                        console.log('[useRecoverTicket] Ticket already used - session was already reset');
                        setIsRecovering(false);
                        return { success: true, signature: 'already-recovered' };
                    }

                    if (attempt === MAX_RETRIES) {
                        throw new Error(`Recovery failed after ${MAX_RETRIES} attempts. Please try again later.`);
                    }

                    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
                }
            }

            throw new Error('Unexpected error during recovery');
        } catch (err: unknown) {
            const typedErr = err as Error;
            console.error('[useRecoverTicket] Error:', typedErr.message);
            setError(typedErr.message || 'Unknown error');
            setIsRecovering(false);
            return { success: false, error: typedErr.message };
        }
    }, [connected, walletAddress, tempKeypair, getToken]);

    return { recoverTicket, isRecovering, error };
}
