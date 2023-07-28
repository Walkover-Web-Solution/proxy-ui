import { NgModule } from '@angular/core';
import { ChartCommonModule } from './common/chart-common.module';
import { AreaChartModule } from './area-chart/area-chart.module';
import { LineChartModule } from './line-chart/line-chart.module';
import { BarChartModule } from './bar-chart/bar-chart.module';
import { PieChartModule } from './pie-chart/pie-chart.module';
import { ngxChartsPolyfills } from './polyfills';

@NgModule({
    exports: [ChartCommonModule, AreaChartModule, LineChartModule, BarChartModule, PieChartModule],
})
export class NgxChartsModule {
    constructor() {
        ngxChartsPolyfills();
    }
}
