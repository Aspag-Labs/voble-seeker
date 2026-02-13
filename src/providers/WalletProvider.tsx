import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { PublicKey, Connection, Keypair, Transaction, VersionedTransaction } from '@solana/web3.js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import bs58 from 'bs58';

// Config
const RPC_ENDPOINT = process.env.EXPO_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';
const WALLET_KEY = 'voble_dev_wallet';
const AUTH_TOKEN_KEY = 'voble_mwa_auth_token';

// App Identity for MWA
const APP_IDENTITY = {
    name: 'Voble',
    uri: 'https://voble.fun',
    icon: 'favicon.ico',
};

// Detect if running in Expo Go (no native modules available)
const isExpoGo = Constants.appOwnership === 'expo';

// Types
interface WalletContextType {
    connected: boolean;
    connecting: boolean;
    publicKey: PublicKey | null;
    address: string | null;
    connection: Connection;
    connect: () => Promise<void>;
    disconnect: () => void;
    signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>;
    signAllTransactions: (transactions: (Transaction | VersionedTransaction)[]) => Promise<(Transaction | VersionedTransaction)[]>;
    createDevWallet: () => Promise<void>;
    isDevelopment: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

// Provider Component
export function WalletProvider({ children }: { children: ReactNode }) {
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
    const [keypair, setKeypair] = useState<Keypair | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [isDevelopment, setIsDevelopment] = useState(isExpoGo);

    const connection = useMemo(() => new Connection(RPC_ENDPOINT), []);

    const address = useMemo(() => {
        return publicKey ? publicKey.toBase58() : null;
    }, [publicKey]);

    // Load saved state on mount
    useEffect(() => {
        loadSavedState();
    }, []);

    const loadSavedState = async () => {
        try {
            const savedAuthToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
            if (savedAuthToken) setAuthToken(savedAuthToken);

            const saved = await SecureStore.getItemAsync(WALLET_KEY);
            if (saved) {
                const secretKey = bs58.decode(saved);
                const kp = Keypair.fromSecretKey(secretKey);
                setKeypair(kp);
                setPublicKey(kp.publicKey);
                setConnected(true);
                console.log('✅ Wallet loaded:', kp.publicKey.toBase58());
            }
        } catch (error) {
            console.log('No saved wallet state');
        }
    };

    // Create a new development wallet
    const createDevWallet = useCallback(async () => {
        setConnecting(true);
        try {
            const newKeypair = Keypair.generate();
            const secretKeyB58 = bs58.encode(newKeypair.secretKey);
            await SecureStore.setItemAsync(WALLET_KEY, secretKeyB58);

            setKeypair(newKeypair);
            setPublicKey(newKeypair.publicKey);
            setConnected(true);
            setIsDevelopment(true);

            console.log('✅ New dev wallet created:', newKeypair.publicKey.toBase58());
        } catch (error) {
            console.error('❌ Failed to create dev wallet:', error);
            throw error;
        } finally {
            setConnecting(false);
        }
    }, []);

    // Connect using Mobile Wallet Adapter (only in custom dev builds)
    const connectWithMWA = useCallback(async () => {
        if (isExpoGo) throw new Error('MWA not available in Expo Go');
        // Dynamically import MWA only in non-Expo-Go builds
        const { transact } = require('@solana-mobile/mobile-wallet-adapter-protocol-web3js');

        const result = await transact(async (wallet: any) => {
            let authResult;
            if (authToken) {
                try {
                    authResult = await wallet.reauthorize({
                        auth_token: authToken,
                        identity: APP_IDENTITY,
                    });
                } catch {
                    authResult = await wallet.authorize({
                        cluster: 'devnet',
                        identity: APP_IDENTITY,
                    });
                }
            } else {
                authResult = await wallet.authorize({
                    cluster: 'devnet',
                    identity: APP_IDENTITY,
                });
            }
            return authResult;
        });

        if (result.auth_token) {
            await SecureStore.setItemAsync(AUTH_TOKEN_KEY, result.auth_token);
            setAuthToken(result.auth_token);
        }

        const walletPubkey = new PublicKey(result.accounts[0].address);
        setPublicKey(walletPubkey);
        setConnected(true);
        setIsDevelopment(false);

        console.log('✅ MWA wallet connected:', walletPubkey.toBase58());
    }, [authToken]);

    // Main connect function
    const connect = useCallback(async () => {
        if (connecting) return;
        setConnecting(true);

        try {
            // In custom dev builds, try MWA first
            if (!isExpoGo) {
                try {
                    await connectWithMWA();
                    return;
                } catch (mwaError) {
                    console.log('MWA failed, falling back to dev wallet:', mwaError);
                }
            }

            // Dev wallet fallback (Expo Go or MWA failure)
            const saved = await SecureStore.getItemAsync(WALLET_KEY);
            if (saved) {
                const secretKey = bs58.decode(saved);
                const kp = Keypair.fromSecretKey(secretKey);
                setKeypair(kp);
                setPublicKey(kp.publicKey);
                setConnected(true);
                setIsDevelopment(true);
                console.log('✅ Dev wallet connected:', kp.publicKey.toBase58());
            } else {
                await createDevWallet();
            }
        } catch (error) {
            console.error('❌ Wallet connection failed:', error);
            throw error;
        } finally {
            setConnecting(false);
        }
    }, [connecting, connectWithMWA, createDevWallet]);

    // Disconnect
    const disconnect = useCallback(async () => {
        setPublicKey(null);
        setKeypair(null);
        setConnected(false);
        setAuthToken(null);
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        console.log('👋 Wallet disconnected');
    }, []);

    // Sign transaction
    const signTransaction = useCallback(async (transaction: Transaction | VersionedTransaction) => {
        if (!connected || !publicKey) throw new Error('Wallet not connected');

        if (isDevelopment && keypair) {
            if (transaction instanceof Transaction) {
                transaction.sign(keypair);
            } else {
                transaction.sign([keypair]);
            }
            return transaction;
        }

        // MWA signing (custom dev build only)
        const { transact } = require('@solana-mobile/mobile-wallet-adapter-protocol-web3js');
        const signedTxs = await transact(async (wallet: any) => {
            await wallet.reauthorize({ auth_token: authToken!, identity: APP_IDENTITY });
            return wallet.signTransactions({ transactions: [transaction] });
        });
        return signedTxs[0];
    }, [connected, publicKey, isDevelopment, keypair, authToken]);

    // Sign all transactions
    const signAllTransactions = useCallback(async (transactions: (Transaction | VersionedTransaction)[]) => {
        if (!connected || !publicKey) throw new Error('Wallet not connected');

        if (isDevelopment && keypair) {
            return transactions.map(tx => {
                if (tx instanceof Transaction) { tx.sign(keypair); }
                else { tx.sign([keypair]); }
                return tx;
            });
        }

        const { transact } = require('@solana-mobile/mobile-wallet-adapter-protocol-web3js');
        return transact(async (wallet: any) => {
            await wallet.reauthorize({ auth_token: authToken!, identity: APP_IDENTITY });
            return wallet.signTransactions({ transactions });
        });
    }, [connected, publicKey, isDevelopment, keypair, authToken]);

    const contextValue = useMemo(() => ({
        connected, connecting, publicKey, address, connection,
        connect, disconnect, signTransaction, signAllTransactions,
        createDevWallet, isDevelopment,
    }), [
        connected, connecting, publicKey, address, connection,
        connect, disconnect, signTransaction, signAllTransactions,
        createDevWallet, isDevelopment,
    ]);

    return (
        <WalletContext.Provider value={contextValue}>
            {children}
        </WalletContext.Provider>
    );
}

// Hook
export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) throw new Error('useWallet must be used within a WalletProvider');
    return context;
}

export default WalletProvider;
