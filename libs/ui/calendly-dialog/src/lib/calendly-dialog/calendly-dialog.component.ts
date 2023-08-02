import { BaseComponent } from '@proxy/ui/base-component';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';

@Component({
    selector: 'proxy-calendly-dialog',
    templateUrl: './calendly-dialog.component.html',
    styleUrls: ['./calendly-dialog.component.scss'],
})
export class CalendlyDialogComponent extends BaseComponent implements OnInit {
    constructor(
        public dialogRef: MatDialogRef<CalendlyDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private toast: PrimeNgToastService
    ) {
        super();
    }

    ngOnInit(): void {
        this.loadExternalStyles('https://assets.calendly.com/assets/external/widget.css');

        let head = document.getElementsByTagName('head')[0];
        let checkoutScript = document.createElement('script');
        checkoutScript.type = 'text/javascript';
        checkoutScript.onload;
        checkoutScript.src = 'https://assets.calendly.com/assets/external/widget.js';
        head.appendChild(checkoutScript);
    }

    private loadExternalStyles(styleUrl: string) {
        return new Promise((resolve, reject) => {
            const styleElement = document.createElement('link');
            styleElement.href = styleUrl;
            styleElement.onload = resolve;
            document.head.appendChild(styleElement);
        });
    }
    public copyDetails() {
        this.toast.success('Copied!');
    }
}
