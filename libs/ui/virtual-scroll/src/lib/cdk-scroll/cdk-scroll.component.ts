import { CdkScrollable, ScrollDispatcher, ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, input, output, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { DEBOUNCE_TIME } from '@proxy/constant';

@Component({
    selector: 'proxy-cdk-scroll',
    imports: [ScrollingModule],
    templateUrl: './cdk-scroll.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CDKScrollComponent implements OnInit {
    @ViewChild(CdkScrollable) public scrollableWrapper: CdkScrollable | undefined;
    /** Scrollable element ID, provided to avoid multiple event triggering when
     * same page has multiple instances of proxy-cdk-scroll component
     */
    public scrollableElementId = input<string>('scrollableWrapper');
    public fetchNextPage = output<string>();
    private destroy$: Subject<any> = new Subject();
    private sd = inject(ScrollDispatcher);

    public ngOnInit(): void {
        this.sd
            .scrolled()
            .pipe(debounceTime(DEBOUNCE_TIME), takeUntil(this.destroy$))
            .subscribe((res) => {
                if (
                    res &&
                    (res.getElementRef().nativeElement.id === 'scrollableWrapper' ||
                        res.getElementRef().nativeElement.id === this.scrollableElementId()) &&
                    res.measureScrollOffset('bottom') <= 30 &&
                    res.measureScrollOffset('top')
                ) {
                    this.fetchNextPage.emit(res.getElementRef().nativeElement.id);
                }
            });
    }

    public ngOnDestroy(): void {
        if (this.destroy$) {
            this.destroy$.next(true);
            this.destroy$.complete();
        }
    }
}
