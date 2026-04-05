import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    OnDestroy,
    inject,
    computed,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WidgetThemeService } from '../../service/widget-theme.service';
import { OtpService } from '../../service/otp.service';
import { OtpUtilityService } from '../../service/otp-utility.service';
import { environment } from 'apps/36-blocks-widget/src/environments/environment';
import { WidgetVersion } from '../utility/model';
import { WIDGET_LAYOUT } from '../theme.constants';
import { WidgetTheme } from '@proxy/constant';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'proxy-inline-login',
    imports: [CommonModule, FormsModule],
    templateUrl: './inline-login.component.html',
    styleUrls: ['./inline-login.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineLoginComponent implements OnInit, OnDestroy {
    @Input() buttonsData: any;
    @Input() loginWidgetData: any;
    @Input() version: string = WidgetVersion.V1;
    @Input() borderRadius: string = '8px';
    @Input() primaryColor: string = '#000000';
    @Input() buttonColor: string = '#3f51b5';
    @Input() buttonHoverColor: string = '#303f9f';
    @Input() buttonTextColor: string = '#ffffff';
    @Input() totalButtons: number = 1;
    @Input() showDivider: boolean = false;
    @Input() inputFieldsPosition: string = 'top';

    @Output() forgotPasswordClicked = new EventEmitter<string>();
    @Output() loginSuccess = new EventEmitter<any>();
    @Output() loginFailure = new EventEmitter<any>();
    @Output() registrationRequired = new EventEmitter<string>();

    private readonly themeService = inject(WidgetThemeService);
    private readonly otpService = inject(OtpService);
    private readonly otpUtilityService = inject(OtpUtilityService);
    private readonly cdr = inject(ChangeDetectorRef);

    readonly isDark = computed(() => this.themeService.isDark$());
    readonly WidgetTheme = WidgetTheme;
    readonly layout = WIDGET_LAYOUT;

    username = '';
    password = '';
    showPassword = false;
    isLoading = signal(false);
    errorMessage = signal('');
    hCaptchaToken = '';
    hCaptchaWidgetId: any = null;
    isHovered = false;

    private hcaptchaLoading = false;
    private hcaptchaRenderQueue: Array<() => void> = [];
    private hcaptchaPlaceholder: HTMLElement | null = null;

    ngOnInit(): void {
        setTimeout(() => this.initHCaptcha(), 0);
    }

    ngOnDestroy(): void {
        this.resetHCaptchaWidget();
    }

    private initHCaptcha(): void {
        const el = document.getElementById('inline-login-hcaptcha');
        if (el) {
            this.hcaptchaPlaceholder = el;
            this.ensureHCaptchaScriptLoaded(() => this.renderHCaptcha());
        }
    }

    private renderHCaptcha(): void {
        const instance = this.getHCaptchaInstance();
        if (!instance || !environment.hCaptchaSiteKey || !this.hcaptchaPlaceholder) return;
        this.hcaptchaPlaceholder.innerHTML = '';
        this.hCaptchaWidgetId = instance.render(this.hcaptchaPlaceholder, {
            sitekey: environment.hCaptchaSiteKey,
            theme: this.isDark() ? WidgetTheme.Dark : WidgetTheme.Light,
            callback: (token: string) => {
                this.hCaptchaToken = token;
                this.errorMessage.set('');
                this.cdr.markForCheck();
            },
            'expired-callback': () => {
                this.hCaptchaToken = '';
                this.cdr.markForCheck();
            },
            'error-callback': () => {
                this.hCaptchaToken = '';
                this.errorMessage.set('hCaptcha verification failed. Please retry.');
                this.cdr.markForCheck();
            },
        });
    }

    private ensureHCaptchaScriptLoaded(onReady: () => void): void {
        if (this.getHCaptchaInstance()) {
            onReady();
            return;
        }
        this.hcaptchaRenderQueue.push(onReady);
        if (this.hcaptchaLoading) return;
        this.hcaptchaLoading = true;
        const script = document.createElement('script');
        script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            this.hcaptchaLoading = false;
            const queued = [...this.hcaptchaRenderQueue];
            this.hcaptchaRenderQueue = [];
            queued.forEach((cb) => cb());
        };
        script.onerror = () => {
            this.hcaptchaLoading = false;
            this.hcaptchaRenderQueue = [];
        };
        document.head.appendChild(script);
    }

    private getHCaptchaInstance(): any {
        return (window as any)?.hcaptcha;
    }

    private resetHCaptchaWidget(): void {
        const instance = this.getHCaptchaInstance();
        if (instance && this.hCaptchaWidgetId !== null && this.hCaptchaWidgetId !== undefined) {
            instance.reset(this.hCaptchaWidgetId);
        }
        this.hCaptchaToken = '';
    }

    onSubmit(): void {
        const user = this.username?.trim();
        const pass = this.password;

        if (!user || !pass) {
            this.errorMessage.set('Email/Mobile and password are required.');
            return;
        }
        if (!this.hCaptchaToken) {
            this.errorMessage.set('Please complete the hCaptcha verification.');
            return;
        }

        this.errorMessage.set('');
        this.isLoading.set(true);

        const payload = {
            state: this.buttonsData?.state || this.loginWidgetData?.state,
            user: user.replace(/^\+/, ''),
            password: this.encryptPassword(pass),
            hCaptchaToken: this.hCaptchaToken,
        };

        this.otpService.login(payload).subscribe(
            (res) => {
                this.isLoading.set(false);
                this.cdr.markForCheck();
                if (res?.hasError) {
                    this.errorMessage.set(res?.errors?.[0] || 'Unable to login. Please try again.');
                    this.resetHCaptchaWidget();
                    return;
                }
                if (res?.data?.redirect_url) {
                    window.location.href = res.data.redirect_url;
                    return;
                }
                this.loginSuccess.emit(res);
            },
            (error: HttpErrorResponse) => {
                this.isLoading.set(false);
                this.cdr.markForCheck();
                if (error?.status === 403) {
                    this.registrationRequired.emit(this.username?.trim());
                    this.resetHCaptchaWidget();
                    return;
                }
                this.errorMessage.set(
                    error?.error?.errors?.[0] || 'Login failed. Please check your details and try again.'
                );
                this.resetHCaptchaWidget();
                this.loginFailure.emit(error);
            }
        );
    }

    onForgotPassword(): void {
        this.forgotPasswordClicked.emit(this.username?.trim() || '');
    }

    onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.onSubmit();
        }
    }

    private encryptPassword(password: string): string {
        return this.otpUtilityService.aesEncrypt(
            JSON.stringify(password),
            environment.uiEncodeKey,
            environment.uiIvKey,
            true
        );
    }

    get inputStyle(): string {
        const dark = this.isDark();
        return `width:100%;height:${WIDGET_LAYOUT.inputHeight};padding:0 16px;border:1px solid ${dark ? '#ffffff' : '#cbd5e1'};border-radius:${this.borderRadius};background:${dark ? 'transparent' : '#ffffff'};color:${dark ? '#ffffff' : '#1f2937'};font-size:${WIDGET_LAYOUT.buttonFontSize};outline:none;box-sizing:border-box;`;
    }

    get passwordInputStyle(): string {
        return this.inputStyle.replace('padding:0 16px', 'padding:0 44px 0 16px');
    }
}
