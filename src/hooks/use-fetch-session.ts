/**
 * Fetch Session hook for mobile
 * Fetches game session data from TEE (Trusted Execution Environment)
 * Ported from web's use-fetch-session.ts
 */
import { useQuery, type QueryObserverResult } from '@tanstack/react-query';
import { createSolanaRpc, address, type Address, type ReadonlyUint8Array, type Option } from '@solana/kit';

import { useWallet } from '../providers';
import { usePrivateRollupAuth } from './use-private-rollup-auth';
import { getSessionPDA } from './pdas';
import {
    fetchMaybeSessionAccount,
    type SessionAccount,
    type GuessData,
    LetterResult,
} from '../generated';

export { LetterResult };

export interface GuessDataParsed {
    guess: string;
    result: LetterResult[];
}

export interface SessionData {
    player: Address;
    targetWord: string;
    guesses: (GuessDataParsed | null)[];
    isSolved: boolean;
    guessesUsed: number;
    timeMs: number;
    score: number;
    completed: boolean;
    periodId: string;
    vrfRequestTimestamp: number;
    isCurrentPeriod: boolean;
}

export interface FetchSessionResult {
    session: SessionData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<QueryObserverResult<SessionData | null, Error>>;
}

const ER_RPC_URL = 'https://tee.magicblock.app';

let consecutiveAuthFailures = 0;
const MAX_AUTH_FAILURES_BEFORE_CLEAR = 2;

export function useFetchSession(periodId: string): FetchSessionResult {
    const { address: walletAddress, connected } = useWallet();
    const { authToken, getToken, clearToken } = usePrivateRollupAuth();

    const queryResult = useQuery({
        queryKey: ['gameSession', walletAddress, periodId],
        queryFn: async (): Promise<SessionData | null> => {
            if (!walletAddress) {
                throw new Error('No wallet connected');
            }

            if (!periodId || periodId.trim().length === 0) {
                throw new Error('Period ID is required');
            }

            const playerAddress = address(walletAddress);
            const trimmedPeriodId = periodId.trim();

            const [sessionPda] = await getSessionPDA(playerAddress);

            try {
                let sessionAccount: SessionAccount | null = null;

                try {
                    const token = authToken || (await getToken());

                    if (token) {
                        const rpcUrl = `${ER_RPC_URL}?token=${token}`;
                        const erRpc = createSolanaRpc(rpcUrl);

                        const maybeSession = await fetchMaybeSessionAccount(erRpc, sessionPda);
                        if (maybeSession.exists) {
                            sessionAccount = maybeSession.data;
                            consecutiveAuthFailures = 0;
                        }
                    }
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : String(err);

                    const isCorsOrNetworkError =
                        errMessage.includes('CORS') ||
                        errMessage.includes('ERR_FAILED') ||
                        errMessage.includes('NetworkError') ||
                        errMessage.includes('Failed to fetch');

                    if (isCorsOrNetworkError) {
                        consecutiveAuthFailures++;
                        console.warn(
                            `[useFetchSession] Auth failure #${consecutiveAuthFailures}/${MAX_AUTH_FAILURES_BEFORE_CLEAR}:`,
                            errMessage,
                        );

                        if (consecutiveAuthFailures >= MAX_AUTH_FAILURES_BEFORE_CLEAR) {
                            console.warn('[useFetchSession] Max auth failures reached, clearing stale token');
                            clearToken();
                            consecutiveAuthFailures = 0;
                        }
                    }

                    if (errMessage.includes('decode') || errMessage.includes('Failed to decode')) {
                        console.error('[useFetchSession] Decode error:', err);
                        throw new Error('Session account exists but cannot be decoded. IDL mismatch.');
                    }
                }

                if (!sessionAccount) {
                    return null;
                }

                const bytesToString = (bytes: Uint8Array | ReadonlyUint8Array): string => {
                    let end = bytes.length;
                    for (let i = 0; i < bytes.length; i++) {
                        if (bytes[i] === 0) {
                            end = i;
                            break;
                        }
                    }
                    return new TextDecoder().decode(bytes.slice(0, end));
                };

                const parsedGuesses = sessionAccount.guesses.map((guess: Option<GuessData>) => {
                    if (guess.__option === 'None' || !guess.value) return null;
                    const g = guess.value;
                    return {
                        guess: g.guess,
                        result: g.result,
                    };
                });

                const revealedWord = bytesToString(sessionAccount.revealedTargetWord as Uint8Array);
                const targetWord = sessionAccount.completed ? revealedWord : '';
                const periodIdDecoded = bytesToString(sessionAccount.periodId as Uint8Array);

                const sessionData: SessionData = {
                    player: sessionAccount.player,
                    targetWord,
                    guesses: parsedGuesses,
                    isSolved: sessionAccount.isSolved,
                    guessesUsed: sessionAccount.guessesUsed,
                    timeMs: sessionAccount.timeMs,
                    score: sessionAccount.score,
                    completed: sessionAccount.completed,
                    periodId: periodIdDecoded,
                    isCurrentPeriod: periodIdDecoded === trimmedPeriodId,
                    vrfRequestTimestamp: Number(sessionAccount.vrfRequestTimestamp),
                };

                return sessionData;
            } catch (err: unknown) {
                const typedErr = err as Error;
                console.error('[useFetchSession] Error:', err);
                throw new Error(`Failed to fetch session: ${typedErr.message}`);
            }
        },
        enabled: !!walletAddress && !!periodId && connected,
        staleTime: 1000,
        refetchInterval: false,
        retry: (failureCount, error) => {
            if (error.message?.includes('Account does not exist')) {
                return false;
            }
            return failureCount < 3;
        },
    });

    return {
        session: queryResult.data || null,
        isLoading: queryResult.isLoading,
        error: queryResult.error?.message || null,
        refetch: queryResult.refetch,
    };
}
