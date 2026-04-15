import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    ViewChild,
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
import { AnalyticsService, IBreakdownParams } from '@proxy/services/proxy/analytics';
import { takeUntil } from 'rxjs';
import * as echarts from 'echarts';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { BreakdownExpandDialogComponent } from './breakdown-expand-dialog.component';
import { INFO_TOOLTIPS } from '@proxy/constant';

export type BreakdownGroupBy = 'service_id' | 'source' | 'type';

@Component({
    selector: 'proxy-breakdown-chart',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        MatIconModule,
        MatSelectModule,
        MatFormFieldModule,
        FormsModule,
        MatButtonModule,
        MatTooltipModule,
    ],
    templateUrl: './breakdown-chart.component.html',
})
export class BreakdownChartComponent extends BaseComponent implements OnDestroy {
    readonly infoTooltip = INFO_TOOLTIPS.dashboard.charts.breakdown;
    @ViewChild('chartEl', { static: false }) chartEl!: ElementRef<HTMLDivElement>;

    range = input<string>('week');
    featureConfigurationId = input<number | null>(null);

    private analyticsService = inject(AnalyticsService);
    private dialog = inject(MatDialog);
    private chart: echarts.ECharts | null = null;
    private themeObserver: MutationObserver | null = null;

    readonly isLoading = signal(false);
    readonly error = signal<string | null>(null);
    readonly chartData = signal<{ key: string; count: number }[]>([]);

    selectedGroupBy = signal<BreakdownGroupBy>('type');

    readonly groupByOptions: { label: string; value: BreakdownGroupBy }[] = [
        { label: 'By Type', value: 'type' },
        // { label: 'By Source', value: 'source' },
        { label: 'By Service', value: 'service_id' },
    ];

    readonly palette = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

    constructor() {
        super();
        this.watchTheme();
        effect(() => {
            const params: IBreakdownParams = {
                range: this.range() as any,
                group_by: this.selectedGroupBy(),
            };
            const fcId = this.featureConfigurationId();
            if (fcId) params.feature_configuration_id = fcId;
            this.fetchBreakdown(params);
        });
    }

    fetchBreakdown(params: IBreakdownParams): void {
        this.isLoading.set(true);
        this.error.set(null);
        this.chartData.set([]);

        this.analyticsService
            .getBreakdown(params)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    const data = res?.data?.data ?? [];
                    this.chartData.set(data);
                    this.isLoading.set(false);
                    setTimeout(() => this.renderChart(data), 0);
                },
                error: (err: any) => {
                    this.error.set(err?.message ?? 'Failed to load breakdown');
                    this.isLoading.set(false);
                },
            });
    }

    onGroupByChange(value: BreakdownGroupBy): void {
        this.selectedGroupBy.set(value);
    }

    openExpand(): void {
        this.dialog.open(BreakdownExpandDialogComponent, {
            data: {
                data: this.chartData(),
                palette: this.palette,
                label:
                    'Breakdown — ' + (this.groupByOptions.find((o) => o.value === this.selectedGroupBy())?.label ?? ''),
            },
            width: '80vw',
            maxWidth: '900px',
        });
    }

    private getCssVar(name: string): string {
        return getComputedStyle(this.chartEl.nativeElement).getPropertyValue(name).trim();
    }

    private watchTheme(): void {
        this.themeObserver?.disconnect();
        this.themeObserver = new MutationObserver(() => {
            if (this.chartData().length) this.renderChart(this.chartData());
        });
        this.themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    private renderChart(data: { key: string; count: number }[]): void {
        if (!this.chartEl?.nativeElement) return;
        if (this.chart) {
            this.chart.dispose();
        }

        const borderColor = this.getCssVar('--color-common-border');
        const textColor = this.getCssVar('--color-common-text');
        const bgColor = this.getCssVar('--color-common-bg');

        this.chart = echarts.init(this.chartEl.nativeElement);
        this.chart.setOption({
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} ({d}%)',
                backgroundColor: bgColor,
                borderColor: borderColor,
                textStyle: { color: textColor },
            },
            legend: { bottom: 0, left: 'center', textStyle: { fontSize: 11, color: textColor } },
            series: [
                {
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '45%'],
                    data: data.map((d, i) => ({
                        name: d.key,
                        value: d.count,
                        itemStyle: { color: this.palette[i % this.palette.length] },
                    })),
                    label: { show: false },
                    emphasis: {
                        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.2)' },
                    },
                },
            ],
        });
    }

    override ngOnDestroy(): void {
        this.themeObserver?.disconnect();
        this.chart?.dispose();
        super.ngOnDestroy();
    }
}
