import { AsyncPipe } from '@angular/common';
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { BehaviorSubject } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'proxy-copy-button',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AsyncPipe, MatButtonModule, MatIconModule, ClipboardModule, MatTooltipModule],
    template: `
        <button
            type="button"
            mat-icon-button
            color="primary"
            [class]="btnClass()"
            [cdkCopyToClipboard]="copyData()"
            onclick="this.blur()"
            (click)="onCopy()"
            [class.pointer-events-none]="copied | async"
            [matTooltip]="tooltip()"
        >
            <mat-icon
                [class]="'material-icons-outlined mat-icon-18 ' + iconClass()"
                [class.text-success]="copied | async"
            >
                {{ (copied | async) ? 'done' : 'content_copy' }}
            </mat-icon>
        </button>
    `,
})
export class CopyButtonComponent {
    copyData = input<any>();
    btnClass = input<string>('icon-btn-md !inline-flex justify-center items-center');
    iconClass = input<string>('');
    iconChangeDelay = input<number>(1000);
    tooltip = input<string>('');

    public copied = new BehaviorSubject<boolean>(false);

    public onCopy(): void {
        this.copied.next(true);
        setTimeout(() => {
            this.copied.next(false);
        }, this.iconChangeDelay());
    }
}
