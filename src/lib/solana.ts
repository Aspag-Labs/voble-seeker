import { Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

/**
 * RPC Configuration
 */
export const RPC_ENDPOINT = clusterApiUrl('devnet');

/**
 * Create a Solana connection
 */
export function createConnection(): Connection {
    return new Connection(RPC_ENDPOINT);
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: number | bigint): number {
    return Number(lamports) / LAMPORTS_PER_SOL;
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
    return Math.floor(sol * LAMPORTS_PER_SOL);
}

/**
 * Shorten an address for display
 */
export function shortenAddress(address: string, chars = 4): string {
    if (!address) return '';
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Check if a string is a valid Solana address
 */
export function isValidAddress(address: string): boolean {
    try {
        new PublicKey(address);
        return true;
    } catch {
        return false;
    }
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Common error messages
 */
export const ERRORS = {
    WALLET_NOT_CONNECTED: 'Wallet not connected',
    PROFILE_NOT_FOUND: 'User profile not found',
    GAME_SESSION_NOT_ACTIVE: 'Game session not active',
    TRANSACTION_FAILED: 'Transaction failed',
    INSUFFICIENT_FUNDS: 'Insufficient SOL balance for transaction',
    TRANSACTION_EXPIRED: 'Transaction expired, please try again',
} as const;

/**
 * Handle common transaction errors
 */
export function handleTransactionError(error: unknown): string {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes('insufficient funds') || message.includes('insufficient lamports')) {
            return ERRORS.INSUFFICIENT_FUNDS;
        }
        if (message.includes('blockhash not found') || message.includes('blockhash expired')) {
            return ERRORS.TRANSACTION_EXPIRED;
        }
        if (message.includes('user rejected')) {
            return 'Transaction was rejected';
        }

        return error.message;
    }

    return 'Unknown error occurred';
}

/**
 * Format SOL amount with proper decimals
 */
export function formatSol(lamports: number | bigint): string {
    const sol = lamportsToSol(lamports);
    return sol.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}
