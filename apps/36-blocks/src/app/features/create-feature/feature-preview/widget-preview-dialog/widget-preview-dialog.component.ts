import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, NgZone, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PROXY_DOM_ID, PublicScriptType, WidgetTheme } from '@proxy/constant';
import { ProxyAuthScriptUrl } from '@proxy/models/features-model';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type PreviewTab =
    | PublicScriptType.Authorization
    | PublicScriptType.UserProfile
    | PublicScriptType.UserManagement
    | PublicScriptType.OrganizationDetails;

@Component({
    selector: 'blocks-widget-preview',
    imports: [CommonModule, MatButtonModule, MatButtonToggleModule, MatIconModule, MatTooltipModule, MatListModule],
    templateUrl: './widget-preview-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetPreviewDialogComponent implements AfterViewInit {
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

    public activeTab = signal<PreviewTab>(PublicScriptType.Authorization);
    public theme = signal<WidgetTheme>(WidgetTheme.System);
    public authToken = signal<string>('');

    private readonly systemDark = signal(
        typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    public readonly isDark = computed(() => {
        const t = this.theme();
        if (t === WidgetTheme.Dark) return true;
        if (t === WidgetTheme.Light) return false;
        return this.systemDark();
    });

    protected readonly tabs: { id: PreviewTab; label: string; icon: string; requiresAuth: boolean }[] = [
        { id: PublicScriptType.Authorization, label: 'Authorization', icon: 'lock', requiresAuth: false },
        { id: PublicScriptType.UserProfile, label: 'User Profile', icon: 'person', requiresAuth: true },
        { id: PublicScriptType.UserManagement, label: 'User Management', icon: 'manage_accounts', requiresAuth: true },
        { id: PublicScriptType.OrganizationDetails, label: 'Organization', icon: 'business', requiresAuth: true },
    ];

    constructor() {
        if (typeof window !== 'undefined') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = (e: MediaQueryListEvent) => this.systemDark.set(e.matches);
            mq.addEventListener('change', handler);
        }

        this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
            const token = params.get('proxy_auth_token');
            const explicitTab = params.get('tab') as PreviewTab | null;

            if (token) {
                this.authToken.set(token);
                if (!explicitTab) {
                    this.activeTab.set(PublicScriptType.UserProfile);
                }
            }

            const theme = params.get('theme') as WidgetTheme | null;
            if (theme && Object.values(WidgetTheme).includes(theme)) {
                this.theme.set(theme);
            }

            if (explicitTab && this.tabs.some((t) => t.id === explicitTab)) {
                this.activeTab.set(explicitTab);
            }
        });
    }

    ngAfterViewInit(): void {
        setTimeout(() => this.launchWidget());
    }

    public goBack(): void {
        this.location.back();
    }

    public selectTab(tab: PreviewTab): void {
        if (tab !== PublicScriptType.Authorization && !this.authToken()?.trim()) {
            return;
        }
        this.activeTab.set(tab);
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { tab },
            queryParamsHandling: 'merge',
            replaceUrl: true,
        });
        setTimeout(() => this.launchWidget(), 100);
    }

    public onThemeChange(newTheme: WidgetTheme): void {
        this.theme.set(newTheme);
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { theme: newTheme },
            queryParamsHandling: 'merge',
            replaceUrl: true,
        });
        setTimeout(() => this.launchWidget(), 50);
    }

    public launchWidget(): void {
        const tab = this.activeTab();
        const isAuthTab = tab === PublicScriptType.Authorization;
        const domId = isAuthTab ? this.referenceId : this.proxyDomId;
        const el = document.getElementById(domId);
        if (!el) return;

        el.innerHTML = '';

        const config: Record<string, any> = {
            referenceId: this.referenceId,
            theme: this.theme(),
            target: '_blank',
            success: (data: unknown) => {
                this.ngZone.run(() => {
                    if (isAuthTab) {
                        const token = (data as any)?.data?.token ?? (data as any)?.token ?? '';
                        if (token) {
                            this.authToken.set(token);
                            this.toast.success('Login successful — auth token received');
                            setTimeout(() => this.selectTab(PublicScriptType.UserProfile), 50);
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

        if (isAuthTab) {
            config['redirect_path'] = this.location.path().split('?')[0];
        } else {
            config['type'] = tab;
            config['authToken'] = this.authToken()?.trim();
            if (tab === PublicScriptType.UserManagement) {
                config['isRolePermission'] = true;
            }
        }

        const launch = () => window?.['initVerification']?.(config);

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
