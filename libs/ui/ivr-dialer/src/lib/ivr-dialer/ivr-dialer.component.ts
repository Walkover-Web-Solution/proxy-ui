import { BaseComponent } from '@proxy/ui/base-component';
import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'proxy-ivr-dialer',
    templateUrl: './ivr-dialer.component.html',
    styleUrls: ['./ivr-dialer.component.scss'],
})
export class IvrDialerComponent extends BaseComponent implements OnDestroy {
    @Output() sendDTMF = new EventEmitter<number>();
    public dtmfInput = '';

    constructor(public dialogRef: MatDialogRef<IvrDialerComponent>) {
        super();
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public digitClicked(event): void {
        this.dtmfInput += event.srcElement.id;
        this.sendDTMF.emit(event.srcElement.id);
    }

    public onNoClick() {
        this.dialogRef.close();
    }
}
