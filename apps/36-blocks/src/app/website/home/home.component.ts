import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { WidgetTheme } from '@proxy/constant';
import { WidgetThemeService } from 'apps/36-blocks-widget/src/app/otp/service/widget-theme.service';
import { DomSanitizer, Meta, SafeHtml, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { BaseComponent } from '@proxy/ui/base-component';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { Store, select } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { Observable, distinctUntilChanged, takeUntil, debounceTime } from 'rxjs';
import {
    selectLogInErrors,
    selectLogInData,
    selectLogInDataInProcess,
    selectLogInDataSuccess,
} from './ngrx/selector/login.selector';
import { ILogInFeatureStateWithRootState } from './ngrx/store/login.state';
import * as logInActions from './ngrx/actions/login.action';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-home',
    imports: [RouterModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    providers: [WidgetThemeService],
})
export class HomeComponent extends BaseComponent implements OnInit {
    public selectLogInErrors$: Observable<string[]>;
    public logInData$: Observable<any>;
    public logInDataInProcess$: Observable<boolean>;
    public logInDataSuccess$: Observable<boolean>;

    private toast = inject(PrimeNgToastService);
    private _store = inject<Store<ILogInFeatureStateWithRootState>>(Store);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);
    private meta = inject(Meta);
    private titleService = inject(Title);
    private platformId = inject(PLATFORM_ID);
    private document = inject(DOCUMENT);
    private sanitizer = inject(DomSanitizer);
    // temp chagnes
    public readonly accent = {
        text: 'text-teal-400',
        bg: 'bg-teal-400',
        border: 'border-teal-400',
        bgAlpha10: 'bg-teal-400/10',
        bgAlpha30: 'bg-teal-400/30',
        borderAlpha20: 'border-teal-400/20',
        borderAlpha30: 'border-teal-400/30',
        pillBadge: 'bg-teal-400/10 border border-teal-400/30 text-teal-400',
        iconBg: 'bg-teal-400/10 border border-teal-400/20',
        btnPrimary: 'bg-teal-400 text-[#0d1117] shadow-[0_8px_24px_rgba(45,212,191,0.3)] hover:-translate-y-0.5',
        btnOutline: 'border border-teal-400 text-teal-400',
    };

    public readonly appearanceModes: { label: string; value: 'dark' | 'light' | 'system' }[] = [
        { label: 'System', value: 'system' },
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
    ];

    public readonly themeColors: { name: string; hex: string }[] = [
        { name: 'teal', hex: '#2dd4bf' }, // Default
        { name: 'red', hex: '#ef4444' },
        { name: 'orange', hex: '#f97316' },
        { name: 'blue', hex: '#3b82f6' },
    ];
    public selectedColor = this.themeColors[0].hex;
    public selectedAppearance: 'dark' | 'light' | 'system' = 'dark';
    public borderRadius = 8;
    private readonly themeService = inject(WidgetThemeService);

    public get isDark(): boolean {
        return this.themeService.isDark(this.selectedAppearance as WidgetTheme);
    }

    public get themeVars(): Record<string, string> {
        const dark = this.isDark;
        return {
            '--bg-page': dark ? '#0d1117' : '#f6f8fa',
            '--bg-card': dark ? '#161b22' : '#ffffff',
            '--bg-card2': dark ? '#21262d' : '#eaeef2',
            '--border': dark ? '#21262d' : '#d0d7de',
            '--text-primary': dark ? '#f0f6fc' : '#1f2328',
            '--text-secondary': dark ? '#8b949e' : '#656d76',
            '--text-body': dark ? '#c9d1d9' : '#24292f',
        };
    }

    public selectColor(hex: string): void {
        this.selectedColor = hex;
        this.cdr.markForCheck();
    }

    public selectAppearance(mode: 'dark' | 'light' | 'system'): void {
        this.selectedAppearance = mode;
        this.themeService.setInputTheme(mode);
        this.cdr.markForCheck();
    }

    public onRadiusChange(event: Event): void {
        this.borderRadius = +(event.target as HTMLInputElement).value;
        this.cdr.markForCheck();
    }

    public colorAlpha(hex: string, alpha: number): string {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    public readonly heroBadges: { label: string }[] = [
        { label: 'Social Login' },
        { label: 'OTP Auth' },
        { label: 'RBAC' },
    ];

    public readonly uiFeatureCards: { icon: string; title: string; desc: string }[] = [
        { icon: 'brush', title: 'Theme Editor', desc: 'Match your brand colors' },
        { icon: 'dashboard', title: 'Layout Options', desc: 'Multiple form layouts' },
        { icon: 'smartphone', title: 'Responsive', desc: 'Works on all devices' },
        { icon: 'translate', title: 'i18n Ready', desc: '30+ languages' },
    ];

    public readonly platformFeatures: { icon: string; title: string; desc: string }[] = [
        {
            icon: 'link',
            title: 'Plug and Play',
            desc: 'Pre-built signup, login, profile, and access control components.',
        },
        { icon: 'security', title: 'Secure with hCaptcha', desc: 'Bot protection to prevent fake signups and abuse.' },
        {
            icon: 'group',
            title: 'Multiple Login Options',
            desc: 'Google, Apple, OTP, and username-password authentication.',
        },
        { icon: 'bar_chart', title: 'User Analytics', desc: 'Track total users, active users, and login trends.' },
        {
            icon: 'contactless',
            title: 'Social & OTP Login',
            desc: 'Passwordless and social authentication for better conversion.',
        },
        { icon: 'lock', title: 'Role-Based Access', desc: 'Fine-grained permissions using RBAC.' },
        { icon: 'trending_up', title: 'Activity Tracking', desc: 'Audit logs and user activity monitoring.' },
        { icon: 'schedule', title: 'Secure Sessions', desc: 'Token-based authentication with session expiry.' },
        { icon: 'menu_book', title: 'Developer Documentation', desc: 'Clear APIs, SDKs, and step-by-step guides.' },
    ];

    public readonly buildCards: { icon: string; title: string; desc: string; highlight?: boolean }[] = [
        {
            icon: 'edit',
            title: 'SaaS Applications',
            desc: 'Launch faster with secure authentication and access control.',
        },
        { icon: 'business', title: 'Enterprise Tools', desc: 'Manage teams, roles, and permissions at scale.' },
        {
            icon: 'smartphone',
            title: 'Consumer Apps',
            desc: 'Seamless social login and OTP authentication.',
            highlight: true,
        },
        { icon: 'settings', title: 'Internal Admin Panels', desc: 'Track activity and control access across tools.' },
    ];

    public readonly heroStats: { value: string; label: string }[] = [
        { value: '5 min', label: 'Integration time' },
        { value: '99.9%', label: 'Uptime SLA' },
    ];

    public readonly mockFormFields: { label: string; placeholder: string }[] = [
        { label: 'Email', placeholder: 'Your email address' },
        { label: 'Password', placeholder: 'Enter your password' },
    ];

    public readonly floatingBadges: { side: 'left' | 'right'; dot?: string; icon?: string; text: string }[] = [
        { side: 'left', dot: 'bg-green-500', text: 'JavaScript Ready' },
        { side: 'right', icon: 'verified', text: 'Enterprise-grade' },
    ];

    public readonly macDots: string[] = ['bg-[#ff5f56]', 'bg-[#ffbd2e]', 'bg-[#27ca40]'];

    public readonly cardSections: {
        id: string;
        headingId: string;
        label: string;
        accentWord: string;
        desc: string;
        gridCols: string;
        cards: { icon: string; title: string; desc: string; highlight?: boolean }[];
    }[] = [
        {
            id: 'features',
            headingId: 'features-heading',
            label: 'Everything You Need to Manage Users',
            accentWord: 'Securely',
            desc: 'Replace months of custom authentication development with production-ready components built for security, scale, and speed.',
            gridCols: 'grid-cols-1 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-4',
            cards: this.platformFeatures,
        },
        {
            id: 'build',
            headingId: 'build-heading',
            label: 'What You Can',
            accentWord: 'Build',
            desc: '',
            gridCols: 'grid-cols-1 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-4',
            cards: this.buildCards,
        },
    ];

    public readonly codeSnippetLines: { num: string; html: SafeHtml }[] = this.buildCodeLines([
        {
            num: '01',
            html: `  <span class="token tag">&lt;script</span> <span class="token attr-name">type</span>=<span class="token string">"text/javascript"</span><span class="token tag">&gt;</span>`,
        },
        {
            num: '02',
            html: `    <span class="token keyword">var</span> <span class="token variable">configuration</span> <span class="token operator">=</span> <span class="token punctuation">&#123;</span>`,
        },
        {
            num: '03',
            html: `      <span class="token property">referenceId:</span> <span class="token string">'4512365a176770...'</span>,`,
        },
        {
            num: '04',
            html: `      <span class="token property">type:</span> <span class="token string">'authorization'</span>,`,
        },
        {
            num: '05',
            html: `      <span class="token property">success:</span> <span class="token punctuation">(</span>data<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">&#123;</span>`,
        },
        { num: '06', html: `        <span class="token comment">// get verified token in response</span>` },
        {
            num: '07',
            html: `        <span class="token object">console</span>.<span class="token function">log</span><span class="token punctuation">(</span><span class="token string">'success response'</span>, data<span class="token punctuation">)</span>;`,
        },
        { num: '08', html: `      <span class="token punctuation">&#125;</span>,` },
        {
            num: '09',
            html: `      <span class="token property">failure:</span> <span class="token punctuation">(</span>error<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">&#123;</span>`,
        },
        { num: '10', html: `        <span class="token comment">// handle error</span>` },
        {
            num: '11',
            html: `        <span class="token object">console</span>.<span class="token function">log</span><span class="token punctuation">(</span><span class="token string">'failure reason'</span>, error<span class="token punctuation">)</span>;`,
        },
        { num: '12', html: `      <span class="token punctuation">&#125;</span>,` },
        { num: '13', html: `    <span class="token punctuation">&#125;</span>;` },
        { num: '14', html: `  <span class="token tag">&lt;/script&gt;</span>` },
        { num: '15', html: `  <span class="token tag">&lt;script</span>` },
        {
            num: '16',
            html: `    <span class="token attr-name">type</span>=<span class="token string">"text/javascript"</span>`,
        },
        {
            num: '17',
            html: `    <span class="token attr-name">onload</span>=<span class="token string">"initVerification(configuration)"</span>`,
        },
        {
            num: '18',
            html: `    <span class="token attr-name">src</span>=<span class="token string">"https://proxy.msg91.com/..."</span><span class="token tag">&gt;</span>`,
        },
        { num: '19', html: `  <span class="token tag">&lt;/script&gt;</span>` },
    ]);

    private buildCodeLines(lines: { num: string; html: string }[]): { num: string; html: SafeHtml }[] {
        return lines.map((l) => ({ num: l.num, html: this.sanitizer.bypassSecurityTrustHtml(l.html) }));
    }

    public currentlyBuilding: string = '';
    private buildingTexts = [
        'A developer-friendly authentication platform with social login, OTP, analytics, and role-based access control.',
    ];
    private currentTextIndex = 0;
    private currentCharIndex = 0;
    private isDeleting = false;
    private typewriterInterval: any;

    constructor() {
        super();

        this.selectLogInErrors$ = this._store.pipe(
            select(selectLogInErrors),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.logInData$ = this._store.pipe(
            select(selectLogInData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.logInDataInProcess$ = this._store.pipe(
            select(selectLogInDataInProcess),
            debounceTime(200),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.logInDataSuccess$ = this._store.pipe(
            select(selectLogInDataSuccess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
    }

    ngOnInit(): void {
        this.titleService.setTitle('36Blocks — Secure Auth & User Management for Modern Apps');
        this.meta.addTags([
            {
                name: 'description',
                content:
                    'Launch secure user signup, login, roles, and access control in minutes with 36Blocks. Plug & play authentication with social login, OTP, RBAC, and analytics.',
            },
            {
                name: 'keywords',
                content:
                    'authentication platform, SSO, OTP login, social login, RBAC, user management, Angular auth, developer authentication, passwordless login, hCaptcha, role-based access control',
            },
            { name: 'robots', content: 'index, follow' },
            { name: 'author', content: '36Blocks' },
            { property: 'og:site_name', content: '36Blocks' },
            { property: 'og:title', content: '36Blocks — Secure Auth & User Management for Modern Apps' },
            {
                property: 'og:description',
                content:
                    'Launch secure user signup, login, roles, and access control in minutes. Plug & play authentication platform with social login, OTP, and RBAC.',
            },
            { property: 'og:type', content: 'website' },
            { property: 'og:url', content: 'https://36blocks.com/' },
            { property: 'og:image', content: 'https://36blocks.com/assets/og-image.png' },
            { property: 'og:image:width', content: '1200' },
            { property: 'og:image:height', content: '630' },
            { property: 'og:image:alt', content: '36Blocks — Secure Auth & User Management' },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:site', content: '@36blocks' },
            { name: 'twitter:title', content: '36Blocks — Secure Auth & User Management for Modern Apps' },
            {
                name: 'twitter:description',
                content: 'Plug & play authentication with social login, OTP, RBAC, and analytics. 5-minute setup.',
            },
            { name: 'twitter:image', content: 'https://36blocks.com/assets/og-image.png' },
            { name: 'twitter:image:alt', content: '36Blocks — Secure Auth & User Management' },
        ]);

        this.injectJsonLdSchema();

        if (isPlatformBrowser(this.platformId)) {
            this.selectLogInErrors$.subscribe((errors) => {
                errors?.forEach((errorMessage) => {
                    this.toast.error(errorMessage);
                });
            });

            this.startTypewriter();
        }
    }

    ngOnDestroy() {
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
        }
        super.ngOnDestroy();
    }

    private startTypewriter(): void {
        if (!isPlatformBrowser(this.platformId)) return;
        this.typewriterInterval = setInterval(
            () => {
                const currentText = this.buildingTexts[this.currentTextIndex];

                if (!this.isDeleting) {
                    this.currentlyBuilding = currentText.substring(0, this.currentCharIndex + 1);
                    this.currentCharIndex++;

                    if (this.currentCharIndex === currentText.length) {
                        this.isDeleting = true;
                        setTimeout(() => {}, 1500);
                    }
                } else {
                    this.currentlyBuilding = currentText.substring(0, this.currentCharIndex - 1);
                    this.currentCharIndex--;

                    if (this.currentCharIndex === 0) {
                        this.isDeleting = false;
                        this.currentTextIndex = (this.currentTextIndex + 1) % this.buildingTexts.length;
                    }
                }
                this.cdr.markForCheck();
            },
            this.isDeleting ? 50 : 100
        );
    }

    login() {
        this._store.dispatch(logInActions.logInAction());
    }

    private injectJsonLdSchema(): void {
        const schemas = [
            {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: '36Blocks',
                url: 'https://36blocks.com/',
                logo: 'https://36blocks.com/assets/logo.png',
                sameAs: [],
                contactPoint: {
                    '@type': 'ContactPoint',
                    contactType: 'customer support',
                    url: 'https://36blocks.com/',
                },
            },
            {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: '36Blocks',
                url: 'https://36blocks.com/',
                description:
                    'Secure authentication and user management platform with social login, OTP, RBAC, and analytics.',
                potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                        '@type': 'EntryPoint',
                        urlTemplate: 'https://36blocks.com/?q={search_term_string}',
                    },
                    'query-input': 'required name=search_term_string',
                },
            },
            {
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: '36Blocks',
                url: 'https://36blocks.com/',
                applicationCategory: 'DeveloperApplication',
                operatingSystem: 'Web',
                description:
                    'Plug & play authentication platform with social login, OTP, role-based access control, and user analytics. Integrate in 5 minutes.',
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                    availability: 'https://schema.org/InStock',
                },
                featureList: [
                    'Social Login (Google, Apple)',
                    'OTP Authentication',
                    'Role-Based Access Control (RBAC)',
                    'hCaptcha Bot Protection',
                    'User Analytics Dashboard',
                    'Customizable Auth Forms',
                    'Multi-language Support (30+ languages)',
                    'Secure Sessions with Token Expiry',
                    'Activity Tracking & Audit Logs',
                ],
                author: {
                    '@type': 'Organization',
                    name: '36Blocks',
                    url: 'https://36blocks.com/',
                },
            },
        ];

        schemas.forEach((schema) => {
            const script = this.document.createElement('script');
            script.type = 'application/ld+json';
            script.text = JSON.stringify(schema);
            this.document.head.appendChild(script);
        });
    }
}
