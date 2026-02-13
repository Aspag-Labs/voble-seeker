/**
 * Temporary keypair for gasless TEE transactions
 * Adapted from web: uses expo-secure-store instead of localStorage
 */
import { useEffect, useState } from 'react';
import { createKeyPairSignerFromBytes, type KeyPairSigner } from '@solana/kit';
import * as SecureStore from 'expo-secure-store';
import { useWallet } from '../providers';

const STORAGE_KEY_PREFIX = 'voble_temp_keypair_';

export interface TempKeypairResult {
    signer: KeyPairSigner;
}

export function useTempKeypair(): TempKeypairResult | null {
    const { address } = useWallet();
    const [tempKeypair, setTempKeypair] = useState<TempKeypairResult | null>(null);

    useEffect(() => {
        if (!address) {
            setTempKeypair(null);
            return;
        }

        // SecureStore keys can't have special chars, truncate address
        const storageKey = `${STORAGE_KEY_PREFIX}${address.slice(0, 8)}`;
        let cancelled = false;

        const init = async () => {
            try {
                const stored = await SecureStore.getItemAsync(storageKey);

                if (stored) {
                    const keypairBytes = new Uint8Array(JSON.parse(stored) as number[]);
                    const signer = await createKeyPairSignerFromBytes(keypairBytes);
                    if (!cancelled) {
                        setTempKeypair({ signer });
                        console.log('✅ [TempKeypair] Loaded from storage:', signer.address);
                    }
                    return;
                }

                // Generate new random 32-byte seed + derive public key
                // Use react-native-get-random-values polyfill
                const seed = new Uint8Array(32);
                crypto.getRandomValues(seed);

                // For Ed25519 in @solana/kit, we need 64-byte keypair (seed + pubkey)
                // createKeyPairSignerFromBytes can derive the public key from seed
                // But it expects 64 bytes. We'll use a different approach:
                // Generate a full 64-byte keypair using @solana/web3.js Keypair
                const { Keypair } = require('@solana/web3.js');
                const kp = Keypair.generate();
                const keypairBytes = kp.secretKey; // 64 bytes: seed + pubkey

                if (cancelled) return;

                // Store the keypair
                await SecureStore.setItemAsync(storageKey, JSON.stringify(Array.from(keypairBytes)));

                const signer = await createKeyPairSignerFromBytes(keypairBytes);

                if (!cancelled) {
                    setTempKeypair({ signer });
                    console.log('✅ [TempKeypair] Created new keypair:', signer.address);
                }
            } catch (e) {
                console.error('Error initializing temp keypair:', e);
                if (!cancelled) setTempKeypair(null);
            }
        };

        init();
        return () => { cancelled = true; };
    }, [address]);

    return tempKeypair;
}
