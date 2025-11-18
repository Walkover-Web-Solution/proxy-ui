import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { UiLoaderModule } from '@proxy/ui/loader';
import { MatIconModule } from '@angular/material/icon';
import { CreateFeatureComponent } from './create-feature.component';
import { ServicesProxyFeaturesModule } from '@proxy/services/proxy/features';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MarkdownModule } from 'ngx-markdown';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UiCopyButtonModule } from '@proxy/ui/copy-button';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { HttpClientModule } from '@angular/common/http';
import { SimpleDialogComponent } from './simple-dialog/simple-dialog.component';
import { CreatePlanDialogComponent } from './create-plan-dialog/create-plan-dialog.component';
import { CreateTaxDialogComponent } from './create-tax-dialog/create-tax-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
const routes: Routes = [
    {
        path: '',
        component: CreateFeatureComponent,
        pathMatch: 'full',
    },
];

@NgModule({
    declarations: [CreateFeatureComponent, SimpleDialogComponent, CreatePlanDialogComponent, CreateTaxDialogComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        MatCardModule,
        MatButtonModule,
        UiLoaderModule,
        MatStepperModule,
        MatListModule,
        ServicesProxyFeaturesModule,
        MatChipsModule,
        MarkdownModule.forRoot(),
        MatTabsModule,
        MatSlideToggleModule,
        UiCopyButtonModule,
        MatTableModule,
        MatDialogModule,
        MatSelectModule,
        HttpClientModule,
        MatTooltipModule,
    ],
    exports: [RouterModule],
})
export class CreateFeatureModule {}
