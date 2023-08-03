import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { SmsPreviewComponent } from './sms-preview/sms-preview.component';
import { EmailPreviewComponent } from './email-preview/email-preview.component';
import { WhatsappPreviewComponent } from './whatsapp-preview/whatsapp-preview.component';
import { PipesReplaceModule } from '@proxy/pipes/replace';

@NgModule({
    imports: [CommonModule, MatCardModule, MatButtonModule, PipesReplaceModule],
    declarations: [SmsPreviewComponent, EmailPreviewComponent, WhatsappPreviewComponent],
    exports: [SmsPreviewComponent, EmailPreviewComponent, WhatsappPreviewComponent],
})
export class UiComponentsTemplatePreviewModule {}
