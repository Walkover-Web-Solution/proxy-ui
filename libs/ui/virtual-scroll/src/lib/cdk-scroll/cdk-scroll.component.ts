import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { DEBOUNCE_TIME } from '@proxy/constant';

@Component({
    selector: 'proxy-cdk-scroll',
    templateUrl: './cdk-scroll.component.html',
})
export class CDKScrollComponent implements OnInit {
    @ViewChild(CdkScrollable) public scrollableWrapper: CdkScrollable | undefined;
    /** Scrollable element ID, provided to avoid multiple event triggering when
     * same page has multiple instances of proxy-cdk-scroll component
     */
    @Input() public scrollableElementId = 'scrollableWrapper';
    @Output() public fetchNextPage: EventEmitter<string> = new EventEmitter();
    private destroy$: Subject<any> = new Subject();

    constructor(private sd: ScrollDispatcher) {}

    public ngOnInit(): void {
        this.sd
            .scrolled()
            .pipe(debounceTime(DEBOUNCE_TIME), takeUntil(this.destroy$))
            .subscribe((res) => {
                if (
                    res &&
                    (res.getElementRef().nativeElement.id === 'scrollableWrapper' ||
                        res.getElementRef().nativeElement.id === this.scrollableElementId) &&
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
