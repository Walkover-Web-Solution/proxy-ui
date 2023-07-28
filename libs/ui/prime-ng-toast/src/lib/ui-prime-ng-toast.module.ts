import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { PrimeNgToastComponent } from './prime-ng-toast/prime-ng-toast.component';
import { PrimeNgToastService } from './prime-ng-toast.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ButtonModule } from 'primeng/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
    declarations: [PrimeNgToastComponent],
    imports: [CommonModule, ToastModule, RippleModule, ButtonModule, MatIconModule, MatButtonModule, MatTooltipModule],
    exports: [PrimeNgToastComponent],
    providers: [PrimeNgToastService],
})
export class UiPrimeNgToastModule {}
