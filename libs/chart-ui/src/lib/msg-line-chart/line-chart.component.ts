import {
    AfterViewInit,
    Component,
    ContentChild,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { curveLinear } from 'd3-shape';
import * as dayjs from 'dayjs';
import * as isoWeek from 'dayjs/plugin/isoWeek';
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import * as weekOfYear from 'dayjs/plugin/weekOfYear';
import { cloneDeep } from 'lodash-es';

import { LineChartComponent } from '../line-chart/line-chart.component';

dayjs.extend(isSameOrBefore);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
@Component({
    selector: 'proxy-line-chart',
    templateUrl: './line-chart.component.html',
    styleUrls: ['./line-chart.component.scss'],
})
export class MsgLineChartComponent implements OnInit, AfterViewInit, OnChanges {
    @ViewChild('chart') chart: LineChartComponent;
    @Input() containerHeight: number = 200;
    @Input() data: any[];
    results: any[] = [];
    @Input() view: [number, number];
    @Input() scheme: any = 'cool';
    @Input() schemeType = 'ordinal';
    @Input() customColors: any;
    @Input() animations = true;
    @Input() legend = false;
    @Input() legendTitle = 'Legend';
    @Input() legendPosition = 'right';
    @Input() xAxis = true;
    @Input() yAxis = true;
    @Input() showXAxisLabel = true;
    @Input() showYAxisLabel = true;
    @Input() xAxisLabel = 'Hourly';
    @Input() yAxisLabel = '';
    @Input() autoScale = true;
    @Input() timeline = true;
    @Input() gradient: boolean;
    @Input() showGridLines = true;
    @Input() curve: any = curveLinear;
    @Input() activeEntries: any[] = [];

    @Input() rangeFillOpacity = 2;
    @Input() trimXAxisTicks = false;
    @Input() trimYAxisTicks = false;
    @Input() rotateXAxisTicks = true;
    @Input() maxXAxisTickLength = 25;
    @Input() maxYAxisTickLength = 25;
    @Input() xAxisTickFormatting: any;
    @Input() yAxisTickFormatting: any;
    @Input() xAxisTicks: any[];
    @Input() yAxisTicks: any[];
    @Input() roundDomains = false;
    @Input() tooltipDisabled = false;
    @Input() showRefLines = true;
    @Input() referenceLines: any;
    @Input() showRefLabels = true;
    @Input() xScaleMin: any;
    @Input() xScaleMax: any;

    xScaleMaxCalculated: any;

    @Input() yScaleMin: number;
    @Input() yScaleMax: number;
    @Input() showHourlTab: boolean = true;

    @Output() activate: EventEmitter<any> = new EventEmitter();
    @Output() deactivate: EventEmitter<any> = new EventEmitter();
    // tslint:disable-next-line:no-output-native
    @Output() select = new EventEmitter();
    @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<any>;
    @ContentChild('seriesTooltipTemplate') seriesTooltipTemplate: TemplateRef<any>;

    colorScheme = {
        domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
    };
    @Input() from: string;
    /** return selected filter value */
    @Output() selectedFilter = new EventEmitter();

    constructor() {
        this.data = [];
    }

    ngAfterViewInit(): void {}

    ngOnChanges(changes: SimpleChanges) {
        if (this.data && changes?.data?.currentValue) {
            this.onRangeChange({ value: this.xAxisLabel } as MatButtonToggleChange);
        }
    }

    ngOnInit(): void {
        if (!this.showHourlTab) {
            this.onRangeChange({ value: 'Day' } as MatButtonToggleChange);
        }
    }

    showDots(chart) {
        let index = 0;
        const paths = chart.chartElement.nativeElement.getElementsByClassName('line-series');
        const color = chart.chartElement.nativeElement.getElementsByClassName('line-highlight');

        for (const path of paths) {
            const chrtColor = color[index].getAttribute('ng-reflect-fill');
            const pathElement = path.getElementsByTagName('path')[0];
            const pathAttributes = {
                'marker-start': `url(#dot${index})`,
                'marker-mid': `url(#dot${index})`,
                'marker-end': `url(#dot${index})`,
            };
            this.createMarker(chart, chrtColor, index);
            this.setAttributes(pathElement, pathAttributes);
            index += 1;
        }
    }

    /**
     * create marker
     *
     */
    createMarker(chart, color, index) {
        const svg = chart.chartElement.nativeElement.getElementsByTagName('svg');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        svg[0].getElementsByTagName('defs')[0].append(marker);
        marker.append(circle);
        const m = svg[0].getElementsByTagName('marker')[0];
        const c = svg[0].getElementsByTagName('circle')[0];

        const markerAttributes = {
            id: `dot${index}`,
            viewBox: '0 0 10 10',
            refX: 5,
            refY: 5,
            markerWidth: 5,
            markerHeight: 5,
        };

        const circleAttributes = {
            cx: 5,
            cy: 5,
            r: 5,
            fill: color,
        };
        m.append(circle);

        this.setAttributes(m, markerAttributes);
        this.setAttributes(c, circleAttributes);
    }

    /**
     * set multiple attributes
     */
    setAttributes(element, attributes) {
        // tslint:disable-next-line:forin
        for (const key in attributes) {
            element.setAttribute(key, attributes[key]);
        }
    }

    onRangeChange($event: MatButtonToggleChange) {
        this.xAxisLabel = $event.value;
        if (this.data) {
            this.results =
                cloneDeep(this.data).map((s) => {
                    const baseSeries = this.baseSeries($event.value, this.xScaleMin, this.xScaleMax);
                    let resultSeries = [];
                    switch ($event.value) {
                        case 'Week': {
                            resultSeries = baseSeries.map((d) => {
                                d.value = s.series
                                    .filter(
                                        (m) =>
                                            dayjs(d.name).toDate() <= dayjs(m.name).toDate() &&
                                            dayjs(d.name).add(7, 'day').toDate() > dayjs(m.name).toDate()
                                    )
                                    ?.reduce((acc, cur) => acc + cur.value, 0);
                                return d;
                            });
                            break;
                        }
                        case 'Month': {
                            resultSeries = baseSeries.map((d) => {
                                d.value = s.series
                                    .filter((m) => dayjs(m.name).isSame(d.name, 'month'))
                                    ?.reduce((acc, cur) => acc + cur.value, 0);
                                return d;
                            });
                            break;
                        }
                        case 'Day': {
                            resultSeries = baseSeries.map((d) => {
                                d.value = s.series
                                    .filter((m) => dayjs(m.name).isSame(d.name, 'day'))
                                    ?.reduce((acc, cur) => acc + cur.value, 0);
                                return d;
                            });
                            break;
                        }
                        case 'Hourly': {
                            resultSeries = baseSeries.map((d) => {
                                d.value = s.series
                                    .filter((m) => dayjs(m.name).isSame(d.name, 'hour'))
                                    ?.reduce((acc, cur) => acc + cur.value, 0);
                                return d;
                            });
                            break;
                        }
                    }
                    s.series = resultSeries;
                    return s;
                }) ?? [];
            if (this.chart) {
                this.chart.update();
                this.chart.updateTimeline();
            }
        }
    }

    updateSeries(p) {
        const uniqData = [];
        const op = [];

        p.series.forEach((ele) => {
            const index = uniqData.indexOf(ele.name.getTime());
            if (index === -1) {
                uniqData.push(ele.name.getTime());
                op.push(ele);
            } else {
                op.find((w) => w.name.getTime() === ele.name.getTime()).value += ele.value;
            }
        });
        p.series = op;
        return p;
    }

    randomSeries(num: number) {
        const series = [];
        for (let i = 0; i < num; i++) {
            series.push({
                name: this.randomDate(new Date(2020, 1, 25), new Date(2020, 12, 31)),
                value: Math.random() * 500,
            });
        }
        return series;
    }

    randomValueBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    randomDate(date1, date2) {
        date1 = date1.getTime();
        date2 = date2.getTime();
        if (date1 > date2) {
            return new Date(this.randomValueBetween(date2, date1));
        } else {
            return new Date(this.randomValueBetween(date1, date2));
        }
    }

    public dateFormat(d: Date) {
        return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    }

    public baseSeries(event: 'Month' | 'Week' | 'Hourly' | 'Day', minDate: Date, maxDate: Date) {
        const result = [];
        let currentDate = cloneDeep(minDate);
        while (dayjs(currentDate).isSameOrBefore(dayjs(maxDate))) {
            const currentHr = dayjs(currentDate).hour();
            const currentdate = dayjs(currentDate).date();
            const currentMaxdate = dayjs(cloneDeep(maxDate)).date();
            const currentMonth = dayjs(currentDate).month();
            const maxDateMonth = dayjs(cloneDeep(maxDate)).month();
            switch (event) {
                case 'Hourly': {
                    for (let i = currentHr; i <= 24; i++) {
                        result.push({
                            name: dayjs(currentDate)
                                .add(currentHr - i, 'hour')
                                .toDate(),
                            value: 0,
                        });
                    }
                    currentDate = dayjs(currentDate).add(24, 'hour').toDate();
                    break;
                }
                case 'Day': {
                    let j = 0;
                    if (currentMonth === maxDateMonth) {
                        for (let i = currentdate; i <= currentMaxdate; i++) {
                            result.push({
                                name: dayjs(currentDate).add(j, 'day').toDate(),
                                value: 0,
                            });
                            j++;
                        }
                        currentDate = dayjs(currentDate).add(dayjs(currentDate).daysInMonth(), 'day').toDate();
                    } else {
                        const lastDayOfMonth = dayjs(currentDate).endOf('month').format('D');
                        for (let i = currentdate; i <= +lastDayOfMonth; i++) {
                            result.push({
                                name: dayjs(currentDate).add(j, 'day').toDate(),
                                value: 0,
                            });
                            j++;
                        }
                        // for (let i = 1; i <= currentMaxdate; i++) {
                        //     result.push({
                        //         name: dayjs(currentDate).add(j, 'day').toDate(),
                        //         value: 0,
                        //     });
                        //     j++;
                        // }
                        // currentDate = dayjs(currentDate).add(dayjs(currentDate).daysInMonth(), 'day').toDate();
                        currentDate = dayjs(currentDate)
                            .add(+lastDayOfMonth - currentdate + 1, 'day')
                            .toDate();
                    }
                    break;
                }
                case 'Month': {
                    result.push({ name: dayjs(currentDate).toDate(), value: 0 });
                    currentDate = dayjs(currentDate)
                        .add(dayjs(currentDate).daysInMonth() + 1 - currentdate, 'day')
                        .toDate();
                    break;
                }
                case 'Week': {
                    const dateForWeek = dayjs()
                        .day(1)
                        .week(dayjs(currentDate).isoWeek() + 1);
                    result.push({ name: dayjs(currentDate).toDate(), value: 0 });
                    currentDate = dayjs(currentDate).add(7, 'day').toDate();
                    break;
                }
            }
        }
        return result;
    }

    getToolTipText(tooltipItem: any): string {
        let result: string = '';
        if (tooltipItem.series !== undefined) {
            result += tooltipItem.series;
        } else {
            result += '???';
        }
        result += ': ';
        if (tooltipItem.value !== undefined) {
            result += tooltipItem.value.toLocaleString();
        }
        if (tooltipItem.min !== undefined || tooltipItem.max !== undefined) {
            result += ' (';
            if (tooltipItem.min !== undefined) {
                if (tooltipItem.max === undefined) {
                    result += '≥';
                }
                result += tooltipItem.min.toLocaleString();
                if (tooltipItem.max !== undefined) {
                    result += ' - ';
                }
            } else if (tooltipItem.max !== undefined) {
                result += '≤';
            }
            if (tooltipItem.max !== undefined) {
                result += tooltipItem.max.toLocaleString();
            }
            result += ')';
        }
        return result;
    }

    public changeRange(event: MatButtonToggleChange) {
        // if (this.from === 'email') {
        //     this.xAxisLabel = event.value;
        //     this.selectedFilter.emit(event.value.toLowerCase());
        //     return;
        // }
        this.onRangeChange(event);
    }
}
