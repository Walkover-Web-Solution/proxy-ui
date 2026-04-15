import { Component, ElementRef, Inject, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import * as echarts from 'echarts';

export interface ChartDialogData {
    label: string;
    color: string;
    data: { period: string; value: number }[];
}

@Component({
    selector: 'proxy-chart-expand-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, MatIconModule],
    template: `
        <div class="flex items-center justify-between px-6 pt-5 pb-2">
            <span class="text-base font-semibold" [style.color]="data.color">{{ data.label }}</span>
            <button mat-icon-button (click)="close()">
                <mat-icon>close</mat-icon>
            </button>
        </div>
        <mat-dialog-content>
            <div #chartEl style="height: 420px; width: 100%;"></div>
        </mat-dialog-content>
    `,
})
export class ChartExpandDialogComponent implements AfterViewInit, OnDestroy {
    @ViewChild('chartEl', { static: false }) chartEl!: ElementRef<HTMLDivElement>;
    private chart: echarts.ECharts | null = null;

    constructor(
        public dialogRef: MatDialogRef<ChartExpandDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ChartDialogData
    ) {}

    ngAfterViewInit(): void {
        setTimeout(() => this.renderChart(), 0);
    }

    private renderChart(): void {
        if (!this.chartEl?.nativeElement) return;
        this.chart = echarts.init(this.chartEl.nativeElement);
        this.chart.setOption({
            tooltip: { trigger: 'axis' },
            grid: { top: 16, right: 24, bottom: 40, left: 56 },
            xAxis: {
                type: 'category',
                data: this.data.data.map((d) => d.period),
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
                    name: this.data.label,
                    type: 'line',
                    data: this.data.data.map((d) => d.value),
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 6,
                    lineStyle: { width: 2, color: this.data.color },
                    itemStyle: { color: this.data.color },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: this.data.color + '33' },
                            { offset: 1, color: this.data.color + '05' },
                        ]),
                    },
                },
            ],
        });
    }

    close(): void {
        this.dialogRef.close();
    }

    ngOnDestroy(): void {
        this.chart?.dispose();
    }
}
