import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewEncapsulation,
} from '@angular/core';
import { trimLabel } from '../trim-label.helper';
import { formatLabel } from '../label.helper';

@Component({
    selector: 'ngx-charts-advanced-legend',
    template: `
        <div class="advanced-pie-legend" [style.width.px]="width">
            <div
                *ngIf="animations"
                class="total-value"
                ngx-charts-count-up
                [countTo]="roundedTotal"
                [valueFormatting]="valueFormatting"
            ></div>
            <div class="total-value" *ngIf="!animations">
                {{ valueFormatting ? valueFormatting(roundedTotal) : defaultValueFormatting(roundedTotal) }}
            </div>
            <div class="total-label">
                {{ label }}
            </div>
            <div class="legend-items-container">
                <div class="legend-items">
                    <div
                        *ngFor="let legendItem of legendItems; trackBy: trackBy"
                        tabindex="-1"
                        class="legend-item"
                        (mouseenter)="activate.emit(legendItem.data)"
                        (mouseleave)="deactivate.emit(legendItem.data)"
                        (click)="select.emit(legendItem.data)"
                    >
                        <div class="item-color" [style.background-color]="legendItem.color"></div>
                        <div class="d-flex align-items-center">
                            <div
                                *ngIf="animations"
                                class="item-value"
                                ngx-charts-count-up
                                [countTo]="legendItem._value"
                                [valueFormatting]="valueFormatting"
                            ></div>
                            <div
                                *ngIf="animations"
                                class="item-percent"
                                ngx-charts-count-up
                                [countTo]="legendItem.percentage"
                                [countSuffix]="'%'"
                            ></div>
                        </div>
                        <div *ngIf="!animations" class="item-value">
                            {{
                                valueFormatting
                                    ? valueFormatting(legendItem.value)
                                    : defaultValueFormatting(legendItem.value)
                            }}
                        </div>
                        <div class="item-label">{{ legendItem.displayLabel }}</div>

                        <div *ngIf="!animations" class="item-percent">
                            {{ legendItem.percentage.toLocaleString() }}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styleUrls: ['./advanced-legend.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedLegendComponent implements OnChanges {
    @Input() width: number;
    @Input() data;
    @Input() colors;
    @Input() label: string = 'Total';
    @Input() animations: boolean = true;

    @Output() select: EventEmitter<any> = new EventEmitter();
    @Output() activate: EventEmitter<any> = new EventEmitter();
    @Output() deactivate: EventEmitter<any> = new EventEmitter();

    legendItems: any[] = [];
    total: number;
    roundedTotal: number;

    @Input() valueFormatting: (value: number) => any;
    @Input() labelFormatting: (value: string) => any = (label) => label;
    @Input() percentageFormatting: (value: number) => any = (percentage) => percentage;

    defaultValueFormatting: (value: number) => any = (value) => value.toLocaleString();

    ngOnChanges(changes: SimpleChanges): void {
        this.update();
    }

    getTotal(): number {
        return this.data.map((d) => d.value).reduce((sum, d) => sum + d, 0);
    }

    update(): void {
        this.total = this.getTotal();
        this.roundedTotal = this.total;

        this.legendItems = this.getLegendItems();
    }

    getLegendItems(): any {
        return this.data.map((d) => {
            const label = formatLabel(d.name);
            const value = d.value;
            const color = this.colors.getColor(label);
            const percentage = this.total > 0 ? (value / this.total) * 100 : 0;
            const formattedLabel = typeof this.labelFormatting === 'function' ? this.labelFormatting(label) : label;

            return {
                _value: value,
                data: d,
                value,
                color,
                label: formattedLabel,
                displayLabel: trimLabel(formattedLabel, 20),
                origialLabel: d.name,
                percentage: this.percentageFormatting
                    ? this.percentageFormatting(percentage)
                    : percentage.toLocaleString(),
            };
        });
    }

    trackBy(item) {
        return item.formattedLabel;
    }
}
