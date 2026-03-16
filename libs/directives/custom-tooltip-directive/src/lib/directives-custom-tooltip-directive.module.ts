import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { CustomTooltipComponent } from './custom-tooltip/custom-tooltip.component';
import { CustomTooltipDirective } from './custom-tooltip/custom-tooltip.directive';

@NgModule({
    declarations: [CustomTooltipComponent, CustomTooltipDirective],
    imports: [MatTooltipModule, CommonModule, MatButtonModule, MatIconModule],
    exports: [CustomTooltipComponent, CustomTooltipDirective],
})
export class DirectivesCustomTooltipDirectiveModule {}
