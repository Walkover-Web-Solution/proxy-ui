import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CDKScrollModule } from './cdk-scroll/cdk-scroll.module';

@NgModule({
    imports: [CommonModule, CDKScrollModule],
    exports: [CDKScrollModule],
})
export class UiVirtualScrollModule {}
