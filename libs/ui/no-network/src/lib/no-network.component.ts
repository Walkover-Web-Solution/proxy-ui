import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'proxy-no-network-connection',
    template: ` <div
            class="mat-right-dialog-header logs-details-header d-flex align-items-center justify-content-end"
            *ngIf="data?.showCloseButton"
        >
            <button mat-icon-button mat-dialog-close color="primary" (click)="dialogRef.close()">
                <mat-icon>close</mat-icon>
            </button>
        </div>
        <div mat-dialog-content style="margin: 42px 0;">
            <div class="d-flex justify-content-center mb-20">
                <mat-icon class="network-off-icon">wifi_off</mat-icon>
            </div>
            <h2 class="text-center"><strong>No network connection!</strong></h2>
            <p class="text-center">
                Your network is not connected. The application cannot be used without an active connection.
            </p>
        </div>`,
    styles: [
        `
            .network-off-icon {
                height: 80px;
                width: 80px;
                font-size: 52px;
                background-color: #ff000017;
                border-radius: 100%;
                color: #d70000;
                padding: 16px;
            }
        `,
    ],
})
export class NoNetworkConnection {
    constructor(public dialogRef: MatDialogRef<NoNetworkConnection>, @Inject(MAT_DIALOG_DATA) public data) {}
}
