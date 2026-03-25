import { ApplicationRef, Injectable, Injector, inject } from '@angular/core';
import { DomPortal, DomPortalOutlet } from '@angular/cdk/portal';

const STYLE_ID = 'widget-overlay-styles';

/**
 * Injects an unscoped stylesheet into document.head so that w-* utility
 * classes and Tailwind dark-mode utilities work on elements teleported
 * outside the Shadow DOM. Shadow DOM adoptedStyleSheets are NOT copied
 * because their rules are :host-scoped and do not apply outside the shadow.
 */
export function ensureAddUserDialogStyles(): void {
    ensureOverlayStyles();
}

function ensureOverlayStyles(): void {
    if (document.getElementById(STYLE_ID)) return;

    const styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;

    // Always use unscoped handwritten CSS — Shadow DOM adoptedStyleSheets rules are
    // scoped with :host and do not match elements teleported outside the Shadow DOM.
    styleEl.textContent = `
[data-widget-overlay]{font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:16px;box-sizing:border-box}
[data-widget-overlay] *{box-sizing:border-box}
.w-dialog-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);z-index:2147483646}
.dark .w-dialog-backdrop{background:rgba(0,0,0,.7)}
.w-dialog-panel{position:fixed;left:1rem;right:1rem;top:50%;transform:translateY(-50%);z-index:2147483647;background:#fff;border-radius:.75rem;box-shadow:0 25px 50px -12px rgba(0,0,0,.25);outline:1px solid rgba(17,24,39,.05);display:flex;flex-direction:column;max-height:85vh;overflow:hidden}
.dark .w-dialog-panel{background:#111827;outline-color:rgba(255,255,255,.1)}
@media(min-width:640px){.w-dialog-panel{left:50%;right:auto;width:100%;max-width:32rem;transform:translate(-50%,-50%)}}
.w-dialog-header{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1.5rem;border-bottom:1px solid #e5e7eb;flex-shrink:0}
.dark .w-dialog-header{border-color:#374151}
.w-dialog-body{flex:1;overflow-y:auto;min-height:0;padding:1.25rem 1.5rem}
.w-dialog-footer{display:flex;align-items:center;justify-content:flex-end;gap:.75rem;padding:1rem 1.5rem;border-top:1px solid #e5e7eb;flex-shrink:0}
.dark .w-dialog-footer{border-color:#374151}
.w-input{display:block;width:100%;border-radius:.5rem;border:1px solid #e5e7eb;background:#fff;padding:.5rem .875rem;font-size:.875rem;color:#111827}
.dark .w-input{background:#1f2937;border-color:#374151;color:#fff}
.w-input:focus{outline:none;box-shadow:0 0 0 2px #6366f1}
.w-label{display:block;font-size:.875rem;font-weight:500;color:#111827;margin-bottom:.375rem}
.dark .w-label{color:#fff}
.w-btn-primary{display:inline-flex;align-items:center;gap:.375rem;border-radius:.5rem;background:#4f46e5;padding:.5rem 1rem;font-size:.875rem;font-weight:600;color:#fff;cursor:pointer;transition:background .15s}
.w-btn-primary:hover{background:#4338ca}
.w-btn-primary:disabled{opacity:.5;cursor:not-allowed}
.w-btn-secondary{border-radius:.5rem;padding:.5rem 1rem;font-size:.875rem;font-weight:600;color:#374151;background:#fff;outline:1px solid #d1d5db;cursor:pointer;transition:background .15s}
.w-btn-secondary:hover{background:#f9fafb}
.dark .w-btn-secondary{color:#d1d5db;background:#1f2937;outline-color:#4b5563}
.w-btn-danger{border-radius:.5rem;background:#dc2626;padding:.5rem 1rem;font-size:.875rem;font-weight:600;color:#fff;cursor:pointer;transition:background .15s}
.w-btn-danger:hover{background:#b91c1c}
.w-btn-close{margin:-.25rem;padding:.25rem;border-radius:.375rem;color:#9ca3af;cursor:pointer;transition:color .15s}
.w-btn-close:hover{color:#6b7280}
.w-field-error{margin-top:.375rem;font-size:.75rem;color:#dc2626}
.w-select{display:block;width:100%;border-radius:.5rem;border:1px solid #e5e7eb;background:#fff;padding:.5rem .875rem .5rem .875rem;font-size:.875rem;color:#111827;appearance:none}
.w-textarea{display:block;width:100%;border-radius:.5rem;border:1px solid #e5e7eb;background:#fff;padding:.5rem .875rem;font-size:.875rem;color:#111827;resize:none}
.w-checkbox-group{border-radius:.5rem;border:1px solid #e5e7eb;background:#f9fafb;max-height:11rem;overflow-y:auto}
.w-checkbox-row{display:flex;align-items:center;gap:.75rem;padding:.625rem .875rem;cursor:pointer}
.w-checkbox{width:1rem;height:1rem;border-radius:.25rem;border:1px solid #d1d5db;accent-color:#6366f1}
.w-section-subtitle{margin-top:.25rem;font-size:.875rem;color:#6b7280}
.dark .w-section-subtitle{color:#9ca3af}
.w-input-readonly{display:block;width:100%;border-radius:.5rem;border:1px solid #e5e7eb;background:#fff;padding:.5rem .875rem;font-size:.875rem;color:#6b7280;cursor:not-allowed;opacity:.6}

/* ── Tailwind dark-mode utility overrides for teleported overlays ─────── */
/* text colors */
.dark .dark\\:text-white{color:#fff}
.dark .dark\\:text-gray-100{color:#f3f4f6}
.dark .dark\\:text-gray-200{color:#e5e7eb}
.dark .dark\\:text-gray-300{color:#d1d5db}
.dark .dark\\:text-gray-400{color:#9ca3af}
.dark .dark\\:text-gray-500{color:#6b7280}
.dark .dark\\:text-indigo-300{color:#a5b4fc}
.dark .dark\\:text-indigo-400{color:#818cf8}
.dark .dark\\:text-red-400{color:#f87171}
.dark .dark\\:text-green-400{color:#4ade80}
.dark .dark\\:text-teal-300{color:#5eead4}
.dark .dark\\:text-orange-300{color:#fdba74}
.dark .dark\\:text-purple-300{color:#d8b4fe}
.dark .dark\\:text-rose-300{color:#fda4af}
/* background colors */
.dark .dark\\:bg-gray-950{background-color:#030712}
.dark .dark\\:bg-gray-900{background-color:#111827}
.dark .dark\\:bg-gray-800{background-color:#1f2937}
.dark .dark\\:bg-gray-700{background-color:#374151}
.dark .dark\\:bg-indigo-900\\/40{background-color:rgba(49,46,129,.4)}
.dark .dark\\:bg-indigo-900\\/60{background-color:rgba(49,46,129,.6)}
.dark .dark\\:bg-red-900\\/30{background-color:rgba(127,29,29,.3)}
.dark .dark\\:bg-green-900\\/30{background-color:rgba(20,83,45,.3)}
/* border colors */
.dark .dark\\:border-gray-700{border-color:#374151}
.dark .dark\\:border-gray-600{border-color:#4b5563}
.dark .dark\\:border-gray-500{border-color:#6b7280}
/* ring colors */
.dark .dark\\:ring-gray-700{--tw-ring-color:#374151}
.dark .dark\\:ring-gray-600{--tw-ring-color:#4b5563}
/* placeholder */
.dark .dark\\:placeholder-gray-500::placeholder{color:#6b7280}
.dark .dark\\:placeholder\\:text-gray-500::placeholder{color:#6b7280}
/* divide */
.dark .dark\\:divide-gray-700>:not([hidden])~:not([hidden]){border-color:#374151}
/* hover overrides */
.dark .dark\\:hover\\:bg-gray-800:hover{background-color:#1f2937}
.dark .dark\\:hover\\:bg-gray-700:hover{background-color:#374151}
.dark .dark\\:hover\\:text-indigo-400:hover{color:#818cf8}
.dark .dark\\:hover\\:text-white:hover{color:#fff}
`;
    document.head.appendChild(styleEl);
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
        document.body.appendChild(host);

        const outlet = new DomPortalOutlet(host, this._appRef, this._injector);
        const portal = new DomPortal(element);
        outlet.attach(portal);

        return new WidgetPortalRef(portal, outlet, placeholder);
    }
}
