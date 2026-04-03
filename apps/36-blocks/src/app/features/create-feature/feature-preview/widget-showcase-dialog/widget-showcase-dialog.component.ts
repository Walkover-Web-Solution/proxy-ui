import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, NgZone, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PROXY_DOM_ID, PublicScriptType, WidgetTheme } from '@proxy/constant';
import { ProxyAuthScriptUrl } from '@proxy/models/features-model';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from '../../../../../environments/environment';

export type ShowcaseTab =
    | PublicScriptType.Authorization
    | PublicScriptType.UserProfile
    | PublicScriptType.UserManagement
    | PublicScriptType.OrganizationDetails;

@Component({
    selector: 'blocks-widget-showcase',
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatToolbarModule,
        MatTooltipModule,
    ],
    templateUrl: './widget-showcase-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetShowcaseDialogComponent implements AfterViewInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private location = inject(Location);
    private toast = inject(PrimeNgToastService);
    private ngZone = inject(NgZone);

    protected readonly PublicScriptType = PublicScriptType;
    protected readonly WidgetTheme = WidgetTheme;
    protected readonly proxyDomId = PROXY_DOM_ID;

    protected readonly referenceId: string | null = this.route.snapshot.paramMap.get('referenceId');
    private scriptLoaded = false;

    public activeTab = signal<ShowcaseTab>(PublicScriptType.Authorization);
    public theme = signal<WidgetTheme>(WidgetTheme.System);
    public authToken = signal<string>('');
    public showAuthTokenInput = signal(false);

    protected readonly tabs: { id: ShowcaseTab; label: string; icon: string; requiresAuth: boolean }[] = [
        { id: PublicScriptType.Authorization, label: 'Authorization', icon: 'lock', requiresAuth: false },
        { id: PublicScriptType.UserProfile, label: 'User Profile', icon: 'person', requiresAuth: true },
        { id: PublicScriptType.UserManagement, label: 'User Management', icon: 'manage_accounts', requiresAuth: true },
        { id: PublicScriptType.OrganizationDetails, label: 'Organization', icon: 'business', requiresAuth: true },
    ];

    ngAfterViewInit(): void {
        setTimeout(() => this.launchWidget());
    }

    public goBack(): void {
        this.location.back();
    }

    public selectTab(tab: ShowcaseTab): void {
        if (tab !== PublicScriptType.Authorization && !this.authToken()?.trim()) {
            return;
        }
        this.activeTab.set(tab);
        setTimeout(() => this.launchWidget(), 100);
    }

    public onThemeChange(newTheme: WidgetTheme): void {
        this.theme.set(newTheme);
        setTimeout(() => this.launchWidget(), 50);
    }

    public onAuthTokenSave(): void {
        this.showAuthTokenInput.set(false);
        if (this.authToken()?.trim() && this.activeTab() !== PublicScriptType.Authorization) {
            setTimeout(() => this.launchWidget(), 50);
        }
    }

    public copyAuthToken(): void {
        const token = this.authToken()?.trim();
        if (token) {
            navigator.clipboard.writeText(token);
            this.toast.success('Auth token copied');
        }
    }

    public launchWidget(): void {
        const tab = this.activeTab();
        const domId = tab === PublicScriptType.Authorization ? this.referenceId ?? '' : this.proxyDomId;
        const el = document.getElementById(domId);
        if (!el) return;

        el.innerHTML = '';

        const config: Record<string, any> = {
            referenceId: this.referenceId,
            theme: this.theme(),
            target: '_blank',
            success: (data: unknown) => {
                this.ngZone.run(() => {
                    if (tab === PublicScriptType.Authorization) {
                        const token = (data as any)?.data?.token ?? (data as any)?.token ?? '';
                        if (token) {
                            this.authToken.set(token);
                            this.toast.success('Login successful — auth token received');
                        } else {
                            this.toast.success('Authorization successful');
                        }
                    } else {
                        this.toast.success('Action completed successfully');
                    }
                });
            },
            failure: (error: unknown) => {
                this.ngZone.run(() => {
                    this.toast.error((error as any)?.message ?? 'Something went wrong');
                });
            },
        };

        if (tab === PublicScriptType.Authorization) {
            // No `type` set — mirrors showAuthentication=true flow:
            // widget renders as embedded auth directly into the referenceId-named container
        } else {
            config['type'] = tab;
            config['authToken'] = this.authToken()?.trim();
            if (tab === PublicScriptType.UserManagement) {
                config['isRolePermission'] = true;
            }
        }

        const launch = () => window?.['initVerification']?.(config);

        // If initVerification already exists on window (script loaded globally), call directly
        if (typeof window?.['initVerification'] === 'function') {
            launch();
            return;
        }

        if (!this.scriptLoaded) {
            this.scriptLoaded = true;
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = ProxyAuthScriptUrl(environment.proxyServer, new Date().getTime());
            document.getElementsByTagName('head')[0].appendChild(script);
            script.onload = () => launch();
            script.onerror = () => this.toast.error('Failed to load widget script');
        } else {
            // Script tag was appended but onload hasn't fired yet — poll until ready
            const interval = setInterval(() => {
                if (typeof window?.['initVerification'] === 'function') {
                    clearInterval(interval);
                    launch();
                }
            }, 100);
            setTimeout(() => clearInterval(interval), 10000);
        }
    }
}
