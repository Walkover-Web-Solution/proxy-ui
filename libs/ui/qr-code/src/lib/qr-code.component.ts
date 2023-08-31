import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';

declare var QRious;

@Component({
    selector: 'proxy-qr-code',
    template: '<canvas id="qr-code" style="height: 200px !important; width: 200px !important;"></canvas>',
})
export class QRCodeComponent extends BaseComponent implements OnInit {
    @Input() qrContent: string;

    constructor() {
        super();
    }

    ngOnInit(): void {
        let head = document.getElementsByTagName('head')[0];
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.onload = () => {
            this.generateQR();
        };
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
        head.appendChild(script);
    }

    public generateQR(): void {
        if (this.qrContent) {
            var qr;
            qr = new QRious({
                element: document.getElementById('qr-code'),
                size: 200,
                value: this.qrContent,
            });
        }
    }
}
