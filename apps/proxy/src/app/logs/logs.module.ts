import { RouterModule, Routes } from '@angular/router';
import { LogComponent } from './log/log.component';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { UiComponentsSearchModule } from '@proxy/ui/search';
import { MatSelectModule } from '@angular/material/select';
import { UiDateRangePickerModule } from '@proxy/date-range-picker';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { ServicesProxyLogsModule } from '@proxy/services/proxy/logs';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { UiNoRecordFoundModule } from '@proxy/ui/no-record-found';
import { DirectivesRemoveCharacterDirectiveModule } from '@proxy/directives/RemoveCharacterDirective';
import { UiMatPaginatorGotoModule } from '@proxy/ui/mat-paginator-goto';
import { LogsDetailsSideDialogComponent } from './log-details-side-dialog/log-details-side-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { UiLoaderModule } from '@proxy/ui/loader';
import { UiVirtualScrollModule } from '@proxy/ui/virtual-scroll';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

const routes: Routes = [
    {
        path: '',
        component: LogComponent,
        data: { title: 'Logs' },
        pathMatch: 'full',
    },
];

@NgModule({
    declarations: [LogComponent, LogsDetailsSideDialogComponent],
    imports: [
        FormsModule,
        CommonModule,
        RouterModule.forChild(routes),
        MatCardModule,
        MatButtonModule,
        MatInputModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatMenuModule,
        MatIconModule,
        MatTableModule,
        MatMenuModule,
        MatSortModule,
        MatCheckboxModule,
        MatDividerModule,
        MatDialogModule,
        UiDateRangePickerModule,
        ServicesProxyLogsModule,
        UiNoRecordFoundModule,
        UiMatPaginatorGotoModule,
        UiLoaderModule,
        UiComponentsSearchModule,
        DirectivesRemoveCharacterDirectiveModule,
        UiVirtualScrollModule,
        MatAutocompleteModule,
    ],
    exports: [RouterModule],
})
export class LogsModule {}
