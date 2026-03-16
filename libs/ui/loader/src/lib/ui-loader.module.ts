import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader.component';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

@NgModule({
    declarations: [LoaderComponent],
    imports: [CommonModule, MatProgressSpinnerModule],
    exports: [LoaderComponent],
})
export class UiLoaderModule {}
