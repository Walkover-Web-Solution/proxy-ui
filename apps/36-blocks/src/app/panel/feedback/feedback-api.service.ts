import { Injectable, inject } from '@angular/core';
import { AuthService } from '@proxy/services/proxy/auth';
import { CookieService } from 'ngx-cookie-service';
import { Store, select } from '@ngrx/store';
import { selectClientSettings } from '../../core/ngrx';
import { selectLogInData } from '../../website/home/ngrx/selector/login.selector';
import { ILogInFeatureStateWithRootState } from '../../website/home/ngrx/store/login.state';
import { IClientSettings, IFirebaseUserModel } from '@proxy/models/root-models';
import { BillingService } from '../billing/billing.service';
import { environment } from '../../../environments/environment';
import { take } from 'rxjs/operators';

export interface IFeedbackUser {
    id: string | number | null;
    email: string | null;
    name: string | null;
    company: string | null;
    plan: string | null;
}

export interface IFeedbackSendResult {
    success: boolean;
    status: number;
    error?: string;
}

@Injectable({
    providedIn: 'root',
})
export class FeedbackApiService {
    private readonly authService = inject(AuthService);
    private readonly cookieService = inject(CookieService);
    private readonly store = inject<Store<ILogInFeatureStateWithRootState>>(Store);
    private readonly billingService = inject(BillingService);

    private currentLoginData: IFirebaseUserModel | null = null;
    private currentClientSettings: IClientSettings | null = null;
    private cachedPlan: string | null = null;

    constructor() {
        this.store.pipe(select(selectLogInData)).subscribe((loginData) => {
            this.currentLoginData = loginData ?? null;
        });

        this.store.pipe(select(selectClientSettings)).subscribe((settings) => {
            this.currentClientSettings = settings ?? null;
        });
    }

    public refreshPlan(): void {
        const rawToken = this.authService.getTokenSync() || this.cookieService.get('authToken');
        if (!rawToken) return;

        this.billingService
            .getSubscriptionStatus()
            .pipe(take(1))
            .subscribe({
                next: (res) => {
                    if (res?.data?.active_plan_code) {
                        this.cachedPlan = res.data.active_plan_code;
                    } else if (res?.data && !res.data.has_subscription) {
                        this.cachedPlan = 'free';
                    }
                },
                error: () => {
                    // Ignore errors when refreshing plan in background
                },
            });
    }

    private parseJwt(token: string | null | undefined): Record<string, any> | null {
        if (!token || typeof token !== 'string') return null;
        try {
            const parts = token.split('.');
            if (parts.length < 2) return null;
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch {
            return null;
        }
    }

    public getSessionUser(): IFeedbackUser {
        const rawToken = this.authService.getTokenSync() || this.cookieService.get('authToken');
        const jwt = this.parseJwt(rawToken);

        const id =
            this.currentLoginData?.uid ??
            jwt?.['id'] ??
            jwt?.['user_id'] ??
            jwt?.['sub'] ??
            (this.currentClientSettings?.client?.id != null ? String(this.currentClientSettings.client.id) : null);

        const email =
            this.currentLoginData?.email ?? jwt?.['email'] ?? this.currentClientSettings?.client?.email ?? null;

        const name =
            this.currentLoginData?.displayName ?? jwt?.['name'] ?? this.currentClientSettings?.client?.name ?? null;

        const company = this.currentClientSettings?.client?.name ?? jwt?.['company_name'] ?? jwt?.['company'] ?? null;

        const plan =
            this.cachedPlan ??
            jwt?.['plan'] ??
            jwt?.['plan_code'] ??
            this.currentClientSettings?.client?.settings?.['plan'] ??
            null;

        return {
            id,
            email,
            name,
            company,
            plan,
        };
    }

    public async sendFeedback(text: string): Promise<IFeedbackSendResult> {
        const url = (environment as any).stewardFeedbackUrl || 'https://steward.embarko.app/api/v1/feedback';
        const key = (environment as any).stewardFeedbackKey || 'pk_7109b673ade5f6aefc2eb0a1dfbcee1c4a2e';
        const appVersion = (environment as any).appVersion || '0.0.3';

        const user = this.getSessionUser();
        const payload = {
            text,
            user,
            page: {
                url: typeof window !== 'undefined' ? window.location.href : '',
                title: typeof document !== 'undefined' ? document.title : '',
            },
            meta: {
                app_version: appVersion,
            },
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Steward-Key': key,
                },
                body: JSON.stringify(payload),
            });

            if (response.status === 202 || (response.status >= 200 && response.status < 300)) {
                return { success: true, status: response.status };
            }

            if (response.status === 429) {
                return {
                    success: false,
                    status: 429,
                    error: 'Too many at once. Please try again shortly.',
                };
            }

            let errorMessage = `Request failed (${response.status})`;
            try {
                const data = await response.json();
                if (data?.message) {
                    errorMessage = data.message;
                } else if (data?.error) {
                    errorMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
                }
            } catch {
                const textOutput = await response.text().catch(() => '');
                if (textOutput) {
                    errorMessage = textOutput;
                }
            }

            return {
                success: false,
                status: response.status,
                error: errorMessage,
            };
        } catch (err: any) {
            return {
                success: false,
                status: 0,
                error: err?.message || 'Network error. Please check your connection and try again.',
            };
        }
    }
}
