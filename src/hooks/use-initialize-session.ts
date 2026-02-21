/**
 * Initialize Session hook for mobile
 * Creates session + target word accounts and delegates them to TEE
 * Ported from web's use-initialize-session.ts with mobile wallet signing pattern
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

import {
    getInitializeSessionInstructionAsync,
    getDelegateSessionPermissionInstructionAsync,
    getCreateSessionPermissionInstructionAsync,
    getInitializeTargetWordInstructionAsync,
    getCreateTargetWordPermissionInstructionAsync,
    getDelegateTargetWordPermissionInstructionAsync,
    getDelegateSessionInstructionAsync,
    getDelegateTargetWordInstructionAsync,
} from '../generated';

import {
    getSessionPDA,
    getTargetWordPDA,
    getDelegationBufferPDA,
    getDelegationRecordPDA,
    getDelegationMetadataPDA,
    getPermissionDelegationBufferPDA,
    permissionPdaFromAccount,
    PERMISSION_PROGRAM_ADDRESS,
    DELEGATION_PROGRAM_ADDRESS,
} from './pdas';
import { createRpc, handleTransactionError } from './utils';
import { useWallet } from '../providers';

// TEE Validator for Private ER
const TEE_VALIDATOR = 'FnE6VJT5QNZdedZPnCoLsARgBwoE6DeJNjBs2H1gySXA';

export interface InitializeSessionResult {
    success: boolean;
    signature?: string;
    error?: string;
}

export function useInitializeSession() {
    const { address: walletAddress, connected, connection, signTransaction } = useWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initializeSession = useCallback(async (): Promise<InitializeSessionResult> => {
        try {
            setIsLoading(true);
            setError(null);

            if (!connected || !walletAddress) {
                throw new Error('No wallet connected');
            }

            const playerAddress = address(walletAddress);
            const signerPlaceholder = createNoopSigner(playerAddress);
            const teeValidator = address(TEE_VALIDATOR);
            const rpc = createRpc();

            // === Derive PDAs ===
            const [sessionPda] = await getSessionPDA(playerAddress);
            const [targetWordPda] = await getTargetWordPDA(playerAddress);

            // Permission PDAs (SDK 0.8.0)
            const permissionPda = await permissionPdaFromAccount(sessionPda);
            const targetWordPermissionPda = await permissionPdaFromAccount(targetWordPda);

            // Check which accounts already exist
            const [sessionAccountInfo, permissionAccountInfo, targetWordAccountInfo] = await Promise.all([
                rpc.getAccountInfo(sessionPda, { encoding: 'base64' }).send(),
                rpc.getAccountInfo(permissionPda, { encoding: 'base64' }).send(),
                rpc.getAccountInfo(targetWordPda, { encoding: 'base64' }).send(),
            ]);

            const sessionExists = sessionAccountInfo.value !== null;
            const permissionExists = permissionAccountInfo.value !== null;
            const targetWordExists = targetWordAccountInfo.value !== null;

            console.log('[InitializeSession] Session exists:', sessionExists);
            console.log('[InitializeSession] Target Word exists:', targetWordExists);
            console.log('[InitializeSession] Permission exists:', permissionExists);

            // Build instructions array based on what already exists
            const instructions: any[] = [];
            const instructionNames: string[] = [];

            // === PHASE A: SESSION ===

            // 1. Initialize session if it doesn't exist
            if (!sessionExists) {
                const createSessionIx = await getInitializeSessionInstructionAsync({
                    payer: signerPlaceholder,
                });
                instructions.push(createSessionIx);
                instructionNames.push('InitializeSession');
            }

            // 2. Create session permission if it doesn't exist
            if (!permissionExists) {
                const createPermissionIx = await getCreateSessionPermissionInstructionAsync({
                    payer: signerPlaceholder,
                    player: signerPlaceholder,
                    session: sessionPda,
                    permission: permissionPda,
                    permissionProgram: PERMISSION_PROGRAM_ADDRESS,
                });
                instructions.push(createPermissionIx);
                instructionNames.push('CreateSessionPermission');
            }

            // === PHASE B: TARGET WORD ===

            if (!targetWordExists) {
                // 3. Initialize Target Word
                const initTargetWordIx = await getInitializeTargetWordInstructionAsync({
                    payer: signerPlaceholder,
                    player: signerPlaceholder,
                });
                instructions.push(initTargetWordIx);
                instructionNames.push('InitializeTargetWord');

                // 4. Create Target Word Permission
                const createTargetPermissionIx = await getCreateTargetWordPermissionInstructionAsync({
                    payer: signerPlaceholder,
                    player: signerPlaceholder,
                    targetWord: targetWordPda,
                    permission: targetWordPermissionPda,
                    permissionProgram: PERMISSION_PROGRAM_ADDRESS,
                });
                instructions.push(createTargetPermissionIx);
                instructionNames.push('CreateTargetWordPermission');
            }

            // === PHASE C: PERMISSION DELEGATION (must happen BEFORE standard ER delegation) ===

            // 5. Delegate Target Word Permission to TEE (if new)
            if (!targetWordExists) {
                const [targetDelegationRecord] = await getDelegationRecordPDA(targetWordPermissionPda);
                const [targetDelegationMetadata] = await getDelegationMetadataPDA(targetWordPermissionPda);
                const [targetBuffer] = await getPermissionDelegationBufferPDA(targetWordPermissionPda);

                const delegateTargetWordIx = await getDelegateTargetWordPermissionInstructionAsync({
                    payer: signerPlaceholder,
                    player: signerPlaceholder,
                    targetWord: targetWordPda,
                    permission: targetWordPermissionPda,
                    permissionProgram: PERMISSION_PROGRAM_ADDRESS,
                    ownerProgram: PERMISSION_PROGRAM_ADDRESS,
                    delegationBuffer: targetBuffer,
                    delegationRecord: targetDelegationRecord,
                    delegationMetadata: targetDelegationMetadata,
                    delegationProgram: DELEGATION_PROGRAM_ADDRESS,
                    validator: teeValidator,
                });
                instructions.push(delegateTargetWordIx);
                instructionNames.push('DelegateTargetWordPermission (TEE)');
            }

            // 6. Delegate session permission
            const [bufferPda] = await getPermissionDelegationBufferPDA(permissionPda);
            const [delegationRecordPda] = await getDelegationRecordPDA(permissionPda);
            const [delegationMetadataPda] = await getDelegationMetadataPDA(permissionPda);

            const delegateIx = await getDelegateSessionPermissionInstructionAsync({
                payer: signerPlaceholder,
                player: signerPlaceholder,
                session: sessionPda,
                permission: permissionPda,
                permissionProgram: PERMISSION_PROGRAM_ADDRESS,
                ownerProgram: PERMISSION_PROGRAM_ADDRESS,
                delegationBuffer: bufferPda,
                delegationRecord: delegationRecordPda,
                delegationMetadata: delegationMetadataPda,
                delegationProgram: DELEGATION_PROGRAM_ADDRESS,
                validator: teeValidator,
            });
            instructions.push(delegateIx);
            instructionNames.push('DelegateSessionPermission (TEE)');

            // === PHASE D: STANDARD ER DELEGATION (for write access on TEE) ===

            // 7. Delegate target word for write access (if new)
            if (!targetWordExists) {
                const [targetWordDelegationBuffer] = await getDelegationBufferPDA(targetWordPda);
                const [targetWordDelegationRecord] = await getDelegationRecordPDA(targetWordPda);
                const [targetWordDelegationMetadata] = await getDelegationMetadataPDA(targetWordPda);

                const delegateTargetWordErIx = await getDelegateTargetWordInstructionAsync({
                    payer: signerPlaceholder,
                    player: playerAddress,
                    targetWord: targetWordPda,
                    bufferTargetWord: targetWordDelegationBuffer,
                    delegationRecordTargetWord: targetWordDelegationRecord,
                    delegationMetadataTargetWord: targetWordDelegationMetadata,
                    validator: teeValidator,
                });
                instructions.push(delegateTargetWordErIx);
                instructionNames.push('DelegateTargetWord (ER Write Access)');
            }

            // 8. Delegate session for write access
            const [sessionDelegationBuffer] = await getDelegationBufferPDA(sessionPda);
            const [sessionDelegationRecord] = await getDelegationRecordPDA(sessionPda);
            const [sessionDelegationMetadata] = await getDelegationMetadataPDA(sessionPda);

            const delegateSessionErIx = await getDelegateSessionInstructionAsync({
                payer: signerPlaceholder,
                player: playerAddress,
                session: sessionPda,
                bufferSession: sessionDelegationBuffer,
                delegationRecordSession: sessionDelegationRecord,
                delegationMetadataSession: sessionDelegationMetadata,
                validator: teeValidator,
            });
            instructions.push(delegateSessionErIx);
            instructionNames.push('DelegateSession (ER Write Access)');

            console.log('[InitializeSession] Instructions:', instructionNames);

            // === BUILD, SIGN & SEND TRANSACTION ===
            const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

            const compiledTx = pipe(
                createTransactionMessage({ version: 0 }),
                (tx) => setTransactionMessageFeePayer(playerAddress, tx),
                (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
                (tx) => appendTransactionMessageInstructions(instructions, tx),
                (tx) => compileTransaction(tx),
            );

            const txBytes = new Uint8Array(getTransactionEncoder().encode(compiledTx));
            const legacyTx = VersionedTransaction.deserialize(txBytes);
            const signedTx = await signTransaction(legacyTx);
            const rawTx = signedTx.serialize();

            const signature = await connection.sendRawTransaction(rawTx, {
                skipPreflight: true,
                preflightCommitment: 'confirmed',
            });

            console.log('[InitializeSession] Transaction sent:', signature);

            // Wait for confirmation
            await connection.confirmTransaction(signature, 'confirmed');

            setIsLoading(false);
            return { success: true, signature };
        } catch (err: unknown) {
            console.error('[InitializeSession] Error:', err);
            const errorMessage = handleTransactionError(err);
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    }, [connected, walletAddress, connection, signTransaction]);

    return { initializeSession, isLoading, error };
}
