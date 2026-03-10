import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';

const CONTAINER_CLASS = 'cdk-overlay-container';
/** Full-viewport overlay container style so positioning is viewport-based when in shadow root */
const OVERLAY_CONTAINER_STYLE =
    'position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;pointer-events:none!important;z-index:1000!important;';
/**
 * OverlayContainer that:
 * - When proxy-auth with shadow root exists (script load): attaches the overlay as the
 *   **first** child of the shadow root with full-viewport fixed style, so it is NOT
 *   inside the fixed .container and positioning is correct (dropdown below the right field).
 * - Otherwise: attaches to document.body (default behaviour).
 */
@Injectable()
export class ShadowDomOverlayContainer extends OverlayContainer {
    constructor(@Inject(DOCUMENT) document: Document, _platform: Platform) {
        super(document, _platform);
    }

    /**
     * Before returning the cached container, check whether it is still
     * connected to the live document.  This can become false when the client
     * application does a SPA navigation that removes the <proxy-auth> custom
     * element (and therefore its shadow root) from the DOM.  A new
     * <proxy-auth> element is created by initVerification() on the next
     * navigation, but the CDK base class would keep returning the old,
     * detached container — causing MatDialog / MatSnackBar to render into an
     * invisible node.  Clearing _containerElement forces _createContainer()
     * to run again and attach the overlay to the new shadow root.
     */
    override getContainerElement(): HTMLElement {
        if (this._containerElement && !this._containerElement.isConnected) {
            this._containerElement = null;
        }
        return super.getContainerElement();
    }

    protected override _createContainer(): void {
        if (!this._platform.isBrowser) {
            return;
        }

        const container = this._document.createElement('div');
        container.classList.add(CONTAINER_CLASS);

        const parent = this._getOverlayParent();
        if (parent !== this._document.body) {
            container.setAttribute('style', OVERLAY_CONTAINER_STYLE);
            const first = parent.firstChild;
            if (first) {
                parent.insertBefore(container, first);
            } else {
                parent.appendChild(container);
            }
        } else {
            parent.appendChild(container);
        }
        this._containerElement = container;
    }

    private _getOverlayParent(): HTMLElement {
        const host =
            (this._document.querySelector('proxy-auth:not([data-master])') as HTMLElement | null) ??
            (this._document.querySelector('proxy-auth') as HTMLElement | null);

        if (host?.shadowRoot) {
            return host.shadowRoot as unknown as HTMLElement;
        }
        return this._document.body;
    }
}
