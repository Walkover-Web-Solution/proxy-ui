import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
    AppTheme,
    StoredUiSettings,
    ThemePreference,
    UI_SETTINGS_STORAGE_KEY,
    isThemePreference,
    readStoredUiSettings,
    resolveThemeClass,
} from './theme-preference';

const DEFAULTS: Omit<StoredUiSettings, '_savedAt'> = {
    theme: 'light-theme',
    themePreference: 'light',
    sideNavOpen: true,
};

@Injectable({ providedIn: 'root' })
export class UiSettingsService {
    private _settings: StoredUiSettings;
    private readonly platformId = inject(PLATFORM_ID);
    private readonly isBrowser = isPlatformBrowser(this.platformId);

    /** Saved choice: light, dark, or match the OS. */
    readonly themePreference = signal<ThemePreference>(DEFAULTS.themePreference);
    private readonly systemDark = signal(false);

    constructor() {
        if (this.isBrowser) {
            this.systemDark.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
            const media = window.matchMedia('(prefers-color-scheme: dark)');
            const onChange = (event: MediaQueryListEvent) => {
                this.systemDark.set(event.matches);
                if (this.themePreference() !== 'system') {
                    return;
                }
                this.applyResolvedTheme();
                this._save();
            };
            media.addEventListener('change', onChange);
        }
        this._settings = this._load();
        this.themePreference.set(this._settings.themePreference);
        this.applyResolvedTheme();
    }

    /** Resolved body class (`light-theme` or `dark-theme`), including when the choice is system. */
    get theme(): AppTheme {
        return resolveThemeClass(this.themePreference(), this.systemDark());
    }

    /** True when the resolved theme is dark, including system-plus-OS-dark. */
    readonly isDark = computed(() => this.theme === 'dark-theme');

    get sideNavOpen(): boolean {
        return this._settings.sideNavOpen;
    }

    setThemePreference(value: ThemePreference): void {
        if (!isThemePreference(value)) {
            return;
        }
        this.themePreference.set(value);
        this._settings.themePreference = value;
        this.applyResolvedTheme();
        this._save();
    }

    /**
     * Explicit light or dark, for callers that still pass a body class.
     * Does not select system. Boot code must not call this with the resolved class,
     * or a saved system preference would be overwritten.
     */
    setTheme(value: AppTheme): void {
        this.setThemePreference(value === 'dark-theme' ? 'dark' : 'light');
    }

    setSideNavOpen(value: boolean): void {
        this._settings.sideNavOpen = value;
        this._save();
    }

    private applyResolvedTheme(): void {
        const resolved = resolveThemeClass(this.themePreference(), this.systemDark());
        this._settings.theme = resolved;
        if (!this.isBrowser) {
            return;
        }
        document.body.classList.remove('dark-theme', 'light-theme');
        document.body.classList.add(resolved);
    }

    private _load(): StoredUiSettings {
        if (!this.isBrowser) {
            return { ...DEFAULTS, _savedAt: Date.now() };
        }
        const stored = readStoredUiSettings(
            localStorage.getItem(UI_SETTINGS_STORAGE_KEY),
            Date.now(),
            this.systemDark()
        );
        return stored ?? { ...DEFAULTS, _savedAt: Date.now() };
    }

    private _save(): void {
        if (!this.isBrowser) {
            return;
        }
        this._settings._savedAt = Date.now();
        localStorage.setItem(UI_SETTINGS_STORAGE_KEY, JSON.stringify(this._settings));
    }
}
