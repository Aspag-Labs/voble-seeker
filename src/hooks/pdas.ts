/**
 * PDA derivation utilities using @solana/kit
 * Ported from web project's hooks/pdas.ts
 */
import {
    getProgramDerivedAddress,
    getAddressEncoder,
    getUtf8Encoder,
    type Address,
    type ProgramDerivedAddressBump,
} from '@solana/kit';
import { VOBLE_PROGRAM_ADDRESS } from '../generated';

// Program addresses
export const DELEGATION_PROGRAM_ADDRESS = 'DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh' as Address;
export const PERMISSION_PROGRAM_ADDRESS = 'ACLseoPoyC3cBqoUtkbjZ4aDrkurZW86v19pXz2XQnp1' as Address;

export { VOBLE_PROGRAM_ADDRESS };

// PDA seed constants (matching the smart contract)
export const PDA_SEEDS = {
    USER_PROFILE: 'user_profile',
    SESSION: 'session',
    GLOBAL_CONFIG: 'global_config',
    DAILY_PRIZE_VAULT: 'daily_prize_vault',
    WEEKLY_PRIZE_VAULT: 'weekly_prize_vault',
    MONTHLY_PRIZE_VAULT: 'monthly_prize_vault',
    PLATFORM_VAULT: 'platform_vault',
    PAYOUT_VAULT: 'payout_vault',
    LUCKY_DRAW_VAULT: 'lucky_draw_vault',
    VOBLE_VAULT: 'voble_vault',
    LEADERBOARD: 'leaderboard',
    DAILY_PERIOD: 'daily_period',
    WEEKLY_PERIOD: 'weekly_period',
    MONTHLY_PERIOD: 'monthly_period',
    WINNER_ENTITLEMENT: 'winner_entitlement',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    TARGET_WORD: 'target_word',
} as const;

const addressEncoder = getAddressEncoder();
const utf8Encoder = getUtf8Encoder();

export type ProgramDerivedAddressResult = readonly [Address, ProgramDerivedAddressBump];

export async function getUserProfilePDA(playerAddress: Address): Promise<ProgramDerivedAddressResult> {
    return getProgramDerivedAddress({
        programAddress: VOBLE_PROGRAM_ADDRESS,
        seeds: [PDA_SEEDS.USER_PROFILE, addressEncoder.encode(playerAddress)],
    });
}

export async function getSessionPDA(playerAddress: Address): Promise<ProgramDerivedAddressResult> {
    return getProgramDerivedAddress({
        programAddress: VOBLE_PROGRAM_ADDRESS,
        seeds: [PDA_SEEDS.SESSION, addressEncoder.encode(playerAddress)],
    });
}

export async function getGlobalConfigPDA(): Promise<ProgramDerivedAddressResult> {
    return getProgramDerivedAddress({
        programAddress: VOBLE_PROGRAM_ADDRESS,
        seeds: [PDA_SEEDS.GLOBAL_CONFIG],
    });
}

export async function getTargetWordPDA(playerAddress: Address): Promise<ProgramDerivedAddressResult> {
    return getProgramDerivedAddress({
        programAddress: VOBLE_PROGRAM_ADDRESS,
        seeds: [utf8Encoder.encode(PDA_SEEDS.TARGET_WORD), addressEncoder.encode(playerAddress)],
    });
}

export async function getLeaderboardPDA(
    periodId: string,
    leaderboardType: 'daily' | 'weekly' | 'monthly',
): Promise<ProgramDerivedAddressResult> {
    const periodTypeByte = leaderboardType === 'daily' ? 0 : leaderboardType === 'weekly' ? 1 : 2;
    return getProgramDerivedAddress({
        programAddress: VOBLE_PROGRAM_ADDRESS,
        seeds: [PDA_SEEDS.LEADERBOARD, utf8Encoder.encode(periodId), new Uint8Array([periodTypeByte])],
    });
}

export async function getEventAuthorityPDA(): Promise<ProgramDerivedAddressResult> {
    return getProgramDerivedAddress({
        programAddress: VOBLE_PROGRAM_ADDRESS,
        seeds: ['__event_authority'],
    });
}

export async function getWinnerEntitlementPDA(
    winnerAddress: Address,
    entitlementType: 'daily' | 'weekly' | 'monthly',
    periodId: string,
): Promise<ProgramDerivedAddressResult> {
    return getProgramDerivedAddress({
        programAddress: VOBLE_PROGRAM_ADDRESS,
        seeds: [
            PDA_SEEDS.WINNER_ENTITLEMENT,
            addressEncoder.encode(winnerAddress),
            utf8Encoder.encode(entitlementType),
            utf8Encoder.encode(periodId),
        ],
    });
}

export async function getLuckyDrawStatePDA(periodId: string): Promise<ProgramDerivedAddressResult> {
    return getProgramDerivedAddress({
        programAddress: VOBLE_PROGRAM_ADDRESS,
        seeds: ['lucky_draw', utf8Encoder.encode(periodId)],
    });
}

export async function getDailyPrizeVaultPDA(): Promise<ProgramDerivedAddressResult> {
    return getProgramDerivedAddress({
        programAddress: VOBLE_PROGRAM_ADDRESS,
        seeds: [PDA_SEEDS.DAILY_PRIZE_VAULT],
    });
}

export async function getWeeklyPrizeVaultPDA(): Promise<ProgramDerivedAddressResult> {
    return getProgramDerivedAddress({
        programAddress: VOBLE_PROGRAM_ADDRESS,
        seeds: [PDA_SEEDS.WEEKLY_PRIZE_VAULT],
    });
}

export async function getMonthlyPrizeVaultPDA(): Promise<ProgramDerivedAddressResult> {
    return getProgramDerivedAddress({
        programAddress: VOBLE_PROGRAM_ADDRESS,
        seeds: [PDA_SEEDS.MONTHLY_PRIZE_VAULT],
    });
}

export async function getVobleVaultPDA(): Promise<ProgramDerivedAddressResult> {
    return getProgramDerivedAddress({
        programAddress: VOBLE_PROGRAM_ADDRESS,
        seeds: [PDA_SEEDS.VOBLE_VAULT],
    });
}

export async function getLuckyDrawVaultPDA(): Promise<ProgramDerivedAddressResult> {
    return getProgramDerivedAddress({
        programAddress: VOBLE_PROGRAM_ADDRESS,
        seeds: [PDA_SEEDS.LUCKY_DRAW_VAULT],
    });
}

// Re-export period utilities
export {
    getCurrentDayPeriodId,
    getCurrentWeekPeriodId,
    getCurrentMonthPeriodId,
    getCurrentPeriodIds,
} from '../lib/periods';
