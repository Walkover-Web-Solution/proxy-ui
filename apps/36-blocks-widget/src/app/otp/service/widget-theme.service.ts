import { Injectable, OnDestroy, signal, computed } from '@angular/core';
import { WidgetTheme } from '@proxy/constant';

@Injectable()
export class WidgetThemeService implements OnDestroy {
    private readonly _systemDark = signal(
        typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    private readonly _themeOverride = signal<string | undefined>(undefined);
    private readonly _inputTheme = signal<string | undefined>(undefined);

    readonly resolvedTheme = computed(() => this._themeOverride() ?? this._inputTheme());

    readonly isDark = (theme?: WidgetTheme): boolean => {
        const t = theme ?? this.resolvedTheme();
        if (t === WidgetTheme.Dark) return true;
        if (t === WidgetTheme.Light) return false;
        return this._systemDark();
    };

    private _mediaQueryCleanup?: () => void;

    constructor() {
        if (typeof window !== 'undefined') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = (e: MediaQueryListEvent) => this._systemDark.set(e.matches);
            mq.addEventListener('change', handler);
            this._mediaQueryCleanup = () => mq.removeEventListener('change', handler);
        }
    }

    public setInputTheme(theme: string | undefined): void {
        this._inputTheme.set(theme);
    }

    public setThemeOverride(theme: string | undefined): void {
        this._themeOverride.set(theme);
    }

    ngOnDestroy(): void {
        this._mediaQueryCleanup?.();
    }
}
