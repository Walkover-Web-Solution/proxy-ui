import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ScrollRevealDirective } from '../directives/scroll-reveal.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-about',
    imports: [RouterModule, ScrollRevealDirective],
    templateUrl: './about.component.html',
})
export class AboutComponent implements OnInit {
    private readonly titleService = inject(Title);
    private readonly metaService = inject(Meta);

    public ngOnInit(): void {
        this.titleService.setTitle('About Us — 36Blocks');
        this.metaService.updateTag({
            name: 'description',
            content:
                '36Blocks is a developer-first authentication platform. Learn about our mission, values, and the team building secure, plug-and-play auth for SaaS teams worldwide.',
        });
        this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
        this.metaService.updateTag({ property: 'og:title', content: 'About Us — 36Blocks' });
        this.metaService.updateTag({
            property: 'og:description',
            content: 'Built for developers. Shared identity for connected apps. Learn about 36Blocks.',
        });
        this.metaService.updateTag({ property: 'og:type', content: 'website' });
    }

    public readonly values: { title: string; description: string; iconPath: string }[] = [
        {
            title: 'Developer First',
            description:
                'APIs, the browser widget, and dashboard features is designed to reduce friction for engineering teams.',
            iconPath: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
        },
        {
            title: 'Configurable Security',
            description:
                'Configure authentication providers and bot protection for your block. Validate the complete access flow in your environment.',
            iconPath:
                'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
        },
        {
            title: 'Transparent Pricing',
            description: 'Confirm enabled plans, usage limits, and commercial terms with the team before purchase.',
            iconPath:
                'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        },
        {
            title: 'Clear Boundaries',
            description:
                'Integrate through existing APIs and the browser widget. Your application owns its business permissions.',
            iconPath:
                'M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
        },
        {
            title: 'Fast Integration',
            description:
                'Mount the widget using your block reference ID, configure providers, and verify your server session flow.',
            iconPath: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
        },
        {
            title: 'Practical Operations',
            description:
                'Inspect request logs, usage views, and recorded sensitive operations while supporting your users.',
            iconPath:
                'M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941',
        },
    ];

    public readonly stats: { value: string; label: string }[] = [
        { value: 'Widget', label: 'Browser integration' },
        { value: 'API', label: 'Server integration' },
        { value: 'Users', label: 'Identity management' },
        { value: 'Logs', label: 'Request investigation' },
    ];

    public readonly productFeatures: string[] = [
        'Email & password authentication',
        'Google & Apple social login',
        'OTP via SMS or email',
        'Role-Based Access Control (RBAC)',
        'hCaptcha bot protection',
        'User analytics & request logs',
        'Customisable branding & themes',
        'Multi-organisation support',
        'Configurable session expiry',
        'APIs & browser widget',
    ];
}
