import { MarkdownModule } from 'ngx-markdown';
/** Local review entry only. Never imported by main.ts or a release configuration. */
import { bootstrapApplication } from '@angular/platform-browser';
import { Component, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, RouterOutlet, withInMemoryScrolling } from '@angular/router';
import {
    HttpBackend,
    HttpErrorResponse,
    HttpEvent,
    HttpRequest,
    HttpResponse,
    provideHttpClient,
} from '@angular/common/http';
import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { Observable, of, throwError, delay } from 'rxjs';
import { ProxyBaseUrls } from '@proxy/models/root-models';
import { appRoutes } from './app/app.routes';
import { reducers } from './app/core/ngrx/store/app.state';
import { loginsReducer } from './app/website/home/ngrx/store/login.state';
import { registrationReducer } from './app/website/home/ngrx/reducers/registration.reducer';
import { RootEffects } from './app/core/ngrx/effects/root';
import { CanActivateRouteGuard } from './app/website/home/authguard';
import { LoggedInGuard } from './app/website/home/authguard/logged-in.guard';
import { GoogleOneTapService } from './app/website/login/google-one-tap.service';
import { page, reviewData } from './review/fixtures';

class ReviewBackend implements HttpBackend {
    handle(request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
        const state = new URLSearchParams(location.search).get('reviewState');
        const path = new URL(request.url, location.origin).pathname.replace('/review-api/', '');
        const fail = (status: number) =>
            throwError(
                () => new HttpErrorResponse({ status, error: { errors: { message: 'Synthetic review response' } } })
            );
        if (request.method !== 'GET') return fail(403);
        if (state === 'denied') return fail(403);
        if (state === 'error') return fail(503);
        let data = reviewData(path, request.params);
        if (data === undefined) return fail(404);
        if (state === 'empty' && data?.data && Array.isArray(data.data)) data = page([]);
        return of(new HttpResponse({ status: 200, body: { hasError: false, errors: [], data } })).pipe(
            delay(state === 'loading' ? 15000 : 100)
        );
    }
}
@Component({
    selector: 'proxy-root',
    imports: [RouterOutlet],
    template: `<div class="review-banner">
            LOCAL REVIEW · Synthetic data · No live API calls or credential issuance <a href="/">Website</a
            ><a href="/app/dashboard">Workspace</a><a href="/app/users?reviewState=denied">Denied state</a
            ><a href="/app/users?reviewState=error">Error state</a
            ><a href="/app/users?reviewState=empty">Empty state</a>
        </div>
        <router-outlet />`,
    styles: [
        `
            .review-banner {
                min-height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 16px;
                padding: 6px 10px;
                background: #253a22;
                color: #fff;
                font: 10px system-ui;
                flex-wrap: wrap;
            }
            .review-banner a {
                color: #e7f0de;
                text-decoration: underline;
            }
            :host {
                display: block;
            }
            :host ::ng-deep .workspace-shell,
            :host ::ng-deep proxy-layout {
                height: calc(100dvh - 32px);
            }
            @media (max-width: 720px) {
                .review-banner {
                    font-size: 9px;
                    gap: 8px;
                }
                .review-banner a:nth-last-child(-n + 3) {
                    display: none;
                }
            }
        `,
    ],
})
class ReviewRoot {}
document.getElementById('app-splash-screen')?.remove();
bootstrapApplication(ReviewRoot, {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideAnimations(),
        provideRouter(
            appRoutes,
            withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })
        ),
        provideStore(reducers),
        provideState('auth', loginsReducer),
        provideState('registration', registrationReducer),
        provideEffects([RootEffects]),
        importProvidersFrom(MarkdownModule.forRoot()),
        provideHttpClient(),
        { provide: HttpBackend, useClass: ReviewBackend },
        { provide: ProxyBaseUrls.BaseURL, useValue: '/review-api' },
        { provide: ProxyBaseUrls.ProxyLogsUrl, useValue: '/review-api' },
        { provide: ProxyBaseUrls.IToken, useValue: { token: null, companyId: null } },
        { provide: ProxyBaseUrls.FirebaseConfig, useValue: {} },
        { provide: AngularFireAuth, useValue: { authState: of(null) } },
        { provide: CanActivateRouteGuard, useValue: { canActivate: () => true } },
        { provide: LoggedInGuard, useValue: { canActivate: () => true } },
        {
            provide: GoogleOneTapService,
            useValue: {
                loadScript: () => Promise.resolve(),
                isAvailable: () => false,
                prompt: () => {},
                initialize: () => {},
                renderButton: () => {},
                cancel: () => {},
            },
        },
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
    ],
}).catch(() => {
    document.body.textContent = 'The local review could not start. Check the build output.';
});
