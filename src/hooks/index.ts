/**
 * Mobile Hooks for Voble Game
 * Adapted from web version for React Native
 */

// Data fetching hooks
export { useLeaderboard } from './use-leaderboard';
export type { LeaderboardRow, UseLeaderboardResult, PeriodType } from './use-leaderboard';

export { useLuckyDraw } from './use-lucky-draw';
export type { LuckyDrawData, LuckyDrawWinner } from './use-lucky-draw';

export { useVaultBalances } from './use-vault-balances';
export type { VaultBalances } from './use-vault-balances';

// Transaction hooks
export { useInitializeProfile } from './use-initialize-profile';
export type { InitializeProfileResult } from './use-initialize-profile';

export { useBuyTicket } from './use-buy-ticket';
export type { BuyTicketResult } from './use-buy-ticket';

export { useSubmitGuess } from './use-submit-guess';
export type { SubmitGuessResult } from './use-submit-guess';

export { useCompleteGame } from './use-complete-game';
export type { CompleteGameResult } from './use-complete-game';

export { useClaim } from './use-claim';
export type { ClaimResult, PrizePeriodType } from './use-claim';

// Utility hooks
export { useTempKeypair } from './use-temp-keypair';
export { usePrivateRollupAuth } from './use-private-rollup-auth';

// Protocol stats hooks
export { useProtocolStats, useTopEarners } from './use-protocol-stats';
export type { ProtocolStats, TopEarner } from './use-protocol-stats';

// Referral hooks
export { useReferralStats, useGenerateReferralCode, useClaimReferral } from './use-referral';
export type { ReferralStats } from './use-referral';

// Game state machine
export { useGameMachine } from './use-game-machine';
export type { GamePhase, UseGameMachineReturn } from './use-game-machine';

// Session hooks
export { useInitializeSession } from './use-initialize-session';
export type { InitializeSessionResult } from './use-initialize-session';

export { useFetchSession } from './use-fetch-session';
export type { SessionData, GuessDataParsed, FetchSessionResult } from './use-fetch-session';

export { useRecoverTicket } from './use-recover-ticket';
export type { RecoverTicketResult } from './use-recover-ticket';

// User profile
export { useUserProfile } from './use-user-profile';
export type { UserProfileData, UserProfileResult } from './use-user-profile';

// Game history & player rank
export { useGameHistory } from './use-game-history';
export type { GameHistoryItem, PlayerStatsFromDB } from './use-game-history';

export { usePlayerRank } from './use-player-rank';
export type { PlayerRank } from './use-player-rank';

// Trade & Account management
export { useTradeActivityPoints } from './use-trade-activity-points';
export { useCloseAccounts } from './use-close-accounts';

// PDA utilities
export * from './pdas';
