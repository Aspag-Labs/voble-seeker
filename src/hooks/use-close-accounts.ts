/**
 * Close Accounts hook for mobile
 * Closes unused session/permission accounts to recover rent SOL
 * Ported from web's use-close-accounts.ts
 */
import { useState, useCallback } from 'react';
import { permissionPdaFromAccount } from '@magicblock-labs/ephemeral-rollups-kit';
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

import {
    getUndelegateSessionPermissionInstructionAsync,
    getCloseSessionPermissionInstructionAsync,
    getCloseTargetWordPermissionInstructionAsync,
} from '../generated';
import { getSessionPDA, getTargetWordPDA, PERMISSION_PROGRAM_ADDRESS } from './pdas';
import { createRpc, handleTransactionError } from './utils';
import { useWallet } from '../providers';

const MAGIC_PROGRAM = address('Magic11111111111111111111111111111111111111');
const MAGIC_CONTEXT = address('MagicContext1111111111111111111111111111111');

export function useCloseAccounts() {
    const { address: walletAddress, connected, connection, signTransaction } = useWallet();
    const [isClosing, setIsClosing] = useState(false);
    const [isUndelegating, setIsUndelegating] = useState(false);

    const undelegateSession = useCallback(async (): Promise<{ success: boolean; error?: string; signature?: string }> => {
        if (!connected || !walletAddress) {
            return { success: false, error: 'No wallet connected' };
        }

        setIsUndelegating(true);

        try {
            const playerAddress = address(walletAddress);
            const rpc = createRpc();

            const [sessionPda] = await getSessionPDA(playerAddress);
            const permissionPda = await permissionPdaFromAccount(sessionPda);

            console.log('📤 [UndelegateSession] Undelegating session...');

            const undelegateIx = await getUndelegateSessionPermissionInstructionAsync({
                payer: createNoopSigner(playerAddress),
                player: playerAddress,
                session: sessionPda,
                permission: permissionPda,
                permissionProgram: PERMISSION_PROGRAM_ADDRESS,
                magicProgram: MAGIC_PROGRAM,
                magicContext: MAGIC_CONTEXT,
            });

            const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

            const compiledTx = pipe(
                createTransactionMessage({ version: 0 }),
                (tx) => setTransactionMessageFeePayer(playerAddress, tx),
                (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
                (tx) => appendTransactionMessageInstructions([undelegateIx], tx),
                (tx) => compileTransaction(tx),
            );

            const txBytes = new Uint8Array(getTransactionEncoder().encode(compiledTx));
            const versionedTx = VersionedTransaction.deserialize(txBytes);
            const signedTx = await signTransaction(versionedTx);
            const rawTx = signedTx.serialize();
            const signature = await connection.sendRawTransaction(rawTx, {
                skipPreflight: true,
                preflightCommitment: 'confirmed',
            });

            await connection.confirmTransaction(signature, 'confirmed');
            console.log('✅ [UndelegateSession] Success:', signature);

            return { success: true, signature };
        } catch (err) {
            console.error('❌ [UndelegateSession] Error:', err);
            const errorMessage = handleTransactionError(err);
            return { success: false, error: errorMessage };
        } finally {
            setIsUndelegating(false);
        }
    }, [connected, walletAddress, connection, signTransaction]);

    const closePermissions = useCallback(async (): Promise<{ success: boolean; error?: string; signature?: string }> => {
        if (!connected || !walletAddress) {
            return { success: false, error: 'No wallet connected' };
        }

        setIsClosing(true);

        try {
            const playerAddress = address(walletAddress);
            const rpc = createRpc();

            const [sessionPda] = await getSessionPDA(playerAddress);
            const [targetWordPda] = await getTargetWordPDA(playerAddress);
            const sessionPermissionPda = await permissionPdaFromAccount(sessionPda);
            const targetWordPermissionPda = await permissionPdaFromAccount(targetWordPda);

            console.log('🗑️ [ClosePermissions] Closing permissions...');

            const closeSessionIx = await getCloseSessionPermissionInstructionAsync({
                payer: createNoopSigner(playerAddress),
                player: createNoopSigner(playerAddress),
                session: sessionPda,
                permission: sessionPermissionPda,
                permissionProgram: PERMISSION_PROGRAM_ADDRESS,
            });

            const closeTargetWordIx = await getCloseTargetWordPermissionInstructionAsync({
                payer: createNoopSigner(playerAddress),
                player: createNoopSigner(playerAddress),
                targetWord: targetWordPda,
                permission: targetWordPermissionPda,
                permissionProgram: PERMISSION_PROGRAM_ADDRESS,
            });

            const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

            const compiledTx = pipe(
                createTransactionMessage({ version: 0 }),
                (tx) => setTransactionMessageFeePayer(playerAddress, tx),
                (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
                (tx) => appendTransactionMessageInstructions([closeSessionIx, closeTargetWordIx], tx),
                (tx) => compileTransaction(tx),
            );

            const txBytes = new Uint8Array(getTransactionEncoder().encode(compiledTx));
            const versionedTx = VersionedTransaction.deserialize(txBytes);
            const signedTx = await signTransaction(versionedTx);
            const rawTx = signedTx.serialize();
            const signature = await connection.sendRawTransaction(rawTx, {
                skipPreflight: true,
                preflightCommitment: 'confirmed',
            });

            await connection.confirmTransaction(signature, 'confirmed');
            console.log('✅ [ClosePermissions] Success:', signature);

            return { success: true, signature };
        } catch (err) {
            console.error('❌ [ClosePermissions] Error:', err);
            const errorMessage = handleTransactionError(err);
            return { success: false, error: errorMessage };
        } finally {
            setIsClosing(false);
        }
    }, [connected, walletAddress, connection, signTransaction]);

    return { undelegateSession, closePermissions, isUndelegating, isClosing };
}
