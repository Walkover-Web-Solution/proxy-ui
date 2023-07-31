import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import { AppFirebaseModule } from './app-firebase.module';
import { UiPrimeNgToastModule } from '@msg91/ui/prime-ng-toast';
import { StoreModule } from '@ngrx/store';
import { loginsReducer } from './auth/ngrx/store/login.state';
import { reducers, EffectModule } from './ngrx';
import { clearStateMetaReducer } from './ngrx/store/app.state';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LogInEffectsModule } from './auth/ngrx/effects/login-effects.module';
import { ServicesProxyAuthModule } from '@proxy/services/proxy/auth';
import { ProxyBaseUrls } from '@msg91/models/root-models';
import { environment } from '../environments/environment';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { AdminErrorInterceptor } from '@msg91/services/interceptor/adminErrorInterceptor';
import { VersionCheckServiceModule } from '@msg91/service';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        AppFirebaseModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
        UiPrimeNgToastModule,
        StoreModule.forRoot(reducers, { metaReducers: [clearStateMetaReducer] }),
        EffectModule,
        StoreModule.forFeature('auth', loginsReducer),
        HttpClientModule,
        LogInEffectsModule,
        ServicesProxyAuthModule,
        VersionCheckServiceModule,
    ],
    providers: [
        { provide: ProxyBaseUrls.FirebaseConfig, useValue: environment.firebaseConfig },
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                appearance: 'outline',
                floatLabel: 'auto',
            },
        },
        {
            provide: ProxyBaseUrls.IToken,
            useValue: {
                token: null,
                companyId: null,
            },
        },
        { provide: HTTP_INTERCEPTORS, useClass: AdminErrorInterceptor, multi: true },
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS,
            useValue: {
                autoFocus: false,
                hasBackdrop: true,
                disableClose: true,
                restoreFocus: false,
            },
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
