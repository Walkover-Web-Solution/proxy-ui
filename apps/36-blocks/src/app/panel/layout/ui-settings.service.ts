import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type AppTheme = 'light-theme' | 'dark-theme';

interface UiSettings {
    theme: AppTheme;
    sideNavOpen: boolean;
    _savedAt: number;
}

const STORAGE_KEY = 'ui-settings';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const DEFAULTS: Omit<UiSettings, '_savedAt'> = {
    theme: 'light-theme',
    sideNavOpen: true,
};

@Injectable({ providedIn: 'root' })
export class UiSettingsService {
    private _settings: UiSettings;
    private readonly platformId = inject(PLATFORM_ID);

    constructor() {
        this._settings = this._load();
        this._initTheme();
    }

    private _initTheme(): void {
        if (!isPlatformBrowser(this.platformId)) return;
        const hasThemeClass =
            document.body.classList.contains('dark-theme') || document.body.classList.contains('light-theme');
        if (!hasThemeClass) {
            document.body.classList.add(this._settings.theme);
        }
    }

    get theme(): AppTheme {
        return this._settings.theme;
    }

    get sideNavOpen(): boolean {
        return this._settings.sideNavOpen;
    }

    setTheme(value: AppTheme): void {
        const previousTheme = this._settings.theme;
        this._settings.theme = value;
        this._save();
        if (isPlatformBrowser(this.platformId) && previousTheme !== value) {
            document.body.classList.remove('dark-theme', 'light-theme');
            document.body.classList.add(value);
        }
    }

    setSideNavOpen(value: boolean): void {
        this._settings.sideNavOpen = value;
        this._save();
    }

    private _load(): UiSettings {
        if (!isPlatformBrowser(this.platformId)) {
            return { ...DEFAULTS, _savedAt: Date.now() };
        }
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed: UiSettings = JSON.parse(raw);
                if (parsed._savedAt && Date.now() - parsed._savedAt < TTL_MS) {
                    return { ...DEFAULTS, ...parsed };
                }
            }
        } catch {
            // corrupted storage — fall through to defaults
        }
        return { ...DEFAULTS, _savedAt: Date.now() };
    }

    private _save(): void {
        if (!isPlatformBrowser(this.platformId)) return;
        this._settings._savedAt = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._settings));
    }
}
