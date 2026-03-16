import { RouterModule, Routes } from '@angular/router';
import { LogComponent } from './log/log.component';
import { NgModule } from '@angular/core';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { CommonModule } from '@angular/common';
import { UiComponentsSearchModule } from '@proxy/ui/search';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { UiDateRangePickerModule } from '@proxy/date-range-picker';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { ServicesProxyLogsModule } from '@proxy/services/proxy/logs';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { UiNoRecordFoundModule } from '@proxy/ui/no-record-found';
import { DirectivesRemoveCharacterDirectiveModule } from '@proxy/directives/RemoveCharacterDirective';
import { UiMatPaginatorGotoModule } from '@proxy/ui/mat-paginator-goto';
import { LogsDetailsSideDialogComponent } from './log-details-side-dialog/log-details-side-dialog.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { UiLoaderModule } from '@proxy/ui/loader';
import { UiVirtualScrollModule } from '@proxy/ui/virtual-scroll';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';

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
        ServicesProxyLogsModule,
        MatSortModule,
        MatCheckboxModule,
        MatDividerModule,
        MatDialogModule,
        UiDateRangePickerModule,
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
