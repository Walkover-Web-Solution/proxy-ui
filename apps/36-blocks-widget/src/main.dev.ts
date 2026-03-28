import { bootstrapApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideZoneChangeDetection, importProvidersFrom, Injector } from '@angular/core';
import { NgHcaptchaModule } from 'ng-hcaptcha';
import { AppComponent } from './app/app.component';
import { ProxyAuthWidgetComponent } from './app/otp/widget/widget.component';
import { reducers } from './app/otp/store/app.state';
import { OtpEffects } from './app/otp/store/effects';
import { OtpService } from './app/otp/service/otp.service';
import { OtpUtilityService } from './app/otp/service/otp-utility.service';
import { OtpWidgetService } from './app/otp/service/otp-widget.service';
import { WidgetThemeService } from './app/otp/service/widget-theme.service';
import { ProxyBaseUrls } from '@proxy/models/root-models';
import { environment } from './environments/environment';

import './app/init-verification';

bootstrapApplication(AppComponent, {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideHttpClient(),
        provideAnimations(),
        provideStore(reducers, {
            runtimeChecks: {
                strictStateImmutability: true,
                strictActionImmutability: true,
            },
        }),
        provideEffects([OtpEffects]),
        provideStoreDevtools({ maxAge: 25, serialize: true }),
        importProvidersFrom(NgHcaptchaModule.forRoot({ siteKey: environment.hCaptchaSiteKey })),
        OtpService,
        OtpUtilityService,
        OtpWidgetService,
        WidgetThemeService,
        { provide: ProxyBaseUrls.Env, useValue: environment.env },
        {
            provide: ProxyBaseUrls.BaseURL,
            useValue: environment.apiUrl + environment.msgMidProxy,
        },
        {
            provide: ProxyBaseUrls.ClientURL,
            useValue: environment.apiUrl + environment.msgMidProxy,
        },
    ],
})
    .then((appRef) => {
        const injector = appRef.injector.get(Injector);
        if (!customElements.get('proxy-auth')) {
            const el = createCustomElement(ProxyAuthWidgetComponent, { injector });
            customElements.define('proxy-auth', el);
        }
    })
    .catch((err) => console.error(err));
