/**
 * Game State Machine hook for mobile
 * Orchestrates the complete game lifecycle: idle → recovering → preflight → buying → syncing → playing → completing → result
 * Ported from web's use-game-machine.ts with mobile adaptations (AsyncStorage instead of localStorage)
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useBuyTicket } from './use-buy-ticket';
import { useFetchSession } from './use-fetch-session';
import { useRecoverTicket } from './use-recover-ticket';
import { useUserProfile } from './use-user-profile';
import { useWallet } from '../providers';

export type GamePhase =
    | 'idle'
    | 'recovering'
    | 'preflight'
    | 'buying'
    | 'resetting'
    | 'syncing'
    | 'playing'
    | 'submitting'
    | 'completing'
    | 'result'
    | 'error';

export interface GameMachineState {
    phase: GamePhase;
    error: string | null;
    startTime: number;
}

export interface UseGameMachineReturn {
    phase: GamePhase;
    error: string | null;
    startTime: number;
    isStartingGame: boolean;
    ticketPurchased: boolean;
    vrfCompleted: boolean;
    startGame: () => Promise<void>;
    setPhase: (phase: GamePhase) => void;
    setError: (error: string | null) => void;
    setStartTimeNow: () => void;
    retry: () => void;
}

const STORAGE_KEY_PREFIX = 'voble_startTime_';

export function useGameMachine(periodId: string): UseGameMachineReturn {
    const { address: walletAddress } = useWallet();

    const { buyTicket, ticketPurchased: hookTicketPurchased, vrfCompleted: hookVrfCompleted } = useBuyTicket();
    const { session, refetch: refetchSession } = useFetchSession(periodId);
    const { recoverTicket, isRecovering } = useRecoverTicket();
    const { profile } = useUserProfile(walletAddress || undefined);

    const [state, setState] = useState<GameMachineState>({
        phase: 'idle',
        error: null,
        startTime: 0,
    });

    const recoveryAttemptedRef = useRef(false);

    const transition = useCallback((newPhase: GamePhase, errorMsg?: string) => {
        console.log(`[GameMachine] → ${newPhase}${errorMsg ? ` (error: ${errorMsg})` : ''}`);
        setState((prev) => ({
            ...prev,
            phase: newPhase,
            error: errorMsg || (newPhase === 'error' ? prev.error : null),
        }));
    }, []);

    const setStartTimeNow = useCallback(() => {
        const now = Date.now();
        AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${periodId}`, now.toString()).catch(console.error);
        setState((prev) => ({ ...prev, startTime: now }));
    }, [periodId]);

    const retry = useCallback(() => {
        setState({ phase: 'idle', error: null, startTime: 0 });
        recoveryAttemptedRef.current = false;
    }, []);

    const setPhase = useCallback((phase: GamePhase) => {
        transition(phase);
    }, [transition]);

    const setError = useCallback((error: string | null) => {
        setState((prev) => ({ ...prev, error }));
    }, []);

    // Load startTime from AsyncStorage on mount
    useEffect(() => {
        AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${periodId}`).then((saved) => {
            if (saved) {
                setState((prev) => ({ ...prev, startTime: parseInt(saved) }));
            }
        }).catch(console.error);
    }, [periodId]);

    // Auto-recovery: detect paid ticket with stale session
    useEffect(() => {
        const attemptRecovery = async () => {
            if (recoveryAttemptedRef.current || state.phase !== 'idle' || isRecovering) return;

            const hasPaidForToday = profile?.lastPaidPeriod === periodId;
            const sessionExists = session !== null;
            const sessionNotCurrent = !session?.isCurrentPeriod;

            if (hasPaidForToday && sessionExists && sessionNotCurrent) {
                recoveryAttemptedRef.current = true;
                console.log('[GameMachine] Auto-recovery: detecting unused ticket...');
                transition('recovering');

                const result = await recoverTicket(periodId);
                if (result.success) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await refetchSession();
                    setStartTimeNow();
                    transition('playing');
                } else {
                    console.error('[GameMachine] Recovery failed:', result.error);
                    transition('error', result.error || 'Failed to recover game session');
                }
            }
        };

        attemptRecovery();
    }, [profile?.lastPaidPeriod, periodId, session?.isCurrentPeriod, state.phase, isRecovering, transition, recoverTicket, refetchSession, setStartTimeNow, session]);

    // Restore to playing state on app reopen (if session exists and not completed)
    useEffect(() => {
        if (state.phase === 'idle' && session?.isCurrentPeriod && !session?.completed) {
            console.log('[GameMachine] Restoring to playing state from session');
            transition('playing');

            AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${periodId}`).then((saved) => {
                if (saved) {
                    setState((prev) => ({ ...prev, startTime: parseInt(saved) }));
                } else if (session?.timeMs) {
                    const derivedStart = Date.now() - session.timeMs;
                    setState((prev) => ({ ...prev, startTime: derivedStart }));
                    AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${periodId}`, derivedStart.toString()).catch(console.error);
                }
            }).catch(console.error);
        }
    }, [session?.isCurrentPeriod, session?.completed, periodId, state.phase, transition, session?.timeMs]);

    const startGame = useCallback(async () => {
        try {
            transition('preflight');
            transition('buying');

            const result = await buyTicket(periodId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to buy ticket');
            }

            transition('resetting');
            transition('syncing');

            // Poll for session ready with exponential backoff
            const MAX_POLL_ATTEMPTS = 12;
            let sessionReady = false;

            for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
                const waitTime = Math.min(attempt * 1000, 5000);
                await new Promise(resolve => setTimeout(resolve, waitTime));

                const { data: newSession } = await refetchSession();
                if (newSession?.isCurrentPeriod && !newSession?.completed) {
                    sessionReady = true;
                    break;
                }
            }

            if (!sessionReady) {
                throw new Error('Game session failed to sync. Please try again.');
            }

            await new Promise(resolve => setTimeout(resolve, 500));
            await refetchSession();

            setStartTimeNow();
            transition('playing');
        } catch (err: unknown) {
            const error = err as Error;
            console.error('[GameMachine] startGame error:', error);
            transition('error', error.message || 'An error occurred. Please try again.');
        }
    }, [periodId, buyTicket, refetchSession, transition, setStartTimeNow]);

    const isStartingGame = ['preflight', 'buying', 'resetting', 'syncing', 'recovering'].includes(state.phase);
    const ticketPurchased = hookTicketPurchased || ['resetting', 'syncing', 'playing', 'submitting', 'completing', 'result'].includes(state.phase);
    const vrfCompleted = hookVrfCompleted || ['syncing', 'playing', 'submitting', 'completing', 'result'].includes(state.phase);

    return {
        phase: state.phase,
        error: state.error,
        startTime: state.startTime,
        isStartingGame,
        ticketPurchased,
        vrfCompleted,
        startGame,
        setPhase,
        setError,
        setStartTimeNow,
        retry,
    };
}
