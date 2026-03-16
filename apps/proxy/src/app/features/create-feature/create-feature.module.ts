import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { UiLoaderModule } from '@proxy/ui/loader';
import { MatIconModule } from '@angular/material/icon';
import { CreateFeatureComponent } from './create-feature.component';
import { ServicesProxyFeaturesModule } from '@proxy/services/proxy/features';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MarkdownModule } from 'ngx-markdown';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { UiCopyButtonModule } from '@proxy/ui/copy-button';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { HttpClientModule } from '@angular/common/http';
import { SimpleDialogComponent } from './simple-dialog/simple-dialog.component';
import { CreatePlanDialogComponent } from './create-plan-dialog/create-plan-dialog.component';
import { CreateTaxDialogComponent } from './create-tax-dialog/create-tax-dialog.component';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';

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
        FormsModule,
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
        MatExpansionModule,
        MatRadioModule,
    ],
    exports: [RouterModule],
})
export class CreateFeatureModule {}
