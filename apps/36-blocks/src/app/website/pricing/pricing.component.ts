import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
    imports: [CommonModule, MatIconModule, RouterModule],
    templateUrl: './pricing.component.html',
})
export class PricingComponent implements OnInit {
    private readonly titleService = inject(Title);
    private readonly metaService = inject(Meta);

    public ngOnInit(): void {
        this.titleService.setTitle('Pricing — 36Blocks');
        this.metaService.updateTag({
            name: 'description',
            content: 'Confirm current 36Blocks pricing, usage limits, and service terms with the team.',
        });
        this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
        this.metaService.updateTag({ property: 'og:title', content: 'Pricing — 36Blocks' });
        this.metaService.updateTag({
            property: 'og:description',
            content: 'Contact the team for current pricing and service terms.',
        });
        this.metaService.updateTag({ property: 'og:type', content: 'website' });
    }

    public readonly plans: PricingPlan[] = [
        {
            name: 'Plan and environment review',
            price: 'Contact us',
            period: '',
            description: 'Confirm current commercial terms and enabled capabilities for your application.',
            highlight: false,
            features: [
                { text: 'Review login methods and provider configuration', included: true },
                { text: 'Confirm usage limits and billing terms', included: true },
                { text: 'Confirm session and retention policies', included: true },
            ],
            cta: 'Discuss your setup',
            ctaStyle: 'outline',
        },
    ];

    public readonly infoBanners: InfoBanner[] = [
        {
            icon: 'info',
            title: 'Current terms require confirmation',
            description:
                'Plan names and limits in older material may differ from your environment. Confirm pricing, usage allowances, and enabled providers with the team before purchase.',
        },
        {
            icon: 'sms',
            title: 'Provider dependencies',
            description:
                'SMS, email, and social login require the appropriate provider configuration. Confirm provider costs and availability for your environment.',
        },
    ];

    public readonly trustItems: TrustItem[] = [
        { title: 'Widget integration', description: 'Use your configured block reference ID.', icon: 'code' },
        { title: 'Application boundaries', description: 'Your product enforces business authorization.', icon: 'lock' },
        { title: 'Environment review', description: 'Confirm enabled providers and service terms.', icon: 'settings' },
        {
            title: 'Investigation tools',
            description: 'Inspect request failures and recorded activity.',
            icon: 'search',
        },
    ];
}
