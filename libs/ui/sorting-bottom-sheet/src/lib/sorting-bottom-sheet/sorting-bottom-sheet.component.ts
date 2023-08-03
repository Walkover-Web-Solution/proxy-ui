import { AfterViewInit, Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
interface ISortColumn {
    key: string;
    columnName: string;
    value: 'asc' | 'desc';
}
@Component({
    selector: 'proxy-sorting-bottom-sheet',
    templateUrl: './sorting-bottom-sheet.component.html',
    styleUrls: ['./sorting-bottom-sheet.component.scss'],
})
export class SortingBottomSheetComponent implements AfterViewInit {
    public sortColumns = [];
    public updatedSortObj: ISortColumn;

    constructor(
        private _bottomSheetRef: MatBottomSheetRef<SortingBottomSheetComponent>,
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
    ) {}

    public ngAfterViewInit(): void {
        for (let a of this.data?.columnsName) {
            this.sortColumns.push({
                key: a,
                columnName: a.replaceAll('_', ' '),
                value: this.data?.sortBy === a ? this.data?.sortOrder : null,
            });
        }
    }

    public applySorting(): void {
        this._bottomSheetRef.dismiss(this.updatedSortObj);
    }

    public updateSortValue(sort: ISortColumn, index: any): void {
        this.sortColumns.forEach((key, i) => {
            if (index != i) {
                key.value = null;
            }
        });
        this.updatedSortObj = sort;
    }

    public closeSortingBottomSheet(): void {
        this._bottomSheetRef.dismiss(null);
    }
}
