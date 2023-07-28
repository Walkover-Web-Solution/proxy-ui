import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoNetworkConnection } from './no-network.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    declarations: [NoNetworkConnection],
    imports: [CommonModule, MatIconModule, MatButtonModule],
    exports: [NoNetworkConnection],
})
export class UiNoNetworkModule {}
