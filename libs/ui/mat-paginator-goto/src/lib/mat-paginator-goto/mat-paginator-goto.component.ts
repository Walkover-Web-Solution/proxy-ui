import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelect, MAT_SELECT_CONFIG } from '@angular/material/select';
import { SHOW_PAGINATOR_LENGTH } from '@proxy/constant';

@Component({
    selector: 'mat-paginator-goto',
    templateUrl: './mat-paginator-goto.component.html',
    styleUrls: ['./mat-paginator-goto.component.scss'],
    providers: [
        {
            provide: MAT_SELECT_CONFIG,
            useValue: { overlayPanelClass: 'custom-mat-paginator' },
        },
    ],
})
export class MatPaginatorGotoComponent implements OnInit {
    pageSize: number;
    pageIndex: number;
    length: number;
    goTo: number;
    pageNumbers: number[];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(CdkVirtualScrollViewport, { static: false }) cdkVirtualScrollViewPort: CdkVirtualScrollViewport;
    @ViewChild('goToDropdown', { read: MatSelect, static: false }) goToDropdown: MatSelect;
    @Input() disabled: boolean = false;
    @Input() hidePageSize: boolean = false;
    @Input() pageSizeOptions: number[];
    @Input() showFirstLastButtons: boolean = false;
    @Input() enableVirtualScroll: boolean;
    @Input() itemSize: number = 35;
    @Input() hidePaginationArrows: boolean = false;
    @Output() page = new EventEmitter<PageEvent>();
    minWidth: number = 64;
    public showPaginatorLength = SHOW_PAGINATOR_LENGTH;

    @Input('pageIndex') set pageIndexChanged(pageIndex: number) {
        this.pageIndex = pageIndex;
        this.updateGoto(!this.enableVirtualScroll);
    }

    @Input('length') set lengthChanged(length: number) {
        this.length = length;
        this.updateGoto();
    }

    @Input('pageSize') set pageSizeChanged(pageSize: number) {
        this.pageSize = pageSize;
        this.updateGoto();
    }

    ngOnInit() {
        this.updateGoto();
    }

    updateGoto(shouldRecreate: boolean = true) {
        this.goTo = (this.pageIndex || 0) + 1;
        if (shouldRecreate) {
            this.pageNumbers = [];
            for (let i = 1; i <= Math.ceil(this.length / this.pageSize); i++) {
                this.pageNumbers.push(i);
            }
            this.enableVirtualScroll = this.pageNumbers?.length > 100;
            if (this.enableVirtualScroll) {
                /*  Need to manually open and close the mat-select dropdown when virtual
                    scroll is used as the virtual scroll doesn't load all the mat-option
                    at runtime and therefore 'Go To' mat-select could not get the selected
                    option when number of options are of the order of >= 10k. Due to this mat-select
                    shows blank value as selection when page is changed even when 'goTo' variable has value.

                    Opening the mat-select causes the virtual scroll to load the mat-option which
                    triggers the mat-select event 'openedChange' which is handled in openChange() method
                    that scrolls to the selected index and thus the correct option appears selected in
                    the dropdown.

                    It is an open issue on Angular repo:
                    https://github.com/angular/components/issues/10122
                    https://github.com/angular/components/issues/16352
                */
                setTimeout(() => {
                    this.goToDropdown?.open();
                }, 0);
            }
            setTimeout(() => {
                if (this.enableVirtualScroll) {
                    this.openChange(true);
                    this.goToDropdown?.close();
                }
            }, 50);
        }
    }

    paginationChange(pageEvt: PageEvent) {
        this.length = pageEvt.length;
        this.pageIndex = pageEvt.pageIndex;
        this.pageSize = pageEvt.pageSize;
        this.updateGoto(!this.enableVirtualScroll);
        this.emitPageEvent(pageEvt);
        let tableRef = document.querySelector('.table-scroll');
        if (tableRef) {
            tableRef.scroll(0, 0);
            tableRef = null;
        }
    }

    goToChange() {
        this.paginator.pageIndex = this.goTo - 1;
        const event: PageEvent = {
            length: this.paginator.length,
            pageIndex: this.paginator.pageIndex,
            pageSize: this.paginator.pageSize,
        };
        this.emitPageEvent(event);

        // Dynamic with of pagination
        if ((this.paginator.pageIndex + 1).toString().length > 3) {
            this.minWidth = (this.paginator.pageIndex + 1).toString().length * 16;
        } else {
            this.minWidth = 64;
        }
    }

    emitPageEvent(pageEvent: PageEvent) {
        this.page.next(pageEvent);
    }

    openChange(event: boolean): void {
        if (event) {
            this.cdkVirtualScrollViewPort?.scrollToIndex(
                this.paginator.pageIndex - 5 < 0 ? 0 : this.paginator.pageIndex - 5
            );
            this.cdkVirtualScrollViewPort?.checkViewportSize();
        }
    }
}
