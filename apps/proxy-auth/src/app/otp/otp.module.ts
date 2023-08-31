import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatRippleModule } from '@angular/material/core';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { ProxyBaseUrls } from '@msg91/models/root-models';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { SendOtpCenterComponent } from './component';
import { SendOtpComponent } from './send-otp/send-otp.component';
import { OtpService } from './service/otp.service';
import { reducers } from './store/app.state';
import { OtpEffects } from './store/effects';
import { DirectivesRemoveCharacterDirectiveModule } from 'libs/directives/remove-character-directive/src/index';
import { ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { OtpUtilityService } from './service/otp-utility.service';

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
        ServicesHttpWrapperModule,
    ],
    declarations: [...CHAT_COMPONENTS],
    providers: [
        OtpService,
        OtpUtilityService,
        { provide: ProxyBaseUrls.Env, useValue: environment.env },
        { provide: ProxyBaseUrls.ProxyURL, useValue: null },
        {
            provide: ProxyBaseUrls.BaseURL,
            useValue: environment.apiUrl + environment.msgMidProxy,
        },
    ],
    exports: [SendOtpComponent],
})
export class OtpModule {}
