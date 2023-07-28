import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import * as Highcharts from 'highcharts';
import { Options } from 'highcharts';

@Component({
    selector: 'msg91-heat-map-chart',
    templateUrl: './heat-map-chart.component.html',
    styleUrls: ['./heat-map-chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeatMapChartComponent {
    public Highcharts = Highcharts;

    @Input() containerHeight: number = 200;
    @Input() chartOptions: Options;
}
