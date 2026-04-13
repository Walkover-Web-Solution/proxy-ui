import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface PricingFeature {
    text: string;
    included: boolean;
    bold?: boolean;
}

export interface PricingPlan {
    name: string;
    price: string;
    period: string;
    description: string;
    highlight: boolean;
    badge?: string;
    features: PricingFeature[];
    cta: string;
    ctaStyle: 'primary' | 'outline';
}

export interface InfoBanner {
    icon: string;
    title: string;
    description: string;
}

export interface TrustItem {
    title: string;
    description: string;
    icon: string;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-pricing',
    imports: [CommonModule, MatIconModule],
    templateUrl: './pricing.component.html',
})
export class PricingComponent implements OnInit {
    private readonly titleService = inject(Title);
    private readonly metaService = inject(Meta);

    public ngOnInit(): void {
        this.titleService.setTitle('Pricing — 36Blocks');
        this.metaService.updateTag({
            name: 'description',
            content:
                'Simple, transparent pricing for 36Blocks. Start free with 1,000 MAU. Upgrade as you grow. No hidden fees, no contracts.',
        });
        this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
        this.metaService.updateTag({ property: 'og:title', content: 'Pricing — 36Blocks' });
        this.metaService.updateTag({
            property: 'og:description',
            content: 'Start free. Scale with confidence. Transparent usage-based pricing.',
        });
        this.metaService.updateTag({ property: 'og:type', content: 'website' });
    }

    public readonly plans: PricingPlan[] = [
        {
            name: 'Starter',
            price: '$0',
            period: '/ month',
            description: 'Everything you need to get started with authentication.',
            highlight: false,
            features: [
                { text: '1,000 Monthly Active Users', included: true },
                { text: '3 Blocks', included: true },
                { text: '7-day logs', included: true },
                { text: '3-hour sessions', included: true },
                { text: 'Email authentication', included: true },
                { text: 'SMS (Not available)', included: false },
                { text: '36Blocks branding', included: true },
            ],
            cta: 'Start Free',
            ctaStyle: 'outline',
        },
        {
            name: 'Growth',
            price: '$49',
            period: '/ month',
            description: 'Scale your product with powerful auth and branding control.',
            highlight: true,
            badge: 'Most Popular',
            features: [
                { text: '10,000 MAU included', included: true },
                { text: '10 Blocks', included: true },
                { text: '30-day logs', included: true },
                { text: '12-hour sessions', included: true },
                { text: 'Custom branding', included: true },
                { text: 'SMS available (usage-based)', included: true },
                { text: 'Auto multi-org mapping', included: true },
                { text: 'Overage: +$10 per 5k MAU', included: true, bold: true },
                { text: '+$5 per extra Block', included: true, bold: true },
            ],
            cta: 'Upgrade to Growth',
            ctaStyle: 'primary',
        },
        {
            name: 'Scale',
            price: '$149',
            period: '/ month',
            description: 'Enterprise-grade auth for high-volume, complex SaaS products.',
            highlight: false,
            features: [
                { text: '50,000 MAU included', included: true },
                { text: 'Unlimited Blocks', included: true },
                { text: '24-hour sessions', included: true },
                { text: 'Advanced org rules', included: true },
                { text: 'SMS available (usage-based)', included: true },
                { text: 'Overage: +$25 per 25k MAU', included: true, bold: true },
            ],
            cta: 'Choose Scale',
            ctaStyle: 'outline',
        },
    ];

    public readonly infoBanners: InfoBanner[] = [
        {
            icon: 'bar_chart',
            title: 'Transparent usage-based pricing',
            description:
                'MAU = unique logged-in users per calendar month. Usage visible in real time. No hidden fees. No contracts.',
        },
        {
            icon: 'sms',
            title: 'Optional Add-ons',
            description:
                'Transactional SMS on paid plans. Billed per message by destination country. Requires a configurable monthly spending cap.',
        },
    ];

    public readonly trustItems: TrustItem[] = [
        {
            title: '5-minute setup',
            description: 'Minimal configuration. Production-ready instantly.',
            icon: 'bolt',
        },
        {
            title: 'No vendor lock-in',
            description: 'Simple architecture and predictable APIs.',
            icon: 'lock_open',
        },
        {
            title: 'Cancel anytime',
            description: 'No contracts. Upgrade or downgrade freely.',
            icon: 'autorenew',
        },
        {
            title: 'Security-first',
            description: 'Encrypted in transit and at rest.',
            icon: 'shield',
        },
    ];
}
