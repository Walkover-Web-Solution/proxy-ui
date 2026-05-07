import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
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
import { reducers, clearStateMetaReducer } from './core/ngrx/store/app.state';
import { loginsReducer } from './website/home/ngrx/store/login.state';
import { registrationReducer } from './website/home/ngrx/reducers/registration.reducer';
import { RootEffects } from './core/ngrx/effects/root';
import { LogInEffects } from './website/home/ngrx/effects/login.effects';
import { RegistrationEffects } from './website/home/ngrx/effects/registration.effects';
import { ErrorInterceptor } from '@proxy/services/interceptor/errorInterceptor';
import { ProxyBaseUrls } from '@proxy/models/root-models';
import { AuthInitializerService } from './core/auth-initializer.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideAnimations(),
        provideRouter(
            appRoutes,
            withEnabledBlockingInitialNavigation(),
            withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })
        ),
        provideHttpClient(withFetch(), withInterceptorsFromDi()),
        provideStore(reducers, { metaReducers: [clearStateMetaReducer] }),
        provideState('auth', loginsReducer),
        provideState('registration', registrationReducer),
        provideEffects([RootEffects, LogInEffects, RegistrationEffects]),
        ...(!environment.production ? [provideStoreDevtools({ maxAge: 25, serialize: true })] : []),
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        {
            provide: APP_INITIALIZER,
            useFactory: (authInitializerService: AuthInitializerService) => () => authInitializerService.initialize(),
            deps: [AuthInitializerService],
            multi: true,
        },
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
