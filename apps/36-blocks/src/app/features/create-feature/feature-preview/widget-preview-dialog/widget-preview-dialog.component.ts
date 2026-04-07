import { CommonModule, NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    Component,
    Injector,
    afterNextRender,
    inject,
    NgZone,
    signal,
    computed,
    ChangeDetectionStrategy,
    ViewChild,
} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDrawer } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PROXY_DOM_ID, PublicScriptType, WidgetTheme } from '@proxy/constant';
import { ProxyAuthScript, ProxyAuthScriptUrl } from '@proxy/models/features-model';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MarkdownModule } from 'ngx-markdown';
import { CopyButtonComponent } from '@proxy/ui/copy-button';
import { buildCodeSnippet } from './widget-code-snippet';
import { A11yModule } from '@angular/cdk/a11y';

export type PreviewTab =
    | PublicScriptType.Authorization
    | PublicScriptType.UserProfile
    | PublicScriptType.UserManagement
    | PublicScriptType.OrganizationDetails;

@Component({
    selector: 'blocks-widget-preview',
    imports: [
        CommonModule,
        NgTemplateOutlet,
        MatButtonModule,
        MatButtonToggleModule,
        MatIconModule,
        MatTooltipModule,
        MatListModule,
        MatSidenavModule,
        MarkdownModule,
        CopyButtonComponent,
        A11yModule,
    ],
    templateUrl: './widget-preview-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetPreviewDialogComponent implements AfterViewInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private location = inject(Location);
    private toast = inject(PrimeNgToastService);
    private ngZone = inject(NgZone);
    private breakpointObserver = inject(BreakpointObserver);
    private readonly _injector = inject(Injector);

    @ViewChild('drawer') drawer!: MatDrawer;

    public readonly isMobile = signal<boolean>(false);
    private readonly originUrl: string | null;

    protected readonly PublicScriptType = PublicScriptType;
    protected readonly WidgetTheme = WidgetTheme;
    protected readonly proxyDomId = PROXY_DOM_ID;

    protected readonly referenceId = signal<string | null>(this.route.snapshot.paramMap.get('referenceId'));
    private scriptLoaded = false;

    public activeTab = signal<PreviewTab>(PublicScriptType.Authorization);
    public readonly activeTabLabel = computed(() => this.tabs.find((t) => t.id === this.activeTab())?.label ?? '');
    public theme = signal<WidgetTheme>(WidgetTheme.System);
    public authToken = signal<string>('');
    public viewMode = signal<'preview' | 'code'>('preview');

    public readonly demoDiv = computed(() =>
        this.referenceId() ? `<div id="${this.referenceId()}"></div>` : '<div id="<reference_id>"></div>'
    );

    public readonly proxyAuthScript = computed(() =>
        ProxyAuthScript(environment.proxyServer, this.referenceId() ?? '<reference_id>', this.activeTab())
    );

    public readonly codeSnippet = computed(() =>
        buildCodeSnippet(this.referenceId() ?? '<reference_id>', this.activeTab())
    );

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
        this.originUrl = this.resolveOriginUrl();
        this.breakpointObserver
            .observe([Breakpoints.XSmall, Breakpoints.Small])
            .pipe(takeUntilDestroyed())
            .subscribe((result) => this.isMobile.set(result.matches));

        if (typeof window !== 'undefined') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = (e: MediaQueryListEvent) => this.systemDark.set(e.matches);
            mq.addEventListener('change', handler);
        }

        this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
            const newRefId = params.get('referenceId');
            if (newRefId && newRefId !== this.referenceId()) {
                this.referenceId.set(newRefId);
                this.activeTab.set(PublicScriptType.Authorization);
                this.authToken.set('');
                this.viewMode.set('preview');
                afterNextRender(() => this.launchWidget(), { injector: this._injector });
            }
        });

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

    private originStorageKey(): string | null {
        return this.referenceId() ? `widget_preview_origin_${this.referenceId()}` : null;
    }

    private resolveOriginUrl(): string | null {
        const storageKey = this.originStorageKey();

        const fromState = this.router.getCurrentNavigation()?.extras?.state?.['originUrl'] as string | undefined;
        if (fromState) {
            try {
                if (storageKey) {
                    sessionStorage.setItem(storageKey, fromState);
                }
            } catch {
                // sessionStorage unavailable (e.g. private browsing with storage blocked)
                console.error('sessionStorage unavailable');
            }
            return fromState;
        }

        try {
            if (storageKey) {
                return sessionStorage.getItem(storageKey);
            }
        } catch {
            // sessionStorage unavailable
            console.error('sessionStorage unavailable');
        }
        return null;
    }

    public goBack(): void {
        const storageKey = this.originStorageKey();
        try {
            if (storageKey) {
                sessionStorage.removeItem(storageKey);
            }
        } catch {
            // sessionStorage unavailable
            console.error('sessionStorage unavailable');
        }
        if (this.originUrl) {
            this.router.navigateByUrl(this.originUrl);
        } else {
            this.router.navigate(['/app/features']);
        }
    }

    public selectTab(tab: PreviewTab): void {
        if (tab !== PublicScriptType.Authorization && !this.authToken()?.trim()) {
            return;
        }
        this.activeTab.set(tab);
        if (this.drawer?.mode === 'over') {
            this.drawer.close();
        }
        this.viewMode.set('preview');
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
        const domId = isAuthTab ? this.referenceId() : this.proxyDomId;

        // Remove any stale proxy-auth element left over from a previous widget
        document.querySelectorAll('proxy-auth').forEach((el) => el.remove());

        const el = document.getElementById(domId);
        if (!el) return;

        el.innerHTML = '';

        const config: Record<string, any> = {
            referenceId: this.referenceId(),
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
                // Enables the Role & Permission tab in the User Management widget
                config['isRolePermission'] = false;
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
