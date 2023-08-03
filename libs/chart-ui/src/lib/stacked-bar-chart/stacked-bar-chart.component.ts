import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StackedBarChartOptions } from '../models/stacked-bar-chart.model';
import * as Highcharts from 'highcharts';

@Component({
    selector: 'proxy-stacked-bar-chart',
    templateUrl: './stacked-bar-chart.component.html',
    styleUrls: ['./stacked-bar-chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackedBarChartComponent {
    public Highcharts = Highcharts;

    @Input() containerHeight: number = 200;
    @Input() chartOptions: StackedBarChartOptions;
}
