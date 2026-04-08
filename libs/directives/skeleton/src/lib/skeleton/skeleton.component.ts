import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';

@Component({
    selector: 'skeleton-rect',
    host: {
        'class': 'shimmer-loading',
    },
    template: ``,
    styleUrls: ['./skeleton.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [
        `
            :host {
                display: block;
                width: var(--skeleton-rect-width);
                height: var(--skeleton-rect-height);
            }
        `,
    ],
})
export class SkeletonComponent {
    width: string;
    height: string;
    className: string | string[];

    private host = inject(ElementRef<HTMLElement>);

    ngOnInit() {
        const host = this.host.nativeElement;

        if (this.className) {
            const classes = typeof this.className === 'string' ? [this.className] : this.className;
            host.classList.add(...classes);
        }

        host.style.setProperty('--skeleton-rect-width', this.width ?? '100%');
        host.style.setProperty('--skeleton-rect-height', this.height ?? '20px');
    }
}
