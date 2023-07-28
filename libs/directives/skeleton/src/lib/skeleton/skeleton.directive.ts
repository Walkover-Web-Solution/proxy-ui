import { Directive, Input, OnChanges, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { random } from 'lodash-es';
import { Subject } from 'rxjs';
import { SkeletonComponent } from './skeleton.component';

@Directive({ selector: '[skeleton]' })
export class SkeletonDirective implements OnChanges {
    /** skeleton show/hide */
    @Input('skeleton') isLoading: boolean = false;
    /** number to how many skeleton render */
    @Input('skeletonRepeat') size: number = 1;
    /** width of skeleton */
    @Input('skeletonWidth') width: string;
    /** height of skeleton */
    @Input('skeletonHeight') height: string;
    /** class name which direct apply to skeleton */
    @Input('skeletonClassName') className: string | string[];

    /** Subject to unsubscribe from the listeners */
    private destroy$: Subject<boolean> = new Subject();

    constructor(private templateRef: TemplateRef<any>, private viewContainerRef: ViewContainerRef) {}

    ngOnChanges(changes: SimpleChanges) {
        // check isLoading is passed as directive input param.
        if (changes.isLoading) {
            // console.log('changes.isLoading', JSON.parse(JSON.stringify(changes.isLoading)))
            // clear old view container
            this.viewContainerRef.clear();
            /**
             * check isLoading value
             */
            if (changes.isLoading.currentValue) {
                Array.from({ length: this.size }).forEach(() => {
                    const ref = this.viewContainerRef.createComponent(SkeletonComponent);
                    Object.assign(ref.instance, {
                        width: this.width === 'rand' ? `${random(30, 90)}%` : this.width,
                        height: this.height,
                        className: this.className,
                    });
                });
            } else {
                this.viewContainerRef.createEmbeddedView(this.templateRef);
            }
        }
    }

    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
}
