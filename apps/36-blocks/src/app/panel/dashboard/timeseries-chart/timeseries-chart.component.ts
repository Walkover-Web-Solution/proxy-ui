import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    effect,
    inject,
    input,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { BaseComponent } from '@proxy/ui/base-component';
import { AnalyticsService } from '@proxy/services/proxy/analytics';
import { forkJoin, takeUntil } from 'rxjs';
import * as echarts from 'echarts';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
    TimeseriesInterval,
    ITimeseriesSeries,
    ITimeseriesParams,
    INTERVAL_OPTIONS,
    TIMESERIES_METRICS,
    intervalForRange,
} from '../dashboard.models';

@Component({
    selector: 'timeseries-chart',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { style: 'display: contents' },
    imports: [
        CommonModule,
        MatIconModule,
        MatSelectModule,
        MatFormFieldModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatTooltipModule,
    ],
    templateUrl: './timeseries-chart.component.html',
})
export class TimeseriesChartComponent extends BaseComponent implements OnDestroy {
    @ViewChildren('chartEl') chartEls!: QueryList<ElementRef<HTMLDivElement>>;
    @ViewChild('expandTpl', { static: false }) expandTpl!: TemplateRef<any>;

    range = input<string>('week');
    featureConfigurationId = input<number | null>(null);

    private analyticsService = inject(AnalyticsService);
    private dialog = inject(MatDialog);
    private expandDialogRef: MatDialogRef<any> | null = null;

    readonly isLoading = signal(false);
    readonly error = signal<string | null>(null);
    readonly seriesList = signal<ITimeseriesSeries[]>([]);
    readonly expandSeries = signal<ITimeseriesSeries | null>(null);

    selectedInterval = signal<TimeseriesInterval>(TimeseriesInterval.day);

    readonly metrics = TIMESERIES_METRICS;

    readonly intervalOptions = INTERVAL_OPTIONS;

    constructor() {
        super();
        effect(() => {
            const range = this.range();
            this.selectedInterval.set(intervalForRange(range));
            const fcId = this.featureConfigurationId();
            this.fetchAllMetrics(fcId);
        });
        this.watchTheme();
    }

    fetchAllMetrics(fcId: number | null): void {
        this.isLoading.set(true);
        this.error.set(null);
        this.seriesList.set([]);

        const calls = Object.values(this.metrics).map((m) => {
            const params: ITimeseriesParams = {
                range: this.range() as any,
                metric: m.value,
                interval: this.selectedInterval(),
            };
            if (fcId) params.feature_configuration_id = fcId;
            return this.analyticsService.getTimeseries(params);
        });

        forkJoin(calls)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (results: any[]) => {
                    const metricValues = Object.values(this.metrics);
                    const list = results.map((res, i) => ({
                        label: metricValues[i]!.label,
                        color: metricValues[i]!.color,
                        infoTooltip: metricValues[i]!.infoTooltip,
                        data: (res?.data?.data ?? []) as { period: string; value: number }[],
                    }));
                    this.seriesList.set(list);
                    this.isLoading.set(false);
                    setTimeout(() => this.renderCharts(), 0);
                },
                error: (err: any) => {
                    this.error.set(err?.message ?? 'Failed to load timeseries');
                    this.isLoading.set(false);
                },
            });
    }

    private charts: echarts.ECharts[] = [];
    private themeObserver: MutationObserver | null = null;

    private getCssVar(el: HTMLElement, name: string): string {
        return getComputedStyle(el).getPropertyValue(name).trim();
    }

    private watchTheme(): void {
        this.themeObserver?.disconnect();
        this.themeObserver = new MutationObserver(() => this.renderCharts());
        this.themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    private renderCharts(): void {
        this.charts.forEach((c) => c?.dispose());
        this.charts = [];

        const list = this.seriesList();
        list.forEach((s, i) => {
            const el = this.chartEls?.get(i)?.nativeElement;
            if (!el) return;

            const borderColor = this.getCssVar(el, '--color-common-border');
            const textColor = this.getCssVar(el, '--color-common-text');
            const bgColor = this.getCssVar(el, '--color-common-bg');

            if (this.charts[i]) this.charts[i].dispose();
            this.charts[i] = echarts.init(el);
            this.charts[i].setOption(
                {
                    backgroundColor: 'transparent',
                    tooltip: {
                        trigger: 'axis',
                        backgroundColor: bgColor,
                        borderColor: borderColor,
                        textStyle: { color: textColor },
                    },
                    grid: { top: 8, right: 16, bottom: 36, left: 48 },
                    xAxis: {
                        type: 'category',
                        data: s.data.map((d) => d.period),
                        axisLabel: { fontSize: 10, color: textColor },
                        axisLine: { lineStyle: { color: borderColor } },
                        splitLine: { show: false },
                    },
                    yAxis: {
                        type: 'value',
                        axisLabel: { fontSize: 10, color: textColor },
                        splitLine: { lineStyle: { color: borderColor } },
                    },
                    series: [
                        {
                            name: s.label,
                            type: 'line',
                            data: s.data.map((d) => d.value),
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 5,
                            lineStyle: { width: 2, color: s.color },
                            itemStyle: { color: s.color },
                            areaStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: s.color + '33' },
                                    { offset: 1, color: s.color + '05' },
                                ]),
                            },
                        },
                    ],
                },
                true
            );
        });
    }

    closeExpand(): void {
        this.expandDialogRef?.close();
    }

    openExpand(s: ITimeseriesSeries): void {
        this.expandSeries.set(s);
        const ref = (this.expandDialogRef = this.dialog.open(this.expandTpl, {
            panelClass: ['mat-dialog', 'mat-dialog-lg'],
        }));
        ref.afterOpened().subscribe(() => {
            const el = document.querySelector('[data-expand-chart="timeseries"]') as HTMLDivElement;
            if (!el) return;
            const expandChart = echarts.init(el);
            expandChart.setOption({
                tooltip: { trigger: 'axis' },
                grid: { top: 16, right: 24, bottom: 40, left: 56 },
                xAxis: {
                    type: 'category',
                    data: s.data.map((d) => d.period),
                    axisLabel: { fontSize: 11 },
                    axisLine: { lineStyle: { color: '#e5e7eb' } },
                    splitLine: { show: false },
                },
                yAxis: {
                    type: 'value',
                    axisLabel: { fontSize: 11 },
                    splitLine: { lineStyle: { color: '#e5e7eb' } },
                },
                series: [
                    {
                        name: s.label,
                        type: 'line',
                        data: s.data.map((d) => d.value),
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        lineStyle: { width: 2, color: s.color },
                        itemStyle: { color: s.color },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: s.color + '33' },
                                { offset: 1, color: s.color + '05' },
                            ]),
                        },
                    },
                ],
            });
            ref.afterClosed().subscribe(() => expandChart.dispose());
        });
    }

    onIntervalChange(value: TimeseriesInterval): void {
        this.selectedInterval.set(value);
    }

    override ngOnDestroy(): void {
        this.themeObserver?.disconnect();
        this.charts.forEach((c) => c?.dispose());
        super.ngOnDestroy();
    }
}
