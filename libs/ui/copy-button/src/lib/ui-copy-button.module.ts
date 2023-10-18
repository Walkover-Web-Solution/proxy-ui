import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { BehaviorSubject } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'proxy-copy-button',
    template: `
        <button
            type="button"
            mat-icon-button
            color="primary"
            [class]="btnClass"
            [cdkCopyToClipboard]="copyData"
            onclick="this.blur()"
            (click)="onCopy()"
            [ngClass]="{ 'pointer-none': copied | async }"
            [matTooltip]="tooltip"
        >
            <mat-icon
                [class]="'material-icons-outlined mat-icon-18 ' + iconClass"
                [ngClass]="{ 'text-success': copied | async }"
            >
                {{ (copied | async) ? 'done' : 'content_copy' }}
            </mat-icon>
        </button>
    `,
})
export class CopyButtonComponent {
    @Input() public copyData: any;
    @Input() public btnClass = 'icon-btn-md';
    @Input() public iconClass = '';
    @Input() private iconChangeDelay = 1000;
    @Input() public tooltip = '';

    public copied = new BehaviorSubject<boolean>(false);

    public onCopy(): void {
        this.copied.next(true);
        setTimeout(() => {
            this.copied.next(false);
        }, this.iconChangeDelay);
    }
}

@NgModule({
    declarations: [CopyButtonComponent],
    imports: [CommonModule, MatButtonModule, MatIconModule, ClipboardModule, MatTooltipModule],
    exports: [CopyButtonComponent],
})
export class UiCopyButtonModule {}
