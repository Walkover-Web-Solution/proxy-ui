import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class VoiceLibServiceModule {}
