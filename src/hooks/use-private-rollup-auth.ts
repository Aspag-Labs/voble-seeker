/**
 * TEE Private Rollup Authentication for Mobile
 * Adapted from web: uses expo-secure-store instead of localStorage/window
 */
import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { address, type Address } from '@solana/kit';
import * as SecureStore from 'expo-secure-store';
import { useWallet } from '../providers';

const TEE_RPC_URL = 'https://tee.magicblock.app';
const TOKENS_STORAGE_KEY = 'voble_tee_auth_tokens';

type AuthTokenData = { token: string; expiresAt: number };

export function usePrivateRollupAuth() {
    const { address: walletAddress } = useWallet();
    const [tokens, setTokens] = useState<Record<string, AuthTokenData>>({});
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const isMountedRef = useRef(true);

    const authToken = useMemo(() => {
        if (walletAddress) {
            const tokenData = tokens[walletAddress] ?? null;
            if (tokenData?.expiresAt > Date.now()) {
                return tokenData.token;
            }
        }
        return null;
    }, [tokens, walletAddress]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    // Load tokens from SecureStore on mount
    useEffect(() => {
        const loadTokens = async () => {
            try {
                const stored = await SecureStore.getItemAsync(TOKENS_STORAGE_KEY);
                if (stored) {
                    setTokens(JSON.parse(stored));
                }
            } catch (e) {
                console.error('[TEE Auth] Error loading tokens:', e);
            }
        };
        loadTokens();
    }, []);

    const saveTokens = useCallback(async (newTokens: Record<string, AuthTokenData>) => {
        try {
            await SecureStore.setItemAsync(TOKENS_STORAGE_KEY, JSON.stringify(newTokens));
        } catch (e) {
            console.error('[TEE Auth] Error saving tokens:', e);
        }
    }, []);

    const getToken = useCallback(async (): Promise<string | null> => {
        if (!walletAddress) {
            console.warn('[TEE Auth] No wallet connected');
            return null;
        }

        // Return cached token if valid
        if (authToken) {
            return authToken;
        }

        setIsAuthenticating(true);

        try {
            // Check if WebAssembly is available (Hermes/Expo Go doesn't have it)
            if (typeof globalThis.WebAssembly === 'undefined') {
                console.warn('[TEE Auth] WebAssembly not available (Hermes). Skipping TEE auth — use a development build for full TEE support.');
                return null;
            }

            // Dynamically import to avoid errors if not available
            const { getAuthToken, verifyTeeRpcIntegrity } = require('@magicblock-labs/ephemeral-rollups-kit');

            const publicKey = address(walletAddress);

            // Verify TEE integrity
            const isVerified = await verifyTeeRpcIntegrity(TEE_RPC_URL);
            if (!isVerified) {
                console.warn('[TEE Auth] TEE RPC integrity verification failed');
                return null;
            }
            console.log('[TEE Auth] TEE RPC integrity verified ✅');

            // For mobile, we need to sign a message - use the dev wallet keypair
            // In production (MWA), this would use the wallet's signMessage
            const signMessage = async (message: Uint8Array): Promise<Uint8Array> => {
                const { Keypair } = require('@solana/web3.js');

                const saved = await SecureStore.getItemAsync('voble_dev_wallet');
                if (!saved) throw new Error('No wallet key for signing');

                const bs58 = require('bs58');
                const secretKey = bs58.decode(saved);
                const kp = Keypair.fromSecretKey(secretKey);
                const { sign } = require('@solana/web3.js').nacl;
                return sign.detached(message, kp.secretKey);
            };

            const { token, expiresAt } = await getAuthToken(TEE_RPC_URL, publicKey, signMessage);

            const updatedTokens = { ...tokens, [walletAddress]: { token, expiresAt } };
            setTokens(updatedTokens);
            await saveTokens(updatedTokens);

            console.log('[TEE Auth] Authenticated successfully ✅');
            return token;
        } catch (error) {
            console.warn('[TEE Auth] Error getting token:', error);
            return null;
        } finally {
            setIsAuthenticating(false);
        }
    }, [walletAddress, authToken, tokens, saveTokens]);

    const clearToken = useCallback(async () => {
        if (!walletAddress) return;
        const newTokens = { ...tokens };
        delete newTokens[walletAddress];
        setTokens(newTokens);
        await saveTokens(newTokens);
    }, [walletAddress, tokens, saveTokens]);

    return { authToken, isAuthenticating, tokens, getToken, clearToken };
}
