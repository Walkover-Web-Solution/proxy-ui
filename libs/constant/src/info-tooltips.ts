/**
 * INFO_TOOLTIPS
 *
 * Global registry for all info-icon tooltip strings across the panel.
 * Organised by page/section. Import from @proxy/constant and bind to
 * [matTooltip] on an <mat-icon>info_outline</mat-icon> element.
 *
 * Usage in TS:
 *   import { INFO_TOOLTIPS } from '@proxy/constant';
 *   readonly tip = INFO_TOOLTIPS.dashboard.overviewCards.signups;
 *
 * Usage in HTML (after exposing via a class property or directly):
 *   <mat-icon [matTooltip]="INFO_TOOLTIPS.features.apiKey" matTooltipPosition="above"
 *             style="font-size:16px;width:16px;height:16px;" class="text-gray-400 cursor-default">
 *     info_outline
 *   </mat-icon>
 */
export const INFO_TOOLTIPS = {
    /** ─── Analytics Dashboard ────────────────────────────────────────────── */
    dashboard: {
        overviewCards: {
            signups: 'Total number of new user sign-ups during the selected time period.',
            logins: 'Total number of login events recorded during the selected time period.',
            active_users: 'Count of unique users who performed at least one action in the selected period.',
            users: 'Cumulative total of all registered users on your platform.',
        },
        charts: {
            logins: 'Daily login trend showing how user login activity changes over time.',
            signups: 'Daily sign-up trend showing new user registrations over time.',
            active_users: 'Daily active user trend showing unique engaged users over time.',
            breakdown: 'Distribution of activity grouped by the selected dimension (type, source, or service).',
        },
    },

    /** ─── Features / Blocks ──────────────────────────────────────────────── */
    features: {
        apiKey: 'Unique key used to authenticate API requests for this feature/block.',
        webhookUrl: 'Endpoint that receives real-time event notifications from this block.',
        rateLimiting: 'Maximum number of requests allowed per minute for this block.',
        authMethods: 'Authentication strategies enabled for this block (OTP, Google, Microsoft, etc.).',
        subscriptionPlan: 'Plan that governs the usage quota and billing for this block.',
    },

    /** ─── Logs ───────────────────────────────────────────────────────────── */
    logs: {
        requestId: 'Unique identifier for each individual API request.',
        statusCode: 'HTTP response code returned for this request.',
        latency: 'Time taken (in ms) to process and respond to the request.',
        environment: 'The project environment (e.g. Production, Staging) that handled the request.',
    },

    /** ─── Users / User Management ───────────────────────────────────────── */
    users: {
        totalUsers: 'Total registered users across all environments for this project.',
        activeUsers: 'Users who have performed at least one action in the last 30 days.',
        blockedUsers: 'Users whose access has been revoked or suspended.',
        lastLogin: 'Timestamp of the most recent successful login for this user.',
    },
} as const;

export type InfoTooltips = typeof INFO_TOOLTIPS;
