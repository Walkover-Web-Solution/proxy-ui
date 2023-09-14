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
import { CreateFeatureComponent } from './create-feature/create-feature.component';
import { FeaturesLayoutComponent } from './feature-layout.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatListModule } from '@angular/material/list';
// Component
const routes: Routes = [
    {
        path: '',
        component: FeaturesLayoutComponent,
        children: [
            {
                path: '',
                redirectTo: 'feature',
                pathMatch: 'full',
            },
            {
                path: 'feature',
                component: FeatureComponent,
            },
            {
                path: 'create-feature',
                component: CreateFeatureComponent,
            },
        ],
    },
];

@NgModule({
    declarations: [FeaturesLayoutComponent, FeatureComponent, CreateFeatureComponent],
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
        UiLoaderModule,
        UiComponentsSearchModule,
        MatStepperModule,
        MatListModule,
    ],
    exports: [RouterModule],
})
export class FeaturesModule {}
