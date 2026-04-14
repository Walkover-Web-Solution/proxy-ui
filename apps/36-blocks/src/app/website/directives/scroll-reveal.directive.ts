import { Directive, ElementRef, Input, OnDestroy, OnInit, inject } from '@angular/core';

@Directive({
    selector: '[wsReveal]',
    standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
    @Input() public wsReveal: 'up' | 'down' | 'left' | 'right' | 'scale' | '' = 'up';
    @Input() public wsRevealThreshold: number = 0.12;

    private readonly elementRef = inject(ElementRef<HTMLElement>);
    private intersectionObserver: IntersectionObserver | null = null;

    public ngOnInit(): void {
        const element = this.elementRef.nativeElement;
        element.classList.add('ws-reveal');
        if (this.wsReveal) {
            element.classList.add(`ws-reveal--${this.wsReveal}`);
        }

        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        this.intersectionObserver?.unobserve(entry.target);
                    }
                });
            },
            { threshold: this.wsRevealThreshold }
        );

        this.intersectionObserver.observe(element);
    }

    public ngOnDestroy(): void {
        this.intersectionObserver?.disconnect();
        this.intersectionObserver = null;
    }
}
