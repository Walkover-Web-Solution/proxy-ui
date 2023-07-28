import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from './qr-code.component';

@NgModule({
    declarations: [QRCodeComponent],
    imports: [CommonModule],
    exports: [QRCodeComponent],
})
export class UiComponentsQrCodeModule {}
