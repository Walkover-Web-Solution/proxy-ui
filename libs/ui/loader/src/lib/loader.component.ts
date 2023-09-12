import { Component, Input, TemplateRef } from '@angular/core';

@Component({
    selector: 'proxy-loader',
    template: `
        <div class="h-100 content-loader">
            <div class="loading-box">
                <mat-spinner></mat-spinner>
                <span>{{ message }}</span>
            </div>
        </div>
    `,
})
export class LoaderComponent {
    @Input() public message: string = 'Loading...';
}
