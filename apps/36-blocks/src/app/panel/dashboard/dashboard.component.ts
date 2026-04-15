import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { BaseComponent } from '@proxy/ui/base-component';
import { AnalyticsService, IAnalyticsParams } from '@proxy/services/proxy/analytics';
import { FeaturesService } from '@proxy/services/proxy/features';
import { IFeature } from '@proxy/models/features-model';
import { TimeseriesChartComponent } from './timeseries-chart/timeseries-chart.component';
import { BreakdownChartComponent } from './breakdown-chart/breakdown-chart.component';
import { INFO_TOOLTIPS } from '@proxy/constant';
import { takeUntil } from 'rxjs';

export type DateRange = 'day' | 'week' | 'month'; // dashboard

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-dashboard',
    imports: [
        CommonModule,
        RouterModule,
        MatIconModule,
        MatSelectModule,
        MatFormFieldModule,
        MatButtonModule,
        MatTooltipModule,
        FormsModule,
        TimeseriesChartComponent,
        BreakdownChartComponent,
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent extends BaseComponent implements OnInit {
    private analyticsService = inject(AnalyticsService);
    private featuresService = inject(FeaturesService);

    readonly features = signal<IFeature[]>([]);
    readonly isLoadingFeatures = signal(false);

    readonly range = signal<DateRange>('week');
    readonly featureConfigurationId = signal<number | string | null>('');

    readonly overviewData = signal<any>(null);
    readonly isLoadingOverview = signal<boolean>(false);
    readonly overviewError = signal<string | null>(null);

    readonly params = computed<IAnalyticsParams>(() => {
        const base: IAnalyticsParams = { range: this.range() };
        const fcId = this.featureConfigurationId();
        if (fcId !== '' && fcId !== null) base.feature_configuration_id = fcId as number;
        return base;
    });

    readonly overviewCards = [
        {
            key: 'signups',
            valueKey: 'signups.total',
            label: 'Signups',
            icon: 'person_add',
            bgClass: 'bg-indigo-100 dark:bg-indigo-900/40',
            iconClass: 'text-indigo-500',
            sub: 'in selected period',
            infoTooltip: INFO_TOOLTIPS.dashboard.overviewCards.signups,
        },
        {
            key: 'logins',
            valueKey: 'logins.total',
            label: 'Logins',
            icon: 'login',
            bgClass: 'bg-violet-100 dark:bg-violet-900/40',
            iconClass: 'text-violet-500',
            sub: 'in selected period',
            infoTooltip: INFO_TOOLTIPS.dashboard.overviewCards.logins,
        },
        {
            key: 'active_users',
            valueKey: 'active_users.unique',
            label: 'Active Users',
            icon: 'group',
            bgClass: 'bg-cyan-100   dark:bg-cyan-900/40',
            iconClass: 'text-cyan-500',
            sub: 'unique in period',
            infoTooltip: INFO_TOOLTIPS.dashboard.overviewCards.active_users,
        },
        {
            key: 'users',
            valueKey: 'users.client_total',
            label: 'Total Users',
            icon: 'people',
            bgClass: 'bg-emerald-100 dark:bg-emerald-900/40',
            iconClass: 'text-emerald-500',
            sub: 'registered total',
            infoTooltip: INFO_TOOLTIPS.dashboard.overviewCards.users,
        },
    ];

    getCardValue(data: any, path: string): number {
        return path.split('.').reduce((acc, k) => acc?.[k], data) ?? 0;
    }

    readonly rangeOptions: { label: string; value: DateRange }[] = [
        { label: 'Today', value: 'day' },
        { label: 'This Week', value: 'week' },
        { label: 'This Month', value: 'month' },
    ];

    constructor() {
        super();
        effect(() => {
            const p = this.params();
            this.fetchOverview(p);
        });
    }

    ngOnInit(): void {
        this.fetchFeatures();
    }

    fetchFeatures(): void {
        this.isLoadingFeatures.set(true);
        this.featuresService
            .getFeature({})
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    this.features.set(res?.data?.data ?? []);
                    this.isLoadingFeatures.set(false);
                },
                error: () => this.isLoadingFeatures.set(false),
            });
    }

    onFeatureChange(id: number | null): void {
        this.featureConfigurationId.set(id);
    }

    fetchOverview(params: IAnalyticsParams): void {
        this.isLoadingOverview.set(true);
        this.overviewData.set(null);
        this.overviewError.set(null);

        this.analyticsService
            .getOverview(params)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    this.overviewData.set(res?.data ?? null);
                    this.isLoadingOverview.set(false);
                },
                error: (err: any) => {
                    this.overviewError.set(err?.message ?? 'Failed to load overview');
                    this.isLoadingOverview.set(false);
                },
            });
    }

    onRangeChange(value: DateRange): void {
        this.range.set(value);
    }
}
