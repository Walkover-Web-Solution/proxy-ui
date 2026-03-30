import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Usage: <proxy-spinner [size]="'md'" />
 * sizes: sm (16px) | md (24px) | lg (32px)
 */
@Component({
    selector: 'proxy-spinner',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <svg
            class="animate-spin text-indigo-600"
            [class]="sizeClass()"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
    `,
})
export class SpinnerComponent {
    readonly size = input<'sm' | 'md' | 'lg'>('md');

    sizeClass(): string {
        return { sm: 'size-4', md: 'size-6', lg: 'size-8' }[this.size()];
    }
}
