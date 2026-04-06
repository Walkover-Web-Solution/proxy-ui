import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';
import { MarkdownModule } from 'ngx-markdown';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';
import { reducers, clearStateMetaReducer } from './ngrx/store/app.state';
import { loginsReducer } from './auth/ngrx/store/login.state';
import { RootEffects } from './ngrx/effects/root';
import { LogInEffects } from './auth/ngrx/effects/login.effects';
import { ErrorInterceptor } from '@proxy/services/interceptor/errorInterceptor';
import { ProxyBaseUrls } from '@proxy/models/root-models';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideAnimations(),
        provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
        provideHttpClient(withInterceptorsFromDi()),
        provideStore(reducers, { metaReducers: [clearStateMetaReducer] }),
        provideState('auth', loginsReducer),
        provideEffects([RootEffects, LogInEffects]),
        ...(!environment.production ? [provideStoreDevtools({ maxAge: 25, serialize: true })] : []),
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        importProvidersFrom(AngularFireModule.initializeApp(environment.firebaseConfig), AngularFireAuthModule),
        { provide: ProxyBaseUrls.FirebaseConfig, useValue: environment.firebaseConfig },
        { provide: ProxyBaseUrls.IToken, useValue: { token: null, companyId: null } },
        { provide: ProxyBaseUrls.BaseURL, useValue: environment.baseUrl },
        { provide: ProxyBaseUrls.ProxyLogsUrl, useValue: environment.baseUrl },
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: { appearance: 'outline', floatLabel: 'auto' },
        },
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS,
            useValue: { autoFocus: false, hasBackdrop: true, disableClose: true, restoreFocus: false },
        },
        {
            provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
            useValue: { disableTooltipInteractivity: true },
        },
        importProvidersFrom(MarkdownModule.forRoot()),
    ],
};
