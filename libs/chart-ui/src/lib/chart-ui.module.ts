import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsgLineChartComponent } from './msg-line-chart/line-chart.component';
import { StackedBarChartComponent } from './stacked-bar-chart/stacked-bar-chart.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NgxChartsModule } from './ngx-charts.module';
import { PipesChartDateAddModule } from '@proxy/pipes/ChartDateAdd';
import { HighchartsChartModule } from 'highcharts-angular';

@NgModule({
    imports: [CommonModule, MatButtonToggleModule, NgxChartsModule, PipesChartDateAddModule, HighchartsChartModule],
    declarations: [MsgLineChartComponent, StackedBarChartComponent],
    exports: [MsgLineChartComponent, StackedBarChartComponent],
})
export class ChartUiModule {}
