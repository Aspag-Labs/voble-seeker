/**
 * Transaction utility functions for Voble Mobile
 * Ported from web project's hooks/utils.ts
 */
import { createSolanaRpc, isAddress } from '@solana/kit';

export const LAMPORTS_PER_SOL = 1_000_000_000;

// RPC from env, fallback to public devnet
const RPC_ENDPOINT = process.env.EXPO_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';

export function getRpcEndpoint(): string {
    return RPC_ENDPOINT;
}

export function createRpc() {
    return createSolanaRpc(getRpcEndpoint());
}

export function lamportsToSol(lamports: number | bigint): number {
    return Number(lamports) / LAMPORTS_PER_SOL;
}

export function solToLamports(sol: number): number {
    return Math.floor(sol * LAMPORTS_PER_SOL);
}

export const ERRORS = {
    WALLET_NOT_CONNECTED: 'Wallet not connected',
    PROFILE_NOT_FOUND: 'User profile not found',
    GAME_SESSION_NOT_ACTIVE: 'Game session not active',
    TRANSACTION_FAILED: 'Transaction failed',
    INSUFFICIENT_FUNDS: 'Insufficient SOL balance for transaction',
    TRANSACTION_EXPIRED: 'Transaction expired, please try again',
    ACCOUNT_IN_USE: 'Account already exists or is in use',
    SIMULATION_FAILED: 'Transaction simulation failed',
} as const;

export function handleTransactionError(error: unknown): string {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes('insufficient funds') || message.includes('insufficient lamports')) {
            return ERRORS.INSUFFICIENT_FUNDS;
        }
        if (message.includes('blockhash not found') || message.includes('blockhash expired')) {
            return ERRORS.TRANSACTION_EXPIRED;
        }
        if (message.includes('already in use') || message.includes('already exists')) {
            return ERRORS.ACCOUNT_IN_USE;
        }
        if (message.includes('simulation failed')) {
            return ERRORS.SIMULATION_FAILED;
        }
        if (message.includes('user rejected')) {
            return 'Transaction was rejected';
        }

        return error.message;
    }

    return 'Unknown error occurred';
}

export function isValidAddress(addr: string): boolean {
    return isAddress(addr);
}

export function shortenAddress(addr: string, chars = 4): string {
    if (!addr) return '';
    return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
    let lastError: Error | unknown;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, i);
                console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
                await sleep(delay);
            }
        }
    }

    throw lastError;
}
