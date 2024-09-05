import { RouterModule, Routes } from '@angular/router';
import { EndpointListComponent } from './endpoint-list.component';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { UiComponentsSearchModule } from '@proxy/ui/search';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { UiMatPaginatorGotoModule } from '@proxy/ui/mat-paginator-goto';
import { MatSelectModule } from '@angular/material/select';
import { UiNoRecordFoundModule } from '@proxy/ui/no-record-found';
import { DirectivesSkeletonModule } from '@proxy/directives/skeleton';

const routes: Routes = [
    {
        path: '',
        component: EndpointListComponent,
        pathMatch: 'full',
    },
];

@NgModule({
    declarations: [EndpointListComponent],
    imports: [
        FormsModule,
        CommonModule,
        MatIconModule,
        RouterModule.forChild(routes),
        MatCardModule,
        MatButtonModule,
        UiComponentsSearchModule,
        MatTableModule,
        MatFormFieldModule,
        MatMenuModule,
        MatInputModule,
        ReactiveFormsModule,
        UiMatPaginatorGotoModule,
        MatSelectModule,
        UiNoRecordFoundModule,
        DirectivesSkeletonModule,
    ],
    exports: [RouterModule],
})
export class EndpointListModule {}
