import {
    ApplicationRef,
    ComponentRef,
    EnvironmentInjector,
    Injectable,
    Type,
    createComponent,
    inject,
} from '@angular/core';
import { WidgetTheme } from '@proxy/constant';

/**
 * Base class for components mounted via WidgetDialogService.
 * Implement `close()` to trigger self-destruction.
 */
export abstract class WidgetDialogBase {
    /** Set by WidgetDialogService before onInit. */
    widgetDialogRef!: WidgetDialogRef<unknown>;

    abstract close(): void;
}

/**
 * Handle returned by WidgetDialogService.open().
 * Call close() to destroy the component and remove the shadow host.
 */
export class WidgetDialogRef<T> {
    private _destroyed = false;

    constructor(
        private readonly _componentRef: ComponentRef<T>,
        private readonly _shadowHost: HTMLElement,
        private readonly _appRef: ApplicationRef
    ) {}

    get instance(): T {
        return this._componentRef.instance;
    }

    close(): void {
        if (this._destroyed) return;
        this._destroyed = true;
        this._appRef.detachView(this._componentRef.hostView);
        this._componentRef.destroy();
        this._shadowHost.parentNode?.removeChild(this._shadowHost);
    }
}

/**
 * Standard service for mounting any Angular component as a fully CSS-isolated
 * dialog at document.body.
 *
 * Every dialog opened through this service gets its own Shadow DOM host so:
 *   - Client CSS rules (including `* { text-transform: uppercase !important }`)
 *     cannot bleed in — shadow boundary blocks all stylesheet rules.
 *   - Inherited CSS properties (font-family, text-transform, color, etc.) are
 *     reset on the shadow host via inline style, breaking the inheritance chain
 *     before it enters the shadow root.
 *   - Widget CSS (from window.__proxyAuth.inlinedStyles) is adopted into the
 *     shadow root via adoptedStyleSheets (parsed once, zero-copy shared).
 *
 * Usage — triggering from a window event:
 *
 *   // 1. Add an entry to WIDGET_WINDOW_EVENTS in this file (or your service):
 *   window.addEventListener('openMyDialog', (e: Event) => {
 *     const ref = widgetDialogService.open(MyDialogComponent, {
 *       theme: (e as CustomEvent).detail?.theme,
 *       setup: (instance) => {
 *         instance.authToken = (e as CustomEvent).detail?.authToken;
 *         instance.dialogRef = ref;  // so component can close itself
 *       },
 *     });
 *   });
 *
 *   // 2. In MyDialogComponent:
 *   close() { this.widgetDialogRef.close(); }
 */
@Injectable({ providedIn: 'root' })
export class WidgetDialogService {
    private readonly _appRef = inject(ApplicationRef);
    private readonly _injector = inject(EnvironmentInjector);

    /** Lazily-constructed CSSStyleSheet shared across all dialog shadow roots. */
    private _sharedSheet: CSSStyleSheet | null = null;

    /**
     * Mounts `component` inside a new Shadow DOM host at document.body.
     *
     * @param component   The Angular component class to instantiate.
     * @param options.theme   WidgetTheme value — used to set the `.dark` class.
     * @param options.setup   Optional callback to set inputs on the instance
     *                        before change detection runs.
     */
    open<T>(
        component: Type<T>,
        options: {
            theme?: string;
            setup?: (instance: T, ref: WidgetDialogRef<T>) => void;
        } = {}
    ): WidgetDialogRef<T> {
        const shadowHost = this._createHost(options.theme);
        const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
        this._adoptStyles(shadowRoot);

        const inner = document.createElement('div');
        inner.style.cssText =
            'all:initial;display:contents;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:16px;line-height:1.5;text-transform:none;';
        shadowRoot.appendChild(inner);

        const componentRef = createComponent(component, {
            environmentInjector: this._injector,
            hostElement: inner,
        });

        const dialogRef = new WidgetDialogRef<T>(componentRef, shadowHost, this._appRef);

        if (options.setup) {
            options.setup(componentRef.instance, dialogRef);
        }

        this._appRef.attachView(componentRef.hostView);
        componentRef.changeDetectorRef.detectChanges();

        return dialogRef;
    }

    private _createHost(theme?: string): HTMLElement {
        const host = document.createElement('div');
        host.setAttribute('data-widget-dialog', '');
        // Reset inherited CSS on the host so they don't propagate into the shadow root.
        host.style.cssText = [
            'all:initial',
            'display:block',
            'position:static',
            'font-family:Inter,ui-sans-serif,system-ui,sans-serif',
            'font-size:16px',
            'line-height:1.5',
            'text-transform:none',
            'letter-spacing:normal',
            'word-spacing:normal',
            'color:inherit',
        ].join(';');

        const isDark = this._resolveDark(theme);
        if (isDark) host.classList.add('dark');

        document.body.appendChild(host);
        return host;
    }

    private _resolveDark(theme?: string): boolean {
        if (theme === WidgetTheme.Dark) return true;
        if (theme === WidgetTheme.Light) return false;
        if (typeof window === 'undefined') return false;
        // Check if the client page uses class-based dark mode (Tailwind, Next.js, etc.)
        // before falling back to the OS preference.
        const root = document.documentElement;
        const body = document.body;
        if (root.classList.contains('dark') || body.classList.contains('dark')) return true;
        if (root.getAttribute('data-theme') === 'dark' || body.getAttribute('data-theme') === 'dark') return true;
        if (root.getAttribute('data-mode') === 'dark' || body.getAttribute('data-mode') === 'dark') return true;
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    private _adoptStyles(shadowRoot: ShadowRoot): void {
        const css: string | null = (window as any).__proxyAuth?.inlinedStyles ?? null;
        if (!css) {
            console.warn('[proxy-auth] Widget styles not found. Dialog may render without styles.');
            return;
        }

        if (!this._sharedSheet) {
            try {
                const sheet = new CSSStyleSheet();
                sheet.replaceSync(css);
                this._sharedSheet = sheet;
            } catch {
                const style = document.createElement('style');
                style.textContent = css;
                shadowRoot.appendChild(style);
                return;
            }
        }

        shadowRoot.adoptedStyleSheets = [this._sharedSheet];
    }
}
