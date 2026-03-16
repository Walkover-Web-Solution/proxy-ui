import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatSortModule } from '@angular/material/sort';
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
import { ProxyBaseUrls } from '@proxy/models/root-models';
import { NgHcaptchaModule } from 'ng-hcaptcha';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { DirectivesRemoveCharacterDirectiveModule } from '@proxy/directives/RemoveCharacterDirective';

import { environment } from '../../environments/environment';
import { SendOtpCenterComponent } from './component';
import { SendOtpComponent } from './send-otp/send-otp.component';
import { OtpService } from './service/otp.service';
import { reducers } from './store/app.state';
import { OtpEffects } from './store/effects';
import { ServicesHttpWrapperNoAuthModule } from '@proxy/services/http-wrapper-no-auth';
import { OtpUtilityService } from './service/otp-utility.service';
import { OtpWidgetService } from './service/otp-widget.service';
import { RegisterComponent } from './component/register/register.component';
import { DirectivesMarkAllAsTouchedModule } from '@proxy/directives/mark-all-as-touched';
import { LoginComponent } from './component/login/login.component';
import { UiLoaderModule } from '@proxy/ui/loader';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserDialogModule } from './user-profile/user-dialog/user-dialog.module';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { UserManagementComponent } from './user-management/user-management.component';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { SubscriptionCenterComponent } from './component/subscription-center/subscription-center.component';
import { MatDividerModule } from '@angular/material/divider';
import { UiConfirmDialogModule } from '@proxy/ui/confirm-dialog';
import { OrganizationDetailsComponent } from './organization-details/organization-details.component';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ShadowDomOverlayContainer } from '../shadow-dom-overlay-container';

export const CHAT_COMPONENTS: any[] = [
    SendOtpComponent,
    SendOtpCenterComponent,
    RegisterComponent,
    LoginComponent,
    UserProfileComponent,
    UserManagementComponent,
    SubscriptionCenterComponent,
    OrganizationDetailsComponent,
];

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatRippleModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatRadioModule,
        UiLoaderModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        UserDialogModule,
        MatCardModule,
        MatSelectModule,
        MatTooltipModule,
        MatTabsModule,
        MatSnackBarModule,
        NgHcaptchaModule.forRoot({
            siteKey: environment.hCaptchaSiteKey,
        }),
        MatDividerModule,
        UiConfirmDialogModule,

        DirectivesRemoveCharacterDirectiveModule,
        EffectsModule.forRoot([OtpEffects]),
        StoreModule.forRoot(reducers, {
            runtimeChecks: {
                strictStateImmutability: true,
                strictActionImmutability: true,
            },
        }),
        ServicesHttpWrapperNoAuthModule,
        DirectivesMarkAllAsTouchedModule,
        MatSnackBarModule,
    ],
    declarations: [...CHAT_COMPONENTS],
    providers: [
        OtpService,
        OtpUtilityService,
        OtpWidgetService,
        { provide: OverlayContainer, useClass: ShadowDomOverlayContainer },
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
    exports: [SendOtpComponent],
})
export class OtpModule {}
