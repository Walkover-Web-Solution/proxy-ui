export type ThemePreference = 'light' | 'dark' | 'system';
export type AppTheme = 'light-theme' | 'dark-theme';

export const UI_SETTINGS_STORAGE_KEY = 'ui-settings';
export const UI_SETTINGS_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface StoredUiSettings {
    theme: AppTheme;
    themePreference: ThemePreference;
    sideNavOpen: boolean;
    _savedAt: number;
}

const PREFERENCES: readonly ThemePreference[] = ['light', 'dark', 'system'];

export function isThemePreference(value: unknown): value is ThemePreference {
    return value === 'light' || value === 'dark' || value === 'system';
}

/** Map a saved record onto a preference. Older records only stored the resolved class. */
export function preferenceFromStored(stored: unknown): ThemePreference {
    if (!stored || typeof stored !== 'object') {
        return 'light';
    }
    const record = stored as { themePreference?: unknown; theme?: unknown };
    if (isThemePreference(record.themePreference)) {
        return record.themePreference;
    }
    if (record.theme === 'dark-theme') {
        return 'dark';
    }
    if (record.theme === 'light-theme') {
        return 'light';
    }
    return 'light';
}

/** The class that actually paints the dashboard. System follows the OS scheme. */
export function resolveThemeClass(preference: ThemePreference, systemDark: boolean): AppTheme {
    if (preference === 'dark') {
        return 'dark-theme';
    }
    if (preference === 'light') {
        return 'light-theme';
    }
    return systemDark ? 'dark-theme' : 'light-theme';
}

/**
 * Read `localStorage['ui-settings']`. Expired, corrupt, or empty records return null
 * so the caller can apply defaults. `apps/36-blocks/src/index.html` mirrors this before
 * Angular boots; keep the key, TTL, preference names, and class names in step.
 */
export function readStoredUiSettings(raw: string | null, now: number, systemDark: boolean): StoredUiSettings | null {
    if (!raw) {
        return null;
    }
    try {
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') {
            return null;
        }
        const record = parsed as { _savedAt?: unknown; sideNavOpen?: unknown };
        if (typeof record._savedAt !== 'number' || now - record._savedAt >= UI_SETTINGS_TTL_MS) {
            return null;
        }
        const themePreference = preferenceFromStored(parsed);
        return {
            theme: resolveThemeClass(themePreference, systemDark),
            themePreference,
            sideNavOpen: typeof record.sideNavOpen === 'boolean' ? record.sideNavOpen : true,
            _savedAt: record._savedAt,
        };
    } catch {
        return null;
    }
}

export function themePreferences(): readonly ThemePreference[] {
    return PREFERENCES;
}
