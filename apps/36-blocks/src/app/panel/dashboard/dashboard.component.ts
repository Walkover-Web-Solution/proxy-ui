import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateRange, IAnalyticsParams, OVERVIEW_CARDS, RANGE_OPTIONS } from './dashboard.models';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { BaseComponent } from '@proxy/ui/base-component';
import { AnalyticsService } from '@proxy/services/proxy/analytics';
import { FeaturesService } from '@proxy/services/proxy/features';
import { IFeature } from '@proxy/models/features-model';
import { TimeseriesChartComponent } from './timeseries-chart/timeseries-chart.component';
import { BreakdownChartComponent } from './breakdown-chart/breakdown-chart.component';
import { Subscription, takeUntil } from 'rxjs';

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
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatInputModule,
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
    readonly featuresError = signal<string | null>(null);

    readonly featureSearchControl = new FormControl('');
    readonly featureSearchQuery = signal('');

    readonly filteredFeatures = computed(() => {
        const query = this.featureSearchQuery().toLowerCase().trim();
        if (!query) return this.features();
        return this.features().filter((feature) => feature.name?.toLowerCase().includes(query));
    });

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

    private overviewRequest?: Subscription;
    readonly overviewCards = OVERVIEW_CARDS;

    getCardValue(data: any, path: string, fallbackPath?: string): number | null {
        const read = (p: string) => p.split('.').reduce((acc, k) => acc?.[k], data);
        const value = read(path) ?? (fallbackPath && !this.featureConfigurationId() ? read(fallbackPath) : null);
        return typeof value === 'number' && Number.isFinite(value) ? value : null;
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
        this.featuresError.set(null);
        this.featuresService
            .getFeature({ itemsPerPage: 100, pageNo: 1 })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    if (res?.hasError || !Array.isArray(res?.data?.data)) {
                        this.featuresError.set('Application filters could not be loaded. Retry to choose a block.');
                    } else {
                        this.features.set(res.data.data);
                    }
                    this.isLoadingFeatures.set(false);
                },
                error: () => {
                    this.isLoadingFeatures.set(false);
                    this.featuresError.set('Application filters could not be loaded. Check your access and retry.');
                },
            });
    }

    displayFeatureName = (value: number | string | null): string => {
        if (!value) return '';
        return this.features().find((feature) => feature.id === value)?.name ?? '';
    };

    onFeatureInputChange(value: string): void {
        this.featureSearchQuery.set(value);
    }

    onFeatureSelected(event: MatAutocompleteSelectedEvent): void {
        this.featureConfigurationId.set(event.option.value ?? '');
        this.featureSearchQuery.set('');
    }

    onFeatureInputClear(): void {
        this.featureSearchControl.setValue('');
        this.featureSearchQuery.set('');
        this.featureConfigurationId.set('');
    }

    fetchOverview(params: IAnalyticsParams): void {
        this.overviewRequest?.unsubscribe();
        this.isLoadingOverview.set(true);
        this.overviewData.set(null);
        this.overviewError.set(null);

        this.overviewRequest = this.analyticsService
            .getOverview(params)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    if (res?.hasError || !res?.data?.data || typeof res.data.data !== 'object') {
                        this.overviewError.set(
                            'Usage is unavailable. Retry or check your access with an administrator.'
                        );
                    } else {
                        this.overviewData.set(res.data.data);
                    }
                    this.isLoadingOverview.set(false);
                },
                error: (err: any) => {
                    this.overviewError.set(
                        err?.status === 403 || err?.errorCode === 403
                            ? 'You do not have access to usage in this workspace. Ask a workspace administrator.'
                            : 'Usage could not be loaded. Check your connection and retry.'
                    );
                    this.isLoadingOverview.set(false);
                },
            });
    }

    onRangeChange(value: DateRange): void {
        this.range.set(value);
    }
}
