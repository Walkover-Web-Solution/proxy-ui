import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'proxy-loader',
    imports: [MatProgressSpinnerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div
            class="h-screen content-loader absolute flex justify-center items-center bg-transparent top-0 left-0 right-0 bottom-0 bg-color rounded-lg"
        >
            <div class="loading-box flex items-center gap-4">
                <mat-spinner></mat-spinner>
                <span class="text-color">{{ message() }}</span>
            </div>
        </div>
    `,
})
export class LoaderComponent {
    public message = input<string>('Loading...');
}
