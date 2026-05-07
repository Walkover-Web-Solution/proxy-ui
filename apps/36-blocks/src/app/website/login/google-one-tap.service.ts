import { Injectable, NgZone, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../../environments/environment';

declare const google: {
    accounts: {
        id: {
            initialize: (config: Record<string, unknown>) => void;
            prompt: (
                notification?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void
            ) => void;
            renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
            cancel: () => void;
        };
    };
};

export interface GoogleOneTapCredential {
    credential: string;
    select_by: string;
}

@Injectable({ providedIn: 'root' })
export class GoogleOneTapService {
    private readonly ngZone = inject(NgZone);
    private readonly document = inject(DOCUMENT);

    // GIS script is lazy-loaded only when the login page is visited — not in index.html
    // This avoids loading a third-party script on every page of the app.
    private gisScriptLoaded = false;

    // TODO (pending): Google One Tap is disabled until googleClientId is set in env-variables.ts
    // Once the client ID is configured, this service will render the personalized
    // "Continue as user@gmail.com" button and trigger the One Tap floating prompt.
    // Fallback: the standard Firebase popup Google login remains active when isAvailable() returns false.
    public isAvailable(): boolean {
        return typeof google !== 'undefined' && !!google?.accounts?.id && !!environment.googleClientId;
    }

    public loadScript(): Promise<void> {
        if (this.gisScriptLoaded || typeof google !== 'undefined') {
            this.gisScriptLoaded = true;
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            let resolved = false;
            const resolveOnce = (): void => {
                if (!resolved) {
                    resolved = true;
                    resolve();
                }
            };
            const timeoutId = setTimeout(resolveOnce, 3000);
            const scriptElement = this.document.createElement('script');
            scriptElement.src = 'https://accounts.google.com/gsi/client';
            scriptElement.async = true;
            scriptElement.defer = true;
            scriptElement.onload = () => {
                this.gisScriptLoaded = true;
                clearTimeout(timeoutId);
                resolveOnce();
            };
            scriptElement.onerror = () => {
                clearTimeout(timeoutId);
                resolveOnce();
            };
            this.document.head.appendChild(scriptElement);
        });
    }

    public initialize(onCredentialReceived: (credential: GoogleOneTapCredential) => void): void {
        // TODO (pending): Skipped until googleClientId is set in env-variables.ts
        if (!this.isAvailable()) {
            return;
        }
        google.accounts.id.initialize({
            client_id: environment.googleClientId,
            callback: (credentialResponse: GoogleOneTapCredential) => {
                this.ngZone.run(() => onCredentialReceived(credentialResponse));
            },
            auto_select: true,
            cancel_on_tap_outside: false,
        });
    }

    public prompt(): void {
        // TODO (pending): Skipped until googleClientId is set in env-variables.ts
        if (!this.isAvailable()) {
            return;
        }
        google.accounts.id.prompt();
    }

    public renderButton(parentElement: HTMLElement, options: Record<string, unknown> = {}): void {
        // TODO (pending): Skipped until googleClientId is set in env-variables.ts
        if (!this.isAvailable()) {
            return;
        }
        google.accounts.id.renderButton(parentElement, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: parentElement.offsetWidth || 400,
            ...options,
        });
    }

    public cancel(): void {
        if (!this.isAvailable()) {
            return;
        }
        google.accounts.id.cancel();
    }

    // TODO (pending): Call this instead of initialize()+prompt() separately once googleClientId is set
    public initializeAsObservable(): Observable<GoogleOneTapCredential> {
        return new Observable((observer) => {
            this.initialize((credentialResponse) => {
                observer.next(credentialResponse);
            });
            this.prompt();
            return () => this.cancel();
        });
    }
}
