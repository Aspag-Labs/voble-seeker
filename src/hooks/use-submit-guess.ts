/**
 * Submit Guess hook for mobile
 * Submits word guess to TEE (gasless via temp keypair)
 */
import { useCallback } from 'react';
import {
    pipe,
    createSolanaRpc,
    createTransactionMessage,
    setTransactionMessageFeePayerSigner,
    appendTransactionMessageInstructions,
    address,
    setTransactionMessageLifetimeUsingBlockhash,
    signTransactionMessageWithSigners,
    sendTransactionWithoutConfirmingFactory,
    getSignatureFromTransaction,
} from '@solana/kit';

import { getSubmitGuessInstructionAsync, VOBLE_PROGRAM_ADDRESS } from '../generated';
import { getSessionPDA, getTargetWordPDA, getEventAuthorityPDA } from './pdas';
import { useWallet } from '../providers';
import { useTempKeypair } from './use-temp-keypair';
import { usePrivateRollupAuth } from './use-private-rollup-auth';

export interface SubmitGuessResult {
    success: boolean;
    signature?: string;
    error?: string;
}

export function useSubmitGuess() {
    const { address: walletAddress, connected } = useWallet();
    const tempKeypair = useTempKeypair();
    const { getToken } = usePrivateRollupAuth();

    const submitGuess = useCallback(async (guess: string, periodId?: string): Promise<SubmitGuessResult> => {
        try {
            if (!connected || !walletAddress) {
                throw new Error('No wallet connected');
            }

            if (!guess || guess.length === 0) {
                throw new Error('Guess is required');
            }

            if (!tempKeypair) {
                throw new Error('Temp keypair not available');
            }

            const playerAddress = address(walletAddress);

            // Derive PDAs
            const [sessionPda] = await getSessionPDA(playerAddress);
            const [targetWordPda] = await getTargetWordPDA(playerAddress);
            const [eventAuthorityPda] = await getEventAuthorityPDA();

            // Get auth token and initialize TEE connection
            const authToken = await getToken();
            if (!authToken) {
                throw new Error('Failed to authenticate with TEE');
            }
            const teeUrl = `https://tee.magicblock.app?token=${authToken}`;
            const rpc = createSolanaRpc(teeUrl);

            // Create instruction
            const submitGuessIx = await getSubmitGuessInstructionAsync({
                session: sessionPda,
                targetWord: targetWordPda,
                eventAuthority: eventAuthorityPda,
                program: VOBLE_PROGRAM_ADDRESS,
                guess: guess.toUpperCase(),
            });

            // Get latest blockhash from TEE
            const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

            // Build transaction message (gasless - temp keypair pays)
            const transactionMessage = pipe(
                createTransactionMessage({ version: 0 }),
                (tx) => setTransactionMessageFeePayerSigner(tempKeypair.signer, tx),
                (tx) => appendTransactionMessageInstructions([submitGuessIx], tx),
                (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
            );

            // Sign transaction
            const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);

            // Send transaction to TEE
            const sendTransaction = sendTransactionWithoutConfirmingFactory({ rpc });
            await sendTransaction(signedTransaction, { commitment: 'confirmed' });

            const signature = getSignatureFromTransaction(signedTransaction);

            console.log('✅ [SubmitGuess] Transaction sent:', signature);

            return { success: true, signature };
        } catch (err: unknown) {
            const error = err as Error;
            console.warn('⚠️ Failed to submit guess:', error.message);
            return { success: false, error: error.message || 'Transaction failed' };
        }
    }, [connected, walletAddress, tempKeypair, getToken]);

    return { submitGuess, isLoading: false };
}
