/**
 * Period ID utilities for Voble game periods
 * All period IDs are generated in UTC+8 (Asia/Singapore timezone)
 */

const PERIOD_EPOCH_START = 1704038400; // January 1, 2024 00:00:00 UTC+8 (seconds)
const PERIOD_WEEKLY_DURATION = 7 * 24 * 60 * 60; // 604800 seconds

export function getCurrentDayPeriodId(): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Singapore',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    return formatter.format(new Date());
}

export function getCurrentWeekPeriodId(): string {
    const now = new Date();
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const nowUtc8 = new Date(utcMs + 8 * 3600000);
    const nowUnixSeconds = Math.floor(nowUtc8.getTime() / 1000);
    const elapsedSeconds = nowUnixSeconds - PERIOD_EPOCH_START;
    const weekNumber = Math.floor(elapsedSeconds / PERIOD_WEEKLY_DURATION);
    return `W${weekNumber}`;
}

export function getCurrentMonthPeriodId(): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Singapore',
        year: 'numeric',
        month: '2-digit',
    });
    return formatter.format(new Date()).slice(0, 7);
}

export function getCurrentPeriodIds(): { daily: string; weekly: string; monthly: string } {
    return {
        daily: getCurrentDayPeriodId(),
        weekly: getCurrentWeekPeriodId(),
        monthly: getCurrentMonthPeriodId(),
    };
}
