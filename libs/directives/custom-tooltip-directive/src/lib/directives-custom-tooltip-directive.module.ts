import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomTooltipComponent } from './custom-tooltip/custom-tooltip.component';
import { CustomTooltipDirective } from './custom-tooltip/custom-tooltip.directive';

@NgModule({
    declarations: [CustomTooltipComponent, CustomTooltipDirective],
    imports: [MatTooltipModule, CommonModule, MatButtonModule, MatIconModule],
    exports: [CustomTooltipComponent, CustomTooltipDirective],
})
export class DirectivesCustomTooltipDirectiveModule {}
