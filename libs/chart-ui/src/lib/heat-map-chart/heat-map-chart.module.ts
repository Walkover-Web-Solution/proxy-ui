import { NgModule } from '@angular/core';
import { HeatMapChartComponent } from './heat-map-chart.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [HeatMapChartComponent],
    imports: [CommonModule, HighchartsChartModule],
    exports: [HeatMapChartComponent],
})
export class HeatMapChartModule {}
