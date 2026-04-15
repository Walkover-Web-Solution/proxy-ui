import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateRange, OVERVIEW_CARDS, RANGE_OPTIONS } from './dashboard.models';
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
import { takeUntil } from 'rxjs';

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
})
export class DashboardComponent extends BaseComponent implements OnInit {
    private analyticsService = inject(AnalyticsService);
    private featuresService = inject(FeaturesService);

    readonly features = signal<IFeature[]>([]);
    readonly isLoadingFeatures = signal(false);

    readonly range = signal<DateRange>(DateRange.week);
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

    readonly overviewCards = OVERVIEW_CARDS;

    getCardValue(data: any, path: string): number {
        return path.split('.').reduce((acc, k) => acc?.[k], data) ?? 0;
    }

    readonly rangeOptions = RANGE_OPTIONS;

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
