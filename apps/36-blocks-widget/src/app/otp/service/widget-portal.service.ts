import { ApplicationRef, Injectable, Injector, inject } from '@angular/core';
import { DomPortal, DomPortalOutlet } from '@angular/cdk/portal';

/**
 * Lazily-constructed CSSStyleSheet shared across all portal shadow roots.
 * Using adoptedStyleSheets means the CSS bytes are parsed once and shared.
 */
let _sharedSheet: CSSStyleSheet | null = null;

function getWidgetCSS(): string | null {
    return (window as any).__proxyAuth?.inlinedStyles ?? null;
}

/**
 * Dev-mode fallback: extract compiled CSS from the shadow root that owns `element`.
 * In production, __proxyAuth.inlinedStyles is populated by build-elements.js.
 * In development, each Angular Shadow DOM component has its CSS in its own shadow root's
 * adoptedStyleSheets — we copy those directly into the portal shadow root.
 */
function adoptStylesFromSourceShadowRoot(element: HTMLElement, targetShadowRoot: ShadowRoot): void {
    const sourceShadowRoot = element.getRootNode();
    if (!(sourceShadowRoot instanceof ShadowRoot)) return;

    // Copy adoptedStyleSheets (compiled Angular component CSS including widget-ui + Tailwind)
    if (sourceShadowRoot.adoptedStyleSheets?.length) {
        targetShadowRoot.adoptedStyleSheets = [...sourceShadowRoot.adoptedStyleSheets];
        return;
    }

    // Fallback: copy <style> elements from the source shadow root
    const parts: string[] = [];
    sourceShadowRoot.querySelectorAll('style').forEach((s) => {
        if (s.textContent) parts.push(s.textContent);
    });
    if (parts.length) {
        const style = document.createElement('style');
        style.textContent = parts.join('\n');
        targetShadowRoot.appendChild(style);
    }
}

function getOrCreateSharedSheet(): CSSStyleSheet | null {
    if (_sharedSheet) return _sharedSheet;
    const css = getWidgetCSS();
    if (!css) return null;
    try {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        _sharedSheet = sheet;
        return sheet;
    } catch {
        return null;
    }
}

/**
 * Attaches widget CSS into a shadow root.
 * Fast path: adoptedStyleSheets (shared, zero-copy).
 * Fallback: <style> tag inside the shadow root.
 */
function adoptWidgetStyles(shadowRoot: ShadowRoot): void {
    const css = getWidgetCSS();
    if (!css) {
        console.warn('[36Blocks] Widget overlay styles not found in bundle. Dialogs may not render correctly.');
        return;
    }

    const sheet = getOrCreateSharedSheet();
    if (sheet) {
        shadowRoot.adoptedStyleSheets = [sheet];
    } else {
        const style = document.createElement('style');
        style.textContent = css;
        shadowRoot.appendChild(style);
    }
}

/** @deprecated kept for backwards compatibility — no longer needed */
export function ensureAddUserDialogStyles(): void {}

/**
 * Handle returned by WidgetPortalService.attach().
 * Call detach() to move the element back to its original DOM position.
 */
export class WidgetPortalRef {
    private _detached = false;
    private readonly _detachCallbacks: (() => void)[] = [];

    constructor(
        private readonly _portal: DomPortal,
        private readonly _outlet: DomPortalOutlet,
        private readonly _placeholder: Comment,
        private readonly _shadowHost: HTMLElement
    ) {}

    onDetach(callback: () => void): void {
        this._detachCallbacks.push(callback);
    }

    detach(): void {
        if (this._detached) return;
        this._detached = true;
        this._detachCallbacks.forEach((callback) => callback());
        if (this._outlet.hasAttached()) {
            this._outlet.detach();
        }
        // Move element back next to its placeholder in the Shadow DOM
        this._placeholder.parentNode?.insertBefore(this._portal.element, this._placeholder);
        this._placeholder.parentNode?.removeChild(this._placeholder);
        this._outlet.dispose();
        // Remove the shadow host from body
        this._shadowHost.parentNode?.removeChild(this._shadowHost);
    }
}

/**
 * Teleports an existing DOM element (already rendered inside Shadow DOM)
 * to document.body so it escapes any stacking-context constraints imposed
 * by the client page's container hierarchy.
 *
 * The teleported element is placed inside a NEW Shadow DOM host appended to
 * document.body. This means client CSS (including client Tailwind, * selectors,
 * etc.) cannot bleed into the dialog — the shadow boundary blocks it.
 * Widget CSS is injected directly into the shadow root via adoptedStyleSheets.
 *
 * Usage in a component:
 *
 *   @ViewChild('dialogWrap') dialogWrapRef!: ElementRef<HTMLDivElement>;
 *   private portalRef: WidgetPortalRef | null = null;
 *
 *   openDialog() {
 *     this.showDialog.set(true);
 *     // Wait one tick for Angular to render the @if block
 *     setTimeout(() => {
 *       this.portalRef = this.widgetPortal.attach(this.dialogWrapRef.nativeElement);
 *     });
 *   }
 *
 *   closeDialog() {
 *     this.portalRef?.detach();
 *     this.portalRef = null;
 *     this.showDialog.set(false);
 *   }
 */
@Injectable({ providedIn: 'root' })
export class WidgetPortalService {
    private readonly _appRef = inject(ApplicationRef);
    private readonly _injector = inject(Injector);

    /**
     * Moves `element` from wherever it currently lives (inside Shadow DOM)
     * into a new Shadow DOM host that is a direct child of document.body.
     *
     * Returns a WidgetPortalRef whose detach() moves the element back and
     * removes the shadow host from the DOM.
     */
    attach(element: HTMLElement): WidgetPortalRef {
        // Leave a comment node as a placeholder so we know where to reinsert
        const placeholder = document.createComment('widget-portal-placeholder');
        element.parentNode!.insertBefore(placeholder, element);

        // Outer host — sits in document.body light DOM, just a positional anchor
        const shadowHost = document.createElement('div');
        shadowHost.setAttribute('data-widget-overlay', '');
        // Reset ALL inherited CSS properties on the shadow host itself.
        // Inherited properties (font-family, text-transform, color, etc.) propagate
        // from the host element's computed style into the shadow root — this stops them.
        shadowHost.style.cssText = [
            'all:initial',
            'display:block',
            'position:static',
            'font-family:Inter,ui-sans-serif,system-ui,sans-serif',
            'font-size:16px',
            'line-height:1.5',
            'color:inherit',
            'text-transform:none',
            'letter-spacing:normal',
            'word-spacing:normal',
        ].join(';');
        document.body.appendChild(shadowHost);

        // Shadow root — client stylesheet rules cannot cross this boundary.
        // Inherited properties are reset via the host's inline style above.
        const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

        // Inject widget CSS into the shadow root.
        // Production: adoptWidgetStyles uses __proxyAuth.inlinedStyles set by build-elements.js.
        // Dev mode: fall back to copying adoptedStyleSheets from the element's own shadow root.
        if (getWidgetCSS()) {
            adoptWidgetStyles(shadowRoot);
        } else {
            adoptStylesFromSourceShadowRoot(element, shadowRoot);
        }

        // Inner slot where Angular will render the portal content.
        // An extra all:initial reset here covers any inherited properties that
        // slipped through (belt-and-suspenders).
        const inner = document.createElement('div');
        inner.classList.add('proxy-widget-portal');
        inner.style.cssText =
            'all:initial;display:contents;text-transform:none;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:16px;line-height:1.5';
        shadowRoot.appendChild(inner);

        const outlet = new DomPortalOutlet(inner, this._appRef, this._injector);
        const portal = new DomPortal(element);
        outlet.attach(portal);

        const portalRef = new WidgetPortalRef(portal, outlet, placeholder, shadowHost);

        const escapeKeyListener = (keyboardEvent: KeyboardEvent) => {
            if (keyboardEvent.key === 'Escape') {
                portalRef.detach();
            }
        };
        document.addEventListener('keydown', escapeKeyListener);
        portalRef.onDetach(() => document.removeEventListener('keydown', escapeKeyListener));

        return portalRef;
    }
}
