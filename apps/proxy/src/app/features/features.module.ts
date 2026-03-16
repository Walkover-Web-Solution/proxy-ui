import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { UiComponentsSearchModule } from '@proxy/ui/search';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { UiNoRecordFoundModule } from '@proxy/ui/no-record-found';
import { UiMatPaginatorGotoModule } from '@proxy/ui/mat-paginator-goto';
import { UiLoaderModule } from '@proxy/ui/loader';
import { FeatureComponent } from './feature/feature.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatListModule } from '@angular/material/list';
import { ServicesProxyFeaturesModule } from '@proxy/services/proxy/features';
import { DirectivesSkeletonModule } from '@proxy/directives/skeleton';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiCopyButtonModule } from '@proxy/ui/copy-button';
import { UiConfirmDialogModule } from '@proxy/ui/confirm-dialog';
// Component
const routes: Routes = [
    {
        path: '',
        component: FeatureComponent,
        pathMatch: 'full',
    },
    {
        path: 'create',
        loadChildren: () => import('./create-feature/create-feature.module').then((p) => p.CreateFeatureModule),
    },
    {
        path: 'manage/:id',
        loadChildren: () => import('./create-feature/create-feature.module').then((p) => p.CreateFeatureModule),
    },
];

@NgModule({
    declarations: [FeatureComponent],
    imports: [
        FormsModule,
        CommonModule,
        RouterModule.forChild(routes),
        MatCardModule,
        MatButtonModule,
        MatInputModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatTableModule,
        UiNoRecordFoundModule,
        UiMatPaginatorGotoModule,
        UiComponentsSearchModule,
        MatStepperModule,
        MatListModule,
        ServicesProxyFeaturesModule,
        DirectivesSkeletonModule,
        MatTooltipModule,
        UiLoaderModule,
        UiCopyButtonModule,
        UiConfirmDialogModule,
    ],
    exports: [RouterModule],
})
export class FeaturesModule {}
