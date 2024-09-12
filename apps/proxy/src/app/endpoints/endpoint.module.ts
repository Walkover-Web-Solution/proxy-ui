import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EndpointsComponent } from './env-projects/env-project.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UiComponentsSearchModule } from '../../../../../libs/ui/search/src/lib/ui-components-search.module';
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
import { UiNoRecordFoundModule } from '@proxy/ui/no-record-found';
import { UiMatPaginatorGotoModule } from '@proxy/ui/mat-paginator-goto';
import { UiLoaderModule } from '@proxy/ui/loader';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NewMethodDialogComponent } from './new-method-dialog/new-method-dialog.component';
import { ServicesProxyEndpointModule } from '@proxy/services/proxy/endpoint';
import { DirectivesSkeletonModule } from '@proxy/directives/skeleton';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

const routes: Routes = [
    {
        path: '',
        component: EndpointsComponent,
        pathMatch: 'full',
    },
    {
        path: ':projectId/:projectName',
        loadChildren: () => import('./endpoint-list/endpoint-list.module').then((p) => p.EndpointListModule),
    },
    {
        path: ':projectId/:projectName/create',
        loadChildren: () => import('./create-endpoint/create-endpoint.module').then((p) => p.CreateEndpointModule),
    },
    {
        path: ':projectName/:projectSlug/:projectId/:envProjectId/update/:endpointId',
        loadChildren: () => import('./create-endpoint/create-endpoint.module').then((p) => p.CreateEndpointModule),
    },
];

@NgModule({
    declarations: [EndpointsComponent, NewMethodDialogComponent],
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
        MatSelectModule,
        MatCheckboxModule,
        MatDividerModule,
        MatDialogModule,
        UiNoRecordFoundModule,
        UiMatPaginatorGotoModule,
        UiLoaderModule,
        UiComponentsSearchModule,
        MatAutocompleteModule,
        ServicesProxyEndpointModule,
        DirectivesSkeletonModule,
        MatSlideToggleModule,
        MatTooltipModule,
    ],
    exports: [RouterModule],
})
export class EndpointModule {}
