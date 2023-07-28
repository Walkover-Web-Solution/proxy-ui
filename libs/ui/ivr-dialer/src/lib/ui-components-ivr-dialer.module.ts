import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IvrDialerComponent } from './ivr-dialer/ivr-dialer.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [CommonModule, MatRippleModule, MatIconModule, MatButtonModule, MatInputModule, FormsModule],
    declarations: [IvrDialerComponent],
    exports: [IvrDialerComponent],
})
export class UiComponentsIvrDialerModule {}
