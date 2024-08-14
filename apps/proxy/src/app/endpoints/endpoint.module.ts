import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EndpointsComponent } from './endpoints.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UiComponentsSearchModule } from '../../../../../libs/ui/search/src/lib/ui-components-search.module';
import { BrowserModule } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { UiDateRangePickerModule } from '@proxy/date-range-picker';
import { ServicesProxyLogsModule } from '@proxy/services/proxy/logs';
import { UiNoRecordFoundModule } from '@proxy/ui/no-record-found';
import { UiMatPaginatorGotoModule } from '@proxy/ui/mat-paginator-goto';
import { UiLoaderModule } from '@proxy/ui/loader';
import { DirectivesRemoveCharacterDirectiveModule } from '@proxy/directives/RemoveCharacterDirective';
import { UiVirtualScrollModule } from '@proxy/ui/virtual-scroll';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CreateEndpointComponent } from './create-endpoint/create-endpoint.component';

const routes: Routes = [
    {
        path: '',
        component: EndpointsComponent,

        pathMatch: 'full',
    },
    {
        path: 'create',
        loadChildren: () => import('./create-endpoint/create-endpoint.module').then((p) => p.CreateEndpointModule),
    },
];

@NgModule({
    declarations: [EndpointsComponent],
    imports: [
        FormsModule,
        CommonModule,
        MatCardModule,
        RouterModule.forChild(routes),
        MatIconModule,
        MatButtonModule,
        UiComponentsSearchModule,
        MatTableModule,
        MatFormFieldModule,
        MatMenuModule,
        MatSortModule,
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
export class EndpointModule {}
