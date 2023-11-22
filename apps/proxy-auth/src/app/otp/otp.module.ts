import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { ProxyBaseUrls } from '@proxy/models/root-models';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { DirectivesRemoveCharacterDirectiveModule } from 'libs/directives/remove-character-directive/src';

import { environment } from '../../environments/environment';
import { SendOtpCenterComponent } from './component';
import { SendOtpComponent } from './send-otp/send-otp.component';
import { OtpService } from './service/otp.service';
import { reducers } from './store/app.state';
import { OtpEffects } from './store/effects';
import { ServicesHttpWrapperNoAuthModule } from '@proxy/services/http-wrapper-no-auth';
import { OtpUtilityService } from './service/otp-utility.service';
import { OtpWidgetService } from './service/otp-widget.service';

export const CHAT_COMPONENTS: any[] = [SendOtpComponent, SendOtpCenterComponent];

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatRippleModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatRadioModule,
        DirectivesRemoveCharacterDirectiveModule,
        EffectsModule.forRoot([OtpEffects]),
        StoreModule.forRoot(reducers, {
            runtimeChecks: {
                strictStateImmutability: true,
                strictActionImmutability: true,
            },
        }),
        ServicesHttpWrapperNoAuthModule,
    ],
    declarations: [...CHAT_COMPONENTS],
    providers: [
        OtpService,
        OtpUtilityService,
        OtpWidgetService,
        { provide: ProxyBaseUrls.Env, useValue: environment.env },
        {
            provide: ProxyBaseUrls.BaseURL,
            useValue: environment.apiUrl + environment.msgMidProxy,
        },
    ],
    exports: [SendOtpComponent],
})
export class OtpModule {}
