import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Usage: <proxy-progress-bar />
 * Indeterminate loading bar, replaces mat-progress-bar.
 */
@Component({
    selector: 'proxy-progress-bar',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div
            class="w-full overflow-hidden h-1 bg-indigo-100"
            role="progressbar"
            aria-label="Loading"
            aria-valuemin="0"
            aria-valuemax="100"
        >
            <div class="h-full bg-indigo-600 animate-[indeterminate_1.5s_ease-in-out_infinite]"></div>
        </div>
    `,
    styles: [
        `
            @keyframes indeterminate {
                0% {
                    transform: translateX(-100%) scaleX(0.3);
                }
                50% {
                    transform: translateX(25%) scaleX(0.6);
                }
                100% {
                    transform: translateX(100%) scaleX(0.3);
                }
            }
        `,
    ],
})
export class ProgressBarComponent {}
