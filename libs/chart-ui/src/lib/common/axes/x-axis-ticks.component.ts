import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { trimLabel } from '../trim-label.helper';
import { reduceTicks } from './ticks.helper';

@Component({
    selector: 'g[ngx-charts-x-axis-ticks]',
    template: `
        <svg:g #ticksel>
            <svg:g *ngFor="let tick of ticks" class="tick" [attr.transform]="tickTransform(tick)">
                <title>{{ tickFormat(tick) }}</title>
                <svg:text
                    stroke-width="0.01"
                    [attr.text-anchor]="textAnchor"
                    [attr.transform]="textTransform"
                    [style.font-size]="'12px'"
                >
                    {{ tickTrim(tickFormat(tick)) }}
                </svg:text>
            </svg:g>
        </svg:g>

        <svg:g *ngFor="let tick of ticks" [attr.transform]="tickTransform(tick)">
            <svg:g *ngIf="showGridLines" [attr.transform]="gridLineTransform()">
                <svg:line class="gridline-path gridline-path-vertical" [attr.y1]="-gridLineHeight" y2="0" />
            </svg:g>
        </svg:g>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class XAxisTicksComponent implements OnChanges, AfterViewInit {
    @Input() scale;
    @Input() orient;
    @Input() tickArguments = [5];
    @Input() tickValues: any[];
    @Input() tickStroke = '#ccc';
    @Input() trimTicks: boolean = true;
    @Input() maxTickLength: number = 16;
    @Input() tickFormatting;
    @Input() showGridLines = false;
    @Input() gridLineHeight;
    @Input() width;
    @Input() rotateTicks: boolean = true;

    @Output() dimensionsChanged = new EventEmitter();

    verticalSpacing: number = 20;
    rotateLabels: boolean = false;
    innerTickSize: number = 6;
    outerTickSize: number = 6;
    tickPadding: number = 3;
    textAnchor: string = 'middle';
    maxTicksLength: number = 0;
    maxAllowedLength: number = 16;
    adjustedScale: any;
    textTransform: any;
    ticks: any;
    tickFormat: (o: any) => any;
    height: number = 0;

    @ViewChild('ticksel') ticksElement: ElementRef;

    ngOnChanges(changes: SimpleChanges): void {
        this.update();
    }

    ngAfterViewInit(): void {
        setTimeout(() => this.updateDims());
    }

    updateDims(): void {
        const height = parseInt(this.ticksElement.nativeElement.getBoundingClientRect().height, 10);
        if (height !== this.height) {
            this.height = height;
            this.dimensionsChanged.emit({ height });
            setTimeout(() => this.updateDims());
        }
    }

    update(): void {
        const scale = this.scale;
        this.ticks = this.getTicks();

        if (this.tickFormatting) {
            this.tickFormat = this.tickFormatting;
        } else if (scale.tickFormat) {
            this.tickFormat = scale.tickFormat.apply(scale, this.tickArguments);
        } else {
            this.tickFormat = function (d) {
                if (d.constructor.name === 'Date') {
                    return d.toLocaleDateString();
                }
                return d.toLocaleString();
            };
        }

        const angle = this.rotateTicks ? this.getRotationAngle(this.ticks) : null;

        this.adjustedScale = this.scale.bandwidth
            ? function (d) {
                  return this.scale(d) + this.scale.bandwidth() * 0.5;
              }
            : this.scale;

        this.textTransform = '';
        if (angle && angle !== 0) {
            this.textTransform = `rotate(${angle})`;
            this.textAnchor = 'end';
            this.verticalSpacing = 10;
        } else {
            this.textAnchor = 'middle';
        }

        setTimeout(() => this.updateDims());
    }

    getRotationAngle(ticks): number {
        let angle = 0;
        this.maxTicksLength = 0;
        for (let i = 0; i < ticks.length; i++) {
            const tick = this.tickFormat(ticks[i]).toString();
            let tickLength = tick.length;
            if (this.trimTicks) {
                tickLength = this.tickTrim(tick).length;
            }

            if (tickLength > this.maxTicksLength) {
                this.maxTicksLength = tickLength;
            }
        }

        const len = Math.min(this.maxTicksLength, this.maxAllowedLength);
        const charWidth = 8; // need to measure this
        const wordWidth = len * charWidth;

        let baseWidth = wordWidth;
        const maxBaseWidth = Math.floor(this.width / ticks.length);

        // calculate optimal angle
        while (baseWidth > maxBaseWidth && angle > -90) {
            angle -= 30;
            baseWidth = Math.cos(angle * (Math.PI / 180)) * wordWidth;
        }

        return angle;
    }

    getTicks() {
        let ticks;
        const maxTicks = this.getMaxTicks(20);
        const maxScaleTicks = this.getMaxTicks(100);

        if (this.tickValues) {
            ticks = this.tickValues;
        } else if (this.scale.ticks) {
            ticks = this.scale.ticks.apply(this.scale, [maxScaleTicks]);
        } else {
            ticks = this.scale.domain();
            ticks = reduceTicks(ticks, maxTicks);
        }

        return ticks;
    }

    getMaxTicks(tickWidth: number): number {
        return Math.floor(this.width / tickWidth);
    }

    tickTransform(tick): string {
        return 'translate(' + this.adjustedScale(tick) + ',' + this.verticalSpacing + ')';
    }

    gridLineTransform(): string {
        return `translate(0,${-this.verticalSpacing - 5})`;
    }

    tickTrim(label: string): string {
        return this.trimTicks ? trimLabel(label, this.maxTickLength) : label;
    }
}
