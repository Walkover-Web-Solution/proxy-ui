import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlowConfigurationData } from './flow-configuration.pipe';
import { FlowConnectionPath } from './flow-connection-path.pipe';

@NgModule({
    imports: [CommonModule],
    declarations: [FlowConnectionPath, FlowConfigurationData],
    exports: [FlowConnectionPath, FlowConfigurationData],
    providers: [FlowConnectionPath, FlowConfigurationData],
})
export class PipesFlowModule {}
