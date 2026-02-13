/**
 * Trade Activity Points hook for mobile
 * Exchanges activity points for VOBLE tokens
 * Ported from web's use-trade-points.ts
 */
import { useState, useEffect, useCallback } from 'react';
import {
    pipe,
    createTransactionMessage,
    setTransactionMessageFeePayer,
    setTransactionMessageLifetimeUsingBlockhash,
    appendTransactionMessageInstructions,
    compileTransaction,
    getTransactionEncoder,
    getProgramDerivedAddress,
    getAddressEncoder,
    address,
    type Address,
    type Instruction,
} from '@solana/kit';
import { VersionedTransaction } from '@solana/web3.js';

import { getTradeActivityPointsInstructionAsync, fetchMaybeUserProfile, VOBLE_PROGRAM_ADDRESS } from '../generated';
import { getUserProfilePDA, getVobleVaultPDA } from './pdas';
import { createRpc, handleTransactionError } from './utils';
import { useWallet } from '../providers';

// Voble Token Mint (Devnet)
const VOBLE_MINT = 'vobNFs6WV5gFZZ1E529D87sJ9LprZ2TxoRm3TREGzK6' as Address;
const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address;
const ASSOCIATED_TOKEN_PROGRAM_ID = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL' as Address;

async function getAssociatedTokenAddress(mint: Address, owner: Address): Promise<Address> {
    const [ata] = await getProgramDerivedAddress({
        programAddress: ASSOCIATED_TOKEN_PROGRAM_ID,
        seeds: [
            getAddressEncoder().encode(owner),
            getAddressEncoder().encode(TOKEN_PROGRAM_ID),
            getAddressEncoder().encode(mint),
        ],
    });
    return ata;
}

function createAssociatedTokenAccountInstruction(
    payer: Address,
    associatedToken: Address,
    owner: Address,
    mint: Address,
): Instruction {
    return {
        programAddress: ASSOCIATED_TOKEN_PROGRAM_ID,
        accounts: [
            { address: payer, role: 3 },
            { address: associatedToken, role: 1 },
            { address: owner, role: 0 },
            { address: mint, role: 0 },
            { address: '11111111111111111111111111111111' as Address, role: 0 },
            { address: TOKEN_PROGRAM_ID, role: 0 },
        ],
        data: new Uint8Array([]),
    };
}

export function useTradeActivityPoints() {
    const { address: walletAddress, connected, connection, signTransaction } = useWallet();
    const [isTrading, setIsTrading] = useState(false);
    const [isTradingEnabled, setIsTradingEnabled] = useState(false);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkVaultExists = async () => {
            try {
                const rpc = createRpc();
                const [vobleVaultPda] = await getVobleVaultPDA();
                const vaultInfo = await rpc.getAccountInfo(vobleVaultPda, { encoding: 'base64' }).send();
                setIsTradingEnabled(!!vaultInfo.value);
            } catch (err) {
                console.error('[useTradePoints] Error checking vault:', err);
                setIsTradingEnabled(false);
            } finally {
                setIsCheckingAvailability(false);
            }
        };
        checkVaultExists();
    }, []);

    const tradePoints = useCallback(async (points: number): Promise<{ success: boolean; error?: string; signature?: string }> => {
        if (!isTradingEnabled) {
            return { success: false, error: 'Token trading coming soon!' };
        }
        if (!connected || !walletAddress) {
            return { success: false, error: 'Wallet not connected' };
        }
        if (points <= 0) {
            return { success: false, error: 'Points must be greater than 0' };
        }

        setIsTrading(true);
        setError(null);

        try {
            const playerAddress = address(walletAddress);
            const rpc = createRpc();

            const [userProfilePda] = await getUserProfilePDA(playerAddress);
            const maybeProfile = await fetchMaybeUserProfile(rpc, userProfilePda);

            if (!maybeProfile.exists) {
                return { success: false, error: 'User profile not found' };
            }
            if (maybeProfile.data.activityPoints < BigInt(points)) {
                return { success: false, error: 'Insufficient activity points' };
            }

            const userTokenAccount = await getAssociatedTokenAddress(VOBLE_MINT, playerAddress);
            const instructions: Instruction[] = [];

            // Create ATA if needed
            const ataAccountInfo = await rpc.getAccountInfo(userTokenAccount, { encoding: 'base64' }).send();
            if (!ataAccountInfo.value) {
                instructions.push(
                    createAssociatedTokenAccountInstruction(playerAddress, userTokenAccount, playerAddress, VOBLE_MINT),
                );
            }

            // Trade instruction
            const walletSigner = {
                address: playerAddress,
                signTransactions: async () => { throw new Error('Not used'); },
            };

            const tradeIx = await getTradeActivityPointsInstructionAsync({
                player: walletSigner,
                userTokenAccount,
                vobleMint: VOBLE_MINT,
                pointsToTrade: points,
                program: VOBLE_PROGRAM_ADDRESS,
            });
            instructions.push(tradeIx);

            const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

            const compiledTx = pipe(
                createTransactionMessage({ version: 0 }),
                (tx) => setTransactionMessageFeePayer(playerAddress, tx),
                (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
                (tx) => appendTransactionMessageInstructions(instructions, tx),
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
            console.log('✅ [TradePoints] Success:', signature);

            return { success: true, signature };
        } catch (err: unknown) {
            console.error('[TradePoints] Error:', err);
            const errorMessage = handleTransactionError(err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsTrading(false);
        }
    }, [connected, walletAddress, connection, signTransaction, isTradingEnabled]);

    return { tradePoints, isTrading, isTradingEnabled, isCheckingAvailability, error };
}
