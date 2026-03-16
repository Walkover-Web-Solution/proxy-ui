import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { PrimeNgToastComponent } from './prime-ng-toast/prime-ng-toast.component';
import { PrimeNgToastService } from './prime-ng-toast.service';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { ButtonModule } from 'primeng/button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
    declarations: [PrimeNgToastComponent],
    imports: [CommonModule, ToastModule, RippleModule, ButtonModule, MatIconModule, MatButtonModule, MatTooltipModule],
    exports: [PrimeNgToastComponent],
    providers: [PrimeNgToastService],
})
export class UiPrimeNgToastModule {}
