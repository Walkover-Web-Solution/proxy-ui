import {
    NgModule,
    ChangeDetectionStrategy,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import { BehaviorSubject } from 'rxjs';
import { ConvertToDigitTimeToken } from '@proxy/utils';
import { PipesTimeTokenPipeModule } from '@proxy/pipes/TimeTokenPipe';
import { MatTooltipModule } from '@angular/material/tooltip';

dayjs.extend(relativeTime);

@Component({
    selector: 'app-timeago',
    template: `
        <span *ngIf="showToolTip" [matTooltip]="time | timeToken: true" [matTooltipPosition]="toolTipPosition">
            {{ time$ | async }}
        </span>
        <span *ngIf="!showToolTip">
            {{ time$ | async }}
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeagoComponent implements OnInit, OnDestroy, OnChanges {
    @Input() public time: number;
    @Input() public showToolTip: boolean = true;
    @Input() public toolTipPosition: string = 'below';
    public time$ = new BehaviorSubject<any>(null);
    public timeago: string;
    // public tooltipTime: string;
    private interval: any;

    ngOnInit(): void {
        if (this.time) {
            // this.tooltipTime = this.tooltipDateTime(this.time);
            this.timeago = this.convertTime(this.time);
            this.time$.next(this.timeago);
            this.startInterval();
        } else {
            this.time$.next(null);
        }
    }

    startInterval = () => {
        this.interval = setInterval(() => {
            this.timeago = this.convertTime(this.time);
            this.time$.next(this.timeago);
        }, 5000);
    };

    public convertTime(value) {
        if (value) {
            return dayjs(ConvertToDigitTimeToken(value)).fromNow();
        }
        return null;
    }

    ngOnDestroy(): void {
        clearInterval(this.interval);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes.time.firstChange && changes.time.currentValue !== changes.time.previousValue) {
            clearInterval(this.interval);
            if (changes.time.currentValue) {
                this.timeago = this.convertTime(changes.time.currentValue);
                // this.tooltipTime = this.tooltipDateTime(changes.time.currentValue);
                this.time$.next(this.timeago);
                this.startInterval();
            }
        }
        if (!changes.time.currentValue && this.interval) {
            clearInterval(this.interval);
            this.time$.next(null);
        }
    }
}

@NgModule({
    imports: [CommonModule, PipesTimeTokenPipeModule, MatTooltipModule],
    declarations: [TimeagoComponent],
    exports: [TimeagoComponent],
})
export class TimeagoDirectiveModule {}
