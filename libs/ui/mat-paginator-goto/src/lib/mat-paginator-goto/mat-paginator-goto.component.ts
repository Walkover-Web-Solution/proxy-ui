import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelect, MAT_SELECT_CONFIG } from '@angular/material/select';
import { SHOW_PAGINATOR_LENGTH } from '@proxy/constant';

@Component({
    selector: 'mat-paginator-goto',
    imports: [CommonModule, MatPaginatorModule, MatFormFieldModule, MatSelectModule, FormsModule, ScrollingModule],
    templateUrl: './mat-paginator-goto.component.html',
    styleUrls: ['./mat-paginator-goto.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
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
    disabled = input<boolean>(false);
    hidePageSize = input<boolean>(false);
    pageSizeOptions = input<number[]>();
    showFirstLastButtons = input<boolean>(false);
    enableVirtualScroll: boolean;
    itemSize = input<number>(35);
    hidePaginationArrows = input<boolean>(false);
    page = output<PageEvent>();
    minWidth: number = 64;
    public showPaginatorLength = SHOW_PAGINATOR_LENGTH;

    constructor() {
        effect(() => {
            const pageIndex = this.pageIndexInput();
            if (pageIndex !== undefined) {
                this.pageIndex = pageIndex;
                this.updateGoto(!this.enableVirtualScroll);
            }
        });

        effect(() => {
            const length = this.lengthInput();
            if (length !== undefined) {
                this.length = length;
                this.updateGoto();
            }
        });

        effect(() => {
            const pageSize = this.pageSizeInput();
            if (pageSize !== undefined) {
                this.pageSize = pageSize;
                this.updateGoto();
            }
        });
    }

    pageIndexInput = input<number>(undefined, { alias: 'pageIndex' });
    lengthInput = input<number>(undefined, { alias: 'length' });
    pageSizeInput = input<number>(undefined, { alias: 'pageSize' });

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
        this.page.emit(pageEvent);
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
