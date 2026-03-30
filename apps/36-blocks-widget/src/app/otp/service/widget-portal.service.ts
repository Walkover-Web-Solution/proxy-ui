import { ApplicationRef, Injectable, Injector, inject } from '@angular/core';
import { DomPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { environment } from '../../../environments/environment';

const STYLE_ELEMENT_ID = 'widget-overlay-styles';

/**
 * Injects the compiled widget styles.css into document.head so that w-*
 * utility classes work on elements teleported outside the Shadow DOM.
 *
 * The CSS is inlined into proxy-auth.js at build time by build-elements.js
 * and stored in window.__proxyAuth.inlinedStyles. This ensures the widget
 * works as a single self-contained JS file without external style dependencies.
 */
export function ensureAddUserDialogStyles(): void {
    ensureOverlayStyles();
}

function ensureOverlayStyles(): void {
    if (document.getElementById(STYLE_ELEMENT_ID)) return;

    // Get inlined CSS from global object (injected by build-elements.js)
    const inlinedCSS = (window as any).__proxyAuth?.inlinedStyles;

    if (!inlinedCSS) {
        console.warn('[proxy-auth] Widget overlay styles not found in bundle. Dialogs may not render correctly.');
        return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ELEMENT_ID;
    style.textContent = inlinedCSS;
    document.head.appendChild(style);
}

/**
 * Handle returned by WidgetPortalService.attach().
 * Call detach() to move the element back to its original DOM position.
 */
export class WidgetPortalRef {
    constructor(
        private readonly _portal: DomPortal,
        private readonly _outlet: DomPortalOutlet,
        private readonly _placeholder: Comment
    ) {}

    detach(): void {
        if (this._outlet.hasAttached()) {
            this._outlet.detach();
        }
        // Move element back next to its placeholder in the Shadow DOM
        this._placeholder.parentNode?.insertBefore(this._portal.element, this._placeholder);
        this._placeholder.parentNode?.removeChild(this._placeholder);
        this._outlet.dispose();
    }
}

/**
 * Teleports an existing DOM element (already rendered inside Shadow DOM)
 * to document.body so it escapes any stacking-context constraints imposed
 * by the client page's container hierarchy.
 *
 * This mirrors how Angular CDK Overlay / Angular Material Dialog works
 * internally — the Angular view stays attached to the original component
 * tree (all template bindings continue to work), only the DOM node moves.
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
     * to a new host div that is a direct child of document.body.
     *
     * Returns a WidgetPortalRef whose detach() moves the element back.
     */
    attach(element: HTMLElement): WidgetPortalRef {
        ensureOverlayStyles();

        // Leave a comment node as a placeholder so we know where to reinsert
        const placeholder = document.createComment('widget-portal-placeholder');
        element.parentNode!.insertBefore(placeholder, element);

        // Host container appended directly to body
        const host = document.createElement('div');
        host.setAttribute('data-widget-overlay', '');
        host.classList.add('proxy-widget-portal');
        document.body.appendChild(host);

        const outlet = new DomPortalOutlet(host, this._appRef, this._injector);
        const portal = new DomPortal(element);
        outlet.attach(portal);

        return new WidgetPortalRef(portal, outlet, placeholder);
    }
}
