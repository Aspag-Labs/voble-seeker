import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, Pressable, ActivityIndicator, useColorScheme } from 'react-native';
import { Wallet } from 'lucide-react-native';

import { GameGrid, Keyboard, GameHeader } from '../components/game';
import { GameLoading } from '../components/game/GameLoading';
import { GameLobby } from '../components/game/GameLobby';
import { GameResultModal } from '../components/game/GameResultModal';
import { InitializeSessionDialog } from '../components/game/InitializeSessionDialog';

import { useWallet } from '../providers';
import { useGameMachine } from '../hooks/use-game-machine';
import { useFetchSession, LetterResult, type SessionData } from '../hooks/use-fetch-session';
import { useSubmitGuess } from '../hooks/use-submit-guess';
import { useCompleteGame } from '../hooks/use-complete-game';
import { useUserProfile } from '../hooks/use-user-profile';
import { useInitializeProfile } from '../hooks/use-initialize-profile';
import { usePrivateRollupAuth } from '../hooks/use-private-rollup-auth';
import { getCurrentPeriodIds } from '../hooks/pdas';
import { DEMO_WORDS } from '../lib/demo-words';

const ALLOWED_WORDS = DEMO_WORDS;

type TileState = 'empty' | 'filled' | 'correct' | 'present' | 'absent';
type KeyState = 'correct' | 'present' | 'absent' | 'unused';

interface TileData {
    letter: string;
    state: TileState;
}

const createEmptyGrid = (): TileData[][] =>
    Array(7).fill(null).map(() =>
        Array(6).fill(null).map(() => ({ letter: '', state: 'empty' as TileState }))
    );

export default function GameScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { connected, connecting, connect, address: walletAddress } = useWallet();

    const periodIds = getCurrentPeriodIds();
    const currentPeriodId = periodIds.daily;

    const {
        phase,
        error: machineError,
        startTime,
        isStartingGame,
        ticketPurchased,
        vrfCompleted,
        startGame,
        setPhase,
        retry,
    } = useGameMachine(currentPeriodId);

    const { session, isLoading: sessionLoading, refetch: refetchSession } = useFetchSession(currentPeriodId);
    const { submitGuess: submitGuessToBlockchain } = useSubmitGuess();
    const { completeGame } = useCompleteGame();
    const { profile, isLoading: profileLoading, exists: profileExists } = useUserProfile();
    const { initializeProfile, isLoading: isInitializingProfile } = useInitializeProfile();
    const { authToken } = usePrivateRollupAuth();

    const [grid, setGrid] = useState<TileData[][]>(createEmptyGrid());
    const [currentRow, setCurrentRow] = useState(0);
    const [currentCol, setCurrentCol] = useState(0);
    const [keyStates, setKeyStates] = useState<Record<string, KeyState>>({});
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isProcessingResult, setIsProcessingResult] = useState(false);
    const [showInitSession, setShowInitSession] = useState(false);
    const [isCreatingSession, setIsCreatingSession] = useState(false);
    const [sessionCreated, setSessionCreated] = useState(false);

    const isSubmittingRef = useRef(false);

    // Timer
    useEffect(() => {
        if (phase === 'playing' && startTime > 0) {
            const timer = setInterval(() => {
                setTimeElapsed(Date.now() - startTime);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [phase, startTime]);

    // Restore grid from session data when entering playing state
    useEffect(() => {
        if (phase === 'playing' && session?.isCurrentPeriod && !session?.completed) {
            updateGridFromSession(session);
        }
    }, [phase, session?.guessesUsed]);

    // Check if session needs to be initialized
    useEffect(() => {
        if (connected && profileExists && !sessionLoading && session === null && phase === 'idle') {
            setShowInitSession(true);
        } else {
            setShowInitSession(false);
        }
    }, [connected, profileExists, sessionLoading, session, phase]);

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const updateGridFromSession = (sessionData: SessionData) => {
        const newGrid = createEmptyGrid();
        const newKeyStates: Record<string, KeyState> = {};

        sessionData.guesses.forEach((guess, rowIdx) => {
            if (!guess) return;

            const letters = guess.guess.split('');
            letters.forEach((letter, colIdx) => {
                let tileState: TileState = 'absent';
                if (guess.result[colIdx] === LetterResult.Correct) {
                    tileState = 'correct';
                    newKeyStates[letter] = 'correct';
                } else if (guess.result[colIdx] === LetterResult.Present) {
                    tileState = 'present';
                    if (newKeyStates[letter] !== 'correct') {
                        newKeyStates[letter] = 'present';
                    }
                } else {
                    if (!newKeyStates[letter]) {
                        newKeyStates[letter] = 'absent';
                    }
                }
                newGrid[rowIdx][colIdx] = { letter, state: tileState };
            });
        });

        setGrid(newGrid);
        setKeyStates(newKeyStates);
        setCurrentRow(sessionData.guessesUsed);
        setCurrentCol(0);
    };

    const handleKeyPress = useCallback((key: string) => {
        if (phase !== 'playing' || isSubmittingRef.current) return;

        if (key === 'BACKSPACE') {
            if (currentCol > 0) {
                setGrid(prev => {
                    const newGrid = [...prev.map(row => [...row])];
                    newGrid[currentRow][currentCol - 1] = { letter: '', state: 'empty' };
                    return newGrid;
                });
                setCurrentCol(prev => prev - 1);
            }
        } else if (key === 'ENTER') {
            if (currentCol === 6) {
                handleSubmitGuess();
            } else {
                setErrorMsg('Not enough letters');
                setTimeout(() => setErrorMsg(null), 1500);
            }
        } else if (key.length === 1 && currentCol < 6) {
            setGrid(prev => {
                const newGrid = [...prev.map(row => [...row])];
                newGrid[currentRow][currentCol] = { letter: key, state: 'filled' };
                return newGrid;
            });
            setCurrentCol(prev => prev + 1);
        }
    }, [phase, currentRow, currentCol]);

    const handleSubmitGuess = async () => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setPhase('submitting');

        const guess = grid[currentRow].map(tile => tile.letter).join('');

        // Validate word
        if (!ALLOWED_WORDS.includes(guess.toUpperCase())) {
            setErrorMsg('Not a valid word');
            setTimeout(() => setErrorMsg(null), 1500);
            setPhase('playing');
            isSubmittingRef.current = false;
            return;
        }

        try {
            const result = await submitGuessToBlockchain(guess, currentPeriodId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to submit guess');
            }

            // Wait briefly for TEE to process
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Refetch session to get updated state
            const { data: updatedSession } = await refetchSession();

            if (updatedSession) {
                updateGridFromSession(updatedSession);

                // Check if game is over
                const allCorrect = updatedSession.isSolved;
                const maxGuesses = updatedSession.guessesUsed >= 7;

                if (allCorrect || maxGuesses) {
                    await handleCompleteGame();
                } else {
                    setPhase('playing');
                }
            } else {
                setPhase('playing');
            }
        } catch (err: unknown) {
            const error = err as Error;
            setErrorMsg(error.message || 'Failed to submit guess');
            setTimeout(() => setErrorMsg(null), 3000);
            setPhase('playing');
        } finally {
            isSubmittingRef.current = false;
        }
    };

    const handleCompleteGame = async () => {
        setPhase('completing');
        setIsProcessingResult(true);

        try {
            const result = await completeGame(currentPeriodId);
            if (!result.success) {
                console.error('Complete game failed:', result.error);
            }

            // Wait for TEE to finalize
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Refetch session with final score and revealed word
            const { data: finalSession } = await refetchSession();

            if (finalSession) {
                updateGridFromSession(finalSession);
            }

            setPhase('result');
        } catch (err) {
            console.error('Complete game error:', err);
            setPhase('result');
        } finally {
            setIsProcessingResult(false);
        }
    };

    const handleBuyTicket = () => {
        setGrid(createEmptyGrid());
        setCurrentRow(0);
        setCurrentCol(0);
        setKeyStates({});
        setTimeElapsed(0);
        setErrorMsg(null);
        startGame();
    };

    const handleInitializeSession = async () => {
        setIsCreatingSession(true);
        try {
            const result = await initializeProfile('Player');
            if (result.success) {
                setSessionCreated(true);
                await new Promise(resolve => setTimeout(resolve, 1500));
                await refetchSession();
                setShowInitSession(false);
                setSessionCreated(false);
            }
        } catch (err) {
            console.error('Initialize session error:', err);
        } finally {
            setIsCreatingSession(false);
        }
    };

    const isAlreadyPlayedToday = session?.isCurrentPeriod === true && session?.completed === true;

    const showLobby =
        phase === 'idle' &&
        !sessionLoading &&
        !profileLoading &&
        connected &&
        profileExists &&
        session !== null &&
        !showInitSession;

    const showPlaying =
        (phase === 'playing' || phase === 'submitting') &&
        session?.isCurrentPeriod &&
        !session?.completed;

    const showResult =
        phase === 'result' ||
        (phase === 'idle' && isAlreadyPlayedToday && session?.score !== undefined);

    // Wallet not connected
    if (!connected) {
        return (
            <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <View className="flex-1 items-center justify-center px-8">
                    <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${isDark ? 'bg-indigo-900/40' : 'bg-indigo-100'}`}>
                        <Wallet size={48} color={isDark ? '#818cf8' : '#6366f1'} />
                    </View>
                    <Text className={`text-3xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                        Connect Wallet
                    </Text>
                    <Text className={`text-center mb-8 text-base ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Connect your wallet to start playing Voble and earn rewards
                    </Text>
                    <Pressable
                        onPress={connect}
                        disabled={connecting}
                        className={`w-full py-4 rounded-2xl flex-row items-center justify-center ${connecting ? 'bg-indigo-400' : 'bg-indigo-600 active:bg-indigo-700'}`}
                        style={{
                            shadowColor: '#4f46e5',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 5,
                        }}
                    >
                        {connecting ? (
                            <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                            <>
                                <Wallet size={22} color="#ffffff" />
                                <Text className="text-white font-bold text-lg ml-2">Connect Wallet</Text>
                            </>
                        )}
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    // Loading states
    if (sessionLoading || profileLoading || phase === 'recovering') {
        return (
            <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <GameLoading
                    message={
                        phase === 'recovering'
                            ? 'Recovering game session...'
                            : profileLoading
                                ? 'Loading profile...'
                                : 'Loading game...'
                    }
                />
            </SafeAreaView>
        );
    }

    // Profile not created
    if (!profileExists) {
        return (
            <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <View className="flex-1 items-center justify-center px-8">
                    <View className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${isDark ? 'bg-indigo-900/40' : 'bg-indigo-100'}`}>
                        <Text className="text-3xl">👤</Text>
                    </View>
                    <Text className={`text-2xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                        Create Profile
                    </Text>
                    <Text className={`text-center mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Set up your on-chain profile to start playing
                    </Text>
                    <Pressable
                        onPress={() => handleInitializeSession()}
                        disabled={isInitializingProfile}
                        className={`w-full py-4 rounded-2xl items-center ${
                            isInitializingProfile ? 'bg-indigo-400' : 'bg-indigo-600 active:bg-indigo-700'
                        }`}
                    >
                        {isInitializingProfile ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Create Profile</Text>
                        )}
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    // Initialize session dialog
    if (showInitSession) {
        return (
            <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <GameLoading message="Checking game session..." />
                <InitializeSessionDialog
                    visible={showInitSession}
                    isInitializing={isCreatingSession}
                    isSessionCreated={sessionCreated}
                    isAuthenticated={!!authToken}
                    onInitialize={handleInitializeSession}
                />
            </SafeAreaView>
        );
    }

    // Error state
    if (phase === 'error') {
        return (
            <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-5xl mb-4">⚠️</Text>
                    <Text className={`text-xl font-bold mb-2 text-center ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                        Something went wrong
                    </Text>
                    <Text className={`text-sm text-center mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {machineError || 'An unexpected error occurred'}
                    </Text>
                    <Pressable
                        onPress={retry}
                        className="bg-indigo-600 py-3 px-8 rounded-xl active:bg-indigo-700"
                    >
                        <Text className="text-white font-bold">Try Again</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    // Result screen
    if (showResult && session) {
        return (
            <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <GameResultModal
                    visible={true}
                    onClose={() => setPhase('idle')}
                    gameStatus={session.isSolved ? 'won' : 'lost'}
                    targetWord={session.targetWord || '??????'}
                    guessesUsed={session.guessesUsed}
                    score={session.score}
                    timeTaken={session.timeMs}
                />
            </SafeAreaView>
        );
    }

    // Lobby
    if (showLobby || isStartingGame) {
        return (
            <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <GameLobby
                    isStartingGame={isStartingGame}
                    isBuyingTicket={phase === 'buying'}
                    ticketPurchased={ticketPurchased}
                    vrfCompleted={vrfCompleted}
                    isAlreadyPlayedToday={isAlreadyPlayedToday}
                    onBuyTicket={handleBuyTicket}
                    error={machineError}
                />
            </SafeAreaView>
        );
    }

    // Playing screen
    return (
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <GameHeader
                timeElapsed={Math.floor(timeElapsed / 1000)}
                guessesUsed={currentRow}
                maxGuesses={7}
                formatTime={(s) => {
                    const mins = Math.floor(s / 60);
                    const secs = s % 60;
                    return `${mins}:${secs.toString().padStart(2, '0')}`;
                }}
            />

            {/* Processing overlay */}
            {isProcessingResult && (
                <View className="absolute inset-0 z-50 items-center justify-center bg-black/40">
                    <View className={`rounded-2xl p-6 items-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                        <ActivityIndicator size="large" color={isDark ? '#818cf8' : '#6366f1'} />
                        <Text className={`mt-3 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            Verifying Result...
                        </Text>
                    </View>
                </View>
            )}

            {/* Error toast */}
            {errorMsg && (
                <View className="absolute top-24 left-0 right-0 items-center z-50">
                    <View className={`px-5 py-3 rounded-full shadow-lg ${isDark ? 'bg-slate-700' : 'bg-slate-800'}`}>
                        <Text className="text-white font-semibold">{errorMsg}</Text>
                    </View>
                </View>
            )}

            {/* Submitting indicator */}
            {phase === 'submitting' && (
                <View className="absolute top-24 left-0 right-0 items-center z-40">
                    <View className={`flex-row items-center px-4 py-2 rounded-full ${isDark ? 'bg-indigo-900/80' : 'bg-indigo-100'}`}>
                        <ActivityIndicator size="small" color={isDark ? '#818cf8' : '#6366f1'} />
                        <Text className={`ml-2 text-sm font-medium ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                            Submitting...
                        </Text>
                    </View>
                </View>
            )}

            <View className={`flex-1 justify-between ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <GameGrid
                    grid={grid}
                    currentRow={currentRow}
                    currentCol={currentCol}
                />

                <Keyboard
                    onKeyPress={handleKeyPress}
                    keyStates={keyStates}
                    disabled={phase !== 'playing'}
                />
            </View>
        </SafeAreaView>
    );
}
