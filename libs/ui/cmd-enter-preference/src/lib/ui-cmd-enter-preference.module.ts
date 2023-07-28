import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmdEnterPreferenceComponent, CmdEnterPreferenceService } from './cmd-enter-preference';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
    declarations: [CmdEnterPreferenceComponent],
    imports: [CommonModule, MatTooltipModule],
    exports: [CmdEnterPreferenceComponent],
    providers: [CmdEnterPreferenceService],
})
export class UiCmdEnterPreferenceModule {}
