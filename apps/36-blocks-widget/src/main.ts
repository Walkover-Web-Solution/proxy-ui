import 'zone.js';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { NgHcaptchaModule } from 'ng-hcaptcha';
import { ProxyAuthWidgetComponent } from './app/otp/widget/widget.component';
import { reducers } from './app/otp/store/app.state';
import { OtpEffects } from './app/otp/store/effects';
import { OtpService } from './app/otp/service/otp.service';
import { OtpUtilityService } from './app/otp/service/otp-utility.service';
import { OtpWidgetService } from './app/otp/service/otp-widget.service';
import { WidgetThemeService } from './app/otp/service/widget-theme.service';
import { ProxyBaseUrls } from '@proxy/models/root-models';
import { environment } from './environments/environment';

// Side-effect import — registers window.initVerification, showUserManagement, hideUserManagement
import './app/init-verification';

// Double-load protection — prevents duplicate Angular app if script is loaded twice
if ((window as any).__proxyAuthLoaded) {
    console.warn('[proxy-auth] Script already loaded — skipping bootstrap.');
} else {
    (window as any).__proxyAuthLoaded = true;

    createApplication({
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
            ...(!environment.production ? [provideStoreDevtools({ maxAge: 25, serialize: true })] : []),
            // ng-hcaptcha may not expose standalone providers — use importProvidersFrom as safe fallback
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
    }).then((appRef) => {
        const injector = appRef.injector;
        try {
            if (!customElements.get('proxy-auth')) {
                const el = createCustomElement(ProxyAuthWidgetComponent, { injector });
                customElements.define('proxy-auth', el);
            }
        } catch (e) {
            console.warn('[proxy-auth] Custom element registration failed:', e);
        }
    });
}
