import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    TemplateRef,
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
import { AnalyticsService } from '@proxy/services/proxy/analytics';
import { takeUntil } from 'rxjs';
import * as echarts from 'echarts';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { INFO_TOOLTIPS } from '@proxy/constant';
import {
    BreakdownGroupBy,
    IBreakdownGroupByOption,
    IBreakdownParams,
    GROUP_BY_OPTIONS,
    TimeseriesInterval,
    intervalForRange,
} from '../dashboard.models';

@Component({
    selector: 'breakdown-chart',
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
    @ViewChild('expandTpl', { static: false }) expandTpl!: TemplateRef<any>;

    range = input<string>('week');
    featureConfigurationId = input<number | null>(null);

    private analyticsService = inject(AnalyticsService);
    private dialog = inject(MatDialog);
    private expandDialogRef: MatDialogRef<any> | null = null;
    private chart: echarts.ECharts | null = null;
    private themeObserver: MutationObserver | null = null;

    readonly isLoading = signal(false);
    readonly error = signal<string | null>(null);
    readonly chartData = signal<{ key: string; count: number }[]>([]);

    selectedGroupBy = signal<BreakdownGroupBy>(BreakdownGroupBy.type);
    selectedInterval = signal<TimeseriesInterval>(TimeseriesInterval.day);

    readonly groupByOptions: IBreakdownGroupByOption[] = GROUP_BY_OPTIONS;

    readonly palette = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

    constructor() {
        super();
        this.watchTheme();
        effect(() => {
            const range = this.range();
            const interval = intervalForRange(range);
            this.selectedInterval.set(interval);
            const params: IBreakdownParams = {
                range: range as any,
                group_by: this.selectedGroupBy(),
                interval,
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
                    setTimeout(() => this.renderChart(), 0);
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

    closeExpand(): void {
        this.expandDialogRef?.close();
    }

    openExpand(): void {
        const ref = (this.expandDialogRef = this.dialog.open(this.expandTpl, {
            panelClass: ['mat-dialog', 'mat-dialog-lg'],
        }));
        ref.afterOpened().subscribe(() => {
            const el = document.querySelector('[data-expand-chart="breakdown"]') as HTMLDivElement;
            if (!el) return;
            const expandChart = echarts.init(el);
            expandChart.setOption(this.getPieOption({ expanded: true }));
            ref.afterClosed().subscribe(() => expandChart.dispose());
        });
    }

    private getCssVar(name: string): string {
        return getComputedStyle(this.chartEl.nativeElement).getPropertyValue(name).trim();
    }

    private watchTheme(): void {
        this.themeObserver?.disconnect();
        this.themeObserver = new MutationObserver(() => {
            if (this.chartData().length) this.renderChart();
        });
        this.themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    private getPieOption(opts: { expanded?: boolean } = {}): any {
        const borderColor = this.chartEl?.nativeElement ? this.getCssVar('--color-common-border') : '';
        const textColor = this.chartEl?.nativeElement ? this.getCssVar('--color-common-text') : '';
        const bgColor = this.chartEl?.nativeElement ? this.getCssVar('--color-common-bg') : '';
        return {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} ({d}%)',
                ...(bgColor ? { backgroundColor: bgColor, borderColor, textStyle: { color: textColor } } : {}),
            },
            legend: {
                bottom: 0,
                left: 'center',
                textStyle: { fontSize: opts.expanded ? 12 : 11, color: textColor || undefined },
            },
            series: [
                {
                    type: 'pie',
                    radius: opts.expanded ? ['38%', '65%'] : ['40%', '70%'],
                    center: ['50%', '45%'],
                    data: this.chartData().map((d, i) => ({
                        name: d.key,
                        value: d.count,
                        itemStyle: { color: this.palette[i % this.palette.length] },
                    })),
                    label: opts.expanded ? { show: true, formatter: '{b}\n{d}%', fontSize: 12 } : { show: false },
                    emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.2)' } },
                },
            ],
        };
    }

    private renderChart(): void {
        if (!this.chartEl?.nativeElement) return;
        if (this.chart) {
            this.chart.dispose();
        }
        this.chart = echarts.init(this.chartEl.nativeElement);
        this.chart.setOption(this.getPieOption());
    }

    override ngOnDestroy(): void {
        this.themeObserver?.disconnect();
        this.chart?.dispose();
        super.ngOnDestroy();
    }
}
