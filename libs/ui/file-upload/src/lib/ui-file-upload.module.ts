import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { MatIconModule } from '@angular/material/icon';
import { UploadAttachedFilePreviewComponent } from './upload-attached-file-preview/upload-attached-file-preview.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    imports: [CommonModule, MatIconModule, MatButtonModule],
    declarations: [FileUploadComponent, UploadAttachedFilePreviewComponent],
    exports: [FileUploadComponent, UploadAttachedFilePreviewComponent],
})
export class UiFileUploadModule {}
