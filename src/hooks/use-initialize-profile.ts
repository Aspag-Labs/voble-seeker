/**
 * Initialize User Profile hook for mobile
 * Creates on-chain user profile with username
 */
import { useState, useCallback } from 'react';
import {
    pipe,
    createTransactionMessage,
    setTransactionMessageFeePayer,
    setTransactionMessageLifetimeUsingBlockhash,
    appendTransactionMessageInstructions,
    compileTransaction,
    createNoopSigner,
    getTransactionEncoder,
    address,
} from '@solana/kit';
import { VersionedTransaction } from '@solana/web3.js';

import { getInitializeUserProfileInstructionAsync, VOBLE_PROGRAM_ADDRESS } from '../generated';
import { getEventAuthorityPDA } from './pdas';
import { createRpc, handleTransactionError } from './utils';
import { useWallet } from '../providers';

export interface InitializeProfileResult {
    success: boolean;
    signature?: string;
    error?: string;
}

export function useInitializeProfile() {
    const { address: walletAddress, connected, connection, signTransaction } = useWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initializeProfile = useCallback(async (username: string): Promise<InitializeProfileResult> => {
        setIsLoading(true);
        setError(null);

        try {
            if (!connected || !walletAddress) {
                throw new Error('No wallet connected');
            }

            if (!username || username.trim().length === 0) {
                throw new Error('Username is required');
            }

            if (username.length > 32) {
                throw new Error('Username must be 32 characters or less');
            }

            const trimmedUsername = username.trim();
            const playerAddress = address(walletAddress);

            // Get blockhash
            const rpc = createRpc();
            const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

            const [eventAuthorityPda] = await getEventAuthorityPDA();

            // Build instruction
            const createProfileIx = await getInitializeUserProfileInstructionAsync({
                payer: createNoopSigner(playerAddress),
                username: trimmedUsername,
                eventAuthority: address(eventAuthorityPda),
                program: address(VOBLE_PROGRAM_ADDRESS),
            });

            // Build transaction using @solana/kit pipe
            const compiledTx = pipe(
                createTransactionMessage({ version: 0 }),
                (tx) => setTransactionMessageFeePayer(playerAddress, tx),
                (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
                (tx) => appendTransactionMessageInstructions([createProfileIx], tx),
                (tx) => compileTransaction(tx),
            );

            // Encode to bytes
            const txBytes = new Uint8Array(getTransactionEncoder().encode(compiledTx));

            // Convert to legacy Transaction for signing with WalletProvider
            // WalletProvider uses @solana/web3.js Transaction type
            const legacyTx = VersionedTransaction.deserialize(txBytes);

            // Sign with wallet
            const signedTx = await signTransaction(legacyTx);

            // Send via connection
            const rawTx = signedTx.serialize();
            const signature = await connection.sendRawTransaction(rawTx, {
                skipPreflight: true,
                preflightCommitment: 'confirmed',
            });

            console.log('✅ [InitializeProfile] Transaction sent:', signature);

            // Wait for confirmation
            await connection.confirmTransaction(signature, 'confirmed');

            setIsLoading(false);
            return { success: true, signature };
        } catch (err: unknown) {
            console.error('❌ Error initializing profile:', err);
            const errorMessage = handleTransactionError(err);
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    }, [connected, walletAddress, connection, signTransaction]);

    return { initializeProfile, isLoading, error };
}
