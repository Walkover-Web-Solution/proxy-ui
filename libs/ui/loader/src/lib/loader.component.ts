import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'proxy-loader',
    imports: [MatProgressSpinnerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="h-100 content-loader">
            <div class="loading-box">
                <mat-spinner></mat-spinner>
                <span>{{ message() }}</span>
            </div>
        </div>
    `,
})
export class LoaderComponent {
    public message = input<string>('Loading...');
}
