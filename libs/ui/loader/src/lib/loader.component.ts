import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'proxy-loader',
    imports: [MatProgressSpinnerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="h-screen content-loader flex justify-center items-center bg-transparent">
            <div class="flex gap-4 items-center loading-box p-1.5 rounded-lg bg-color">
                <mat-spinner></mat-spinner>
                <span class="text-color">{{ message() }}</span>
            </div>
        </div>
    `,
})
export class LoaderComponent {
    public message = input<string>('Loading...');
}
