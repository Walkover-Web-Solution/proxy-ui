import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { CommonModule } from '@angular/common';
import { UiComponentsSearchModule } from '@proxy/ui/search';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { UiNoRecordFoundModule } from '@proxy/ui/no-record-found';
import { UiMatPaginatorGotoModule } from '@proxy/ui/mat-paginator-goto';
import { UiLoaderModule } from '@proxy/ui/loader';
import { FeatureComponent } from './feature/feature.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { ServicesProxyFeaturesModule } from '@proxy/services/proxy/features';
import { DirectivesSkeletonModule } from '@proxy/directives/skeleton';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
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
