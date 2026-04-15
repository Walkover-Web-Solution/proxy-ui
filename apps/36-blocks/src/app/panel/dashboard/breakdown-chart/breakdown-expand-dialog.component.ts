import { Component, ElementRef, Inject, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import * as echarts from 'echarts';

export interface BreakdownDialogData {
    data: { key: string; count: number }[];
    palette: string[];
    label: string;
}

@Component({
    selector: 'proxy-breakdown-expand-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, MatIconModule],
    template: `
        <div class="flex items-center justify-between px-6 pt-5 pb-2">
            <span class="text-base font-semibold">{{ data.label }}</span>
            <button mat-icon-button (click)="close()">
                <mat-icon>close</mat-icon>
            </button>
        </div>
        <mat-dialog-content>
            <div #chartEl style="height: 460px; width: 100%;"></div>
        </mat-dialog-content>
    `,
})
export class BreakdownExpandDialogComponent implements AfterViewInit, OnDestroy {
    @ViewChild('chartEl', { static: false }) chartEl!: ElementRef<HTMLDivElement>;
    private chart: echarts.ECharts | null = null;

    constructor(
        public dialogRef: MatDialogRef<BreakdownExpandDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: BreakdownDialogData
    ) {}

    ngAfterViewInit(): void {
        setTimeout(() => this.renderChart(), 0);
    }

    private renderChart(): void {
        if (!this.chartEl?.nativeElement) return;
        this.chart = echarts.init(this.chartEl.nativeElement);
        this.chart.setOption({
            tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
            legend: { bottom: 0, left: 'center', textStyle: { fontSize: 12 } },
            series: [
                {
                    type: 'pie',
                    radius: ['38%', '65%'],
                    center: ['50%', '45%'],
                    data: this.data.data.map((d, i) => ({
                        name: d.key,
                        value: d.count,
                        itemStyle: { color: this.data.palette[i % this.data.palette.length] },
                    })),
                    label: { show: true, formatter: '{b}\n{d}%', fontSize: 12 },
                    emphasis: {
                        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.2)' },
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
